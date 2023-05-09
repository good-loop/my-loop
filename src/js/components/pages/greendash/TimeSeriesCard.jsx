import React, { useEffect, useState } from 'react';
import { Col as div, Container, Row, Tooltip } from 'reactstrap';
import Misc from '../../../base/components/Misc';
import { space, yessy } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import NewChartWidget from '../../../base/components/NewChartWidget';
import { GreenCard, printPeriod, printDate, printDateShort, TONNES_THRESHOLD, GreenCardAbout, Mass, NOEMISSIONS, CO2e } from './dashutils';
import { emissionsPerImpressions, getBreakdownByWithCount } from './emissionscalcTs';
import Icon from '../../../base/components/Icon';
import { nonce } from '../../../base/data/DataClass';
import LinkOut from '../../../base/components/LinkOut';
import { isPer1000 } from './GreenMetrics';


const icons = {
	flights: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="impact-icon flights">
		<path d="m 2.4579501,58.098912 12.8240059,8.389467 0.846291,14.027477 5.139668,-2.31032 -0.247418,-12.27075 17.937126,-7.517538 18.222278,-13.630736 6.928941,50.36164 5.305626,-2.079915 0.613965,-17.141724 5.780788,-4.264539 -1.134677,-4.738253 -4.007417,1.707725 0.538365,-10.517626 8.933694,-3.474022 -4.936451,-6.531972 -3.724557,3.357884 3.187001,-15.937857 17.636814,-11.372786 5.230632,-8.359037 -3.827514,-3.532473 -25.409082,14.033735 -13.11266,-5.05461 1.709764,-5.032594 -3.498835,-2.391194 -6.410655,4.806897 L 38.639321,13.164939 41.633008,9.1434393 36.867028,5.4563288 30.599083,10.547661 14.321793,4.8556121 9.049655,7.8051741 50.324404,36.591478 33.398986,47.566403 18.474953,59.152059 5.4434846,54.404179 Z" />
	</svg>,
	kettles: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="impact-icon kettles">
		<path d="M16.748 84.69H83.034V96.022H16.748z" />
		<path d="M 28.225965,32.754347 16.795513,17.67717 36.66019,17.61659 l 7.639452,-6.018142 12.124318,-0.115895 9.666995,5.229768 10.034736,2.325212 9.585964,8.342585 -0.297552,24.257258 -5.286484,4.089839 L 75.72571,55.877812 75.325008,50.234596 78.56108,42.19173 77.011217,28.800326 69.995865,25.032683 73.829128,81.40362 H 25.002041 Z" />
		<ellipse cx="49.4925" cy="6.1511965" rx="5.3836174" ry="4.8569975" />
	</svg>,
	driving: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="impact-icon driving">
		<path d="M 43.279297 13.248047 L 42.765625 19.076172 L 23.974609 18.630859 L 16.246094 42.496094 L 10.292969 48.919922 L 8.6953125 61.035156 L 13.71875 67.861328 L 15.160156 82.021484 L 27.509766 82.199219 L 27.097656 69.115234 L 74.193359 69.884766 L 73.277344 81.34375 C 73.277344 81.34375 85.835999 83.23029 85.451172 82.03125 C 85.066345 80.83221 86.607422 66.138672 86.607422 66.138672 L 91.599609 60.433594 L 90.513672 49.179688 L 85.121094 42.398438 L 76.425781 17.609375 L 58.099609 17.527344 L 57.701172 13.888672 L 43.279297 13.248047 z M 71.642578 22.824219 L 76.388672 41.267578 L 23.859375 40.636719 L 28.916016 23.261719 L 71.642578 22.824219 z M 70.71875 45.984375 L 82.244141 45.984375 L 82.244141 57.394531 L 70.71875 57.394531 L 70.71875 45.984375 z M 18.507812 46.603516 L 30.03125 46.603516 L 30.03125 58.011719 L 18.507812 58.011719 L 18.507812 46.603516 z" />
	</svg>
};

