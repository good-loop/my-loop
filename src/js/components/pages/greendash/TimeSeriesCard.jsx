import React, { useEffect, useState } from 'react';
import { Col as div, Container, Row } from 'reactstrap';
import Misc from '../../../base/components/Misc';
import { space } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import NewChartWidget from '../../NewChartWidget';
import { GreenCard, printPeriod, printDate, printDateShort, TONNES_THRESHOLD, GreenCardAbout } from './dashutils';
import { getBreakdownBy } from './carboncalc';


const icons = {
	flights: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="impact-icon flights">
		<path d="m 2.4579501,58.098912 12.8240059,8.389467 0.846291,14.027477 5.139668,-2.31032 -0.247418,-12.27075 17.937126,-7.517538 18.222278,-13.630736 6.928941,50.36164 5.305626,-2.079915 0.613965,-17.141724 5.780788,-4.264539 -1.134677,-4.738253 -4.007417,1.707725 0.538365,-10.517626 8.933694,-3.474022 -4.936451,-6.531972 -3.724557,3.357884 3.187001,-15.937857 17.636814,-11.372786 5.230632,-8.359037 -3.827514,-3.532473 -25.409082,14.033735 -13.11266,-5.05461 1.709764,-5.032594 -3.498835,-2.391194 -6.410655,4.806897 L 38.639321,13.164939 41.633008,9.1434393 36.867028,5.4563288 30.599083,10.547661 14.321793,4.8556121 9.049655,7.8051741 50.324404,36.591478 33.398986,47.566403 18.474953,59.152059 5.4434846,54.404179 Z"/>
	</svg>,
	kettles: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="impact-icon kettles">
		<path d="M16.748 84.69H83.034V96.022H16.748z"/>
		<path d="M 28.225965,32.754347 16.795513,17.67717 36.66019,17.61659 l 7.639452,-6.018142 12.124318,-0.115895 9.666995,5.229768 10.034736,2.325212 9.585964,8.342585 -0.297552,24.257258 -5.286484,4.089839 L 75.72571,55.877812 75.325008,50.234596 78.56108,42.19173 77.011217,28.800326 69.995865,25.032683 73.829128,81.40362 H 25.002041 Z"/>
		<ellipse cx="49.4925" cy="6.1511965" rx="5.3836174" ry="4.8569975"/>
	</svg>,
	driving: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="impact-icon driving">
		<path d="M 43.279297 13.248047 L 42.765625 19.076172 L 23.974609 18.630859 L 16.246094 42.496094 L 10.292969 48.919922 L 8.6953125 61.035156 L 13.71875 67.861328 L 15.160156 82.021484 L 27.509766 82.199219 L 27.097656 69.115234 L 74.193359 69.884766 L 73.277344 81.34375 C 73.277344 81.34375 85.835999 83.23029 85.451172 82.03125 C 85.066345 80.83221 86.607422 66.138672 86.607422 66.138672 L 91.599609 60.433594 L 90.513672 49.179688 L 85.121094 42.398438 L 76.425781 17.609375 L 58.099609 17.527344 L 57.701172 13.888672 L 43.279297 13.248047 z M 71.642578 22.824219 L 76.388672 41.267578 L 23.859375 40.636719 L 28.916016 23.261719 L 71.642578 22.824219 z M 70.71875 45.984375 L 82.244141 45.984375 L 82.244141 57.394531 L 70.71875 57.394531 L 70.71875 45.984375 z M 18.507812 46.603516 L 30.03125 46.603516 L 30.03125 58.011719 L 18.507812 58.011719 L 18.507812 46.603516 z"/>
	</svg>
};

/**
// According to "how bad are bananas" - a book by Mike Burners Lee
// ...which is cited in this graphic: https://www.viessmann.co.uk/company/blog/the-carbon-footprint-of-nearly-everything 

// -Boiling a litre of water using an electric kettle: 70g of carbon
// -Driving a mile in an average car: 710g
// -A plane journey from London to Hong Kong: 3.4 tonnes (this is 5982 miles, so 0.00056 tonnes per mile, or 568.99g)

// Further sources for miles driven in a car: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
// Further sources for a long haul flight: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2017 
@returns {mode: {factor:units-per-kg, desc, icon}}
 */
const co2ImpactSpecs = {
	flights: {
		src: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2017",
		factor: 1/(0.19745*5585), // CO2 per km (including radiative forcing) * London <> New York
		desc: 'long haul flights', //flights from London to New York
		icon: icons.flights,
	},
	kettles: {
		factor: 0.07, 
		desc: 'kettles boiled',
		icon: icons.kettles
	},
	driving: {
		src: "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator",
		factor: 2.482,
		desc: 'miles by car',
		icon: icons.driving
	}
};


