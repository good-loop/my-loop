/**
 * Rewrite functions from emissionscalc.js into typescript.
 */

import { sum } from '../../../base/utils/miscutils';

type BreakdownByX = {
	[key: string]: {
		count: number;
		co2: number;
		repeat?: number;
	};
};

export const getCompressedBreakdownWithCount = ({
	breakdownByX,
	minFraction = 0.05,
	osTypes,
}: {
	breakdownByX: BreakdownByX;
	minFraction: number;
	osTypes: any | null;
}): { [key: string]: number } => {
	console.log('breakdownByX', breakdownByX);
	let breakdownByOSGroup1: BreakdownByX = {} as BreakdownByX;
	const total = sum(Object.values(breakdownByX).map((val) => val.count));
	Object.entries(breakdownByX).forEach(([k, v]) => {
		let osType = osTypes && osTypes[k];
		let group: string = osType?.name || k;
		breakdownByOSGroup1[group] = {
			co2: (breakdownByOSGroup1[group]?.co2 || 0) + v.co2,
			count: (breakdownByOSGroup1[group]?.count || 0) + v.count,
		};
	});
	console.log('breakdownByOSGroup1', breakdownByOSGroup1);
	// compress small rows into other
	let breakdownByOSGroup2: BreakdownByX = {} as BreakdownByX;
	Object.entries(breakdownByOSGroup1).forEach(([k, v]) => {
		if (v.count / total < minFraction) {
			k = 'Other';
		}
		breakdownByOSGroup2[k] = {
			count: (breakdownByOSGroup2[k]?.count || 0) + v.count,
			co2: (breakdownByOSGroup2[k]?.co2 || 0) + v.co2,
			repeat: (breakdownByOSGroup2[k]?.repeat || 0) + 1,
		};
	});
	console.log('breakdownByOSGroup2', breakdownByOSGroup2);
	// get average of repeated keys
	let breakdownByOSGroupOutput: { [key: string]: number } = {};
	Object.entries(breakdownByOSGroup2).forEach(([k, v]) => {
		breakdownByOSGroupOutput[k] = v.co2 / v.repeat!;
	});

	return breakdownByOSGroupOutput;
};

type BreakdownRow = {
	key?: string;
	key_as_string?: string;
	co2?: number;
	count?: number;
	co2base?: number;
	co2creative?: number;
	co2supplypath?: number;
};

/**
 * Can have multi keyNameToSum
 */
export const getBreakdownByWithCount = (buckets: Object[], keyNamesToSum: string[], keyNameToBreakdown: string): Object => {
	if (!buckets?.length) {
		return {}; // no data
	}

	const bi = keyNameToBreakdown === 'time' ? 'key_as_string' : 'key';

	let totalByX: { [key: string]: Object } = {};
	for (let i = 0; i < buckets.length; i++) {
		const row: BreakdownRow = buckets[i];
		console.log('row', row);
		const breakdownKey = row[bi];
		if (!breakdownKey) continue;
		keyNamesToSum.forEach((keyName) => {
			if (!(keyName in row)) {
				console.warn(keyName, 'not in buckets');
				return;
			}
		});
		totalByX[breakdownKey] = keyNamesToSum.reduce((acc: {[key: string]: any}, cur) => {
			acc[cur] = {...row}[cur];
			return acc;
		}, {});
	}
	return totalByX;
};