/**
// According to "how bad are bananas" - a book by Mike Burners Lee
// ...which is cited in this graphic: https://www.viessmann.co.uk/company/blog/the-carbon-footprint-of-nearly-everything 

// -Boiling a litre of water using an electric kettle: 70g of carbon (but who boils a litre?? that's ~4 mugs worth)

// Miles driven in a car: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
gives car-miles-per-ton: 2,482
// Further sources for a long haul flight: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2017 
@returns {mode: {factor:units-per-kg, desc, icon}}
 */
const co2ImpactSpecs = {
	flights: {
		src: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2017",
		srcDesc: "Flights from London to New York (including radiative forcing)",
		factor: 1 / (0.19745 * 5585), // CO2 per km (including radiative forcing) * London <> New York
		desc: 'long haul flights', //flights from London to New York
		icon: icons.flights,
	},
	kettles: {
		factor: 1 / 0.07,
		desc: 'kettles boiled',
		icon: icons.kettles,
		srcDesc: "This will vary based on your electricity supply",
		src: "https://www.viessmann.co.uk/company/blog/the-carbon-footprint-of-nearly-everything"
		// SVG on that page is present but invisible: see
		// https://cdn0.scrvt.com/2828ebc457efab95be01dd36047e3b52/b2db73e96a8769dd/23a51a974007/The-Carbon-Footprint.svg
	},
	driving: {
		src: "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator",
		factor: 3.994,
		desc: 'km by car',
		icon: icons.driving
	}
};


/** Render the "That's 99,999 kettles/miles/flights" bubble */
const CO2Impact = ({ kg, mode }) => {
	if (mode === 'base') return (
		<div className="impact-container">
			<div className="big-number">
				<Mass kg={kg} />
				<div className="desc">
					{CO2e}{' '}{isPer1000() ? 'per 1000 impressions' : 'emitted'}
				</div>
			</div>
		</div>
	);

	assert(co2ImpactSpecs[mode], `Can't render CO2-equivalent for mode "${mode}" - no conversion factor/description/etc written`);
	const { factor, desc, icon, src, srcDesc } = co2ImpactSpecs[mode];

	return <div className="impact-container" title={"Source: " + src}>
		<div className="impact-bubble">
			<div className="impact-leader"><Mass kg={kg} /> {CO2e}: that's</div>
			<div className="impact-number">{printer.prettyInt(kg * factor, true)}</div>
			<div className="impact-desc">{desc}</div>
			<div className="impact-icon" title={`Illustrative icon for "${desc}"`}>{icon}</div>			
		</div>
	</div>
};

/**
 * Status: not used! An (i) which you can hover / click on for info. 
 */
const InfoPop = ({children}) => {
	const [id] = useState(nonce());
	const [isOpen, setIsOpen] = useState();
	const toggle = () => setIsOpen( ! isOpen);
	return <>
		<span id={id}><Icon name="info" /></span>
		<Tooltip target={id} isOpen={isOpen} toggle={toggle}>{children}</Tooltip>
	</>;
}

const TotalSubcard = ({ period, aggCO2, per1000 }) => {
	let [mode, setMode] = useState('base');
	if (isPer1000()) mode = 'base'; // Override - never show impact equivalents in per-1000 mode
	// Per-1000 mode: "total" would be sum of daily carbon-per-mille values, which makes no sense
	const totalCO2 = aggCO2?.[isPer1000() ? 'avg' : 'total'] || 0;

	// "That's X long-haul flights" doesn't really make sense in per-1000 mode
	const showImpacts = (totalCO2 > 0 && !isPer1000());

	return (
		<div className="total-subcard flex-column justify-content-between">
			<div>
				{printPeriod(period)}
				{/* the popup doesnt work well with a link {mode!=="base" && <InfoPop>{co2ImpactSpecs[mode].desc} <LinkOut href={co2ImpactSpecs[mode].src} fetchTitle /></InfoPop>} */}
			</div>
			{totalCO2 >= 0 && <CO2Impact kg={totalCO2} mode={mode} />}
			{showImpacts && (
				<div className="impact-buttons">
					{Object.entries(co2ImpactSpecs).map(([key, { icon, src, srcDesc }]) => {
						const selected = mode === key;
						const onClick = () => setMode(selected ? 'base' : key);
						const className = space('impact-button', key, selected && 'selected');
						const title = [srcDesc, src && "Reference: "+src].filter(x => x).join("\r\n");
						return <div className={className} onClick={onClick} key={key} title={title} >
							{icon}
						</div>
					})}
				</div>
			)}
		</div>
	);
};


