import React, { useState } from 'react';
import { Button } from 'reactstrap';
import NewChartWidget from '../../NewChartWidget';
import { GreenCard } from './dashutils';

const dummyDataTech =  {
	labels: ['Logging', 'Media', 'Overhead (JS + XML)'],
	datasets: [{
		label: 'Kg CO2',
		data: [14, 47, 39],
	}],
};

const dummyDataOSMobile = {
	labels: ['Android', 'iOS Phone', 'iOS Tablet'],
	datasets: [{
		label: 'Kg CO2',
		data: [60, 42, 74],
	}],
};

const dummyDataOSDesktop = {
	labels: ['Windows', 'Mac'],
	datasets: [{
		label: 'Kg CO2',
		data: [60, 42],
	}],
};

const TechSubcard = () => {
	return <>
		<p>CO<sub>2</sub>e emissions due to...</p>
		<NewChartWidget type="pie" data={dummyDataTech} />
	</>;
};

const DeviceSubcard = () => {
	return <>
		<p></p>
		<NewChartWidget type="bar" data={dummyDataOSMobile} options={{indexAxis: 'y'}} />
		<NewChartWidget type="bar" data={dummyDataOSDesktop} options={{indexAxis: 'y'}} />
	</>;
}

const BreakdownCard = ({}) => {
	const [mode, setMode] = useState('tech');

	const subcard = (mode === 'tech') ? (
		<TechSubcard />
	) : (
		<DeviceSubcard />
	);

	return <GreenCard title="What is the breakdown of your emissions?">
		<div className="d-flex justify-content-around mb-2">
			<Button size="sm" color="primary" disabled={mode === 'tech'} onClick={() => setMode('tech')}>Ad Tech</Button>
			<Button size="sm" color="primary" disabled={mode === 'device'} onClick={() => setMode('device')}>Device Type</Button>
		</div>
		{subcard}
	</GreenCard>;
};


export default BreakdownCard;
