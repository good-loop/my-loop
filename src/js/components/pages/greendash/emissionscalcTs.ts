/**
 * Rewrite functions from emissionscalc.js into typescript.
 */

import _ from 'lodash';
import { sum, uniq } from '../../../base/utils/miscutils';
import DataStore from '../../../base/plumbing/DataStore';
import ServerIO from '../../../plumbing/ServerIO';
import { getDataList } from '../../../base/plumbing/Crud';
import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import List from '../../../base/data/List';
import Campaign from '../../../base/data/Campaign';
import md5 from 'md5';
import PromiseValue from '../../../base/promise-value';
import Impact from '../../../base/data/Impact';
import { periodFromUrl } from './dashutils';
import { assert } from '../../../base/utils/assert';
import ImpactDebit from '../../../base/data/ImpactDebit';
import SearchQuery from '../../../base/searchquery';
import { Period } from './dashUtils';
/**
 * An array of Records
 */
export type GreenBuckets = Record<string, string | number>[];

type BreakdownByX = Record<
	string,
	{
		count: number;
		co2: number;
		occurs?: number;
	}
>;

export type BreakdownRow = {
	key?: string;
	key_as_string?: string;
	co2?: number;
	count?: number;
	co2base?: number;
	co2creative?: number;
	co2supplypath?: number;
};

export const getCarbon = ({
	endpoint,
	q = '',
	start = '1 month ago',
	end = 'now',
	breakdown,
	...rest
}: {
	endpoint?: string,
	q: string;
	start: string;
	end: string;
	breakdown: string[];
}): PromiseValue => {
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
			return ServerIO.load((endpoint || ServerIO.DATALOG_ENDPOINT), { data, swallow: true });
		},
		null,
		null
	);
};

export const getSumColumn = (buckets: GreenBuckets, keyName: string) => {
	if (!buckets?.length) {
		console.warn('getSumColumn - no data', buckets, keyName);
		return 0; // no data
	}
	let total = 0;
	for (let i = 0; i < buckets.length; i++) {
		const row = buckets[i];
		if (typeof row[keyName] != 'number') continue;
		const n: number = row[keyName] as number;
		if (!n) continue;
		total += 1.0 * n;
	}
	return total;
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
	let breakdownByOSGroupOutput: {[key: string]: number} = {};
	Object.entries(breakdownByOSGroup2).forEach(([k, v]) => {
		breakdownByOSGroupOutput[k] = v.co2 / v.occurs!;
	});

	return breakdownByOSGroupOutput;
};

/**
 * Can have multi keyNameToSum
 */
