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
import { space } from '../base/utils/miscutils';

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

/**
 * 
 * @param {Object} p
 * @param {Object} p.data { labels:string[], datasets:[] }
 * @param {Object} p.datalabels See https://www.npmjs.com/package/chartjs-plugin-datalabels
 * @returns 
 */
const NewChartWidget = ({type = 'line', datalabels, className, style, ...props}) => {
	props.options = props.options || {};
	props.options.maintainAspectRatio = props.options.maintainAspectRatio || false;
	if (datalabels) {
		if (props.plugins) {
			if (!props.plugins.includes(ChartDataLabels)) props.plugins.push(ChartDataLabels);
		} else props.plugins = [ChartDataLabels];
	}

	return <div className={space("chart-canvas-container position-relative", className)} style={style}>
		{{
			line: <Line {...props} />,
			pie: <Pie {...props} />,
			bar: <Bar {...props} />,
		}[type]}
	</div>;
};

export default NewChartWidget;
