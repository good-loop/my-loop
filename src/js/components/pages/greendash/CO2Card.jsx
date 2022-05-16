import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { isoDate, space } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import NewChartWidget from '../../NewChartWidget';
import { byId, dataToCarbon, GreenCard, impsToBytes, printPeriod } from './dashutils';


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


const co2ImpactSpecs = {
	flights: {
		factor: 0.0007672,
		desc: 'long haul flights',
		icon: icons.flights,
	},
	kettles: {
		factor: .03267,
		desc: 'kettles boiled',
		icon: icons.kettles
	},
	driving: {
		factor: 2.481,
		desc: 'miles driven in a car',
		icon: icons.driving
	}
};


/** Render the "That's 99,999 kettles/miles/flights" bubble */
const CO2Impact = ({kg, mode}) => {
	const unit = kg < 1000 ? 'KG' : 'TONNES';

	if (mode === 'base') {
		const amount = kg < 1000 ? <div>
			<span className="number">{printer.prettyInt(kg, true)}</span>
			<span className="unit">{unit}</span>
		</div> : <>
			<div className="number">{printer.prettyInt(kg / 1000, true)}</div>
			<div className="unit">{unit}</div>
		</>;

		return <div className="big-number">
			{amount}
			<div className="desc">CO<sub>2</sub>e EMITTED</div>
		</div>;
	}

	assert(co2ImpactSpecs[mode], `Can't render CO2-equivalent for mode "${mode}" - no conversion factor/description/etc written`);
	const {factor, desc, icon} = co2ImpactSpecs[mode];

	return <div className="impact-bubble">
		<div className="impact-leader">{printer.prettyInt(kg, true)} {unit} CO<sub>2</sub>e, THAT'S</div>
		<div className="impact-number">{printer.prettyInt(kg * factor, true)}</div>
		<div className="impact-desc">{desc}</div>
		<div className="impact-icon" title={`Illustrative icon for "${desc}"`}>{icon}</div>
	</div>;
};


const dummyChartData = {
	labels: ['2021-09', '2021-10', '2021-11', '2021-12', '2022-01', '2022-02', '2022-03', '2022-04'],
	datasets: [{
		label: 'CO2 or something',
		data: [50, 55, 60, 75, 100, 90, 85, 87]
	}]
};


const CO2Card = ({ period, data: rawData, tags }) => {
	const [mode, setMode] = useState('base');
	const [data, setData] = useState();
	const [totalCO2, setTotalCO2] = useState(0);

	// Convert impressions + tags to CO2 time series
	useEffect(() => {
		if (!rawData || !tags) return;

		// Data format accepted by chart.js
		let newData = {
			labels: [],
			datasets: [{
				label: 'Kg CO2',
				data: [],
				cubicInterpolationMode: 'monotone',
				borderColor: '#52727a'
			}, {
				label: 'Avg',
				data: [],
				pointRadius: 0,
				borderDash: [5, 5],
				borderColor: '#aaa'
			}],
		};

		// Construct average line
		let tempAvg = 0;

		// Add up total carbon for period
		let runningTotalCO2 = 0;

		// map tag IDs to tag objects
		const tagsById = byId(tags);

		let maxCO2 = 0;

		// Populate transformed chart data
		rawData.by_time_adid.buckets.forEach(bkt => {
			const bktDate = new Date(bkt.key);
			newData.labels.push(isoDate(bktDate));
			const bytesForDate = impsToBytes(bkt.by_adid.buckets, tagsById);
			const carbonForDate = dataToCarbon(bytesForDate); // TODO Non-default country
			if (carbonForDate > maxCO2) maxCO2 = carbonForDate;
			runningTotalCO2 += carbonForDate;
			newData.datasets[0].data.push(carbonForDate);
			tempAvg += carbonForDate;
		});

		// Display tonnes instead of kg for 10000+
		if (maxCO2 >= 10000) {
			newData.datasets[0].data.forEach((d, i) => {
				newData.datasets[0].data[i] = d / 1000;
			})
			newData.datasets[0].label = 'Tonnes CO2';
			tempAvg /= 1000;
		}

		// normalise avg and duplicate across range
		tempAvg /= newData.datasets[0].data.length;
		for (let i = 0; i < newData.datasets[0].data.length; i++) {
			newData.datasets[1].data.push(tempAvg);
		};



		setData(newData);
		setTotalCO2(runningTotalCO2);
	}, [rawData, tags]);

	// TODO Don't show "Per 1000 impressions" button for one-tag mode

	return <GreenCard title="How much carbon is your digital advertising emitting?" className="carbon-time-series">
		<div className="chart-subcard">
			<div>CO<sub>2</sub>e emissions over time</div>
			{/* <div><Button>Per 1000 impressions</Button> <Button>Total emissions</Button></div> TODO reinstate when ready */}
			<NewChartWidget data={data || dummyChartData} />
		</div>
		<div className="total-subcard">
			<div>{printPeriod(period)}</div>
			<CO2Impact kg={totalCO2} mode={mode} />
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
	</GreenCard>;
};

export default CO2Card;
