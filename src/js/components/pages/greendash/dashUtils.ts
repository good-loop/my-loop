import DataStore from '../../../base/plumbing/DataStore';

/**
 * @param keys an array of params you want to get from url
 */
export const paramsFromUrl = (keys: string[]): Record<string, string | number | boolean> => {
	const results: Record<string, string | number | boolean> = {};
	for (const str of keys) {
		const val = DataStore.getUrlValue(str) as unknown as string;
		if (!isNaN(parseFloat(val))) {
			results[str] = Number.parseInt(val);
			continue;
		}
		if (val?.toString()?.toLowerCase() === 'true') {
			results[str] = true;
			continue;
		}
		if (val?.toString()?.toLowerCase() === 'false') {
			results[str] = false;
			continue;
		}
		results[str] = val;
	}
	return results
};
