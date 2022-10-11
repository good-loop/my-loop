import md5 from 'md5';
import { assert } from '../../../base/utils/assert';
import ServerIO from '../../../plumbing/ServerIO';
import DataStore from '../../../base/plumbing/DataStore';

/**
 * 
 * @param {Object} p
 * @param {string} p.q
 * @param {string} p.start
 * @param {string} p.end
 * @param {string[]} p.breakdown
 * @returns {}
 */
export const getEmissionsCarbon = ({ q = '', start = '1 month ago', end = 'now', breakdown, ...rest }) => {
	assert(!q?.includes('brand:'), q);
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