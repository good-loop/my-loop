import React, { useEffect, useState } from 'react';

import Misc from '../../../base/components/Misc';
import { yessy } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import NewChartWidget from '../../../base/components/NewChartWidget';
import { CO2e, dataColours, GreenCard, GreenCardAbout, ModeButton, NOEMISSIONS, TONNES_THRESHOLD } from './dashutils';
import SimpleTable, { Column } from '../../../base/components/SimpleTable';
import List from '../../../base/data/List';
import { ButtonGroup } from 'reactstrap';
import { emissionsPerImpressions, getBreakdownBy, getCompressedBreakdown, getSumColumn, getTags, getCarbon } from './emissionscalc';
import { isPer1000 } from './GreenMetrics';
// Doesn't need to be used, just imported so MiniCSSExtractPlugin finds the LESS
import '../../../../style/greendash-breakdown-card.less';


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



const pieOptions = (totalCO2, minimumPercentLabeled) => ({
	layout: { autoPadding: true, padding: 5 },
	plugins: {
		legend: {
			position: (ctx) => (ctx.chart.width < 250 ? 'left' : 'top'),
			labels: { boxWidth: 20 },
		},
		tooltip: {
			callbacks: {
				label: (ctx) => ` ${printer.prettyNumber(ctx.dataset.data[ctx.dataIndex])} kg`,
				title: (ctx) => ctx[0].label,
			},
		},
		datalabels: {
			labels: {
				value: {
					color: '#fff',
					textStrokeColor: '#666',
					textStrokeWidth: 2,
					font: (ctx) => ({
						family: 'Montserrat',
						weight: 'bold',
						size: Math.round(Math.min(ctx.chart.chartArea.width, ctx.chart.chartArea.height) / 7),
					}),
					formatter: (value = 0) => {
						const percentage = Math.round((value * 100) / totalCO2);
						return percentage >= minimumPercentLabeled ? `${percentage}%` : '';
					},
				},
			},
		},
	},
});


const FormatSubcard = ({ data, minimumPercentLabeled = 1}) => {
	if (!yessy(data)) return NOEMISSIONS;

	const [chartProps, setChartProps] = useState();
	useEffect(() => {
		const pvTags = getTags(data);
		const tags = List.hits(pvTags.value) || [];

		// map tagIDs to formats
		const tagFormats = tags.reduce((acc, tag) => {
			acc[tag.id] = tag.format;
			return acc;
		}, {});

		// map tagIDs to co2
		const tagEm = data.reduce((acc, row) => {
			acc[row.key] = row.co2;
			return acc
		}, {});

		// group tagIDs by format & sum their co2
		const formatToCarbon = Object.keys(tagFormats).reduce((mapping, id) => {
			const format = tagFormats[id] || 'Unset';
			if (mapping.hasOwnProperty(format)) {
				mapping[format] += tagEm[id];
			} else {
				mapping[format] = tagEm[id];
			}
			return mapping;
		}, {});

		// begin defining chart
		let unit = 'kg';
		let unitShort = 'kg';
		let totalCO2 = data.reduce((acc, row) => acc + row.co2, 0);

		if (Math.max(...data) > TONNES_THRESHOLD) {
			unit = 'tonnes';
			unitShort = 't';
			data = data.map((v) => v / 1000);
			totalCO2 /= 1000;
		}

		setChartProps({
			data: {
				labels: Object.keys(formatToCarbon),
				datasets: [{
					label: 'Kg CO2',
					backgroundColor: ['#4A7B73', '#90AAAF', '#C7D5D7'],
					data: Object.values(formatToCarbon),
				}],
			},
			options: pieOptions(totalCO2, minimumPercentLabeled),
		});
	}, []);

	if (!chartProps) return null;
	if (chartProps?.isEmpty) return NOEMISSIONS;

	return <>
		<p>{CO2e} emissions by advert format:</p>
		<NewChartWidget type="pie" {...chartProps} datalabels />
	</>;
};


/**
 *
 * @param {Object} p
 * @param {*} tags
 * @param {!Object} p.data {table: Object[][] }
 * @param {Number} minimumPercentLabeled the minimum percentage to include a data label for
 * @returns
 */
