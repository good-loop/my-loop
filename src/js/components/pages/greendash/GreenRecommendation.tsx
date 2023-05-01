import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Row } from 'reactstrap';
import Misc from '../../../MiscOverrides';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import NewChartWidget, { KScale } from '../../../base/components/NewChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import { getPeriodFromUrlParams, Period, PeriodFromUrlParams } from '../../../base/utils/date-utils';
import { getUrlVars } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import Login from '../../../base/youagain';
import { GLCard } from '../../impact/GLCards';
import GreenDashboardFilters from './GreenDashboardFilters';
import { GreenBuckets, emissionsPerImpressions, getBasefilters, getCarbon, type BaseFilters, type BreakdownRow } from './emissionscalcTs';
import PropControl from '../../../base/components/PropControl';

import '../../../../style/GreenRecommendations.less';
import { CO2e } from './GreenDashUtils';

const TICKS_NUM = 600;

interface RangeSliderProps {
	min: number;
	max: number;
	step?: number;
	defaultValue: number;
	onChange?: (value: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step, defaultValue, onChange = () => {}, ...props }) => {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => onChange(defaultValue), [value]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(parseFloat(event.target.value));
	};

	return (
		<div className='cutoff-input' {...props}>
			<input className='w-100' type='range' min={min} max={max} step={step} value={value} onChange={handleChange} />
			<span className='value-bubble text-nowrap'>{value.toPrecision(4)}</span>
		</div>
	);
};

/**
 * Note: url param yscale=linear|logarithmic
 *
 * @param {Object} p
 * @param {GreenBuckets} p.bucketsPer1000 A DataLog breakdown of carbon emissions. e.g. [{key, co2, count}]
 * @returns
 */
const RecommendationChart = ({ bucketsPer1000 }: { bucketsPer1000: GreenBuckets }): JSX.Element | null => {
	let logarithmic = true;
	const yscale = DataStore.getUrlValue('yscale');
	if (yscale) logarithmic = KScale.islogarithmic(yscale);

	const [chartData, setChartData] = useState<any>();

	useEffect(() => {
		const co2s = bucketsPer1000.map((row) => row.co2 as number);
		const maxCo2 = Math.max(...co2s);
		const minCo2 = Math.min(...co2s);
		const steps = (maxCo2 - minCo2) / (TICKS_NUM / 3); // How large is a tick

		const scaledBuckets = bucketsPer1000.map((row) => {
			const percentage = Math.floor(((row.co2 as number) - minCo2) / steps);
			return { key: row.key, count: row.count, co2: row.co2, percentage };
		});

		if (!scaledBuckets) return;

		const percentageBuckets: (typeof scaledBuckets)[] = Array.from({ length: TICKS_NUM / 3 }, () => []);
		scaledBuckets.forEach((row) => {
			const percentageKey = Math.max(row.percentage, 1) - 1;
			if (percentageBuckets && percentageBuckets[percentageKey]) percentageBuckets[percentageKey].push(row);
		});

		const dataLabels = percentageBuckets.map((row) =>
			row[0]?.co2 ? (row[0].co2 as number).toPrecision(2) : (percentageBuckets.indexOf(row) * steps + minCo2).toPrecision(2)
		);
		// const dataValues = percentageBuckets.map((row) => row.length);
		// Weight by impressions, not count of domains
		const dataValues = percentageBuckets.map((row) => row.reduce((acc: number, curr: any) => acc + curr.count, 0));

		let chartOptions: any = {
			responsive: true,
			// see https://www.chartjs.org/docs/latest/samples/scale-options/titles.html
			scales: {
				x: {
					display: true,
					// max: Math.ceil(maxCo2),
					min: 0,
					title: {
						display: true,
						text: 'Grams CO2e per impression',
					},
					ticks: {
						stepSize: 0.25, // TODO This won't work in a bar chart - labels are chosen from the dataset labels
						padding: 25, // make room for overlaid slider
					},
				},
				y: {
					display: true,
					title: {
						display: true,
						text: 'Impressions',
					},
					bounds: 'ticks',
					ticks: {
						callback: printer.prettyInt, // No trailing .0 on impression count!
					},
					afterFit: (scaleInstance: { width: number }) => {
						scaleInstance.width = 100; // sets the width to 100px
					},
				},
			},
		};

		if (logarithmic) {
			chartOptions.scales.y.type = 'logarithmic';
		}

		setChartData({
			type: 'bar',
			data: {
				labels: dataLabels,
				datasets: [
					{
						label: 'Impressions',
						data: dataValues,
						backgroundColor: 'green',
					},
				],
			},
			options: chartOptions,
		});
	}, [bucketsPer1000, logarithmic]);

	return chartData ? (
		<NewChartWidget width={null} height={280} datalabels={null} maxy={null} {...chartData} />
	) : (
		<Misc.Loading text={null} pv={null} inline={null} />
	);
};

