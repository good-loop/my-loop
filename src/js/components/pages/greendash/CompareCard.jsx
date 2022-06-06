import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import _ from 'lodash';

import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { getPeriodQuarter, GreenCard, GreenCardAbout, printPeriod } from './dashutils';
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
	const [data, setData] = useState(() => ({
		labels: ['', '', '', ''],
		datasets: [{
			label: 'Kg CO2',
			data: [0, 0, 0, 0]
		}]
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
			getCarbon({ ...baseFilters, breakdowns:[/* TODO REMOVE ME WHEN BASEFILTERS IS UNFUCKED*/] ,start: isoDate(quarter.start), end: isoDate(quarter.end), tags}).promise.then(value => {
				setData(prevData => { // cumulatively insert new values as they arrive
					const nextData = _.cloneDeep(prevData);
					nextData.labels[i] = printPeriod(quarter);
					nextData.datasets[0].data[i] = value.total.kgCarbon.total[0];
					return nextData;
				});
			});
		});
	}, []);

	if (!data) return <Misc.Loading text="Fetching data for previous quarters..." />
	return <NewChartWidget type="bar" data={data} options={{indexAxis: 'y'}} />
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
			<Button size="sm" color="primary" active={mode === 'quarter'} onClick={() => setMode('quarter')}>Quarter</Button>
			<Button size="sm" color="primary" active={mode === 'campaign'} onClick={() => setMode('campaign')}>Campaign</Button>
		</div>
		{subcard}
		<GreenCardAbout>
			<p>Explanation of quarterly and per-campaign emissions comparisons</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default CompareCard;