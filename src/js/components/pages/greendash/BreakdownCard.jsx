import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import Icon from '../../../base/components/Icon';
import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { byId, calcBytes, dataToCarbon, GreenCard } from './dashutils';

// Classify OS strings seen in our data
const osTypes = {
	windows: { type: 'desktop', group: 'Windows', name: 'Windows' },
	'mac os x': { type: 'desktop', group: 'Mac OS X', name: 'Mac OS X' },
	'windows nt 4.0': { type: 'desktop', group: 'Windows', name: 'Windows NT 4.0' },
	'chrome os': { type: 'desktop', group: 'Other', name: 'Chrome OS' },
	linux: { type: 'desktop', group: 'Other', name: 'Linux' },
	ubuntu: { type: 'desktop', group: 'Other', name: 'Ubuntu Linux' },
	fedora: { type: 'desktop', group: 'Other', name: 'Fedora Linux' },
	openbsd: { type: 'desktop', group: 'Other', name: 'OpenBSD' },
	freebsd: { type: 'desktop', group: 'Other', name: 'FreeBSD' },
	other: { type: 'desktop', group: 'Other', name: 'Other' }, // probably there are a few more smart TV etc OSs that get lumped in here
	ios: { type: 'mobile', group: 'iOS', name: 'iOS' },
	android: { type: 'mobile', group: 'Android', name: 'Android' },
	'windows phone': { type: 'mobile', group: 'Other', name: 'Windows Phone' },
	'blackberry os': { type: 'mobile', group: 'Other', name: 'BlackBerry' },
	'firefox os': { type: 'mobile', group: 'Other', name: 'FireFox' },
	chromecast: { type: 'smart', group: 'Smart TV', name: 'Chromecast' },
	tizen: { type: 'smart', group: 'Smart TV', name: 'Tizen' },
	webos: { type: 'smart', group: 'Smart TV', name: 'WebOS' },
};


const dummyDataOSMobile = {
	labels: ['Android', 'iOS Phone', 'iOS Tablet'],
	datasets: [{
		label: 'Kg CO2',
		data: [60, 42, 74],
	}],
};

const dummyDataOSDesktop = {
	labels: ['Windows', 'Mac'],
	datasets: [{
		label: 'Kg CO2',
		data: [60, 42],
	}],
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
	if (!tags || !data) return <Misc.Loading text="Fetching data..." />;

	const labels = ['Media', 'Overhead (JS + XML)'];
	const { logging, media, overhead } = calcBytes(data.by_adid.buckets, byId(tags));
	const chartData = {
		labels,
		datasets: [{
			label: 'Kg CO2',
			backgroundColor: ['#90AAAF', '#C7D5D7'],
			data: [media, overhead],
		}]
	};
	const chartOptions = {
		layout: {
			autoPadding: true,
			padding: 5
		},
		plugins: {
			legend: {
				position: "top"
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
						formatter: (value, ctx) => {
							if (!value) value = 0;
							let sum = 0;
							let dataArr = ctx.chart.data.datasets[0].data;
							dataArr.map(data => {
								sum += data || 0;
							});
							let percentage = Math.round(value*100 / sum);
							return percentage >= minimumPercentLabeled ? percentage+"%" : "";
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


const chartDataTemplate = {
	labels: [],
	datasets: [{ label: 'Kg CO2', data: [] }],
};

/**
 * desktop vs mobile and different OS
 * @param {Object} p
 */
const DeviceSubcard = ({ tags, data }) => {
	if (!tags || !data) return <Misc.Loading text="Fetching data..." />;

	const [chartDatas, setChartDatas] = useState();

	useEffect(() => {
		let maxBytes = 0; // multiple charts means we should specify a common scale so they're comparable
		const tagsById = byId(tags);
		const typesGroupsBytes = {};

		// Bundle operating systems into useful groups, eg "windows", "linux", "smart tv" and total up data usage for each
		data.by_os_adid.buckets.forEach(bkt => {
			const osData = osTypes[bkt.key];
			if (!osData) {
				// debugger;
			}
			let typeObj = typesGroupsBytes[osData.type];
			if (!typeObj) {
				typeObj = {};
				typesGroupsBytes[osData.type] = typeObj;
			}
			if (!typeObj[osData.group]) {
				typeObj[osData.group] = 0;
			}
			const thisBytes = calcBytes(bkt.by_adid.buckets, tagsById);
			typeObj[osData.group] += thisBytes.total;
			if (maxBytes < thisBytes.total) maxBytes = thisBytes.total;
		});

		// Transform totalled groups to chart objects
		const nextChartDatas = {};
		Object.entries(typesGroupsBytes).forEach(([typeName, typeObj]) => {
			const cdForGroup = _.cloneDeep(chartDataTemplate);
			
			Object.entries(typeObj).forEach(([groupName, groupBytes]) => {
				cdForGroup.labels.push(groupName);
				cdForGroup.datasets[0].data.push(dataToCarbon(groupBytes));
			});
			nextChartDatas[typeName] = cdForGroup;
		});

		setChartDatas(nextChartDatas);
	}, [tags, data]);


	if (!chartDatas) return <Misc.Loading text="Loading data for chart..." />;

	return <>
		{Object.entries(chartDatas).map(([key, cd]) => <div key={key}>
			<h5><Icon name={key} /> {key}</h5>
			<NewChartWidget type="bar" data={cd} options={{ indexAxis: 'y' }} />
		</div>)}
	</>;
}

const BreakdownCard = ({ campaigns, tags, data }) => {
	const [mode, setMode] = useState('tech');

	const subcard = (mode === 'tech') ? (
		<TechSubcard tags={tags} data={data} minimumPercentLabeled={10} />
	) : (
		<DeviceSubcard tags={tags} data={data} />
	);

	return <GreenCard title="What is the breakdown of your emissions?">
		<div className="d-flex justify-content-around mb-2">
			<Button size="sm" color="primary" active={mode === 'tech'} onClick={() => setMode('tech')}>Ad Tech</Button>
			<Button size="sm" color="primary" active={mode === 'device'} onClick={() => setMode('device')}>Device Type</Button>
		</div>
		{subcard}
	</GreenCard>;
};


export default BreakdownCard;