const tickSvg = (
	<svg version='1.1' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
		<path d='m25 55 13 13 35-38' fill='none' stroke='currentColor' strokeLinecap='round' strokeWidth='7' />
	</svg>
);
const crossSvg = (
	<svg version='1.1' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
		<g fill='none' stroke='currentColor' strokeLinecap='round' strokeWidth='7'>
			<path d='m26 26 48 48' />
			<path d='m74 26-48 48' />
		</g>
	</svg>
);

const downloadCSV = (data?: string[]) => {
	if (!data) return;
	const csv = data.join('\n');
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'data.csv';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

const DomainList = ({ low, buckets, totalCounts }: { low?: boolean; buckets?: GreenBuckets; totalCounts: number }): JSX.Element => {
	if (!buckets) return <></>;
	const domainsList = buckets.map((val) => val.key as string);
	const totalImpressions = buckets.reduce((acc, cur) => acc + (cur.count as number), 0);
	const totalCo2 = buckets.reduce((acc, cur) => acc + (cur.co2 as number), 0);
	const avgCo2 = totalCo2 / domainsList.length;
	const volumePercentage = (totalImpressions / totalCounts) * 100;

	const cutoffIcon = <div className='cutoff-icon'>{low ? tickSvg : crossSvg}</div>;

	return (
		<GLCard
			className={`domain-list ${low ? 'allow' : 'block'}`}
			noPadding
			noMargin={null}
			modalContent={undefined}
			modalTitle={undefined}
			modalHeader={undefined}
			modalHeaderImg={undefined}
			modalClassName={undefined}
			modal={null}
			modalId={null}
			modalPrioritize={null}
			href={null}
		>
			<CardHeader className='domain-list-title p-2'>
				<h4 className='m-0'>Suggested {low ? 'Allow' : 'Block'} List</h4>
			</CardHeader>
			<CardBody className='flex-column p-0'>
				<div className='cutoff-header p-4'>
					<h5 className='cutoff-label'>
						{/* low ? 'Maximum' : 'Minimum'*/} {CO2e} emissions per impression
					</h5>
					<div className='cutoff-value'>
						{cutoffIcon}
						<span className='cutoff-number ml-2'>{low ? <>&le;</> : <>&gt;</>}1.182g</span>
					</div>
				</div>
				<div className='domain-stats flex-row mx-1 p-1'>
					<div className='domain-stat'>
						<div className='stat-name'>Domains</div>
						<div className='stat-value'>{domainsList.length || '-'}</div>
					</div>
					<div className='domain-stat'>
						<div className='stat-name'>Impressions</div>
						<div className='stat-value'>{printer.prettyNumber(volumePercentage, 2, null)}%</div>
					</div>
					<div className='domain-stat'>
						<div className='stat-name'>{CO2e} per</div>
						<div className='stat-value'>{printer.prettyNumber(avgCo2, 3, null)}g</div>
					</div>
				</div>
				<ul className='domain-list-preview m-0 px-4'>
					{domainsList.map((val, index) => (
						<li key={index}>{val}</li>
					))}
				</ul>
			</CardBody>
			<CardFooter className='csv-block flex-column align-items-center'>
				{cutoffIcon}
				Use as {low ? 'an allow' : 'a block'}-list in your DSP
				<Button onClick={() => downloadCSV(domainsList)}>Download CSV</Button>
			</CardFooter>
		</GLCard>
	);
};

/**
 * Publisher lists
 * @returns
 */
const PublisherListRecommendations = (): JSX.Element | null => {
	// CO2 per impression grams??
	const [selectedCo2, setSelectedCo2] = useState<number>();
	const [lowBuckets, setLowBuckets] = useState<GreenBuckets>();
	const [highBuckets, setHighBuckets] = useState<GreenBuckets>();

	// sort into two lists using bucketsPer1000 below
	useEffect(() => {
		if (!selectedCo2) return;
		let lowBuckets = bucketsPer1000.filter((val) => (val.co2 as number) <= selectedCo2);
		setLowBuckets(lowBuckets);
		let highBuckets = bucketsPer1000.filter((val) => (val.co2 as number) > selectedCo2);
		setHighBuckets(highBuckets);
	}, [selectedCo2]);

	interface FitlerUrlParams extends Object {
		period?: any
	}

	const filterUrlParams = getUrlVars(null, null) as FitlerUrlParams;
	const period = getPeriodFromUrlParams(filterUrlParams);
	if (!period) {
		return null; // Filter widget will set this on first render - allow it to update
	}
	filterUrlParams.period = period; // NB: period is a json object, unlike the other params

	let baseFilters = getBasefilters(filterUrlParams);

	// BaseFiltersFailed
	if ('type' in baseFilters && 'message' in baseFilters) {
		if (baseFilters.type === 'alert') {
			return <Alert color='info'>{baseFilters.message}</Alert>;
		}
		if (baseFilters.type === 'loading') {
			return <Misc.Loading text={baseFilters.message!} pv={null} inline={null} />;
		}
	}

	/**
	 * Inital load of total
	 */
	const baseFilterConfirmed = { ...baseFilters, numRows: '10000' } as unknown as BaseFilters;

	const pvChartTotal = getCarbon({ ...baseFilterConfirmed, breakdown: ['domain{"countco2":"sum"}'] });
	if (!pvChartTotal.resolved) return <Misc.Loading text={null} pv={null} inline={null} />;

	const pvChartTotalValue = baseFilterConfirmed.prob && baseFilterConfirmed.prob != 0 ? pvChartTotal.value?.sampling : pvChartTotal.value;
	const bucketsPer1000 = emissionsPerImpressions(pvChartTotalValue.by_domain.buckets);

	const co2s = bucketsPer1000.map((row) => row.co2! as number);
	const totalCounts = bucketsPer1000.reduce((acc, cur) => acc + (cur.count as number), 0);
	const maxCo2 = Math.max(...co2s);
	const minCo2 = Math.min(...co2s);
	const middleCo2 = ((maxCo2 - minCo2) * 1) / 2;
	const steps = (maxCo2 - minCo2) / TICKS_NUM; // How large is a tick
	const sliderProps: RangeSliderProps = { min: minCo2 * 1, max: maxCo2 * 1, step: steps, defaultValue: middleCo2, onChange: setSelectedCo2 };

	// what weight of impressions is included?
	let lowImps = 0,
		lowWeightedAvg = 0;
	lowBuckets?.forEach((bucket) => {
		lowImps += bucket.count as number;
		lowWeightedAvg += (bucket.count as number) * (bucket.co2 as number);
	});
	lowWeightedAvg = lowImps ? lowWeightedAvg / lowImps : 0;
	const weightedAvg = bucketsPer1000.reduce((acc, bucket) => acc + (bucket.count as number) * (bucket.co2 as number), 0) / totalCounts;

	let reductionPercent = ((100 * (weightedAvg - lowWeightedAvg)) / weightedAvg).toFixed(1);

	return (
		<GLCard
			className='publisher-recommendations'
			noPadding={null}
			noMargin={null}
			modalContent={undefined}
			modalTitle={undefined}
			modalHeader={undefined}
			modalHeaderImg={undefined}
			modalClassName={undefined}
			modal={null}
			modalId={null}
			modalPrioritize={null}
			href={null}
		>
			{/* Hm: eslint + ts objects if we don't list every parameter, optional or not - but that makes for verbose code, which isn't good (time-consuming, and hides the real code) 
			How do we get eslint to be quieter for ts? */}
			<h3 className='mx-auto'>
				Use the slider on the graph below to generate allow and block lists based on publisher generated CO<sub>2</sub>e
			</h3>
			<Row>
				<Col xs={3} className='px-0'>
					<DomainList buckets={lowBuckets} low totalCounts={totalCounts} />
				</Col>
				<Col xs={6} className='px-0'>
					<GLCard
						className='generator d-flex flex-column'
						noPadding
						noMargin={null}
						modalContent={undefined}
						modalTitle={undefined}
						modalHeader={undefined}
						modalHeaderImg={undefined}
						modalClassName={undefined}
						modal={null}
						modalId={null}
						modalPrioritize={null}
						href={null}
					>
						<CardHeader className='generator-title p-2'>
							<h4 className='m-0'>Allow and Block list generator</h4>
						</CardHeader>
						<CardBody>
							{/* @ts-ignore */}
							{/* We should pick the display that's best for the users.
							<PropControl inline type="toggle" prop="scale" dflt="logarithmic" label="Chart Scale:"
								left={{ label: 'Logarithmic', value: 'logarithmic', colour: 'primary' }}
								right={{ label: 'Linear', value: 'linear', colour: 'primary' }}
							/> */}
							<RecommendationChart bucketsPer1000={bucketsPer1000} />
							<RangeSlider {...sliderProps} />
						</CardBody>
						<CardFooter>
							<h4>Estimated Reduction</h4>
							<h4 className='reduction-number ml-4'>{reductionPercent}%</h4>
						</CardFooter>
					</GLCard>
				</Col>
				<Col xs={3} className='px-0'>
					<DomainList buckets={highBuckets} totalCounts={totalCounts} />
				</Col>
			</Row>
			<p className='mt-2'>
				These lists are based on observed data within the current filters. <br />
				We also have general publisher lists available for use. Please contact{' '}
				<a href='mailto:support@good-loop.com?subject=Carbon%20reducttion%20publisher%20lists'>support@good-loop.com</a> for information.
			</p>
		</GLCard>
	);
};

const GreenRecommendation = ({ baseFilters }: { baseFilters: BaseFilters }): JSX.Element => {
	const [agencyIds, setAgencyIds] = useState<any[]>();
	let agencyId = DataStore.getUrlValue('agency');
	if (!agencyId && agencyIds?.length === 1) agencyId = agencyIds[0];
	const [pseudoUser, setPseudoUser] = useState<boolean>(false);

	// All our filters etc are based user having at most access to one agency ??how so?
	// Group M users will have multiple, so start by selecting one.
	useEffect(() => {
		const userId = Login.getId(null);
		if (userId && userId.endsWith('@pseudo')) setPseudoUser(true);

		Login.getSharedWith().then((res: any) => {
			if (!res?.cargo) {
				setAgencyIds([]);
				return;
			}
			const _agencyIds = res.cargo
				.map((share: any) => {
					const matches = share.item.match(/^Agency:(\w+)$/);
					if (!matches) return null;
					return matches[1];
				})
				.filter((a: any) => a);
			setAgencyIds(_agencyIds);
		});
	}, [Login.getId(null)]);

	// Only for logged-in users!
	if (!Login.isLoggedIn())
		return (
			<Container>
				<Card body id='green-login-card' className='m-4'>
					<Container>
						<Row>
							<Col className='decoration flex-center' xs='12' sm='4'>
								<img className='stamp' src='/img/green/gl-carbon-neutral.svg' />
							</Col>
							<Col className='form' xs='12' sm='8'>
								<img className='gl-logo my-4' src='/img/gl-logo/rectangle/logo-name.svg' />
								<p className='text-center my-4'>
									Understand the carbon footprint of your advertising and
									<br />
									discover your offsetting and climate-positive successes
								</p>
								<LoginWidgetEmbed verb='login' canRegister={false} services={null} onLogin={null} onRegister={null} />
							</Col>
						</Row>
					</Container>
				</Card>
			</Container>
		);

	return (
		<div className='green-subpage green-metrics'>
			<Container fluid>
				{agencyIds ? (
					<>
						<GreenDashboardFilters pseudoUser={pseudoUser} />
						<PublisherListRecommendations />
						<CreativeRecommendations />
					</>
				) : (
					<Misc.Loading text='Checking your access...' pv={null} inline={false} />
				)}
			</Container>
		</div>
	);
};

function CreativeRecommendations() {
	return (
		<GLCard
			className={null}
			noPadding={null}
			noMargin={null}
			modalContent={undefined}
			modalTitle={undefined}
			modalHeader={undefined}
			modalHeaderImg={undefined}
			modalClassName={undefined}
			modal={null}
			modalId={null}
			modalPrioritize={null}
			href={null}
		>
			<h3 className='mx-auto'>Optimise Creative Files to Reduce Carbon</h3>
			<h4>Tips</h4>
			<p>
				These tips can require special tools to apply. We are working on automated self-service web tools to make this easy. Meanwhile - email us and we can
				help.
			</p>
			<ul>
				<li>Use .webp format instead of .png. webp is a more modern format which can do compression and transparency.</li>
				<li>Optimise fonts. Often a whole font will be included when just a few letters are needed.</li>
				<li>Sometimes replacing a font with an svg can further reduce the creative weight.</li>
				<li>Use .webm format for videos. It can get better compression.</li>
				<li>Replace GIFs. Embedded video (e.g. .webm or .mp4) is better for animations, and .webp is better for static images.</li>
				<li>Strip down large javascript libraries. Often a whole animation library is included when only a snippet is used.</li>
			</ul>
			<p className='dev-only'>
				We are developing a tool for analysing ads: the <a href={'https://portal.good-loop.com/#measure'}>Low Carbon Creative Tool</a>
			</p>
		</GLCard>
	);
}

export default GreenRecommendation;
