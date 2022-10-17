import React, { useEffect, useState } from 'react';

import Icon from '../../../base/components/Icon';
import Misc from '../../../base/components/Misc';
import { ellipsize, sum, yessy } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import NewChartWidget from '../../../base/components/NewChartWidget';
import { getBreakdownBy, getSumColumn, getTags } from './carboncalc';
import { CO2e, dataColours, GreenCard, GreenCardAbout, ModeButton, NOEMISSIONS, TONNES_THRESHOLD } from './dashutils';
import SimpleTable, { Column } from '../../../base/components/SimpleTable';
import List from '../../../base/data/List';
import { ButtonGroup } from 'reactstrap';
import { getSumColumnEmissions } from './emissionscalc';


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
	tizen: { type: 'smart', group: 'Smart TV', name: 'Samsung TV' },
	webos: { type: 'smart', group: 'Smart TV', name: 'WebOS' },
	web0s: { type: 'smart', group: 'Smart TV', name: 'WebOS' },
	roku: { type: 'smart', group: 'Smart TV', name: 'Roku' },
	googletv: { type: 'smart', group: 'Smart TV', name: 'Google TV' },
	'atv os x': { type: 'smart', group: 'Smart TV', name: 'Apple TV' },
	tvos: { type: 'smart', group: 'Smart TV', name: 'Apple TV' },
	sony: { type: 'smart', group: 'Smart TV', name: 'Sony TV' },
	hisense: { type: 'smart', group: 'Smart TV', name: 'Hisense TV' },
	panasonic: { type: 'smart', group: 'Smart TV', name: 'Hisense TV' },
};


/**
 * 
 * @param {Object} p
 * @param {*} tags
 * @param {!Object} p.data {table: Object[][] }
 * @param {Number} minimumPercentLabeled the minimum percentage to include a data label for
 * @returns 
 */
const TechSubcard = ({ data: osBuckets, minimumPercentLabeled=1 }) => {
	if (!yessy(osBuckets)) return <p>No data</p>;

	const [chartProps, setChartProps] = useState();

	useEffect(() => {
		// "co2","co2base","co2creative","co2supplypath"
		let totalCO2 = getSumColumnEmissions(osBuckets, "co2");
		let media = getSumColumnEmissions(osBuckets, "co2creative");
		let publisher = getSumColumnEmissions(osBuckets, "co2base");
		let dsp = getSumColumnEmissions(osBuckets, "co2supplypath");

		// const totalCO2 = media + dsp + publisher;

		if (totalCO2 === 0) {
			setChartProps({isEmpty: true});
			return;
		}

		setChartProps({
			data: {
				// labels: ['Media', 'Publisher overhead', 'Supply-path overhead'],
				labels: ['Media', 'Publisher', 'Supply path'],
				datasets: [{
					label: 'Kg CO2',
					backgroundColor: ['#4A7B73', '#90AAAF', '#C7D5D7'],
					data: [media, publisher, dsp],
				}]
			},
			options: {
				layout: { autoPadding: true, padding: 5 },
				plugins: {
					legend: {
						position: ctx => (ctx.chart.width < 250 ? 'left' : 'top'),
						labels: { boxWidth: 20 },
					},
					tooltip: {
						callbacks: {
							label: ctx => ` ${printer.prettyNumber(ctx.dataset.data[ctx.dataIndex])} kg`,
							title: ctx => ctx[0].label,
						}
					},
					datalabels: {
						labels: {
							value: {
								color: '#fff',
								textStrokeColor: '#666',
								textStrokeWidth: 2,
								font: ctx => ({
									family: 'Montserrat',
									weight: 'bold',
									size: Math.round(Math.min(ctx.chart.chartArea.width, ctx.chart.chartArea.height) / 7)
								}),
								formatter: (value = 0) => {
									const percentage = Math.round(value * 100 / totalCO2);
									return (percentage >= minimumPercentLabeled) ? `${percentage}%` : '';
								},
							}
						}
					}
				}
			}
		})
	}, [osBuckets])

	if (!chartProps) return null;
	if (chartProps?.isEmpty) return NOEMISSIONS;
	
	return <>
		<p>{CO2e} emissions due to...</p>
		<NewChartWidget type="pie" {...chartProps} datalabels />
		<small className="text-center">
			The Green Ad Tag per-impression overhead is measured,
			but too small to display in this chart.
		</small>
	</>;
};


/**
 * desktop vs mobile and different OS
 * @param {Object} p
 */
