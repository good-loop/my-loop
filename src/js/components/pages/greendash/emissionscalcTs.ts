/* eslint-disable @typescript-eslint/ban-ts-comment */

import _, { remove } from 'lodash';
import md5 from 'md5';
import Campaign from '../../../base/data/Campaign';
import Impact from '../../../base/data/Impact';
import ImpactDebit from '../../../base/data/ImpactDebit';
import KStatus from '../../../base/data/KStatus';
import List from '../../../base/data/List';
import { getDataItem, getDataList } from '../../../base/plumbing/Crud';
import DataStore from '../../../base/plumbing/DataStore';
import PromiseValue from '../../../base/promise-value';
import SearchQuery from '../../../base/searchquery';
import { assert } from '../../../base/utils/assert';
import { sum, uniq, yessy } from '../../../base/utils/miscutils';
import C, { searchParamForType } from '../../../C';
import ServerIO from '../../../plumbing/ServerIO';
import { Period, getPeriodFromUrlParams, getTimeZone } from '../../../base/utils/date-utils';
import { getFilterTypeId } from './dashUtils';

/**
 * An array of Records ??what are the keys/values??
 * ??can be [{key, co2, count}]
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

export type BaseFilters = {
	q: string;
	start: string;
	end: string;
	prob?: string | number;
	sigfig?: string | number;
	nocache?: boolean;
	fixseed?: boolean;
	numRow?: string | number;
	num?: string | number;
	/**
	 * bucket timezone
	 */
	btz?: string;
};

export type BaseFiltersFailed = {
	type?: 'alert' | 'loading';
	message?: string;
};

export const isPer1000 = (): boolean => {
	const emissionsMode = DataStore.getUrlValue('emode');
	return emissionsMode === 'per1000';
};

/**
 * Supposedly return a BaseFilters. But when there are exceptions, return a alert or loading message. Catch the message wtih <Alert /> or <Misc.Loading /> div.
 * Usage examples see GreenMetrics2 in ./GreenMetrics.jsx
 * @param urlParams use getUrlVars() then getPeriodFromUrlParams() then add period!
 */
export const getBasefilters = (urlParams: any): BaseFilters | BaseFiltersFailed => {
	// Default to current quarter, all brands, all campaigns
	const period = urlParams.period;
	if (!period) {
		console.warn("use getUrlVars() then getPeriodFromUrlParams() then add period!");
	}
	let { filterType, filterId } = getFilterTypeId();

	let failedObject: BaseFiltersFailed = {};

	if ( ! filterType || ! filterId) {
		failedObject = { type: 'alert', message: 'Select a brand, campaign, or tag to see data.' };
		return failedObject;
	}

	// Fetch common data for CO2Card and BreakdownCard.
	// CompareCard sets its own time periods & TimeOfDayCard sets the timeofday flag, so both need to fetch their own data
	// ...but give them the basic filter spec so they stay in sync otherwise

	// Query filter e.g. which brand, campaign, or tag?
	let q = SearchQuery.setProp(null, searchParamForType(filterType), filterId).query;

	// HACK: filterMode=brand is twice wrong: the data uses vertiser, and some tags dont carry brand info :(
	// So do it by an OR over campaign-ids instead.
	if (filterType === C.TYPES.Advertiser) {
		// get the campaigns
		let sq = SearchQuery.setProp(null, 'vertiser', filterId);
		const pvAllCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, q: sq.query });
		if (!pvAllCampaigns.resolved) {
			failedObject = { type: 'loading', message: 'Fetching brand campaigns...' };
			return failedObject;
		}
		const campaignIds = List.hits(pvAllCampaigns.value)?.map((c) => c.id);
		if (!campaignIds || !yessy(campaignIds)) {
			failedObject = { type: 'alert', message: `No campaigns for brand id: ${filterId}` };
			return failedObject;
		}
		q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
	}
	if (filterType === C.TYPES.Agency) {
		q = SearchQuery.setProp(null, 'agency', filterId).query;
	}

	// HACK: Is this a master campaign? Do we need to cover sub-campaigns?
	if (filterType === C.TYPES.Campaign) {
		const pvCampaign = getDataItem({ type: C.TYPES.Campaign, id: filterId, status: KStatus.PUB_OR_DRAFT, action: null, swallow: null });
		if (!pvCampaign.value) {
			failedObject = { type: 'loading', message: 'Fetching campaigns...' };
			return failedObject;
		}
		const campaign = pvCampaign.value;
		// @ts-ignore
		if (Campaign.isMaster(campaign)) {
			// @ts-ignore
			const pvAllCampaigns = Campaign.pvSubCampaigns({ campaign, query: null });
			if (!pvAllCampaigns.resolved) {
				failedObject = { type: 'loading', message: 'Fetching campaigns...' };
				return failedObject;
			}
			const campaignIds = List.hits(pvAllCampaigns.value)!.map((c) => c.id);
			if (!yessy(campaignIds)) {
				failedObject = { type: 'alert', message: `No campaigns for master campaign id: ${filterId}` };
				return failedObject;
			}
			q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
		}
	}

	const baseFilters: BaseFilters = {
		q,
		start: period.start.toISOString(),
		end: period.end.toISOString(),
		prob: urlParams.prob?.toString(),
		sigfig: urlParams.sigfig?.toString(),
		nocache: urlParams.nocache,
		fixseed: true,
		btz: getTimeZone()
	};

	return baseFilters;
};