const TechSubcard = ({ data: osBuckets, minimumPercentLabeled = 1 }) => {
	if (!yessy(osBuckets)) return NOEMISSIONS;

	const [chartProps, setChartProps] = useState();

	useEffect(() => {
		let media = getSumColumn(osBuckets, 'co2creative');
		let publisher = getSumColumn(osBuckets, 'co2base');
		let dsp = getSumColumn(osBuckets, 'co2supplypath');

		const totalCO2 = media + dsp + publisher;

		if (totalCO2 === 0) {
			setChartProps({ isEmpty: true });
			return;
		}

		setChartProps({
			data: {
				labels: ['Creative', 'Publisher', 'Supply path'],
				datasets: [{
					label: 'Kg CO2',
					backgroundColor: ['#4A7B73', '#90AAAF', '#C7D5D7'],
					data: [media, publisher, dsp],
				}],
			},
			options: pieOptions(totalCO2, minimumPercentLabeled),
		});
	}, [osBuckets]);

	if (!chartProps) return null;
	if (chartProps?.isEmpty) return NOEMISSIONS;

	return <>
		<p>{CO2e} emissions due to...</p>
		<NewChartWidget type="pie" {...chartProps} datalabels />
		<small className="text-center">The Green Ad Tag per-impression overhead is measured, but too small to display in this chart.</small>
	</>;
};


/**
 * desktop vs mobile and different OS
 * @param {Object} p
 */
const DeviceSubcard = ({ data: osTable }) => {
	if (!yessy(osTable)) return NOEMISSIONS;

	const [chartProps, setChartProps] = useState();

	useEffect(() => {
		// TODO refactor to share code with CompareCardEmissions.jsx
		const breakdownByOS = getBreakdownBy(osTable, 'co2', 'os');
		const totalCO2 = Object.values(breakdownByOS).reduce((acc, v) => acc + v, 0);

		if (totalCO2 === 0) {
			setChartProps({ isEmpty: true });
			return;
		}

		// compress by OS group
		const breakdownByOS2 = getCompressedBreakdown({ breakdownByX: breakdownByOS, osTypes });
		let data = Object.values(breakdownByOS2);
		const labels = Object.keys(breakdownByOS2); // ["Windows", "Mac"];

		// Tonnes or kg?
		let unit = 'kg';
		let unitShort = 'kg';
		if (Math.max(...data) > TONNES_THRESHOLD) {
			unit = 'tonnes';
			unitShort = 't';
			data = data.map((v) => v / 1000);
		}

		setChartProps({
			data: {
				labels,
				datasets: [
					{
						data,
						backgroundColor: dataColours(data),
					},
				],
			},
			options: {
				indexAxis: 'y',
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: (ctx) => `${printer.prettyNumber(ctx.raw)} ${unit} CO2` } },
				},
				scales: { x: { ticks: { callback: (v) => `${Math.round(v)} ${unitShort}` } } },
			},
		});
	}, [osTable]);

	if (!chartProps) return null;
	if (chartProps?.isEmpty) return NOEMISSIONS;

	return <NewChartWidget type="bar" {...chartProps} />;
}; // ./DeviceSubCard


/** A table cell with a title/tooltip for cases where the value is likely to display truncated */
const CellWithTitle = (value) => <span title="value">{value}</span>;


/**
 * Table of impressions and carbon per tag
 * @param {Object} p
 * @param {Object[]} p.data adid table
 */
const TagSubcard = ({ data }) => {
	if (!yessy(data)) return NOEMISSIONS;
	// map GreenTag id to a display-name
	const pvTags = getTags(data);
	const tags = List.hits(pvTags.value) || [];
	const tag4id = {};
	tags.forEach((tag) => (tag4id[tag.id] = tag));

	// {adid, count, totalEmissions, baseEmissions, 'creativeEmissions', 'supplyPathEmissions'}
	let columns = [
		// new Column({Header:"Campaign"}),
		new Column({ Header: 'Tag', accessor: (row) => tag4id[row.key]?.name, Cell: CellWithTitle }),
		new Column({ Header: 'Impressions', accessor: (row) => row.count }),
		new Column({ Header: 'CO2e (kg)', accessor: (row) => row.co2 }),
	];

	return <>
		<p className="small">
			Emissions breakdown by Green Ad Tags.
			<br />
			You can track any aspect of media buying by generating different tags, then using them in your buying.
		</p>
		<SimpleTable data={data} columns={columns} hasCsv rowsPerPage={6} className="tag-table" tableName="carbon-by-tag" />
	</>;
};


