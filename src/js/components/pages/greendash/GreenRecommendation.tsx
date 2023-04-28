import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'reactstrap';
import Misc from '../../../MiscOverrides';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import NewChartWidget, { KScale } from '../../../base/components/NewChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import { getPeriodFromUrlParams, PeriodFromUrlParams } from '../../../base/utils/date-utils';
import { getUrlVars } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import Login from '../../../base/youagain';
import { GLCard } from '../../impact/GLCards';
import GreenDashboardFilters from './GreenDashboardFilters';
import { GreenBuckets, emissionsPerImpressions, getBasefilters, getCarbon, type BaseFilters, type BreakdownRow } from './emissionscalcTs';
import PropControl from '../../../base/components/PropControl';

const TICKS_NUM = 600;

interface RangeSliderProps {
	min: number;
	max: number;
	step?: number;
	defaultValue: number;
	onChange?: (value: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step, defaultValue, onChange }) => {
	useEffect(() => {
		if (onChange) {
			onChange(defaultValue);
		}
	}, []);

	const [value, setValue] = useState(defaultValue);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseFloat(event.target.value);
		setValue(newValue);

		if (onChange) {
			onChange(newValue);
		}
	};

	return (
		<>
			<Row>
				<Col className='text-center p-0' style={{ marginLeft: '8.5em' }}>
					<input className='w-100' type='range' min={min} max={max} step={step} value={value} onChange={handleChange} />
					<span className='text-nowrap'>{value.toPrecision(4)}</span>
				</Col>
			</Row>
		</>
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
	const yscale= DataStore.getUrlValue("yscale");
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

		const percentageBuckets: typeof scaledBuckets[] = Array.from({ length: TICKS_NUM / 3 }, () => []);
		scaledBuckets.forEach((row) => {
			const percentageKey = Math.max(row.percentage, 1) - 1;
			percentageBuckets[percentageKey].push(row);
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
					title: {
						display: true,
						text: 'grams CO2e per impression',
					},
				},
				y: {
					display: true,
					title: {
						display: true,
						text: 'Impressions',
					},
					bounds: 'ticks',
					afterFit: (scaleInstance: { width: number; }) => {
						scaleInstance.width = 100; // sets the width to 100px
					}
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

	const filterUrlParams = getUrlVars(null, null);
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
	const silderProps: RangeSliderProps = { min: minCo2 * 1, max: maxCo2 * 1, step: steps, defaultValue: middleCo2, onChange: setSelectedCo2 };

	// what weight of impressions is included?
	let lowImps = 0,
		lowWeightedAvg = 0;
	lowBuckets?.forEach((bucket) => {
		lowImps += bucket.count as number;
		lowWeightedAvg += (bucket.count as number) * (bucket.co2 as number);
	});
	lowWeightedAvg = lowImps ? lowWeightedAvg / lowImps : 0;
	const weightedAvg = bucketsPer1000.reduce((acc, bucket) => acc + (bucket.count as number) * (bucket.co2 as number), 0) / totalCounts;

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
		return (
			<>
				<h4>{low ? 'Low' : 'High'}-Carbon</h4>
				<div>{domainsList.length || '-'} domains</div>
				<div>{printer.prettyNumber(volumePercentage, 2, null)}% by volume</div>
				<div>Average: {printer.prettyNumber(avgCo2, 3, null)} grams CO2e</div>
				<div style={{ maxHeight: '15em', overflowY: 'scroll', overflowX: 'clip' }}>
					<ul>
						{domainsList.map((val, index) => (
							<li key={index}>{val}</li>
						))}
					</ul>
				</div>
				<Button onClick={() => downloadCSV(domainsList)}>Download CSV</Button>
				<div>Use as {low ? 'an allow' : 'a block'}-list in your DSP</div>
			</>
		);
	};

	return (
		<GLCard /* Hm: eslint + ts objects if we don't list every parameter, optional or not - but that makes for verbose code, which isn't good (time-consuming, and hides the real code) 
		How do we get eslint to be quieter for ts? */>
			<h3 className='mx-auto'>Use this slider tool to generate block and allow lists based on publisher generated CO2e</h3>
			{/* <PropControl We should pick the display that's best for the users.
				inline
				type='toggle'
				prop='scale'
				dflt='logarithmic'
				label='Chart Scale:'
				left={{ label: 'Logarithmic', value: 'logarithmic', colour: 'primary' }}
				right={{ label: 'Linear', value: 'linear', colour: 'primary' }}
			/> */}
			<Row>
				<Col xs={3}>
					<DomainList buckets={lowBuckets} low totalCounts={totalCounts} />
				</Col>
				<Col xs={6}>
					<div className='d-flex flex-column'>
						<RecommendationChart bucketsPer1000={bucketsPer1000} />
						<RangeSlider {...silderProps} />
						<h4>Estimated Reduction: {printer.prettyNumber((100 * (weightedAvg - lowWeightedAvg)) / weightedAvg, 2, null)}%</h4>
					</div>
				</Col>
				<Col xs={3}>
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
						<h1 className='text-left'>How can I start reducing emissions?</h1>
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
		<GLCard>
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
