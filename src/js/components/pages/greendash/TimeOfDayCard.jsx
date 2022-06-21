import React, { useEffect, useState } from 'react';
import md5 from 'md5';
import _ from 'lodash';

import DataStore from '../../../base/plumbing/DataStore';
import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { dataColours, GreenCard, GreenCardAbout, TONNES_THRESHOLD } from './dashutils';
import { getBreakdownBy, getCarbon } from './carboncalc';


const TimeOfDayCard = ({baseFilters, tags}) => {
	const [chartProps, setChartProps] = useState();

	if (!tags || !tags.length) {
		// return <Misc.Loading text="Fetching your tag data..." />;
	}

	useEffect(() => {
		getCarbon({...baseFilters, timeofday: true}).promise.then(res => {
			if (res.table.length === 1) { // only header row = no data
				setChartProps({isEmpty: true});
			}
			const labels = [];
			const data = [];

			Object.entries(getBreakdownBy(res.table, 'totalEmissions', 'timeofday')).sort(
				([ha], [hb]) => ha - hb
			).forEach(([hour, kg]) => {
				labels.push(hour);
				data.push(kg);
			});

			let label = 'Kg CO2';
			let tickFn = v => `${v} kg`;
			
			const maxCarbon = Math.max(...data);
			if (maxCarbon > TONNES_THRESHOLD) {
				data.forEach((kg, i) => data[i] = kg / 1000);
				label = 'Tonnes CO2';
				tickFn = v => `${v} tonnes`;
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
					plugins: { legend: { display: false } },
					scales: { y: { ticks: { callback: tickFn } } },
				}
			});
		});
	}, [baseFilters.q, baseFilters.start, baseFilters.end]);

	let chartContent;
	if (!chartProps) {
		chartContent = <Misc.Loading text="Fetching time-of-day data..." />;
	} else if (chartProps.isEmpty) {
		chartContent = <div>No CO<sub>2</sub> emissions for this period</div>;
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