const PubSubcard = ({ data }) => {
	if (!yessy(data)) return NOEMISSIONS;

	let columns = [
		new Column({ Header: 'Domain', accessor: (row) => row.key, Cell: CellWithTitle }),
		new Column({ Header: 'Impressions', accessor: (row) => row.count }),
		new Column({ Header: 'CO2e (kg)', accessor: (row) => row.co2 }),
	];

	// skip unset
	data = data.filter((row) => row.key !== 'unset');

	return <>
		<p className="small">
			Emissions breakdown by publisher/domain.
			<br />
		</p>
		<SimpleTable data={data} columns={columns} hasCsv rowsPerPage={6} className="domain-table" tableName="carbon-by-publishers" />
	</>;
};


/**
 *
 * @param {Object} p
 * @param {Object} p.dataValue pvChartData.value Which are split by breakdown: os, adid,
 */
const BreakdownCard = ({ baseFilters }) => {
	// Faster initial loading - fetch the default tech breakdown
	const techValue = getCarbon({
		...baseFilters,
		breakdown: ['total{"emissions":"sum"}'],
	})?.value;
	
	const dataValue = getCarbon({
		...baseFilters,
		breakdown: ['os{"co2":"sum"}', 'adid{"co2":"sum"}', 'domain{"co2":"sum"}', 'format{"co2":"sum"}'],
		// breakdown: ['os{"co2":"sum"}', 'adid{"countco2":"sum"}', 'domain{"countco2":"sum"}'], // TODO Wait for new shortcut in backend
	})?.value;

	const loading = <Misc.Loading text="Fetching your data..." />;

	if (!techValue) return (
		<GreenCard title="What is the breakdown of your emissions?" className="carbon-breakdown">
			{loading}
		</GreenCard>
	);

	const [mode, setMode] = useState('tech');

	const datakey = { device: 'by_os', tag: 'by_adid', domain: 'by_domain', format: 'by_adid' }[mode];
	let techData = techValue.by_total?.buckets;
	let data = dataValue && dataValue[datakey]?.buckets;

	// Are we in carbon-per-mille mode?
	if (isPer1000()) {
		data = emissionsPerImpressions(data);
		techData = emissionsPerImpressions(techData);
	}

	let subcard;
	switch (mode) {
		case 'tech':
			subcard = <TechSubcard data={techData} minimumPercentLabeled={10} />;
			break;
		case 'device':
			subcard = dataValue ? <DeviceSubcard data={data} /> : loading;
			break;
		case 'tag':
			subcard = dataValue ? <TagSubcard data={data} /> : loading;
			break;
		case 'domain':
			subcard = dataValue ? <PubSubcard data={data} /> : loading;
			break;
		case 'format':
			subcard = dataValue ? <FormatSubcard data={data} minimumPercentLabeled={10} /> : loading;
	}

	return (
		<GreenCard title="What is the breakdown of your emissions?" className="carbon-breakdown">
			<ButtonGroup className="mb-2 subcard-switch">
				<ModeButton name="tech" mode={mode} setMode={setMode}>
					Ad Tech
				</ModeButton>
				<ModeButton name="device" mode={mode} setMode={setMode}>
					Device Type
				</ModeButton>
				<ModeButton name="tag" mode={mode} setMode={setMode}>
					Tag
				</ModeButton>
				<ModeButton name="domain" mode={mode} setMode={setMode}>
					Domain
				</ModeButton>
				<ModeButton name="format" mode={mode} setMode={setMode}>
					Format
				</ModeButton>
			</ButtonGroup>
			{subcard}
			<GreenCardAbout>
				<p>Where do we get numbers for each slice from?</p>
				<p>How do we determine OS/device breakdowns?</p>
			</GreenCardAbout>
		</GreenCard>
	);
};

export default BreakdownCard;
