
import DataStore from '../../../base/plumbing/DataStore';
import { periodFromName } from '../../../base/utils/date-utils';


/**
 * TODO refator the magic period handling
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



const roundFormat = new Intl.NumberFormat('en-GB', {maximumFractionDigits: 0});
const oneDigitFormat = new Intl.NumberFormat('en-GB', {minimumFractionDigits: 1, maximumFractionDigits: 2});
const twoDigitFormat = new Intl.NumberFormat('en-GB', {minimumFractionDigits: 0, maximumFractionDigits: 1});

/**
 * printer.prettyNumber is a little short on nuance here - we want to show a degree of precision
 * 1-digit numbers get up to 2 decimals & at least one, eg 3.4567 -> 3.45, 1.001 -> 1.0
 * 2-digit numbers get up to 1 decimal, eg 23.456 -> 23.5, 91.04 -> 91
 * 3-digit numbers get rounded to integer
 */
const smartNumber = (x:number) => {
	if (x == 0) return '0';
	if (!x) return '';
	if (x > -10 && x < 10) return oneDigitFormat.format(x);
	else if (x > -100 && x < 100) return twoDigitFormat.format(x);
	return roundFormat.format(x);
}

/**
 * Utility: take a mass in kg and pretty-print in kg or tonnes if it's large enough (raw string)
 * @param kg 
 * @returns eg "800 kg" or "1.5 tons"
 */
export const mass = (kg:number) : String => {
	const number = smartNumber(kg >= 1000 ? kg / 1000 : kg, true);
	const unit = kg < 1000 ? 'kg' : `tonne${kg !== 1 ? 's' : ''}`;
	return `${number} ${unit}`;	
};


// HSL values for the maximum and mimimum values in the series - interpolete between for others
const dfltMaxColour = [192, 33, 48];
const dfltMinColour = [186, 9, 84];

/**
 * Generate pretty on-brand colours for a chart data range
 * @param {!number[]} series 
 * @param {?number[]} maxColour e.g. [255,0,0] bright red
 * @param {?number[]} minColour 
 * @returns 
 */
export const dataColours = (series, maxColour = dfltMaxColour, minColour = dfltMinColour) => {
	if (!series.length) return [];
	// if (series.length === 1) return [`hsl(${maxColour[0]} ${maxColour[1]} ${maxColour[2]})`]

	// make sure everything passed to max/min is coercable to a real number
	const cleanSeries = series.filter(x => isFinite(x));
	const max = Math.max(...cleanSeries);
	const min = Math.min(...cleanSeries);
	const range = max - min || 1; // no x/0 for perfectly uniform datasets!

	const [minH, minS, minL] = minColour;
	const [dH, dS, dL] = maxColour.map((x, i) => x - minColour[i]);

	return series.map(val => {
		const quotient = (val - min) / range;
		return `hsl(${Math.round(minH + (quotient * dH))} ${Math.round(minS + (quotient * dS))}% ${Math.round(minL + (quotient * dL))}%)`
	});
};

/**
 * 
 * @returns {{filterMode:filterMode, filterId:string}}
 */
export const getFilterModeId = () => {
	const brandId = DataStore.getUrlValue('brand');
	const agencyId = DataStore.getUrlValue('agency');
	const campaignId = DataStore.getUrlValue('campaign');
	const tagId = DataStore.getUrlValue('tag');

	// What are we going to filter on? ("adid" rather than "tag" because that's what we'll search for in DataLog)
	// ??shouldn't brand be vertiser??
	const filterMode = campaignId ? 'campaign' : brandId ? 'brand' : agencyId ? 'agency' : tagId ? 'adid' : null;
	// Get the ID for the object we're filtering for
	const filterId = { campaign: campaignId, brand: brandId, agency: agencyId, adid: tagId }[filterMode];
	return {filterMode, filterId};
};

/** WIP
 *  
 */
export const getCountryFlag = (isoCode:String) => {
	console.warn("TODO getCountryFlag");
}

export const getCountryName = (isoCode:String) => {
	const onError = () => {
		console.log("getCountry error");
	};

	fetch(`/js-data/mapdefs-world.json`).then((res) => {
		if (!res.ok) {
			onError();
			return;
		}
		res
			.json()
			.then((json) => {
				return json;
				// clear error on successfully loading a country map
			})
			.catch(onError);
	});
}


/** Minimum kg value where we should switch to displaying tonnes instead */
export const TONNES_THRESHOLD = 1000;
