import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { getPeriodQuarter, GreenCard, GreenCardAbout, ModeButton, printPeriod, TONNES_THRESHOLD } from './dashutils';
import { isoDate } from '../../../base/utils/miscutils';
import { getCarbon } from './carboncalc';


const dummyDataCampaign = {
	labels: ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D',],
	datasets: [{
		label: 'Kg CO2',
		data: [67, 59, 68, 70],
	}],
};


const QuartersCard = ({tags, baseFilters}) => {
	// Set up base chart data object
	const [chartProps, setChartProps] = useState(() => ({
		data: {
			labels: ['', '', '', ''],
			datasets: [{
				label: 'CO2',
				data: [0, 0, 0, 0]
			}]
		},
		options: {
			indexAxis: 'y',
			plugins: { legend: { display: false } },
			scales: { x: { ticks: { callback: v => `${v} kg` } } },
		},
	}));


	useEffect(() => {
		// Construct four quarter periods, from the current quarter back
		const cursorDate = new Date();
		const quarters = [];
		for (let i = 0; i < 4; i++) {
			quarters.unshift(getPeriodQuarter(cursorDate));
			cursorDate.setMonth(cursorDate.getMonth() - 3);
		}

		// Get total carbon for each quarter
		quarters.forEach((quarter, i) => {
			getCarbon({ ...baseFilters, breakdowns:[/* TODO REMOVE ME WHEN BASEFILTERS IS UNFUCKED*/], start: isoDate(quarter.start), end: isoDate(quarter.end), tags}).promise.then(value => {
				setChartProps(prevProps => { // cumulatively insert new values as they arrive
					const nextProps = _.cloneDeep(prevProps);
					nextProps.data.labels[i] = printPeriod(quarter, true);

					// Display kg or tonnes?
					let thisCarbon = value.total.kgCarbon.total[0];
					nextProps.data.datasets[0].data[i] = thisCarbon; // Default to kg
					if (prevProps.tonnes) {
						// There's already been at least one data point above the threshold: just scale down the latest one
						nextProps.data.datasets[0].data[i] /= 1000;
					} else if (thisCarbon > TONNES_THRESHOLD) {
						// This is the first data point above the threshold: Scale down all points & change tick labels from kg to tonnes
						nextProps.data.datasets[0].data = nextProps.data.datasets[0].data.map(d => d / 1000);
						nextProps.options.scales.y.ticks.callback = v => `${v} t`;
						nextProps.tonnes = true;
					}

					return nextProps;
				});
			});
		});
	}, []);

	if (!chartProps) return <Misc.Loading text="Fetching data for previous quarters..." />
	return <NewChartWidget type="bar" data={chartProps.data} options={chartProps.options} />
};


const CampaignCard = ({}) => {
	return <NewChartWidget type="bar" data={dummyDataCampaign} options={{indexAxis: 'y'}} />
};


const CompareCard = (props) => {
	const [mode, setMode] = useState('quarter');

	const subcard = (mode === 'quarter') ? (
		<QuartersCard {...props} />
	) : (
		<CampaignCard {...props} />
	);

	return <GreenCard title="How do your ad emissions compare?" className="carbon-compare">
		<div className="d-flex justify-content-around mb-2">
			<ModeButton name="quarter" mode={mode} setMode={setMode}>Quarter</ModeButton>
			<ModeButton name="campaign" mode={mode} setMode={setMode}>Campaign</ModeButton>
		</div>
		{subcard}
		<GreenCardAbout>
			<p>Explanation of quarterly and per-campaign emissions comparisons</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default CompareCard;