const TimeSeriesCard = ({ period, data: timeTable, per1000, noData }) => {
	const [chartProps, setChartProps] = useState(); // ChartJS-ready props object
	const [aggCO2, setAggCO2] = useState(); // avg/total/max CO2

	// Convert impressions + tags to CO2 time series
	useEffect(() => {
		if (!yessy(timeTable)) return;

		// TODO refactor to use the timeSeriesChartFromKeyValue function in NewChartWidget
		// Omit year in labels if the period doesn't span a year boundary
		const labelFn = (period.start.getYear() === period.end.getYear()) ? (
			utc => printDateShort(new Date(utc))
		) : (
			utc => printDate(new Date(utc))
		);

		const labels = [];
		const data = [];

		// Is the "show normalised emissions vs impressions" toggle set?
		if (per1000) {
			timeTable = emissionsPerImpressions(timeTable);
		}
		
		// Sum total emissions for each date across all other factors, sort, and unzip to labels/data arrays
		Object.entries(getBreakdownByWithCount(timeTable, ['co2'], 'time')).sort(
			([ta], [tb]) => new Date(ta).getTime() - new Date(tb).getTime()
		).forEach(([time, kg]) => {
			labels.push(labelFn(time));
			data.push(kg.co2);
		});

		let totalCO2 = data.reduce((acc, d) => acc + d, 0);
		let maxCO2 = Math.max(...data);
		let avgCO2 = totalCO2 / labels.length;

		setAggCO2({ avg: avgCO2, max: maxCO2, total: totalCO2 });

		// No impressions --> no chart
		if (totalCO2 === 0) {
			setChartProps({ isEmpty: true });
			return;
		}

		let label = 'Kg CO2';

		// Display tonnes instead of kg? (should this be avg instead of max?)
		let ticksShowTonnes = false // Ticks on scales can't check if maxCO2 >= 1000 after we change the value
		if (maxCO2 >= TONNES_THRESHOLD) {
			label = 'Tonnes CO2';
			data.forEach((d, i) => data[i] = d / 1000);
			avgCO2 /= 1000;
			maxCO2 /= 1000;
			totalCO2 /= 1000;
			ticksShowTonnes = true;
		}

		// Data format accepted by chart.js
		let newChartProps = {
			data: {
				labels,
				datasets: [{
					label,
					data,
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
						ticks: { callback: (ticksShowTonnes ? v => `${v} t` : v => `${v} kg`), precision: 2 }, // Show appropriate unit
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
	}, [timeTable, per1000]);

	let chartContent = <Misc.Loading text="Fetching emissions-over-time data..." />;
	if (chartProps) {
		chartContent = chartProps.isEmpty ? null : (
			<NewChartWidget data={chartProps.data} options={chartProps.options} height={null} width={null} />
		);
	} else if (noData) {
		chartContent = <p>No data for this period</p>;
	}


	return <GreenCard title="How much carbon is your digital advertising emitting?" className="carbon-time-series" row>
		<div className="chart-subcard flex-column w-100">
			{chartProps?.isEmpty ? (
				NOEMISSIONS
			) : (
				<div>{CO2e} emissions {per1000 ? 'per 1000 impressions': 'over time'}</div>
			)}
			{/* <div><Button>Per 1000 impressions</Button> <Button>Total emissions</Button></div> TODO reinstate when ready */}
			{chartContent}
		</div>
		<TotalSubcard period={period} aggCO2={aggCO2} per1000={per1000} />
		<GreenCardAbout>
			<p>How do we calculate the time-series carbon emissions?</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default TimeSeriesCard;
