import md5 from 'md5';
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
		// table of publisher, impressions, carbon rows
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
 * @param {Object[][]} table 
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