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
		getCarbon({...baseFilters, timeofday: true}).promise.then(value => {
			const labels = [];
			const data = [];

			getBreakdownBy(value.table, 'timeOfDay').sort(
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
						backgroundColor: dataColours(hourData),
					}],
				},
				options: {
					plugins: { legend: { display: false } },
					scales: { y: { ticks: { callback: tickFn } } },
				}
			});
		});
	}, [baseFilters.q, baseFilters.start, baseFilters.end]);


	return <GreenCard title="When are your ad carbon emissions highest?" className="carbon-time-of-day">
		{chartProps ? <>
			<NewChartWidget type="bar" data={chartProps.data} options={chartProps.options} />
			<p className="text-center mb-0"><small>Time of day in your time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone})</small></p>
			</> : (
			<Misc.Loading text="Fetching time-of-day data..." />
		)}
		<GreenCardAbout>
			<p>How do we break down the TOD of carbon emissions?</p>
		</GreenCardAbout>
	</GreenCard>;
};

export default TimeOfDayCard;
