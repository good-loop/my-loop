import React, { useEffect, useState } from 'react';
import md5 from 'md5';
import _ from 'lodash';

import DataStore from '../../../base/plumbing/DataStore';
import Misc from '../../../base/components/Misc';
import NewChartWidget from '../../NewChartWidget';
import { calcBytes, dataToCarbon, GreenCard, byId,  } from './dashutils';



const baseDataTime = {
	labels: [],
	datasets: [{
		label: 'Kg CO2',
		data: [],
	}],
};


const TimeOfDayCard = ({baseFilters, tags}) => {
	const [data, setData] = useState();

	if (!tags || !tags.length) {
		return <Misc.Loading text="Waiting for Green Ad Tags" />;
	}

	useEffect(() => {
		// Raw query instead of using getDataLogData because that discards interval param
		const query = {...baseFilters, breakdown: ['time/adid'], interval: '1 hour'};
	
		DataStore .fetch(['misc', 'DataLog', 'green', md5(JSON.stringify(query))], () => {
			const params = {data: query, swallow: true};
			return ServerIO.load(ServerIO.DATALOG_ENDPOINT, params);
		}).promise.then(res => {
			const tagsById = byId(tags);

			// Set up empty buckets for aggregation
			const hourLabels = [];
			const hourData = [];
			for (let i = 0; i < 24; i += 3) {
				hourLabels.push(`${((i+11)%12)+1}${(i < 12 ? 'AM' : 'PM')}`);
				hourData.push(0);
			}

			// Aggregate impression counts into time-of-day buckets
			const hourBuckets = res.by_time_adid.buckets;
			hourBuckets.forEach(bkt => {
				const bktHour = new Date(bkt.key_as_string).getHours(); // hour in local time, not UTC as bucket key uses
				const bktData = calcBytes(bkt.by_adid.buckets, tagsById).total; 
				const bktCarbon = dataToCarbon(bktData);
				hourData[Math.floor(bktHour / 3)] += bktCarbon;
			});
			const nextData = _.cloneDeep(baseDataTime);
			nextData.labels = hourLabels;
			nextData.datasets[0].data = hourData;
			setData(nextData);
		});
		
	}, [baseFilters.q, baseFilters.start, baseFilters.end]);


	return <GreenCard title="When are your ad carbon emissions highest?" className="half-height">
		{data ? <>
			<NewChartWidget type="bar" data={data} />
			<p><small>Time of day in your time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</small></p>
			</> : (
			<Misc.Loading text="Fetching time data..." />
		)}
	</GreenCard>;
};

export default TimeOfDayCard;
