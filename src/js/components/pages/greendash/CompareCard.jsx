import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { dataColours, getPeriodQuarter, GreenCard, GreenCardAbout, ModeButton, printPeriod, TONNES_THRESHOLD } from './dashutils';
import { isoDate } from '../../../base/utils/miscutils';
import { getCarbon, getSumColumn } from './carboncalc';
import { getDataList } from '../../../base/plumbing/Crud';
import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import { getId } from '../../../base/data/DataClass';


const dummyDataCampaign = {
	labels: ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D',],
	datasets: [{
		label: 'Kg CO2',
		data: [67, 59, 68, 70],
	}],
};

const baseOptions = {
	indexAxis: 'y',
	scales: { x: { ticks: { callback: v => `${v} kg` } } },
	plugins: {
		legend: { display: false },
		tooltip: { callbacks: { label: ctx => `${printer.prettyNumber(ctx.raw)} kg CO2` } },
	},
};


const QuartersCard = ({baseFilters}) => {
	// Set up base chart data object
	const [chartProps, setChartProps] = useState(() => ({
		data: {
			labels: ['', '', '', ''],
			datasets: [{
				data: [0, 0, 0, 0],
			}]
		},
		options: baseOptions,
	}));


	useEffect(() => {
		// Construct four quarter periods, from the current quarter back
		const cursorDate = new Date();
		cursorDate.setHours(0, 0, 0);
		const quarters = [];
		for (let i = 0; i < 4; i++) {
			quarters.unshift(getPeriodQuarter(cursorDate));
			cursorDate.setMonth(cursorDate.getMonth() - 3);
		}

		// Get total carbon for each quarter
		quarters.forEach((quarter, i) => {
			getCarbon({ ...baseFilters, start: isoDate(quarter.start), end: isoDate(quarter.end)}).promise.then(value => {
				setChartProps(prevProps => { // cumulatively insert new values as they arrive
					const nextProps = _.cloneDeep(prevProps);
					nextProps.data.labels[i] = printPeriod(quarter, true);

					// Display kg or tonnes?
					let thisCarbon = getSumColumn(value.table, 'totalEmissions');
					nextProps.data.datasets[0].data[i] = thisCarbon;

					// Kg or tonnes?
					if (prevProps.tonnes) {
						// There's already been at least one data point above the threshold: just scale down the latest one
						nextProps.data.datasets[0].data[i] /= 1000;
					} else if (thisCarbon > TONNES_THRESHOLD) {
						// This is the first data point above the threshold: Scale down all points & change tick labels from kg to tonnes
						nextProps.data.datasets[0].data = nextProps.data.datasets[0].data.map(d => d / 1000);
						nextProps.options.scales.x.ticks.callback = v => `${v} t`;
						nextProps.options.plugins.tooltip.callbacks.label = ctx => `${printer.prettyNumber(ctx.raw)} tonnes CO2`
						nextProps.tonnes = true;
					}

					// Assign bar colours
					nextProps.data.datasets[0].backgroundColor = dataColours(nextProps.data.datasets[0].data);

					return nextProps;
				});
			});
		});
	}, []);

	if (!chartProps) return <Misc.Loading text="Fetching data for previous quarters..." />

	return <NewChartWidget type="bar" {...chartProps} />
};


/** Transform a GreenCalcServlet data table pertaining to a campaign & insert it in the chart data object */
const insertCampaignData = (prevProps, campaign, table) => {
	const nextProps = _.cloneDeep(prevProps);
	const labels = [...nextProps.data.labels];
	const data = [...nextProps.data.datasets[0].data];

	// Insert new values in sorted position, order alphabetically by campaign name
	const insertIndex = labels.length ? labels.findIndex(label => label > campaign.name) : 0;
	labels.splice(insertIndex, 0, campaign.name);
	data.splice(insertIndex, 0, getSumColumn(table, 'totalEmissions'));

	nextProps.data.labels = labels;
	nextProps.data.datasets[0].data = data;
	nextProps.data.datasets[0].backgroundColor = dataColours(data);

	return nextProps;
};


const CampaignCard = ({baseFilters, campaignIds}) => {
	const [chartProps, setChartProps] = useState(() => ({
		data: {
			labels: [],
			datasets: [{ data: [] }]
		},
		options: baseOptions,
	}));

	useEffect(() => {
		getDataList({
			type: C.TYPES.Campaign,
			status: KStatus.PUB_OR_DRAFT,
			ids: campaignIds
		}).promise.then(({hits: campaigns}) => {
			campaigns.forEach(campaign => {
				getCarbon({...baseFilters, q: `campaign:${getId(campaign)}`, nocache: true}).promise.then(res => {
					setChartProps(prev => insertCampaignData(prev, campaign, res.table));
				});
			})
		});
	}, [campaignIds]);

	// if (chartProps.data.labels.length < campaignIds.length) return

	return <NewChartWidget type="bar" {...chartProps} />
};


const CompareCard = (props) => {
	const [mode, setMode] = useState('quarter');
	const [campaignIds, setCampaignIds] = useState([]);

	// Get available (shared-with-user) campaigns to decide whether compare-campaigns mode is available
	useEffect(() => {
		Login.getSharedWith().then(({cargo: shareList}) => {
			if (!shareList) return;

			const nextCampaignIds = [];
			shareList.forEach(share => {
				const matches = share.item.match(/^Campaign:(\w+)/);
				if (matches) nextCampaignIds.push(matches[1]);
			});
			setCampaignIds(nextCampaignIds);
		});
	}, [Login.getId()])

	const subcard = (mode === 'quarter') ? (
		<QuartersCard {...props} />
	) : (
		<CampaignCard {...props} campaignIds={campaignIds} />
	);

	return <GreenCard title="How do your ad emissions compare?" className="carbon-compare">
		<div className="d-flex justify-content-around mb-2">
			<ModeButton name="quarter" mode={mode} setMode={setMode}>
				Quarter
			</ModeButton>
			<ModeButton name="campaign" mode={mode} setMode={setMode} disabled={campaignIds.length <= 1}>
				Campaign
			</ModeButton>
		</div>
		{subcard}
		<GreenCardAbout>
			<p>Explanation of quarterly and per-campaign emissions comparisons</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default CompareCard;