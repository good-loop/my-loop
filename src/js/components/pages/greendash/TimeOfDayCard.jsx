import React, { useEffect, useState } from 'react';
import md5 from 'md5';
import _ from 'lodash';

import DataStore from '../../../base/plumbing/DataStore';
import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { dataColours, GreenCard, GreenCardAbout, NOEMISSIONS, TONNES_THRESHOLD } from './dashutils';
import { getBreakdownBy, getCarbon } from './carboncalc';


const TimeOfDayCard = ({baseFilters, tags}) => {
	const [chartProps, setChartProps] = useState();

	if (!tags || !tags.length) {
		// return <Misc.Loading text="Fetching your tag data..." />;
	}

	useEffect(() => {
		getCarbon({...baseFilters, timeofday: true, breakdown: 'timeofday'}).promise.then(res => {
			if (res.tables.timeofday.length === 1 || ! res.tables.timeofday.length) { // only header row = no data
				setChartProps({isEmpty: true});
				return;
			}
			const labels = [];
			const data = [];

			// construct hourly breakdown and normalise to numeric hours
			const hoursBreakdown = getBreakdownBy(res.tables.timeofday, 'totalEmissions', 'timeofday');

			// group into 3-hour periods and copy to labels/data
			for (let i = 0; i < 24; i++) {
				const group = Math.floor(i / 3);
				if (i === (group * 3)) {
					labels.push(`${((i + 11) % 12) + 1} ${i < 12 ? 'am' : 'pm'}`);
					data.push(hoursBreakdown[i]);
				} else {
					data[group] += hoursBreakdown[i];
				}
			}

			let label = 'Kg CO2';
			let tickFn = v => `${v} kg`;
			let tooltipFn = ctx => `${printer.prettyNumber(ctx.raw)} kg CO2`;
			
			const maxCarbon = Math.max(...data);
			if (maxCarbon > TONNES_THRESHOLD) {
				data.forEach((kg, i) => data[i] = kg / 1000);
				label = 'Tonnes CO2';
				tickFn = v => `${v} t`;
				tooltipFn = ctx => `${printer.prettyNumber(ctx.raw)} tonnes CO2`;
			}

			setChartProps({
				data: {
					labels,
					datasets: [{
						label,
						data,
						backgroundColor: dataColours(data),
					}],
				},
				options: {
					plugins: {
						legend: { display: false },
						tooltip: { callbacks: { label: tooltipFn } },
					},
					scales: { y: { ticks: { callback: tickFn } } },
				}
			});
		});
	}, [baseFilters.q, baseFilters.start, baseFilters.end]);

	let chartContent;
	if (!chartProps) {
		chartContent = <Misc.Loading text="Fetching time-of-day data..." />;
	} else if (chartProps.isEmpty) {
		chartContent = NOEMISSIONS;
	} else {
		chartContent = <>
			<NewChartWidget type="bar" {...chartProps} />
			<p className="text-center mb-0"><small>Time of day in your time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone})</small></p>
		</>;
	}

	return <GreenCard title="When are your ad carbon emissions highest?" className="carbon-time-of-day">
		{chartContent}
		<GreenCardAbout>
			<p>How do we break down the TOD of carbon emissions?</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default TimeOfDayCard;
