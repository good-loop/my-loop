import React from 'react';

import { Line, Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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


const NewChartWidget = ({type = 'line', datalabels, ...props}) => {
	props.options = props.options || {};
	props.options.maintainAspectRatio = props.options.maintainAspectRatio || false;
	if (datalabels) {
		if (props.plugins) {
			if (!props.plugins.includes(ChartDataLabels)) props.plugins.push(ChartDataLabels);
		} else props.plugins = [ChartDataLabels];
	}

	return <div className="chart-canvas-container">
		{{
			line: <Line {...props} />,
			pie: <Pie {...props} />,
			bar: <Bar {...props} />,
		}[type]}
	</div>;
};

export default NewChartWidget;