export const getCarbon = ({
	endpoint,
	q = '',
	start = '1 month ago',
	end = 'now',
	breakdown,
	...rest
}: {
	endpoint?: string;
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

	// maybe use getDataLogData()??

	return DataStore.fetch(
		['misc', 'DataLog', 'green', md5(JSON.stringify(data))],
		() => {
			return ServerIO.load(endpoint || ServerIO.DATALOG_ENDPOINT, { data, swallow: true, method:"POST" });
		}
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
	let breakdownByOSGroupOutput: { [key: string]: number } = {};
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

	let totalByX: { [key: string]: Object } = {};
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
		totalByX[breakdownKey] = keyNamesToSum.reduce((acc: { [key: string]: any }, cur) => {
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

	const tagIdSet: { [key: string]: boolean } = {};
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

	let pvTags = getDataList({ type: C.TYPES.GreenTag, status: KStatus.PUB_OR_DRAFT });

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
			let cidSet: { [key: string]: boolean } = {};
			List.hits(tags)?.forEach((tag: Record<string, any>) => {
				if (tag && tag.campaign) {
					cidSet[tag.campaign] = true;
				}
			});
			let cids = Object.keys(cidSet);
			let pvcs = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUB_OR_DRAFT, ids: cids });
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
					if (bkt.count as number > filterLessThan) {
						newBkt[k] = k.match(/^co2/) ? (v as number) / ((bkt.count as number) / perN) : v;
					} else {
						newBkt[k] = k.match(/^co2/) ? 0 : v;
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
 * FIXME How does this relate to calculateFixedOffset()??
 * FIXME How does this relate to getFixedOffsetsForCampaign() in the master branch??
 * 
 * Why not use Promise? Returing null when loading is very hard to handle.
 * @returns null if loading data
 */
const calculateDynamicOffset = (campaign: Campaign, offset: Impact, period: Period|null): Impact | null => {
	Campaign.assIsa(campaign, null);
	assert(Impact.isDynamic(offset), campaign); // paranoia

	// We either want carbon emissions or impressions count for this campaign/period - this gets both
	if (!period) {		
		period = getPeriodFromUrlParams();
	}
	let pvCarbonData = getCarbon({
		q: SearchQuery.setProp(null, 'campaign', campaign.id).query,
		start: period?.start?.toISOString() || '2022-01-01',
		end: period?.end?.toISOString() || 'now',
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



/**
 * FIXME How does this relate to calculateFixedOffset()??
 * FIXME How does this relate to getFixedOffsetsForCampaign() in the master branch??
 * How does this relate to getFixedOffsetsForCampaign??
 * fraction by period, or all
 */
const calculateFixedOffset = (impactDebit: ImpactDebit, period: Period|null): Impact | null => {
	ImpactDebit.assIsa(impactDebit, null);
	// We either want carbon emissions or impressions count for this campaign/period - this gets both
	if ( ! period) {		
		period = getPeriodFromUrlParams();
	}
	// fraction of period
	let fraction;
	if (period && impactDebit.start && impactDebit.end) {
		let period2 = {start:new Date(impactDebit.start), end:new Date(impactDebit.end)} as Period;
		let overlapStartMsecs = Math.max(period.start!.getTime(), period2.start!.getTime());
		let overlapEndMsecs = Math.min(period.end!.getTime(), period2.end!.getTime());
		fraction = (overlapEndMsecs - overlapStartMsecs) / (period.end!.getTime() - period.start!.getTime());
		if (fraction<0) {
			fraction = 0;
		}
	} else {
		fraction = 1;
	}
	// copy and set n
	let snapshotOffset = new Impact(impactDebit.impact);
	snapshotOffset.n = impactDebit.impact.n*fraction;
	delete snapshotOffset.rate;
	delete snapshotOffset.input;
	delete snapshotOffset.dynamic;
	snapshotOffset.src = impactDebit.impact; // DEBUG pass on the original
	snapshotOffset.start = period?.start;
	snapshotOffset.end = period?.end;
	return snapshotOffset;
};


type OffSets4Type = {
	isLoading: boolean;
	carbon: Impact[];
	carbonTotal: number;
	trees: Impact[];
	treesTotal: number;
	coral: Impact[];
	coralTotal: number;
	pvAllCampaigns: PromiseValue;
	allFixedOffsets: Impact[];
};

/** For a given list of campaigns, return their offsets
 * 
 * @param campaigns {[Campaign]} List of campaigns we want offsets for
 * @param status
 * @param period
*/ 
export const getCampaignsOffsetsByType = ({ campaigns, status, period }: { campaigns: [Campaign]; status: any; period: Period }): OffSets4Type => {
	// getOffsetsByType2 requires a promiseValue, just pass in the values to give us an already resolved PV
	return getOffsetsByType2({pvAllCampaigns: new PromiseValue({hits : campaigns}), status, period});
};

/** For a given campaign, find all of its subcampaigns and their offsets
 * 
 * @param campaign {Campaign} The master campaign we want to find offsets for
 * @param status
 * @param period
*/ 
export const getOffsetsByType = ({ campaign, status, period }: { campaign: Campaign; status: any; period: Period }): OffSets4Type => {
	// Is this a master campaign?
	// @ts-ignore
	let pvAllCampaigns = Campaign.pvSubCampaigns({ campaign, query: status }) as PromiseValue;
	return getOffsetsByType2({pvAllCampaigns: pvAllCampaigns, status, period});
};

/**
 * 
 * @param campaign {PromiseValue} A promiseValue that resolves into list of campaigns 
 * @param status
 * @param period
 * 
 * Refactored to no longer return offsets for Campaign + SubCampaigns and instead all campaigns passed in
 * @returns {OffSets4Type}
 */
// NB: Tried refactor getOffsetsByType into Promise with async. Causing an infinite loop in GreenLanding2.
export const getOffsetsByType2 = ({ pvAllCampaigns, status, period }: { pvAllCampaigns: PromiseValue; status: any; period: Period }): OffSets4Type => {
	// Is this a master campaign?
	// @ts-ignore
	let isLoading = !pvAllCampaigns.resolved;
	let allFixedOffsets = [] as Impact[];
	if (pvAllCampaigns.value) {
		// for each campaign:
		// - collect offsets
		// - Fixed or dynamic offsets? If dynamic, get impressions
		// - future TODO did it fund eco charities? include those here
		let fixedOffsets = List.hits(pvAllCampaigns.value)!.map((c) => getFixedOffsetsForCampaign(c as unknown as Campaign, period)) as unknown as Impact[];
		if (fixedOffsets.find((x) => !x)) {
			isLoading = true;
		}
		allFixedOffsets = _.flatten(fixedOffsets.filter((x) => x));
	}
	const offsets4type = {} as OffSets4Type;
	// HACK - return this too (why??)
	offsets4type.pvAllCampaigns = pvAllCampaigns;
	offsets4type.allFixedOffsets = allFixedOffsets; // DEBUG
	// kgs of CO2
	let carbonOffsets = allFixedOffsets.filter(Impact.isCarbonOffset);
	let co2sDEBUG = carbonOffsets.map((co) => co.n);
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
	return offsets4type;
};

/**
 * This works across impact types
 * Why not use Promise?? Returning false when loading is hard to handle.
 * @returns {?ImpactDebit[]} false if loading
 */
const getFixedOffsetsForCampaign = (campaign: Campaign, period: Period): (Impact | null)[] | false => {
	let pvImpactDebitsList = Campaign.getImpactDebits({ campaign, status: KStatus.PUBLISHED });
	if (!pvImpactDebitsList.value) {
		return false;
	}
	let impactDebits = List.hits(pvImpactDebitsList.value) as unknown as ImpactDebit[];
	// Do we have mixed dynamic/fixed impacts?
	const dynamicImpactDebits = impactDebits.filter((impd) => Impact.isDynamic(impd.impact));
	const fixedImpactDebits = impactDebits.filter((impd) => !Impact.isDynamic(impd.impact));
	if (!dynamicImpactDebits.length || !fixedImpactDebits.length) {
		// no mix = simples
		let fixedOffsets = impactDebits.map(imp => Impact.isDynamic(imp.impact)? 
			calculateDynamicOffset(campaign, imp.impact, period) 
			: calculateFixedOffset(imp, period));
		return fixedOffsets;
	}
	// What gaps do we have in the fixed impacts?
	let fixedOffsets = [] as Impact[];
	// ...type by type
	let types = uniq(impactDebits.map((impd) => impd.impact?.name));
	for (let ti = 0; ti < types.length; ti++) {
		let type = types[ti];
		let fixed = fixedImpactDebits.filter((impd) => impd.impact.name === type);
		for(let i=0; i<fixed.length; i++) {
			let fo = calculateFixedOffset(fixed[i], period);			
			if (fo) fixedOffsets.push(fo);
		}		
		let dynamic = dynamicImpactDebits.filter((impd) => impd.impact.name === type);
		if (!dynamic.length) continue;
		if (dynamic.length !== 1) {
			console.warn('Multiple dynamic offsets!', campaign, type, dynamic);
		}
		let doffset = dynamic[0].impact;
		if (!fixed.length) {
			console.warn('mixed but not for type ' + type, fixedImpactDebits, 'dynamic', dynamic);
			let do0 = calculateDynamicOffset(campaign, doffset, period) as Impact;
			fixedOffsets.push(do0);
			continue;
		}
		// calculate for gaps
		// ASSUME the fixed patches are a continuous strip, and the dynamic are only start/end pieces
		// ASSUME fixed offsets have start/end dates set (so startGap and endGap are well defined)
		let starts = fixed.map((impd) => impd.start && new Date(impd.start).getTime()).filter((x) => x) as number[];
		let fstart = Math.min(...starts);
		let ends = fixed.map((impd) => impd.end && new Date(impd.end).getTime()).filter((x) => x) as number[];
		let fend = Math.max(...ends);
		if (!Number.isFinite(fstart) || !Number.isFinite(fend)) {
			console.error('Invalid fixed ImpactDebit start/end ' + fstart + ' ' + fend + ' impact.name:' + type + ' campaign:' + campaign.id);
			return false;
		}
		let startGap = { start: period.start, end: new Date(fstart) } as Period;
		let endGap = { start: new Date(fend), end: period.end } as Period;
		// avoid bad/empty periods where start is after end
		if (startGap.start!.getTime() < startGap.end!.getTime()) {
			let do1 = calculateDynamicOffset(campaign, doffset, startGap) as Impact;
			fixedOffsets.push(do1);
		}
		if (endGap.start!.getTime() < endGap.end!.getTime()) {
			let do2 = calculateDynamicOffset(campaign, doffset, endGap) as Impact;
			fixedOffsets.push(do2);
		}
	}
	if (fixedOffsets.filter(x => ! x).length) {
		return false; // still loading data
	}
	return fixedOffsets;
};

/** Tizen could mean Samsung mobile or Samsung TV, split them */
export const splitTizenOS = async (buckets: GreenBuckets, baseFilters: BaseFilters) => {
	// Escape if no tizen were found
	if (!buckets.some((record) => Object.prototype.hasOwnProperty.call(record, "key") && record.key === "tizen")) {
		return buckets;
	}

	// This won't work well with prob setting
	baseFilters = {...baseFilters, prob: undefined};

	const filteredData: GreenBuckets = buckets.filter((record) => !(Object.prototype.hasOwnProperty.call(record, "key") && record.key === "tizen"));
	const tizenFilters = { ...baseFilters, q: `(${baseFilters.q}) AND os:tizen`, breakdown: ['mbl{"countco2":"sum"}'] };

	const pvTizenMblValue = await getCarbon(tizenFilters).promise;

	if (pvTizenMblValue.by_mbl?.buckets) {
		let mblBuckets = _.cloneDeep(pvTizenMblValue.by_mbl.buckets);
		mblBuckets = mblBuckets.map((record: Record<string, string | number>) => {
			if (record.key === "false") {
				record.key = "samsung tv";
			} else {
				record.key = "tizen mobile";
			}
			return record;
		});
		return filteredData.concat(mblBuckets);
	}
};