export const getBreakdownByWithCount = (buckets: GreenBuckets, keyNamesToSum: string[], keyNameToBreakdown: string): Object => {
	if (!buckets?.length) {
		return {}; // no data
	}

	const bi = keyNameToBreakdown === 'time' ? 'key_as_string' : 'key';

	let totalByX: {[key: string]: Object} = {};
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
		totalByX[breakdownKey] = keyNamesToSum.reduce((acc: {[key: string]: any}, cur) => {
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
export const filterByCount = (data: BreakdownByX, minFraction = 0.05) => {
	let total = 0;
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

	const tagIdSet: {[key: string]: boolean} = {};
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

export const getCampaigns = (buckets: GreenBuckets) => {
	let pvTags = getTags(buckets);
	if (!pvTags) {
		return null;
	}

	// TODO tags is GreenTag[]
	return PromiseValue.then(
		pvTags,
		(tags: List) => {
			let cidSet: {[key: string]: boolean} = {};
			List.hits(tags)?.forEach((tag: Record<string, any>) => {
				if (tag && tag.campaign) {
					cidSet[tag.campaign] = true;
				}
			});
			let cids = Object.keys(cidSet);
			let pvcs = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUB_OR_DRAFT, ids: cids, q: null, sort: null, start: null, end: null });
			// TODO have PromiseValue.then() unwrap nested PromiseValue
			return pvcs;
		},
		null
	);
};

/**
 * @param buckets A DataLog breakdown of carbon emissions. e.g. [{key, co2, count}]
 * @param perN e.g. 1000 for "carbon per 1000 impressions"
 * @param filterLessThan Filter out data will too low count. Filter out less than 1% of the largest count if set to -1.
 * @returns The same breakdown, but with every "co2*" value in each bucket divided by (bucketcount / perN)
 */
export const emissionsPerImpressions = (buckets: GreenBuckets, filterLessThan: number = 0, perN: number = 1000): GreenBuckets => {
	// Auto filter amount
	if (filterLessThan === -1) {
		const largest = Math.max(...buckets.map((val) => val.count as number));
		filterLessThan = largest ? largest * 0.01 : 0;
	}

	return buckets
		.map((bkt) => {
			const newBkt: Record<string, string | number> = { ...bkt }; // Start with a copy

			if ('count' in bkt) {
				// Simple breakdown
				Object.entries(bkt).forEach(([k, v]) => {
					// Carbon entries => carbon per N impressions; others unchanged
					if (bkt.count > filterLessThan) {
						newBkt[k] = k.match(/^co2/) ? (v as number) / ((bkt.count as number) / perN) : v;
					} else {
						delete newBkt[k];
					}
				});
			} else {
				// Cross-breakdown (probably)
				const xbdKey = Object.keys(bkt).find((k) => k.match(/^by_/)) as string;
				// Recurse in to process the next breakdown level.
				// This is not safe, but we will allow it anyway
				if (xbdKey) {
					const crossBkt = newBkt[xbdKey] as unknown as GreenBuckets;
					newBkt[xbdKey] = emissionsPerImpressions(crossBkt, filterLessThan, perN) as any;
				}
				// if (!xbdKey) -- No count - but also no by_x sub-breakdown? Strange, but we can skip it.
			}

			return newBkt;
		})
		.filter((obj) => Object.keys(obj).length > 0);
};

/**
 *
 * @returns {?Impact} null if loading data
 */
export const calculateDynamicOffset = (campaign: Campaign, offset:Impact, period: Period) => {
	Campaign.assIsa(campaign);
	if (!Impact.isDynamic(offset)) return offset; // paranoia

	// We either want carbon emissions or impressions count for this campaign/period - this gets both
	if (!period) period = periodFromUrl();
	let pvCarbonData = getCarbon({
		q: SearchQuery.setProp(null, 'campaign', campaign.id).query,
		start: period?.start.toISOString() || '2022-01-01',
		end: period?.end.toISOString() || 'now',
		breakdown: ['total{"emissions":"sum"}'],
	});

	if (!pvCarbonData.value) return null;

	let n;
	// HACK: carbon offset?
	if (Impact.isCarbonOffset(offset)) {
		n = getSumColumn(pvCarbonData.value.by_total.buckets, 'co2');
	} else {
		// check it is per impression
		if (offset.input) assert(offset.input.substring(0, 'impression'.length) === 'impression', offset);
		// Impression count * output-per-impression
		n = pvCarbonData.value.allCount * offset.rate;
	}
	// copy and set n
	let snapshotOffset = new Impact(offset);
	snapshotOffset.n = n;
	delete snapshotOffset.rate;
	delete snapshotOffset.input;
	delete snapshotOffset.dynamic;
	snapshotOffset.campaign = campaign.id;
	snapshotOffset.src = offset; // DEBUG pass on the original
	snapshotOffset.start = period?.start;
	snapshotOffset.end = period?.end;
	return snapshotOffset;
};


type OffSets4Type = {
	isLoading:boolean, carbon:Impact[], carbonTotal:number, trees:Impact[], treesTotal:number, coral:Impact[], 
	pvAllCampaigns:PromiseValue, allFixedOffsets:Impact[]
};

/**
 * @param {Object} p
 * @param {!Campaign} p.campaign If `campaign` is a master, then this function WILL look up sub-campaigns and include them.
 * @param {?Period} p.period {start, end}
 * @returns {OffSets4Type}
 */
export const getOffsetsByType = ({ campaign, status, period }) => {
	// Is this a master campaign?
	let pvAllCampaigns = Campaign.pvSubCampaigns({ campaign, status });
	let isLoading = ! pvAllCampaigns.resolved;	
	let allFixedOffsets = [] as Impact[];
	if (pvAllCampaigns.value) {
		// for each campaign:
		// - collect offsets
		// - Fixed or dynamic offsets? If dynamic, get impressions
		// - future TODO did it fund eco charities? include those here		
		let fixedOffsets = List.hits(pvAllCampaigns.value).map(c => getFixedOffsetsForCampaign(c, period));
		if (fixedOffsets.find(x => ! x)) {
			isLoading = true;
		}
		allFixedOffsets = _.flatten(fixedOffsets.filter(x => x));
	}
	const offsets4type = {} as OffSets4Type;
	// HACK - return this too (why??)
	offsets4type.pvAllCampaigns = pvAllCampaigns;
	offsets4type.allFixedOffsets = allFixedOffsets; // DEBUG
	// kgs of CO2
	let carbonOffsets = allFixedOffsets.filter(Impact.isCarbonOffset);
	let co2sDEBUG = carbonOffsets.map(co => co.n);
	let co2 = carbonOffsets.reduce((x, offset) => x + offset.n, 0);
	offsets4type.carbon = carbonOffsets;
	offsets4type.carbonTotal = co2;

	// Trees
	offsets4type.trees = allFixedOffsets.filter((o) => o?.name?.substring(0, 4) === 'tree');
	offsets4type.treesTotal = offsets4type.trees.reduce((x, offset) => x + offset.n, 0);

	// coral
	offsets4type.coral = allFixedOffsets.filter((o) => o?.name?.substring(0, 4) === 'coral');
	offsets4type.coralTotal = offsets4type.coral.reduce((x, offset) => x + offset.n, 0);

	offsets4type.isLoading = isLoading;
	console.log("offsets4type",offsets4type,"Campaign", campaign,"period",period);
	return offsets4type;
};

/**
 * 
 * @param campaign 
 * @returns false if loading
 */
const getFixedOffsetsForCampaign = (campaign:Campaign, period: Period) => {
	let pvImpactDebitsList = Campaign.getImpactDebits({campaign, status:KStatus.PUBLISHED});
	if ( ! pvImpactDebitsList.value) {
		return false;
	}
	let impactDebits = List.hits(pvImpactDebitsList.value) as ImpactDebit[];
	// Do we have mixed dynamic/fixed impacts?
	const dynamicImpactDebits = impactDebits.filter(impd => Impact.isDynamic(impd.impact));
	const fixedImpactDebits = impactDebits.filter(impd => ! Impact.isDynamic(impd.impact));			
	if ( ! dynamicImpactDebits.length || ! fixedImpactDebits.length) {
			// no mix = simples
		let offsets = impactDebits.map(imp => imp.impact);
		let fixedOffsets = offsets.map((offset) =>
			Impact.isDynamic(offset) ? calculateDynamicOffset(campaign, offset, period) : offset
		);
		return fixedOffsets;
	}
	// What gaps do we have in the fixed impacts?
	let fixedOffsets = [] as Impact[];
	// ...type by type
	let types = uniq(impactDebits.map(impd => impd.impact?.name));
	for(let ti=0; ti<types.length; ti++) {
		let type = types[ti];
		let fixed = fixedImpactDebits.filter(impd => impd.impact.name === type);
		fixedOffsets.push(...fixed.map(impd => Object.assign({start:impd.start, end:impd.end}, impd.impact))); // NB: add start/end for debug
		let dynamic = dynamicImpactDebits.filter(impd => impd.impact.name === type);
		if ( ! dynamic.length) continue;
		if (dynamic.length !== 1) {
			console.warn("Multiple dynamic offsets!", campaign, type, dynamic);
		}
		// calculate for gaps
		// ASSUME the fixed patches are a continuous strip, and the dynamic are only start/end pieces
		// ASSUME fixed offsets have start/end dates set (so startGap and endGap are well defined)
		let starts = fixed.map(impd => impd.start && new Date(impd.start).getTime()).filter(x => x);
		let fstart = Math.min(...starts);
		let ends = fixed.map(impd => impd.end && new Date(impd.end).getTime()).filter(x => x);
		let fend = Math.max(...ends);
		let startGap = {start:period.start, end:new Date(fstart)};
		let endGap = {start:new Date(fend), end:period.end};
		let doffset = dynamic[0].impact;
		let do1 = calculateDynamicOffset(campaign, doffset, startGap);
		let do2 = calculateDynamicOffset(campaign, doffset, endGap);
		fixedOffsets.push(do1, do2);
	}
	if (fixedOffsets.filter(x => ! x).length) {
		console.log("loading carbon data", fixedOffsets);
		return false; // still loading data
	}
	return fixedOffsets;
};