const DeviceSubcard = ({ data: osTable }) => {
	if (!yessy(osTable)) return <p>No data</p>;

	const [chartProps, setChartProps] = useState();

	useEffect(() => {
		const breakdownByOS = getBreakdownBy(osTable, 'co2', 'os');
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
			let group = osType?.group || 'Other';
			if (true || (v / total > minFraction)) {
				group = osType?.name || k;
			}
			breakdownByOSGroup1[group] = (breakdownByOSGroup1[group] || 0) + v;
		});
		// compress small rows into other
		let breakdownByOSGroup2 = {};
		Object.entries(breakdownByOSGroup1).forEach(([k, v]) => {
			if (v / total < minFraction) {
				k = "Other";
			}
			breakdownByOSGroup2[k] = (breakdownByOSGroup2[k] || 0) + v;
		});
	
		let data = Object.values(breakdownByOSGroup2);
		const labels = Object.keys(breakdownByOSGroup2); // ["Windows", "Mac"];
		
		// Tonnes or kg?
		let unit = 'kg';
		let unitShort = 'kg'
		if (Math.max(...data) > TONNES_THRESHOLD) {
			unit = 'tonnes';
			unitShort = 't'
			data = data.map(v => v / 1000);
		}
		

		setChartProps({
			data: {
				labels,
				datasets: [{
					data: data,
					backgroundColor: dataColours(data),
				}]
			},
			options: {
				indexAxis: 'y',
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: ctx => `${printer.prettyNumber(ctx.raw)} ${unit} CO2` } },
				},
				scales: { x: { ticks: { callback: v => `${Math.round(v)} ${unitShort}` } } },
			}
		});
	}, [osTable]);
	
	if (!chartProps) return null;
	if (chartProps?.isEmpty) return NOEMISSIONS;
	
	return <NewChartWidget type="bar" {...chartProps} />;
}


/**
 * Table of impressions and carbon per tag
 * @param {Object} p
 * @param {Object[]} p.data adid table
 */
 const TagSubcard = ({data}) => {
	// map GreenTag id to a display-name
	const pvTags = getTags(data);
	const tags = List.hits(pvTags.value) || [];
	const tag4id = {};
	tags.map(tag => tag4id[tag.id] = tag);

	// {adid, count, totalEmissions, baseEmissions, 'creativeEmissions', 'supplyPathEmissions'}
	let columns = [
		// new Column({Header:"Campaign"}),
		new Column({Header: 'Tag', accessor: row => tag4id[row[0]]?.name || row[0],
			Cell: value => <span title={value}>{value}</span>, // show tooltip in case of truncated tag names
		}),
		// new Column({Header:"Tag ID", accessor:row => row[0]}),
		new Column({Header: 'Impressions', accessor:row => row[1]}),
		new Column({Header: 'CO2e (kg)', accessor:row => row[2]}),
	];
	const rows = data.slice(1); // the 1st row is the header names, so drop it

	return <>
		<p className="small">
			Emissions breakdown by Green Ad Tags.<br/>
			You can track any aspect of media buying by generating different tags, then using them in your buying.
		</p>
		<SimpleTable data={rows} columns={columns} hasCsv rowsPerPage={6} className="tag-table" />
	</>;
};


/**
 * 
 * @param {Object} p
 * @param {Object} p.dataValue pvChartData.value Which are split by breakdown: os, adid, 
 */
const BreakdownCardEmissions = ({ dataValue }) => {
	if (!dataValue) return <Misc.Loading text="Fetching your data..." />;
	const [mode, setMode] = useState('tech');

	let subcard;
	switch(mode) {
		case 'tech':
			subcard = <TechSubcard data={dataValue.by_total?.buckets} minimumPercentLabeled={10} />;
			break;
		case 'device':
			subcard = <DeviceSubcard data={dataValue.by_os?.buckets} />;
			break;
		case 'tag':
			subcard = <TagSubcard data={dataValue.by_adid?.buckets} />;
			break;
	};

	return <GreenCard title="What is the breakdown of your emissions?" className="carbon-breakdown">
		<ButtonGroup className="mb-2">
			<ModeButton name="tech" mode={mode} setMode={setMode}>Ad Tech</ModeButton>
			<ModeButton name="device" mode={mode} setMode={setMode}>Device Type</ModeButton>
			<ModeButton name="tag" mode={mode} setMode={setMode}>Tag</ModeButton>
		</ButtonGroup>
		{subcard}
		<GreenCardAbout>
			<p>Where do we get numbers for each slice from?</p>
			<p>How do we determine OS/device breakdowns?</p>
		</GreenCardAbout>
	</GreenCard>;
};


export default BreakdownCardEmissions;
