import React, { useEffect, useState } from 'react';

import Icon from '../../../base/components/Icon';
import Misc from '../../../base/components/Misc';
import { sum } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import NewChartWidget from '../../NewChartWidget';
import { getBreakdownBy, getSumColumn } from './carboncalc';
import { dataColours, GreenCard, GreenCardAbout, ModeButton, TONNES_THRESHOLD } from './dashutils';


/** Classify OS strings seen in our data  
 * 
 * {raw-value: {type:desktop|mobile, group, name} }
*/
const osTypes = {
	windows: { type: 'desktop', group: 'Windows', name: 'Windows' },
	'mac os x': { type: 'desktop', group: 'Mac OS X', name: 'Mac OS X' },
	'windows nt 4.0': { type: 'desktop', group: 'Windows', name: 'Windows NT 4.0' },
	'chrome os': { type: 'desktop', group: 'Other Desktop', name: 'Chrome OS' },
	linux: { type: 'desktop', group: 'Other Desktop', name: 'Linux' },
	ubuntu: { type: 'desktop', group: 'Other Desktop', name: 'Ubuntu Linux' },
	fedora: { type: 'desktop', group: 'Other Desktop', name: 'Fedora Linux' },
	openbsd: { type: 'desktop', group: 'Other Desktop', name: 'OpenBSD' },
	freebsd: { type: 'desktop', group: 'Other Desktop', name: 'FreeBSD' },
	other: { type: 'desktop', group: 'Other Desktop', name: 'Other' }, // probably there are a few more smart TV etc OSs that get lumped in here
	ios: { type: 'mobile', group: 'iOS', name: 'iOS' },
	android: { type: 'mobile', group: 'Android', name: 'Android' },
	'windows phone': { type: 'mobile', group: 'Other Mobile', name: 'Windows Phone' },
	'blackberry os': { type: 'mobile', group: 'Other Mobile', name: 'BlackBerry' },
	'firefox os': { type: 'mobile', group: 'Other Mobile', name: 'FireFox' },
	chromecast: { type: 'smart', group: 'Smart TV', name: 'Chromecast' },
	tizen: { type: 'smart', group: 'Smart TV', name: 'Tizen' },
	webos: { type: 'smart', group: 'Smart TV', name: 'WebOS' },
};


/**
 * 
 * @param {Object} p
 * @param {*} tags
 * @param {!Object} p.data {table: Object[][] }
 * @param {Number} minimumPercentLabeled the minimum percentage to include a data label for
 * @returns 
 */
const TechSubcard = ({ tags, data, minimumPercentLabeled=1 }) => {
	const [chartProps, setChartProps] = useState();

	useEffect(() => {
		// totalEmissions","baseEmissions","creativeEmissions","supplyPathEmissions
		let media = getSumColumn(data.table, "creativeEmissions");
		let publisher = getSumColumn(data.table, "baseEmissions");
		let dsp = getSumColumn(data.table, "supplyPathEmissions");

		const totalCO2 = media + dsp + publisher;

		if (totalCO2 === 0) {
			setChartProps({isEmpty: true});
			return;
		}

		setChartProps({
			data: {
				labels: ['Media', 'Publisher overhead', 'Supply-path overhead'],
				datasets: [{
					label: 'Kg CO2',
					backgroundColor: ['#4A7B73', '#90AAAF', '#C7D5D7'],
					data: [media, publisher, dsp],
				}]
			},
			options: {
				layout: { autoPadding: true, padding: 5 },
				plugins: {
					legend: { position: 'left' },
					tooltip: {
						callbacks: {
							label: ctx => ` ${printer.prettyNumber(ctx.dataset.data[ctx.dataIndex])} kg`,
							title: ctx => ctx[0].label,
						}
					},
					datalabels: {
						labels: {
							value: {
								anchor: "center",
								color: '#fff',
								font: {
									family: "Montserrat",
									weight: "bolder",
									size: "20px"
								},
								formatter: (value = 0, ctx) => {
									let percentage = Math.round(value * 100 / totalCO2);
									return percentage >= minimumPercentLabeled ? `${percentage}%` : '';
								},
							}
						}
					}
				}
			}
		})
	}, [data])

	if (!chartProps) return null;
	if (chartProps?.isEmpty) return <div>No CO<sub>2</sub> emissions for this period</div>;
	
	return <>
		<p>CO<sub>2</sub>e emissions due to...</p>
		<NewChartWidget type="pie" {...chartProps} datalabels />
		<small className="text-center">
			The Green Ad Tag per-impression overhead is measured,<br />
			but too small to display in this chart.
		</small>
	</>;
};


