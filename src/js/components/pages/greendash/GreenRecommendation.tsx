import React, { useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import NewChartWidget from '../../../base/components/NewChartWidget';
import PromiseValue from '../../../base/promise-value';
import { type BreakdownRow, type GreenBuckets, emissionsPerImpressions, getCarbon } from './emissionscalcTs';

interface ByDomainValue extends Object {
	allCount: number;
	by_domain: { buckets: BreakdownRow[] };
	probability?: number;
	seed?: number;
}

interface ResolvedPromise extends ByDomainValue {
	sampling?: ByDomainValue;
}

type BaseFilters = {
	q: string;
	start: string;
	end: string;
	prob?: string;
	sigfig?: string;
	nocache?: boolean;
	fixseed?: boolean;
	numRows?: string;
};

const baseFiltersTemp = {
	q: 'campaign:nrxhFNGq OR campaign:iLWiEWO6 OR campaign:sjhhqRsR OR campaign:3mYN5ixz OR campaign:PdJMNhOH OR campaign:9x5iaOdG OR campaign:JCWGRAES OR campaign:B0Ywbe1l',
	start: '2022-11-01T00%3A00%3A00.000Z',
	end: '2023-03-31T23:00:00.000Z',
	prob: '-1',
	fixseed: true,
	numRows: '10000',
};

const RangeSlider = ({ carbonRange, domainBuckets }: { carbonRange: { max: number; min: number }; domainBuckets: GreenBuckets }) => {
	const [minSelected, setMin] = useState<number>(carbonRange.min * 1000 || 0);
	const [maxSelected, setMax] = useState<number>(carbonRange.max * 1000 || 10000);
	const [availableDomains, setAvailableDomains] = useState<GreenBuckets>();

	useEffect(() => {
		const availableDomains = domainBuckets.filter((val) => (val.co2 as number) * 1000 >= minSelected && (val.co2 as number) * 1000 <= maxSelected);
		setAvailableDomains(availableDomains);
	}, [minSelected, maxSelected]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>, setter: { (value: React.SetStateAction<number>): void }) => {
		setter(Number(event.target.value));
	};

	const chartData = useMemo(() => {
		const sortedBuckets = domainBuckets.sort((a, b) => (a.co2 as number) - (b.co2 as number));
		const dataLabels = sortedBuckets.map((val) => val.key);
		const dataValues = sortedBuckets.map((val) => (val.co2 as number) * 1000);

		return {
			type: 'bar',
			data: {
				labels: dataLabels,
				datasets: [
					{
						label: 'co2',
						data: dataValues,
						backgroundColor: 'green',
					},
				],
			},
		};
	}, [domainBuckets]);

	const chartOptions = useMemo(() => {
		const max = {
			type: 'line',
			borderColor: 'red',
			borderWidth: 1,
			scaleID: 'y',
			value: maxSelected,
		};

		const min = {
			type: 'line',
			borderColor: 'blue',
			borderWidth: 1,
			scaleID: 'y',
			value: minSelected,
		};

		return {
			responsive: true,
			tooltips: {
				mode: 'index',
				intersect: true,
			},
			plugins: {
				annotation: {
					annotations: { max, min },
				},
			},
		};
	}, [minSelected, maxSelected]);

	return (
		<div>
			<input type='range' min={carbonRange.min * 1000} max={carbonRange.max * 1000} value={minSelected.toString()} onChange={(e) => handleChange(e, setMin)} />
			<input type='range' min={carbonRange.min * 1000} max={carbonRange.max * 1000} value={maxSelected.toString()} onChange={(e) => handleChange(e, setMax)} />
			<div>
				<label>Min: </label>
				<span>{Math.round(minSelected)} grams</span>
			</div>
			<div>
				<label>Max: </label>
				<span>{Math.round(maxSelected)} grams</span>
			</div>
			<div>
				<label>Numbers of domains in this range: </label>
				<span>{availableDomains && availableDomains.length}</span>
			</div>
			<NewChartWidget options={chartOptions} width={null} height={null} datalabels={null} maxy={null} {...chartData} />
		</div>
	);
};

const GreenRecommendation = ({ baseFilters }: { baseFilters: BaseFilters }): JSX.Element => {
	if (!baseFilters) baseFilters = baseFiltersTemp;

	const [domainBuckets, setDomainBuckets] = useState<GreenBuckets>();
	const [carbonRange, setCarbonRange] = useState<{ max: number; min: number }>();
	const [domainList, setDomainList] = useState<{ upperDomains: GreenBuckets; lowerDomains: GreenBuckets; midDomains: GreenBuckets }>();

	const pvDataValue: PromiseValue = getCarbon({
		...baseFilters,
		breakdown: ['domain{"emissions":"sum"}'],
		// endpoint: 'https://locallg.good-loop.com/data?'
	});

	// Type hack: If it is resolved value must be an Object
	const resolvedValue = pvDataValue.resolved ? (pvDataValue.value as ResolvedPromise) : null;
	const byDomainValue = resolvedValue && (resolvedValue.sampling ? resolvedValue.sampling : resolvedValue);

	useEffect(() => {
		if (!byDomainValue) return;
		const allCount = byDomainValue.allCount;
		const buckets = emissionsPerImpressions(byDomainValue.by_domain.buckets);
		setDomainBuckets(buckets);
		const co2s = buckets.map((row) => row.co2! as number);

		const bucketSize = buckets.length;
		const maxCo2 = Math.max(...co2s);
		const minCo2 = Math.min(...co2s);
		setCarbonRange({ max: maxCo2, min: minCo2 });

		const range = maxCo2 - minCo2;
		const upperQuartile = range * 0.75 + minCo2;
		// const midPoint = range * 0.5 + minCo2;
		const lowerQuartile = range * 0.25 + minCo2;

		const upperDomains: GreenBuckets = [];
		const lowerDomains: GreenBuckets = [];
		const midDomains: GreenBuckets = [];

		buckets.forEach((row) => {
			if (row.co2 > upperQuartile) {
				upperDomains.push(row);
			} else if (row.co2 < lowerQuartile) {
				lowerDomains.push(row);
			} else {
				midDomains.push(row);
			}
		});

		setDomainList({ upperDomains, lowerDomains, midDomains });
	}, [byDomainValue]);

	console.log('domainList', domainList);

	return (
		<Container>
			<h1>Green Recommendations</h1>
			<Row className='w-100 text-center' style={{ maxHeight: '20em', overflowY: 'scroll' }}>
				<Col xs={4}>
					<h3>Upper Domains</h3>
					<p>Domains in this list: {domainList?.upperDomains.length}</p>
					<div className='list'>{domainList?.upperDomains && domainList?.upperDomains.map((row, idx) => <p key={idx}>{row.key}</p>)}</div>
				</Col>
				<Col xs={4}>
					<h3>Mid Domains</h3>
					<p>Domains in this list: {domainList?.midDomains.length}</p>
					<div className='list'>{domainList?.midDomains && domainList?.midDomains.map((row, idx) => <p key={idx}>{row.key}</p>)}</div>
				</Col>
				<Col xs={4}>
					<h3>Lower Domains</h3>
					<p>Domains in this list: {domainList?.lowerDomains.length}</p>
					<div className='list'>{domainList?.lowerDomains && domainList?.lowerDomains.map((row, idx) => <p key={idx}>{row.key}</p>)}</div>
				</Col>
			</Row>

			<h1>Fun Scroller</h1>
			{carbonRange && domainBuckets && <RangeSlider carbonRange={carbonRange} domainBuckets={domainBuckets} />}
		</Container>
	);
};

export default GreenRecommendation;
