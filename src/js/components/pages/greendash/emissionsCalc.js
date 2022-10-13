import md5 from 'md5';
import { getDataList } from '../../../base/plumbing/Crud';
import KStatus from '../../../base/data/KStatus';
import PromiseValue from 'promise-value';
// import { assert } from '../../../base/utils/assert';
// import ServerIO from '../../../plumbing/ServerIO';
// import DataStore from '../../../base/plumbing/DataStore';

/**
 * 
 * @param {Object} p
 * @param {string} p.q
 * @param {string} p.start
 * @param {string} p.end
 * @param {string[]} p.breakdown
 * @returns {}
 */
export const getCarbonEmissions = ({ q = '', start = '1 month ago', end = 'now', breakdown, ...rest }) => {
	// assert(!q?.includes('brand:'), q);
	const data = {
		dataspace: 'emissions',
		q,
		start, end,
		breakdown,
		...rest
	};

	return DataStore.fetch(['misc', 'DataLog', 'green', md5(JSON.stringify(data))], () => {
		// buckets of publisher, impressions, carbon rows
		return ServerIO.load(ServerIO.DATALOG_ENDPOINT, {data, swallow: true});
	}); // /fetch()
}

/**
 * 
 * @param {Object[][]} buckets
 * @param {!string} keyName
 * @returns {!number}
 */
 export const getSumColumnEmissions = (buckets, keyName) => {
	if (!buckets?.length) {
		console.warn("getSumColumn - no data", buckets, keyName);
		return 0; // no data
	}
	let total = 0;
	for(let i = 0; i < buckets.length; i++) {
		const row = buckets[i];
		const n = row[keyName];
		if (!n) continue;
		total += 1.0 * n;
	}
	return total;
};

/**
 * 
 * @param {Object[][]} buckets 
 * @param {!string} colName
 * @returns {Object} {breakdown-key: sum-for-key}
 */
 export const getBreakdownByEmissions = (buckets, keyNameToSum, keyNameToBreakdown) => {
	if (!buckets?.length) {
		return {}; // no data
	}

	const bi = keyNameToBreakdown === 'time' ? 'key_as_string' : 'key';

	let totalByX = {};
	for(let i = 0; i < buckets.length; i++) {
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
	if ( ! ids.length) return null;

	// ??does PUB_OR_DRAFT work properly for `ids`??

	let pvTags = getDataList({type: C.TYPES.GreenTag, status: KStatus.PUB_OR_DRAFT, ids});

	return pvTags;
};

/**
 * 
 * @param {Object[][]} buckets 
 * @returns {?PromiseValue} PV of a List of Campaigns
 */
 export const getCampaignsEmissions = (buckets) => {
	let pvTags = getTags(buckets);
	if ( ! pvTags) {
		return null;
	}

	return PromiseValue.then(pvTags, tags => {
		let cidSet = {};
		List.hits(tags).forEach(tag => {
			if (tag && tag.campaign) {
				cidSet[tag.campaign] = true;
			}
		});
		let cids = Object.keys(cidSet);
		let pvcs = getDataList({type: C.TYPES.Campaign, status: KStatus.PUB_OR_DRAFT, ids: cids});
		// TODO have PromiseValue.then() unwrap nested PromiseValue
		return pvcs;
	});
};