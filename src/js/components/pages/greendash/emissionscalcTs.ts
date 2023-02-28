/**
 * Rewrite functions from emissionscalc.js into typescript.
 */

import { sum } from '../../../base/utils/miscutils';
import DataStore from '../../../base/plumbing/DataStore';
import ServerIO from '../../../plumbing/ServerIO';
import { getDataList } from '../../../base/plumbing/Crud';
import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import md5 from 'md5';
import PromiseValue from '../../../base/promise-value';

type BreakdownByX = Record<
	string,
	{
		count: number;
		co2: number;
		occurs?: number;
	}
>;

type GreenBuckets = Record<string, string | number>[];

export const getCarbon = ({
	q = '',
	start = '1 month ago',
	end = 'now',
	breakdown,
	...rest
}: {
	q: string;
	start: string;
	end: string;
	breakdown: string[];
}) => {
	const data = {
		dataspace: 'emissions',
		q,
		start,
		end,
		breakdown,
		...rest,
	};

	return DataStore.fetch(
		['misc', 'DataLog', 'green', md5(JSON.stringify(data))],
		() => {
			return ServerIO.load(ServerIO.DATALOG_ENDPOINT, { data, swallow: true });
		},
		null,
		null
	);
};

/**
 * Compress small rows into other by count instead of co2
 */
export const getCompressedBreakdownWithCount = ({
	breakdownByX,
	minFraction = 0.05,
	osTypes,
}: {
	breakdownByX: BreakdownByX;
	minFraction: number;
	osTypes: any | null;
}): Record<string, number> => {
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
	// compress small rows into other
	let breakdownByOSGroup2: BreakdownByX = {} as BreakdownByX;
	Object.entries(breakdownByOSGroup1).forEach(([k, v]) => {
		if (v.count / total < minFraction) {
			k = 'Other';
		}
		breakdownByOSGroup2[k] = {
			count: (breakdownByOSGroup2[k]?.count || 0) + v.count,
			co2: (breakdownByOSGroup2[k]?.co2 || 0) + v.co2,
			occurs: (breakdownByOSGroup2[k]?.occurs || 0) + 1,
		};
	});
	// get average of repeated keys
	let breakdownByOSGroupOutput: Record<string, number> = {};
	Object.entries(breakdownByOSGroup2).forEach(([k, v]) => {
		breakdownByOSGroupOutput[k] = v.co2 / v.occurs!;
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
export const getBreakdownByWithCount = (buckets: BreakdownRow[], keyNamesToSum: string[], keyNameToBreakdown: string): Object => {
	if (!buckets?.length) {
		return {}; // no data
	}

	const bi = keyNameToBreakdown === 'time' ? 'key_as_string' : 'key';

	let totalByX: Record<string, Object> = {};
	for (let i = 0; i < buckets.length; i++) {
		const row: BreakdownRow = buckets[i];
		const breakdownKey = row[bi];
		if (!breakdownKey) continue;
		keyNamesToSum.forEach((keyName) => {
			if (!(keyName in row)) {
				console.warn(keyName, 'not in buckets');
				return;
			}
		});
		totalByX[breakdownKey] = keyNamesToSum.reduce((acc: Record<string, any>, cur) => {
			acc[cur] = { ...row }[cur];
			return acc;
		}, {});
	}
	return totalByX;
};

/**
 * Simply filter out insignificant data to clean up dashboard view
 * @param minFraction percentage to filter
 */
export const filterByCount = (data: BreakdownByX, minFraction: number = 0.05) => {
	let total: number = 0;
	Object.values(data).forEach((val) => (total += val.count));
	let outputData: BreakdownByX = {};
	Object.entries(data).forEach(([k, v]) => {
		if (v.count > total * minFraction) {
			outputData[k] = v;
		}
	});
	return outputData;
};

/**
 * Get the GreenTags referenced by the buckets
 */
export const getTags = (buckets: GreenBuckets): PromiseValue | null => {
	if (!buckets || !buckets.length) {
		return null;
	}

	const tagIdSet: Record<string, boolean> = {};
	const adIdKey = 'key';
	buckets.forEach((row, i) => {
		let adid: string = row[adIdKey] as string;
		// HACK CaptifyOldMout data is polluted with impressions for adids like `ODCTC5Tu"style="position:absolute;` due to mangled pixels
		if (adid.match(/[^"]+/)) adid = adid.match(/[^"]+/)!.toString(); // Fairly safe to assume " won't be found in a normal adid
		if (adid && adid !== 'unset') {
			tagIdSet[adid] = true;
		}
	});

	const ids = Object.keys(tagIdSet);
	if (!ids.length) return null;

	// ??does PUB_OR_DRAFT work properly for `ids`??

	let pvTags = getDataList({ type: C.TYPES.GreenTag, status: KStatus.PUB_OR_DRAFT, ids, q: null, sort: null, start: null, end: null });

	return pvTags;
};
