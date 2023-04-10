import React, { useEffect, useState } from 'react';
import md5 from 'md5';
import _ from 'lodash';

import DataStore from '../../../base/plumbing/DataStore';
import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../../base/components/NewChartWidget';
import { dataColours, TONNES_THRESHOLD } from './dashUtils';
import { NOEMISSIONS, GreenCard} from './GreenDashUtils';
import { getCarbon, emissionsPerImpressions, getBreakdownByWithCount } from './emissionscalcTs';
import { isPer1000 } from './GreenMetrics';

const TimeOfDayCard = (props) => {
	return <GreenCard title="When are your ad carbon emissions highest?" className="carbon-time-of-day">
		<TimeOfDayCard2 {...props} />
	</GreenCard>;
};


const TimeOfDayCard2 = ({ baseFilters, tags }) => {
	const [chartProps, setChartProps] = useState();
	const [pvCarbon, setPVCarbon] = useState();

	if (!tags || !tags.length) {
		// return <Misc.Loading text="Fetching your tag data..." />;
	}
	useEffect(() => {
		const pvCarbon = getCarbon({ ...baseFilters, timeofday: true, breakdown: 'timeofday{"co2":"sum"}'});
		pvCarbon.promise.then((res) => {
			const resValue = isRandomSampling(prob) ? res.sampling : res;
			if (!resValue.by_timeofday.buckets.length) {
				setChartProps({ isEmpty: true });
				return;
			}
			const labels = [];
			const data = [];

			let buckets = resValue.by_timeofday.buckets;
			if (isPer1000()) {
				buckets = emissionsPerImpressions(buckets);
			}

			// construct hourly breakdown and normalise to numeric hours
			const hoursBreakdown = getBreakdownByWithCount(buckets, ['co2'], 'timeofday');

			// group into 3-hour periods and copy to labels/data
			for (let i = 0; i < 24; i++) {
				const group = Math.floor(i / 3);
				if (i === group * 3) {
					labels.push(`${((i + 11) % 12) + 1} ${i < 12 ? 'am' : 'pm'}`);
					data.push(0);
				}
				data[group] += hoursBreakdown[i]?.co2 || 0;
			}

			let label = 'Kg CO2';
			let tickFn = (v) => `${v} kg`;
			let tooltipFn = (ctx) => `${printer.prettyNumber(ctx.raw)} kg CO2`;

			const maxCarbon = Math.max(...data);
			if (maxCarbon > TONNES_THRESHOLD) {
				data.forEach((kg, i) => (data[i] = kg / 1000));
				label = 'Tonnes CO2';
				tickFn = (v) => `${v} t`;
				tooltipFn = (ctx) => `${printer.prettyNumber(ctx.raw)} tonnes CO2`;
			}

			setChartProps({
				data: {
					labels,
					datasets: [
						{
							label,
							data,
							backgroundColor: dataColours(data),
						},
					],
				},
				options: {
					plugins: {
						legend: { display: false },
						tooltip: { callbacks: { label: tooltipFn } },
					},
					scales: { y: { ticks: { callback: tickFn } } },
				},
			});
		});
	}, [baseFilters.q, baseFilters.start, baseFilters.end, isPer1000()]);

	if ( ! chartProps) {
		return <Misc.Loading text="Fetching time-of-day data..." />;
	}
	if (chartProps.isEmpty) {
		return NOEMISSIONS;
	}
	return (<>
			<NewChartWidget type="bar" {...chartProps} />
			<p className="text-center mb-0">
				<small>Time of day in your time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone})</small>
			</p>
		</>
	);	
};

export default TimeOfDayCard;
