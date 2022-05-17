import React, { useState } from 'react';
import { Button } from 'reactstrap';
import NewChartWidget from '../../NewChartWidget';
import { GreenCard } from './dashutils';

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


const QuarterCard = ({}) => {
	return <NewChartWidget type="bar" data={dummyDataQuarter} options={{indexAxis: 'y'}} />
};


const CampaignCard = ({}) => {
	return <NewChartWidget type="bar" data={dummyDataCampaign} options={{indexAxis: 'y'}} />
};


const CompareCard = ({}) => {
	const [mode, setMode] = useState('quarter');

	const subcard = (mode === 'quarter') ? (
		<QuarterCard />
	) : (
		<CampaignCard />
	);

	return <GreenCard title="How do your ad emissions compare?">
		<div className="d-flex justify-content-around mb-2">
			<Button size="sm" color="primary" disabled={mode === 'quarter'} onClick={() => setMode('quarter')}>Quarter</Button>
			<Button size="sm" color="primary" disabled={mode === 'campaign'} onClick={() => setMode('campaign')}>Campaign</Button>
		</div>
		{subcard}
	</GreenCard>;
};

export default CompareCard;