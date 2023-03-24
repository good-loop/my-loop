import DataStore from '../../../base/plumbing/DataStore';
import { periodFromName } from './dashutils';


export type Period = {start:Date, end:Date};

/**
 * @param keys an array of params you want to get from url
 */
export const paramsFromUrl = (keys: string[]): Record<string, any> => {
	const results: Record<string, any> = {};
	for(let ki=0; ki<keys.length; ki++) {
		const str = keys[ki];
		
		if (str.toString().toLowerCase() === 'period') {
			const periodName = DataStore.getUrlValue(str);
			const periodObjFromName = periodFromName(periodName);
			// User has set a named period (year, quarter, month)
			if (periodObjFromName) {
				results[str] = periodObjFromName;
				continue;
			}

			// Custom period with start/end values
			const start = DataStore.getUrlValue('start') as unknown as string;
			const end = DataStore.getUrlValue('end') as unknown as string;
			if (start || end) {
				const period: Record<string, Date> = {};
				if (start) {
					const [, yyyy, mm, dd] = start.match(/(\d+)-(\d+)-(\d+)/) as any[];
					period.start = new Date(yyyy, mm, dd);
					period.start.setMonth(period.start.getMonth() - 1); // correct for Date taking zero-index months
				}
				if (end) {
					const [, yyyy, mm, dd] = end.match(/(\d+)-(\d+)-(\d+)/) as any[];
					period.end = new Date(yyyy, mm, dd);
					period.end.setMonth(period.end.getMonth() - 1); // correct for Date taking zero-index months
					// Intuitive form "Period ending 2022-03-31" --> machine form "Period ending 2022-04-01T00:00:00"
					period.end.setDate(period.end.getDate() + 1);
				}
				results[str] = period;
				continue;
			}

			// Nothing set in URL
			results[str] = null;
			continue;
		}

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
	return results;
};
