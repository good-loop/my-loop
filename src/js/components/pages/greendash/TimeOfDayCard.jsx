import React, { useEffect, useState } from 'react';
import md5 from 'md5';
import _ from 'lodash';

import DataStore from '../../../base/plumbing/DataStore';
import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { dataColours, GreenCard, GreenCardAbout, TONNES_THRESHOLD } from './dashutils';
import { getCarbon } from './carboncalc';


const TimeOfDayCard = ({baseFilters, tags}) => {
	const [chartProps, setChartProps] = useState();

	if (!tags || !tags.length) {
		return <Misc.Loading text="Fetching your tag data..." />;
	}

	useEffect(() => {
		// Different from the base data retrieved in GreenMetrics: time-series interval 1 hour instead of default 1 day
		getCarbon({...baseFilters, breakdowns: ['time'], interval: '1 hour', tags}).promise.then(value => {
			// Set up empty buckets for aggregation
			const hourLabels = [];
			let hourData = [];
			for (let i = 0; i < 24; i += 3) {
				hourLabels.push(`${((i+11)%12)+1} ${(i < 12 ? 'am' : 'pm')}`);
				hourData.push(0);
			}

			// Aggregate impression counts into time-of-day buckets
			value.time.labels.forEach((timeKey, i) => {
				const hourKey = new Date(timeKey).getHours(); // hour in local time
				hourData[Math.floor(hourKey / 3)] += value.time.kgCarbon.total[i]
			});

			let label = 'Kg CO2';
			let tickFn = v => `${v} kg`;
			const maxCarbon = Math.max(...hourData);
			if (maxCarbon > TONNES_THRESHOLD) {
				hourData = hourData.map(kg => kg / 1000);
				label = 'Tonnes CO2';
				tickFn = v => `${v} tonnes`;
			}

			setChartProps({
				data: {
					labels: hourLabels,
					datasets: [{
						label,
						data: hourData,
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
