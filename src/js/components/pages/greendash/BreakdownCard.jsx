import React, { useEffect, useState } from 'react';

import Icon from '../../../base/components/Icon';
import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { GreenCard, GreenCardAbout, ModeButton } from './dashutils';


// Classify OS strings seen in our data
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
 * @param {*} tags
 * @param {Number[]} data
 * @param {*} options
 * @param {Number} minimumPercentLabeled the minimum percentage to include a data label for
 * @returns 
 */
const TechSubcard = ({ tags, data, options, minimumPercentLabeled=0 }) => {
	if (!tags || !data) return <Misc.Loading text="Fetching your tag data..." />;

	const labels = ['Media', 'Publisher overhead', 'DSP overhead'];
	const { media, publisher, dsp } = data.total.kgCarbon;
	const chartData = {
		labels,
		datasets: [{
			label: 'Kg CO2',
			backgroundColor: ['#90AAAF', '#C7D5D7', '#FF00FF'],
			data: [media, publisher, dsp],
		}]
	};
	const chartOptions = {
		layout: {
			autoPadding: true,
			padding: 5
		},
		plugins: {
			legend: {
				position: 'left'
			},
			tooltip: {
				callbacks: {
					label: function(ctx) {
						//console.log("DATA", ctx);
						const data = ctx.dataset.data;
						let currentValue = data[ctx.dataIndex];
						return ` ${currentValue} kg`;
					},
					title: function(ctx) {
						return ctx[0].label;
						//return data.labels[tooltipItem[0].index];
					}
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
							const sum = ctx.chart.data.datasets[0].data.reduce((acc, v) => acc + (v || 0), 0);
							let percentage = Math.round(value * 100 / sum);
							return percentage >= minimumPercentLabeled ? `${percentage}%` : '';
						},
					}
				}
			}
		}
	};
	Object.assign(chartOptions, options || {});

	return <>
		<p>CO<sub>2</sub>e emissions due to...</p>
		<NewChartWidget type="pie" options={chartOptions} data={chartData} datalabels />
	</>;
};


/**
 * desktop vs mobile and different OS
 * @param {Object} p
 */
const DeviceSubcard = ({ tags, data }) => {
	if (!tags || !data) return <Misc.Loading text="Fetching your green tag data..." />;

	const [chartProps, setChartProps] = useState();

	useEffect(() => {
		const typesGroupsBytes = {};

		// Bundle operating systems into useful groups, eg "windows", "linux", "smart tv" and total up data usage for each
		data.os.labels.forEach((osName, i) => {
			const {type, group} = osTypes[osName];
			// Outer grouping: mobile/desktop
			let groupsToBytes = typesGroupsBytes[type];
			if (!groupsToBytes) {
				groupsToBytes = {};
				typesGroupsBytes[type] = groupsToBytes;
			}
			// Inner grouping: all "Windows", all "Android", etc
			if (!groupsToBytes[group]) {
				groupsToBytes[group] = 0;
			}
			groupsToBytes[group] += data.os.kgCarbon.total[i];
		});

		const chartData = Object.values(typesGroupsBytes).reduce((acc, [groupsToBytes]) => {
			acc.labels = [...acc.labels, ...Object.keys(groupsToBytes)];
			acc.datasets[0].data = [...acc.datasets[0].data, ...Object.values(groupsToBytes)];
			return acc;
		}, { labels: [], datasets: [{ label: 'Kg CO2', data: [] } ] });

		// Transform totalled groups to chart objects
		setChartProps(chartData);
	}, [tags, data]);


	if (!chartProps) return <Misc.Loading text="Fetching device data..." />;

	return <NewChartWidget type="bar" data={chartProps} options={{ indexAxis: 'y' }} />;
}


const BreakdownCard = ({ campaigns, tags, data }) => {
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
