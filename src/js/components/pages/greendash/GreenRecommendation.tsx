import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'reactstrap';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import NewChartWidget from '../../../base/components/NewChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import Login from '../../../base/youagain';
import Misc from '../../../MiscOverrides';
import { paramsFromUrl } from './dashUtils';
import { emissionsPerImpressions, getBasefilters, getCarbon, GreenBuckets, type BaseFilters, type BreakdownRow } from './emissionscalcTs';
import GreenDashboardFilters from './GreenDashboardFilters';

interface ByDomainValue extends Object {
	allCount: number;
	by_domain: { buckets: BreakdownRow[] };
	probability?: number;
	seed?: number;
}

interface ResolvedPromise extends ByDomainValue {
	sampling?: ByDomainValue;
}

const TICKS_NUM = 100;

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
		<Row>
			<Col xs={2}>{min.toPrecision(3)}</Col>
			<Col xs={8} className='text-center'>
				<input className='w-100' type='range' min={min} max={max} step={step} value={value} onChange={handleChange} />
				{value.toPrecision(3)}
			</Col>
			<Col xs={2}>{max.toPrecision(3)}</Col>
		</Row>
	);
};

const RecommendationChart = ({ bucketsPer1000 }: { bucketsPer1000: GreenBuckets }): JSX.Element | null => {
	const [chartData, setChartData] = useState<any>();

	useEffect(() => {
		const co2s = bucketsPer1000.map((row) => row.co2! as number);
		const maxCo2 = Math.max(...co2s);
		const minCo2 = Math.min(...co2s);
		const steps = (maxCo2 - minCo2) / TICKS_NUM; // How large is a tick

		const scaledBuckets = bucketsPer1000.map((row) => {
			const percentage = Math.floor(((row.co2 as number) - minCo2) / steps);
			return { key: row.key, count: row.count, co2: row.co2, percentage };
		});

		if (!scaledBuckets) return;

		const percentageBuckets: typeof scaledBuckets[] = Array.from({ length: TICKS_NUM }, () => []);
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

		const chartOptions = {
			responsive: true,
		};

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
	}, [bucketsPer1000]);

	return chartData ? (
		<NewChartWidget width={null} height={null} datalabels={null} maxy={null} {...chartData} />
	) : (
		<Misc.Loading text={null} pv={null} inline={null} />
	);
};

const GreenRecommendation2 = (): JSX.Element | null => {
	const [selectedCo2, setSelectedCo2] = useState<number>();
	const [leftDomains, setLeftDomains] = useState<string[]>();
	const [rightDomains, setRightDomains] = useState<string[]>();

	useEffect(() => {
		if (!selectedCo2) return;
		setLeftDomains(bucketsPer1000.filter((val) => (val.co2 as number) <= selectedCo2).map((val) => val.key as string));
		setRightDomains(bucketsPer1000.filter((val) => (val.co2 as number) > selectedCo2).map((val) => val.key as string));
	}, [selectedCo2]);

	const urlParams = paramsFromUrl(['period', 'prob', 'sigfig', 'nocache']);
	const period = urlParams.period;
	if (!period) return null; // Filter widget will set this on first render - allow it to update

	let baseFilters = getBasefilters(urlParams);

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
	const maxCo2 = Math.max(...co2s);
	const minCo2 = Math.min(...co2s);
	const middleCo2 = ((maxCo2 - minCo2) * 1) / 2;
	const steps = (maxCo2 - minCo2) / TICKS_NUM; // How large is a tick
	const silderProps: RangeSliderProps = { min: minCo2 * 1, max: maxCo2 * 1, step: steps, defaultValue: middleCo2, onChange: setSelectedCo2 };

	const downloadCSV = (data: string[]) => {
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

	const DomainList = ({ buckets }: { buckets?: string[] }): JSX.Element => {
		return (
			<>
				<p>Domains X: {buckets?.length}</p>
				<div style={{ maxHeight: '20em', overflowY: 'scroll' }}>
					{leftDomains?.map((val, index) => (
						<span key={index}>
							{val}
							<br />
						</span>
					))}
				</div>
				<Button onClick={() => downloadCSV(buckets)}>Download CSV</Button>
			</>
		);
	};

	return (
		<div>
			<Row>
				<Col xs={2}>
					<DomainList buckets={leftDomains} />
				</Col>
				<Col xs={8}>
					<div className='w-100'>
						<RecommendationChart bucketsPer1000={bucketsPer1000} />
					</div>
				</Col>
				<Col xs={2}>
					<DomainList buckets={rightDomains} />
				</Col>
			</Row>
			<RangeSlider {...silderProps} />
		</div>
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
						<h1>Green Recommendations</h1>
						<GreenRecommendation2 />
					</>
				) : (
					<Misc.Loading text='Checking your access...' pv={null} inline={false} />
				)}
			</Container>
		</div>
	);
};

export default GreenRecommendation;
