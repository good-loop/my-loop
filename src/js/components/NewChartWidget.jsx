import React from 'react';

import { Line, Pie, Bar } from 'react-chartjs-2';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement,
	BarElement,
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
	BarElement,
	Title,
	Tooltip,
	Legend
);


const NewChartWidget = ({type = 'line', ...props}) => {
	props.options = props.options || {};
	props.options.maintainAspectRatio = props.options.maintainAspectRatio || false;

	return <div className="chart-canvas-container">
		{{
			line: <Line {...props} />,
			pie: <Pie {...props} />,
			bar: <Bar {...props} />,
		}[type]}
	</div>;
};

export default NewChartWidget;
