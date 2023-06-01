import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Row } from 'reactstrap';
import { BaseFilters, GreenBuckets, emissionsPerImpressions, getBasefilters, getCarbon } from './emissionscalcTs';
import { getUrlVars } from '../../../base/utils/miscutils';
import { getPeriodFromUrlParams } from '../../../base/utils/date-utils';
import NewChartWidget, { KScale } from '../../../base/components/NewChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';
import Misc from '../../../MiscOverrides';
import { CO2e, crossSvg, downloadIcon, tickSvg } from './GreenDashUtils';
import { GLCard } from '../../impact/GLCards';

import { type BreakdownRow } from './emissionscalcTs';

import '../../../../style/GreenRecommendations.less';
import PropControl from '../../../base/components/PropControl';


const TICKS_NUM = 600;

interface ChartObj {
	chartArea: { left: number; right: number; width: number; height: number };
}

/** Puts a PropControlRange in a container which overlays the supplied ChartJS chart */
function CutoffSlider({ chartObj, ...props }: {chartObj?: ChartObj}): JSX.Element | null {
	if (!chartObj) return null;
	// Overlay the slider control on the chart
	const rangeStyle = chartObj?.chartArea ? {
		left: `${chartObj?.chartArea.left - 8}px`,
		width: `${chartObj?.chartArea.width + 16}px`,
		top: `${chartObj?.chartArea.height + 5}px`,
	} : {};

	const path = ['widget', 'GreenRecsPublisher'];

	return <div className="cutoff-input" style={rangeStyle} >
		<PropControl type="range" path={path} prop="cutoff" {...props} />
	</div>;
}


/**
 * Note: url param yscale=linear|logarithmic
 *
 * @param {Object} p
 * @param {GreenBuckets} p.bucketsPer1000 A DataLog breakdown of carbon emissions. e.g. [{key, co2, count}]
 * @param {Function} p.passBackChart Callback with reference to chart object - used to position range slider
 * @returns
 */
