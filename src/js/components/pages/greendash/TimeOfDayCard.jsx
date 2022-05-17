import React from 'react';
import NewChartWidget from '../../NewChartWidget';
import { GreenCard } from './dashutils';


const hourLabels = [];
const hourData = [];

for (let i = 1; i <= 24; i++) {
	hourLabels.push(`${((i-1)%12)+1} ${(i < 12 ? 'AM' : 'PM')}`);
	hourData.push(Math.round(Math.random() * 50));
}

const dummyDataTime = {
	labels: hourLabels,
	datasets: [{
		label: 'Kg CO2',
		data: hourData,
	}],
};


const TimeOfDayCard = ({}) => {
	return <GreenCard title="When are your ad carbon emissions highest?">
		<NewChartWidget type="bar" data={dummyDataTime} />
	</GreenCard>;
};

export default TimeOfDayCard;
