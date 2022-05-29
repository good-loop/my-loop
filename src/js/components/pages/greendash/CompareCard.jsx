import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import _ from 'lodash';

import Misc from '../../../base/components/Misc';
import { getDataLogData } from '../../../base/plumbing/DataLog';
import NewChartWidget from '../../NewChartWidget';
import { byId, dataToCarbon, getPeriodQuarter, GreenCard, calcBytes, printPeriod } from './dashutils';
import { isoDate } from '../../../base/utils/miscutils';

const dummyDataQuarter = {
	labels: ['Q3 \'21', 'Q4 \'21', 'Q1 \'22', 'Q2 \'22',],
	datasets: [{
		label: 'Kg CO2',
		data: [77, 69, 60, 32],
	}],
};

const dummyDataCampaign = {
	labels: ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D',],
	datasets: [{
		label: 'Kg CO2',
		data: [67, 59, 68, 70],
	}],
};

const baseDataQuarters = {
	labels: ['', '', '', ''],
	datasets: [{
		label: 'Kg CO2',
		data: [0, 0, 0, 0]
	}]
};




const QuartersCard = ({campaigns, tags, baseFilters}) => {
	const [data, setData] = useState(_.cloneDeep(baseDataQuarters));

	useEffect(() => {
		const tagsById = byId(tags);

		// construct four quarter periods, from the current quarter back
		const cursorDate = new Date();
		const quarters = [];
		for (let i = 0; i < 4; i++) {
			quarters.unshift(getPeriodQuarter(cursorDate));
			cursorDate.setMonth(cursorDate.getMonth() - 3);
		}

		// Get total carbon for each quarter
		quarters.forEach((quarter, i) => {
			const start = isoDate(quarter.start);
			const end = isoDate(quarter.end);
			getDataLogData({ ...baseFilters, start, end, breakdowns: ['adid']}).promise.then(res => {
				
				// Calculate data usage & carbon emissions for this quarter and insert in the data array at the appropriate point
				const bytes = calcBytes(res.by_adid.buckets, tagsById).total;
				const carbon = dataToCarbon(bytes);
				setData(prevData => {
					const nextData = _.cloneDeep(prevData);
					nextData.labels[i] = printPeriod(quarter);
					nextData.datasets[0].data[i] = carbon;
					return nextData;
				})
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

	return <GreenCard title="How do your ad emissions compare?">
		<div className="d-flex justify-content-around mb-2">
			<Button size="sm" color="primary" active={mode === 'quarter'} onClick={() => setMode('quarter')}>Quarter</Button>
			<Button size="sm" color="primary" active={mode === 'campaign'} onClick={() => setMode('campaign')}>Campaign</Button>
		</div>
		{subcard}
	</GreenCard>;
};

export default CompareCard;