function RecommendationChart({ bucketsPer1000, passBackChart }: { bucketsPer1000: GreenBuckets, passBackChart: Function }): JSX.Element | null {
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
			title: 'Volume of publisher impressions by CO₂e emitted per impression',
			responsive: true,
			animation: { onComplete: ({chart}) => passBackChart(chart) },
			// see https://www.chartjs.org/docs/latest/samples/scale-options/titles.html
			scales: {
				x: {
					display: true,
					title: {
						display: true,
						text: 'Grams CO2e per impression',
					},
					ticks: {
						stepSize: 0.25, // TODO This won't work in a bar chart - labels are chosen from the dataset labels
						padding: 10, // make room for range slider
					}
				},
				y: {
					display: true,
					title: {
						display: true,
						text: 'Impressions',
					},
					bounds: 'ticks',
					ticks: { callback: printer.prettyInt }, // No trailing .0 on impression count!
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
		<NewChartWidget className="publisher-carbon-histogram" width={null} height={null} datalabels={null} maxy={null} {...chartData} />
	) : (
		<Misc.Loading text={null} pv={null} inline={null} />
	);
}


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


function DomainList({ buckets, min, max }: { buckets?: GreenBuckets; min?: number; max?: number; }): JSX.Element {
	if (!buckets) return <></>;

	const [domains, setDomains] = useState<string[]>([]); // Filtered list of domains after applying the min/max CO2 cutoff
	const [volumeFraction, setVolumeFraction] = useState<number>(0); // Fraction of all impressions which ran through the filtered domains
	const [avgCO2, setAvgCO2] = useState<number>(0);

	// Apply cutoffs to publisher list and generate some stats on the result
	useEffect(() => {
		// Apply high/low CO2 cutoff to publisher list, then sort by name
		const filteredBuckets = buckets.filter(bkt => (
			(max ? (bkt.co2 as number <= max) : (bkt.co2 as number > min!))
		)).sort((a, b) => a.key > b.key ? 1 : -1);
		setDomains(filteredBuckets.map(bkt => bkt.key as string));
		// Calculate how many impressions the filtered publisher list contains
		const totalImps = buckets.reduce((acc, bkt) => acc + (bkt.count as number), 0);
		const filteredImps = filteredBuckets.reduce((acc, bkt) => acc + (bkt.count as number), 0);
		setVolumeFraction(filteredImps / totalImps);
		// Calculate average CO2 intensity of filtered publisher list
		setAvgCO2(filteredBuckets.reduce((acc, bkt) => acc + (bkt.co2 as number), 0) / filteredBuckets.length);
	}, [buckets, min, max]);

	const cutoffIcon = <div className="cutoff-icon">{max ? tickSvg : crossSvg}</div>;

	return ( //@ts-ignore
		<GLCard className={`domain-list ${max ? 'allow' : 'block'}`} noPadding>
			<CardHeader className="domain-list-title p-2">
				<h4 className="m-0">Suggested {max ? 'Allow' : 'Block'} List</h4>
			</CardHeader>
			<CardBody className="flex-column p-0">
				<div className="cutoff-header p-3">
					<h5 className="cutoff-label">{/* low ? 'Maximum' : 'Minimum'*/} {CO2e} emissions per impression</h5>
					<div className="cutoff-value">
						{cutoffIcon}
						<span className="cutoff-number ml-3">
							{max ? <>&le;</> : <>&gt;</>}
							{printer.prettyNumber((max || min || 0), 3, null)} g
						</span>
					</div>
				</div>
				<div className="domain-stats flex-row mx-1 p-1">
					<div className="domain-stat">
						<div className="stat-name">Domains</div>
						<div className="stat-value">{domains.length || '-'}</div>
					</div>
					<div className="domain-stat">
						<div className="stat-name">Impressions</div>
						<div className="stat-value">{printer.prettyNumber((volumeFraction * 100), 2, null)}%</div>
					</div>
					<div className="domain-stat">
						<div className="stat-name">{CO2e} per</div>
						<div className="stat-value">{printer.prettyNumber(avgCO2, 3, null)}g</div>
					</div>
				</div>
				<ul className="domain-list-preview m-0 px-4">
					{domains.map((domain, index) => (
						<li key={index}>{domain}</li>
					))}
				</ul>
			</CardBody>
			<CardFooter className="csv-block flex-column align-items-center">
				{cutoffIcon}
				<div className="csv-desc my-2">
					Use as {max ? 'an allow-list' : 'a block-list'} in your DSP
				</div>
				<Button className="csv-button px-3 py-1" onClick={() => downloadCSV(domains)}>Download CSV {downloadIcon}</Button>
			</CardFooter>
		</GLCard>
	);
}


/**
 * Publisher lists
 * @returns
 */
function GreenRecsPublisher(): JSX.Element | null {
	const [co2Cutoff, setCO2Cutoff] = useState<number>(0); // CO2 grams per impression to divide allow and block list
	const [sortedBuckets, setSortedBuckets] = useState<GreenBuckets>(); // Publisher buckets, sorted low -> high CO2
	const [rangeProps, setRangeProps] = useState(); // Props object for the range input
	const [reduction, setReduction] = useState<number>(0); // Reduction effect of allow/block list (fractional, ie 0.1 for 10%)
	const [chartObj, setChartObj] = useState();

	/* Read / set up filters */
	interface FitlerUrlParams extends Object {
		period?: any;
		generic?: boolean;
	}
	const filterUrlParams = getUrlVars(null, null) as FitlerUrlParams;
	const period = getPeriodFromUrlParams(filterUrlParams);
	if (!period) return null; // Filter widget will set this on first render - allow it to update
	filterUrlParams.period = period; // NB: period is a json object, unlike the other params

	const baseFilters = getBasefilters(filterUrlParams);

	let baseFiltersMessage;
	if ('type' in baseFilters && 'message' in baseFilters) {
		if (baseFilters.type === 'alert') {
			baseFiltersMessage = <Alert color="info">{baseFilters.message}</Alert>;
		}
		if (baseFilters.type === 'loading') {
			baseFiltersMessage = <Misc.Loading text={baseFilters.message!} pv={null} inline={null} />;
		}
	}
	const baseFilterConfirmed = baseFiltersMessage ? null : (
		{ ...baseFilters, numRows: '10000' } as unknown as BaseFilters
	);

	/* Get data and assign publishers to carbon-intensity buckets */
	const pvChartTotal = baseFilterConfirmed ? (
		getCarbon({ ...baseFilterConfirmed, breakdown: ['domain{"countco2":"sum"}'] })
	) : null; // - but not until base filters are ready

	console.log('filterUrlParams.generic', filterUrlParams.generic, filterUrlParams);

	// Sort publisher buckets low -> high CO2
	useEffect(() => {
		if (filterUrlParams.generic) return;
		if (!baseFilterConfirmed || !pvChartTotal?.resolved) return;
		const useSampling = baseFilterConfirmed.prob && baseFilterConfirmed.prob != 0;
		const pvChartTotalValue = useSampling ? pvChartTotal.value?.sampling : pvChartTotal.value;
		const bucketsPer1000 = emissionsPerImpressions(pvChartTotalValue.by_domain.buckets);
		setSortedBuckets(bucketsPer1000.slice().sort((a, b) => ((a.co2 as number) - (b.co2 as number))));
	}, [pvChartTotal?.value]);

	// TODO generic domains design TBC
	// TODO Do we want to move this into ES and refactor this into emissionscalcTs.ts using DataStore?
	useEffect(() => {
		if (!filterUrlParams.generic) return;
		console.log("Fetching generic domain emissions...");
		fetch("../js-data/generic-domain-emissions.json")
			.then((response) => response.json())
			.then((data) => {
				const jsonData = data as GreenBuckets;
				setSortedBuckets(jsonData.slice().sort((a, b) => ((a.co2 as number) - (b.co2 as number))));
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}, []);


	// Calculate CO2 reduction effect of chosen CO2 cutoff
	useEffect(() => {
		if (!sortedBuckets) return;
		const allowBuckets = sortedBuckets.filter(bkt => bkt.co2 as number <= co2Cutoff);
		const allowImps = allowBuckets.reduce((acc, bkt) => acc + (bkt.count as number), 0);
		let allowWeightedAvg = allowBuckets.reduce((acc, bkt) => acc + (bkt.count as number) * (bkt.co2 as number), 0);
		allowWeightedAvg = (allowImps > 0) ? (allowWeightedAvg / allowImps) : 0;

		const allImps = sortedBuckets.reduce((acc, bkt) => acc + (bkt.count as number), 0);
		let allWeightedAvg = sortedBuckets.reduce((acc, bkt) => acc + (bkt.count as number) * (bkt.co2 as number), 0);
		allWeightedAvg = (allImps > 0) ? (allWeightedAvg / allImps) : 0;

		// Fractional difference between raw weighted average and allow-list weighted average
		setReduction((allWeightedAvg - allowWeightedAvg) / allWeightedAvg);
	}, [sortedBuckets, co2Cutoff]);

	// Init / update props for range slider input
	useEffect(() => {
		if (!sortedBuckets || !sortedBuckets.length) return;
		const min = (sortedBuckets[0].co2 as number) - 0.001;
		const max = (sortedBuckets[sortedBuckets.length - 1].co2 as number) + 0.001;
		const step = (max - min) / TICKS_NUM;
		const onChangeInstant = (event: InputEvent) => {
			console.log('slider moved', new Date().getTime() % 1000);
			setCO2Cutoff(event.target.value);
		};
		setRangeProps({ min, max, step, dflt: (max - min) / 2, onChangeInstant, chartObj });
	}, [sortedBuckets, chartObj]);

	// Base filters problem / not yet loaded
	if (baseFiltersMessage) return baseFiltersMessage;

	// Haven't yet received and sorted publisher buckets
	if (!sortedBuckets) return <Misc.Loading text={null} pv={null} inline={null} />;

	return <>
		<h6>Can you reduce your publisher-generated {CO2e} emissions?</h6>
		{/* @ts-ignore */}
		<GLCard className="publisher-recommendations">
			{/* Hm: eslint + ts objects if we don't list every parameter, optional or not - but that makes for verbose code, which isn't good (time-consuming, and hides the real code) 
			How do we get eslint to be quieter for ts? */}
			<Row>
				<Col xs={{size: 6, offset: 3}} className="text-center">
					<h4 className="generator-expl">Use the slider on the graph below to generate allow and block<br/>lists based on publisher generated {CO2e}.</h4>
				</Col>
			</Row>
			<Row>
				<Col xs={3} className="px-0">
					<DomainList buckets={sortedBuckets} max={co2Cutoff} />
				</Col>
				<Col xs={6} className="px-0">
					{/* @ts-ignore */}
					<GLCard className="generator flex-column" noPadding>
						<CardHeader className="generator-title p-2">
							<h4 className="m-0">Allow and Block list generator</h4>
						</CardHeader>
						<CardBody className="flex-column">
							{/* We should pick the display that's best for the users.
							<PropControl inline type="toggle" prop="scale" dflt="logarithmic" label="Chart Scale:"
								left={{ label: 'Logarithmic', value: 'logarithmic', colour: 'primary' }}
								right={{ label: 'Linear', value: 'linear', colour: 'primary' }}
							/> */}
							<div className="chart-slider-box">
								<RecommendationChart bucketsPer1000={sortedBuckets} passBackChart={setChartObj} />
								{rangeProps && <CutoffSlider {...rangeProps} />}
							</div>
						</CardBody>
						<CardFooter>
							<h4>Estimated Reduction</h4>
							<h4 className="reduction-number ml-4">
								{(reduction * 100).toFixed(1)}%
							</h4>
						</CardFooter>
					</GLCard>
				</Col>
				<Col xs={3} className="px-0">
					<DomainList buckets={sortedBuckets} min={co2Cutoff} />
				</Col>
			</Row>
			<p className="mt-2">
				These lists are based on observed data within the current filters. <br />
				We also have general publisher lists available for use. Please contact{' '}
				<a href="mailto:support@good-loop.com?subject=Carbon%20reducttion%20publisher%20lists">support@good-loop.com</a> for information.
			</p>
		</GLCard>
	</>;
}


export default GreenRecsPublisher;