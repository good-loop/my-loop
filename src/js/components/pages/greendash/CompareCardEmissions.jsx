import _ from 'lodash';
import React, { useEffect, useState } from 'react';

import { ButtonGroup } from 'reactstrap';
import NewChartWidget from '../../../base/components/NewChartWidget';
import { getId } from '../../../base/data/DataClass';
import KStatus from '../../../base/data/KStatus';
import { getDataList } from '../../../base/plumbing/Crud';
import DataStore from '../../../base/plumbing/DataStore';
import SearchQuery from '../../../base/searchquery';
import { isoDate } from '../../../base/utils/miscutils';
import C from '../../../C';
import { dataColours, getPeriodQuarter, GreenCard, GreenCardAbout, ModeButton, printPeriod, TONNES_THRESHOLD } from './dashutils';
import { emissionsPerImpressions, getCarbonEmissions, getCompressedBreakdown, getSumColumnEmissions } from './emissionscalc';

import { isPer1000 } from './GreenMetricsEmissions';


/**
 * 
 * @param {?String} unit kg|tons
 * @returns 
 */
const baseOptions = (unit='kg') => ({
	indexAxis: 'y',
	scales: { x: { ticks: { callback: v => v+' '+unit } } },
	plugins: {
		legend: { display: false },
		tooltip: { callbacks: { label: ctx => `${printer.prettyNumber(ctx.raw)} ${unit} CO2` } },
	},
});


const QuartersCard = ({baseFilters, dataValue}) => {
	// Set up base chart data object
	const chartProps = {
		data: {
			labels: ['', '', '', ''],
			datasets: [{
				data: [0, 0, 0, 0],
			}]
		},
		options: baseOptions(),
	};

	// TODO Can we use dataValue to avoid fetching again??
	// Construct four quarter periods, from the current quarter back
	const cursorDate = new Date();
	cursorDate.setHours(0, 0, 0, 0);
	const quarters = [];
	for (let i = 0; i < 4; i++) {
		quarters.unshift(getPeriodQuarter(cursorDate));
		cursorDate.setMonth(cursorDate.getMonth() - 3);
	}

	// Get total carbon for each quarter
	let pvsBuckets = quarters.map((quarter, i) => getCarbonEmissions({
		...baseFilters,
		start: isoDate(quarter.start),
		end: isoDate(quarter.end),
		breakdown: 'total{"emissions":"sum"}',
	}));
	// add it into chartProps
	pvsBuckets.forEach((pvBuckets, i) => {
		if (!pvBuckets.value) return;

		// Set label to show quarter is loaded, even if result is empty
		let quarter = quarters[i];
		chartProps.data.labels[i] = printPeriod(quarter, true);

		let buckets = pvBuckets.value.by_total.buckets;
		if (!buckets || !buckets.length) {
			return; // no data for this quarter
		}
		if (isPer1000()) {
			buckets = emissionsPerImpressions(buckets);
		}

		// Are we in carbon-per-mille mode?
		if (isPer1000()) buckets = emissionsPerImpressions(buckets);

		// Display kg or tonnes?
		let thisCarbon = getSumColumnEmissions(buckets, 'co2');
		chartProps.data.datasets[0].data[i] = thisCarbon;

		// Kg or tonnes? (using data-attr notation so we can dump all props into the chart without React complaining)
		if (chartProps['data-tonnes']) {
			// There's already been at least one data point above the threshold: just scale down the latest one
			chartProps.data.datasets[0].data[i] /= 1000;
		} else if (thisCarbon > TONNES_THRESHOLD) {
			// This is the first data point above the threshold: Scale down all points & change tick labels from kg to tonnes
			chartProps.data.datasets[0].data = chartProps.data.datasets[0].data.map(d => d / 1000);
			chartProps.options.scales.x.ticks.callback = v => `${v} t`;
			chartProps.options.plugins.tooltip.callbacks.label = ctx => `${printer.prettyNumber(ctx.raw)} tonnes CO2`
			chartProps['data-tonnes'] = true;
		}
	});

	// Set Steps if data is too small
	let maxVal = 0;
	chartProps.data.datasets[0].data.forEach(val => {if (val > maxVal) maxVal = val})
	if (maxVal < 1) {
		chartProps.options.scales.x.ticks.stepSize = 0.1;
	}

	// Assign bar colours
	chartProps.data.datasets[0].backgroundColor = dataColours(chartProps.data.datasets[0].data);

	return <NewChartWidget type="bar" {...chartProps} />
};


const CampaignCard = ({baseFilters}) => {
	const pvChartData = getCarbonEmissions({
		...baseFilters,
		breakdown: [
			'campaign{"emissions":"sum"}',
		],
		name:"campaign-chartdata"
	});
	let dataValue = pvChartData.value;

	let vbyx = {};	
	if (dataValue) {				
		let buckets = dataValue.by_campaign.buckets;
		if (isPer1000()) {
			buckets = emissionsPerImpressions(buckets);
		}

		let breakdownByX = {};
		buckets.forEach(row => breakdownByX[row.key] = row.co2);
		vbyx = getCompressedBreakdown({breakdownByX});	
	}
	
	let bucketValues = Object.values(vbyx);
	const labels = Object.keys(vbyx);

	const chartProps = {
		data: {
			labels,
			datasets: [{ data:bucketValues }]
		},
		options: baseOptions(),
	};

	// Assign bar colours
	let colors = dataColours(chartProps.data.datasets[0].data);
	chartProps.data.datasets[0].backgroundColor = colors;

	return <NewChartWidget type="bar" {...chartProps} />
};


const CompareCardEmissions = ({dataValue, ...props}) => {
	const [mode, setMode] = useState('quarter');
	// TODO don't offer campaign biew if we're focuding on one campaign
	const campaignModeDisabled = !! DataStore.getUrlValue("campaign");

	const subcard = (mode === 'quarter') ? (
		<QuartersCard dataValue={dataValue} {...props} />
	) : (
		<CampaignCard {...props} />
	);

	return <GreenCard title="How do your ad emissions compare?" className="carbon-compare">
		<div className="d-flex justify-content-around mb-2">
			<ButtonGroup>
				<ModeButton name="quarter" mode={mode} setMode={setMode}>
					Quarter
				</ModeButton>
				<ModeButton name="campaign" mode={mode} setMode={setMode} disabled={campaignModeDisabled} >
					Campaign
				</ModeButton>
			</ButtonGroup>
		</div>
		{subcard}
		<GreenCardAbout>
			<p>Explanation of quarterly and per-campaign emissions comparisons</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default CompareCardEmissions;