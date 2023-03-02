import md5 from 'md5';
import PromiseValue from '../../../base/promise-value';
import Campaign from '../../../base/data/Campaign';
import Impact from '../../../base/data/Impact';
import KStatus from '../../../base/data/KStatus';
import List from '../../../base/data/List';
import { getDataList } from '../../../base/plumbing/Crud';
import SearchQuery from '../../../base/searchquery';
import { assert } from '../../../base/utils/assert';
import { sum } from '../../../base/utils/miscutils';
import C from '../../../C';
import { periodFromUrl } from './dashutils';
import { getDataLogData } from '../../../base/plumbing/DataLog';

/**
 * @deprecated replaced by getCarbon in emissionscalcTs.ts
 * @param {Object} p
 * @param {string} p.q
 * @param {string} p.start
 * @param {string} p.end
 * @param {string[]} p.breakdown
 * @returns {} ??doc??
 */
export const getCarbon = ({ q = '', start = '1 month ago', end = 'now', breakdown, ...rest }) => {
	// TODO refactor to use getDataLogData()

	// assert(!q?.includes('brand:'), q);
	const data = {
		dataspace: 'emissions',
		q,
		start,
		end,
		breakdown,
		...rest,
	};

	return DataStore.fetch(['misc', 'DataLog', 'green', md5(JSON.stringify(data))], () => {
		// buckets of publisher, impressions, carbon rows
		return ServerIO.load(ServerIO.DATALOG_ENDPOINT, { data, swallow: true });
	}); // /fetch()
};

/**
 * @deprecated replaced by emissionscalcTs.ts
 * @param {Object[][]} buckets
 * @param {!string} keyName
 * @returns {!number}
 */
export const getSumColumn = (buckets, keyName) => {
	if (!buckets?.length) {
		console.warn('getSumColumn - no data', buckets, keyName);
		return 0; // no data
	}
	let total = 0;
	for (let i = 0; i < buckets.length; i++) {
		const row = buckets[i];
		const n = row[keyName];
		if (!n) continue;
		total += 1.0 * n;
	}
	return total;
};

/**
 * Merge same-key rows and compress small rows into "Other"
 * @deprecated replaced by getCompressedBreakdownWithCount in emissionscalcTs.ts
 * @param {Object} p
 * @param {Object} p.breakdownByX {key: number}
 * @param {?number} p.minFraction
 * @returns {Object} {key: number}
 */
export const getCompressedBreakdown = ({ breakdownByX, minFraction = 0.05, osTypes }) => {
	let breakdownByOSGroup1 = {};
	const total = sum(Object.values(breakdownByX));
	Object.entries(breakdownByX).forEach(([k, v]) => {
		let osType = osTypes && osTypes[k];
		let group = osType?.name || k;
		breakdownByOSGroup1[group] = (breakdownByOSGroup1[group] || 0) + v;
	});
	// compress small rows into other
	let breakdownByOSGroup2 = {};
	Object.entries(breakdownByOSGroup1).forEach(([k, v]) => {
		if (v / total < minFraction) {
			k = 'Other';
		}
		breakdownByOSGroup2[k] = (breakdownByOSGroup2[k] || 0) + v;
	});
	return breakdownByOSGroup2;
};

/**
 * @deprecated replaced by getBreakdownByWithCount in emissionscalcTs.ts
 * @param {Object[][]} buckets
 * @returns {Object} {breakdown-key: sum-for-key}
 */
export const getBreakdownBy = (buckets, keyNameToSum, keyNameToBreakdown) => {
	if (!buckets?.length) {
		return {}; // no data
	}

	const bi = keyNameToBreakdown === 'time' ? 'key_as_string' : 'key';

	let totalByX = {};
	for (let i = 0; i < buckets.length; i++) {
		const row = buckets[i];
		const n = row[keyNameToSum];
		if (!n) continue;
		const b = row[bi]; // breakdown key
		let v = totalByX[b] || 0;
		v += n;
		totalByX[b] = v;
	}
	return totalByX;
};

/**
 * @deprecated replaced by emissionscalcTs.ts
 * Get the GreenTags referenced by the buckets
 * @param {?Object[][]} buckets
 * @returns {?PromiseValue} PV of a List of GreenTags
 */
export const getTags = (buckets) => {
	if (!buckets || !buckets.length) {
		return null;
	}

	const tagIdSet = {};
	const adIdKey = 'key';
	buckets.forEach((row, i) => {
		let adid = row[adIdKey];
		// HACK CaptifyOldMout data is polluted with impressions for adids like `ODCTC5Tu"style="position:absolute;` due to mangled pixels
		adid = adid.match(/[^"]+/); // Fairly safe to assume " won't be found in a normal adid
		if (adid && adid !== 'unset') {
			tagIdSet[adid] = true;
		}
	});

	const ids = Object.keys(tagIdSet);
	if (!ids.length) return null;

	// ??does PUB_OR_DRAFT work properly for `ids`??

	let pvTags = getDataList({ type: C.TYPES.GreenTag, status: KStatus.PUB_OR_DRAFT, ids });

	return pvTags;
};

/**
 * @deprecated replaced by emissionscalcTs.ts
 * @param {Object[][]} buckets
 * @returns {?PromiseValue} PV of a List of Campaigns
 */
export const getCampaigns = (buckets) => {
	let pvTags = getTags(buckets);
	if (!pvTags) {
		return null;
	}

	return PromiseValue.then(pvTags, (tags) => {
		let cidSet = {};
		List.hits(tags).forEach((tag) => {
			if (tag && tag.campaign) {
				cidSet[tag.campaign] = true;
			}
		});
		let cids = Object.keys(cidSet);
		let pvcs = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUB_OR_DRAFT, ids: cids });
		// TODO have PromiseValue.then() unwrap nested PromiseValue
		return pvcs;
	});
};