/**
 * desktop vs mobile and different OS
 * @param {Object} p
 */
const DeviceSubcard = ({ tags, data }) => {
	const [chartProps, setChartProps] = useState();

	useEffect(() => {
		const breakdownByOS = getBreakdownBy(data.table, 'totalEmissions', 'os');
		const totalCO2 = Object.values(breakdownByOS).reduce((acc, v) => acc + v, 0);

		if (totalCO2 === 0) {
			setChartProps({isEmpty: true});
			return;
		}

		let minFraction = 0.05;
		// compress by OS group
		// ??Roscoe wrote some smart code to gracefully select the level of grouping. 
		// After a data-format change -- just went for a simpler option
		let breakdownByOSGroup1 = {};
		const total = sum(Object.values(breakdownByOS));
		Object.entries(breakdownByOS).forEach(([k, v]) => {
			let osType = osTypes[k];
			let group = osType?.group || "Other";
			if (total*minFraction < v) {
				group = osType?.name || k;
			}
			breakdownByOSGroup1[group] = (breakdownByOSGroup1[group] || 0) + v;
		});
		// compress small rows into other
		let breakdownByOSGroup2 = {};
		Object.entries(breakdownByOSGroup1).forEach(([k, v]) => {
			if (total*minFraction > v) {
				k = "Other";
			}
			breakdownByOSGroup2[k] = (breakdownByOSGroup2[k] || 0) + v;
		});
	
		let chartDataList = Object.values(breakdownByOSGroup2);
		const labels = Object.keys(breakdownByOSGroup2); // ["Windows", "Mac"];
		
		// Tonnes or kg?
		let unit = 'kg';
		if (Math.max(...chartDataList) > TONNES_THRESHOLD) {
			unit = 'tonnes';
			chartDataList = chartDataList.map(v => v / 1000);
		}
		

		setChartProps({
			data: {
				labels,
				datasets: [{
					data: chartDataList,
					label: `${unit} CO2`,
					backgroundColor: dataColours(chartDataList),
				}]
			},
			options: {
				indexAxis: 'y',
				plugins: { legend: { display: false } },
				scales: { x: { ticks: { callback: v => `${Math.round(v)} ${unit}` } } },
			}
		});
	}, [data]);
	
	if (!chartProps) return null;
	if (chartProps?.isEmpty) return <div>No CO<sub>2</sub> emissions for this period</div>;
	
	return <NewChartWidget type="bar" {...chartProps} />;
}


const BreakdownCard = ({ campaigns, tags, data }) => {
	if ( ! data) return <Misc.Loading text="Fetching your data..." />;
	const [mode, setMode] = useState('tech');

	const subcard = (mode === 'tech') ? (
		<TechSubcard tags={tags} data={data} minimumPercentLabeled={10} />
	) : (
		<DeviceSubcard tags={tags} data={data} />
	);

	return <GreenCard title="What is the breakdown of your emissions?" className="carbon-breakdown">
		<div className="d-flex justify-content-around mb-2">
			<ModeButton name="tech" mode={mode} setMode={setMode}>Ad Tech</ModeButton>
			<ModeButton name="device" mode={mode} setMode={setMode}>Device Type</ModeButton>
		</div>
		{subcard}
		<GreenCardAbout>
			<p>Where do we get numbers for each slice from?</p>
			<p>How do we determine OS/device breakdowns?</p>
		</GreenCardAbout>
	</GreenCard>;
};


export default BreakdownCard;
