import React from 'react';

import { Line, Pie } from 'react-chartjs-2';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

/** TODO We should be able to do this dynamically/selectively when components are rendered */
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
);


const NewChartWidget = ({type = 'line', data}) => {
	return {
		line: <Line data={data} />,
		pie: <Pie data={data} />,
	}[type];
};

export default NewChartWidget;