/** Render the "That's 99,999 kettles/miles/flights" bubble */
const CO2Impact = ({kg, mode}) => {
	const unit = kg < 1000 ? 'KG' : 'TONNES';
	let guts = null;

	if (mode === 'base') {
		const amount = kg < 1000 ? <div>
			<span className="number">{printer.prettyInt(kg, true)}</span>
			<span className="unit">{unit}</span>
		</div> : <>
			<div className="number">{printer.prettyInt(kg / 1000, true)}</div>
			<div className="unit">{unit}</div>
		</>;

		guts = <div className="big-number">
			{amount}
			<div className="desc">CO<sub>2</sub>e EMITTED</div>
		</div>;
	} else {
		assert(co2ImpactSpecs[mode], `Can't render CO2-equivalent for mode "${mode}" - no conversion factor/description/etc written`);
		const {factor, desc, icon} = co2ImpactSpecs[mode];

		guts =  <div className="impact-bubble">
			<div className="impact-leader">{printer.prettyInt(kg, true)} {unit} CO<sub>2</sub>e, THAT'S</div>
			<div className="impact-number">{printer.prettyInt(kg * factor, true)}</div>
			<div className="impact-desc">{desc}</div>
			<div className="impact-icon" title={`Illustrative icon for "${desc}"`}>{icon}</div>
		</div>;
	}

	return <div className="impact-container">
		{guts}
	</div>
};


const TotalSubcard = ({ period, data }) => {
	const [mode, setMode] = useState('base');

	return (
		<div className="total-subcard d-flex flex-column">
			<div>{printPeriod(period)}</div>
			{data ? <CO2Impact kg={data.total.kgCarbon.total} mode={mode} /> : null}
			<div className="impact-buttons">
				{Object.entries(co2ImpactSpecs).map(([key, {icon}]) => {
					const selected = mode === key;
					const onClick = () => setMode(selected ? 'base' : key);
					const className = space('impact-button', key, selected && 'selected');
					return <div className={className} onClick={onClick} key={key}>
						{icon}
					</div>
				})}
			</div>
		</div>
	);
};

/** Skip rather than rotating X axis labels */
const chartOptions = {
	scales: {

	},
	plugins: {
		legend: {
			position: 'right',
		}
	}
}


const TimeSeriesCard = ({ period, data }) => {
	const [chartProps, setChartProps] = useState();

	// Convert impressions + tags to CO2 time series
	useEffect(() => {
		if (!data) return;

		// export const getBreakdownBy = (table, colNameToSum, colNameToBreakdown) => {

		const tsdata = getBreakdownBy(data.table, 'totalEmissions', 'time');

		debugger;
		const maxCO2 = Math.max(...data.time.kgCarbon.total);
		const avgCO2 = data.total.kgCarbon.total[0] / data.time.labels.length;

		// Omit year in labels if the period doesn't span a year boundary
		const labelFn = (period.start.getYear() === period.end.getYear()) ? (
			utc => printDateShort(new Date(utc))
		) : (
			utc => printDate(new Date(utc))
		);

		let label = 'Kg CO2';
		let timeSeries = data.time.kgCarbon.total;

		// Display tonnes instead of kg? (should this be avg instead of max?)
		if (maxCO2 >= TONNES_THRESHOLD) {
			label = 'Tonnes CO2';
			timeSeries = timeSeries.map(d => d / 1000);
			avgCO2 /= 1000
		}

		// Data format accepted by chart.js
		let newChartProps = {
			data: {
				labels: data.time.labels.map(labelFn),
				datasets: [{
					label,
					data: timeSeries,
					cubicInterpolationMode: 'monotone',
					borderColor: '#52727a'
				}],
			},
			options: {
				scales: {
					x: {
						ticks: { maxRotation: 0, minRotation: 0 } // Don't angle date labels - skip some if space is tight
					},
					y: {
						ticks: { callback: (maxCO2 >= TONNES_THRESHOLD ? v => `${v} t` : v => `${v} kg`)}, // Show appropriate unit
					},
				},
				plugins: {
					legend: { display: false },
					autocolors: false,
					annotation: { // add average line
						annotations: {
							line1: {
								type: 'line',
								yMin: avgCO2,
								yMax: avgCO2,
								borderDash: [5, 5],
								borderColor: '#aaa',
								borderWidth: 2,
								label: { enabled: true, content: 'Avg', position: 'end' },
							}
						}
					}
				},
			}
		};

		setChartProps(newChartProps);
	}, [data]);

	//const labelInterval = data ? Math.round(data.labels.length / numLabels) : 1;



	// TODO Don't show "Per 1000 impressions" button for one-tag mode

	return <GreenCard title="How much carbon is your digital advertising emitting?" className="carbon-time-series" row>
		<div className="chart-subcard flex-column">
			<div>CO<sub>2</sub>e emissions over time</div>
			{/* <div><Button>Per 1000 impressions</Button> <Button>Total emissions</Button></div> TODO reinstate when ready */}
			{ chartProps ? (
				<NewChartWidget data={chartProps.data} options={chartProps.options} />
			) : (
				<Misc.Loading text="Fetching emissions-over-time data..." />
			)}
		</div>
		{/* <TotalSubcard period={period} data={data} /> */}
		<GreenCardAbout>
			<p>How do we calculate the time-series carbon emissions?</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default TimeSeriesCard;