/**
 *
 * @returns {?Impact} null if loading data
 */
export const calculateDynamicOffset = ({ campaign, offset, period }) => {
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
	return snapshotOffset;
};

/**
 * @deprecated Shift to ImpactDebits
 *
 * @param {Object} p
 * @param {!Campaign} p.campaign If `campaign` is a master, then this function WILL look up sub-campaigns and include them.
 * @param {?Object} p.period {start, end}
 * @returns {Object} {isLoading:boolean, carbon: Impact[], carbonTotal: Number, trees: Impact[], treesTotal:Number, coral: [], pvAllCampaigns }
 */
export const getOffsetsByType = ({ campaign, status, period }) => {
	// Is this a master campaign?
	let pvAllCampaigns = Campaign.pvSubCampaigns({ campaign, status });
	let isLoading = ! pvAllCampaigns.resolved;	
	const allFixedOffsets = [];
	if (pvAllCampaigns.value) {
		// for each campaign:
		// - collect offsets
		// - Fixed or dynamic offsets? If dynamic, get impressions
		// - future TODO did it fund eco charities? include those here
		List.hits(pvAllCampaigns.value).forEach((campaign) => {
			let pvImpactDebitsList = Campaign.getImpactDebits({campaign, status:KStatus.PUBLISHED});
			if (pvImpactDebitsList.value) {
				let impactDebits = List.hits(pvImpactDebitsList.value);
				let offsets = impactDebits.map(imp => imp.impact);
				let fixedOffsets = offsets.map((offset) =>
					Impact.isDynamic(offset) ? calculateDynamicOffset({ campaign, offset, period }) : offset
				);
				allFixedOffsets.push(...fixedOffsets);
			} else {
				isLoading = false;
			}
		});
		// console.log('allFixedOffsets', allFixedOffsets);
	}
	const offsets4type = {};
	// HACK - return this too (why??)
	offsets4type.pvAllCampaigns = pvAllCampaigns;
	// kgs of CO2
	let co2 = campaign.co2; // manually set for this campaign?
	let carbonOffsets;
	if (!co2) {
		// from offsets inc dynamic
		carbonOffsets = allFixedOffsets.filter((o) => Impact.isCarbonOffset(o));
		co2 = carbonOffsets.reduce((x, offset) => x + offset.n, 0);
	} else {
		// HACK use our default, gold-standard
		carbonOffsets = [new Impact({ charity: 'gold-standard', rate: 1, name: 'carbon offset' })];
	}
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
 * @deprecated replaced by emissionscalcTs.ts
 * @param {Object[]} buckets A DataLog breakdown of carbon emissions. e.g. [{key, co2, count}]
 * @param {Number} perN e.g. 1000 for "carbon per 1000 impressions"
 * @param {Number} filterLessThan Filter out data will too low count. Filter out less than 1% of the largest count if set to -1.
 * @returns The same breakdown, but with every "co2*" value in each bucket divided by (bucketcount / perN)
 */
export const emissionsPerImpressions = (buckets, filterLessThan = 0, perN = 1000) => {
	// Auto filter amount
	if (filterLessThan === -1) {
		const largest = Math.max(...buckets.map(val => val.count));
		filterLessThan = largest ? largest * 0.01 : 0;
	}

	return buckets
		.map((bkt) => {
			const newBkt = { ...bkt }; // Start with a copy

			if ('count' in bkt) {
				// Simple breakdown
				Object.entries(bkt).forEach(([k, v]) => {
					// Carbon entries => carbon per N impressions; others unchanged
					if (bkt.count > filterLessThan) {
						newBkt[k] = k.match(/^co2/) ? v / (bkt.count / perN) : v;
					} else {
						delete newBkt[k];
					}
				});
			} else {
				// Cross-breakdown (probably)
				const xbdKey = Object.keys(bkt).find((k) => k.match(/^by_/));
				// Recurse in to process the next breakdown level.
				if (xbdKey) newBkt[xbdKey] = emissionsPerImpressions(bkt[xbdKey], filterLessThan, perN);
				// if (!xbdKey) -- No count - but also no by_x sub-breakdown? Strange, but we can skip it.
			}

			return newBkt;
		})
		.filter((obj) => Object.keys(obj).length > 0);
};
