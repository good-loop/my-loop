import React, { useEffect, useState } from 'react';
import PromiseValue from '../../../base/promise-value';
import { type BreakdownRow, type GreenBuckets, emissionsPerImpressions, getCarbon } from './emissionscalcTs';

interface ByDomainValue extends Object {
	allCount: number;
	by_domain: { buckets: BreakdownRow[] };
	probability?: number;
	seed?: number;
}

interface ResolvedPromise extends ByDomainValue {
	sampling?: ByDomainValue;
}

type BaseFilters = {
	q: string;
	start: string;
	end: string;
	prob?: string;
	sigfig?: string;
	nocache?: boolean;
	fixseed?: boolean;
};

const baseFiltersTemp = {
	q: 'campaign:nrxhFNGq OR campaign:iLWiEWO6 OR campaign:sjhhqRsR OR campaign:3mYN5ixz OR campaign:PdJMNhOH OR campaign:9x5iaOdG OR campaign:JCWGRAES OR campaign:B0Ywbe1l',
	start: '2023-01-01T00:00:00.000Z',
	end: '2023-03-31T23:00:00.000Z',
	prob: '-1',
	fixseed: true,
};

const GreenRecommendation = ({ baseFilters }: { baseFilters: BaseFilters }): JSX.Element => {
	if (!baseFilters) baseFilters = baseFiltersTemp;

	const [domainList, setDomainList] = useState<{ upperDomains: GreenBuckets; lowerDomains: GreenBuckets; midDomains: GreenBuckets }>();

	const pvDataValue: PromiseValue = getCarbon({
		...baseFilters,
		breakdown: ['domain{"emissions":"sum"}'],
	});

	// Type hack: If it is resolved value must be an Object
	const resolvedValue = pvDataValue.resolved ? (pvDataValue.value as ResolvedPromise) : null;
	const byDomainValue = resolvedValue && (resolvedValue.sampling ? resolvedValue.sampling : resolvedValue);

	useEffect(() => {
		if (!byDomainValue) return;
		const allCount = byDomainValue.allCount;
		const buckets = emissionsPerImpressions(byDomainValue.by_domain.buckets);
		const co2s = buckets.map((row) => row.co2! as number);

		const bucketSize = buckets.length;
		const maxCo2 = Math.max(...co2s);
		const minCo2 = Math.min(...co2s);
		console.log({ allCount, bucketSize, maxCo2, minCo2 });

		const range = maxCo2 - minCo2;
		const upperQuartile = range * 0.75 + minCo2;
		// const midPoint = range * 0.5 + minCo2;
		const lowerQuartile = range * 0.25 + minCo2;

		const upperDomains: GreenBuckets = [];
		const lowerDomains: GreenBuckets = [];
		const midDomains: GreenBuckets = [];

		buckets.forEach((row) => {
			if (row.co2 > upperQuartile) {
				upperDomains.push(row);
			} else if (row.co2 < lowerQuartile) {
				lowerDomains.push(row);
			} else {
				midDomains.push(row);
			}
		});

		setDomainList({ upperDomains, lowerDomains, midDomains });
	}, [byDomainValue]);

	console.log('domainList', domainList);

	return (
		<>
			<h1>Green Recommendations</h1>
		</>
	);
};

export default GreenRecommendation;
