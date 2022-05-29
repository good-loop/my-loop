import md5 from 'md5';


/** Turn a list of things with IDs into an object mapping IDs to things */
export const byId = things => things.reduce((acc, thing) => {
	acc[thing.id] = thing;
	return acc;
}, {})


/** Data (gigabytes) to CO2 (kg) for each country */
const DATA_TO_CARBON_BY_COUNTRY = {
	GB: 0.54,
};

const PUBLISHER_OVERHEAD = 100000; // TODO Fill in correct number
const DSP_OVERHEAD = 100000; // TODO Fill in correct number


/** Take DataLog impression buckets where the keys correspond to tags & total up bytes of data transferred */
const calcBytes = (buckets, tagsById) => {
	let media = 0;
	let publisher = 0;
	let dsp = 0;

	buckets.forEach(({count, key}) => {
		media += count * tagsById[key].weight;
		publisher += count * PUBLISHER_OVERHEAD;
		dsp += count * DSP_OVERHEAD;
	});
	return {total: (media + publisher + dsp), media, publisher, dsp};
};


/**
 * Turns a list of buckets into an object containing a proportional breakdown
 * @param {*} buckets e.g. [ { key: 'one', count: 100 }, { key: 'two', count: 300} ]
 * @return e.g. { one: 0.25, two: 0.75 }
 */
const bucketsToFractions = (buckets) => {
	// Add up total count across all buckets...
	const total = buckets.reduce((acc, bkt) => acc + bkt.count, 0);

	// ...and divide each individual count to turn it into a fraction of the total
	return buckets.reduce((acc, bkt) => {
		acc[bkt.key] = bkt.count / total;
		return acc;
	}, {});
};


/**
 * For each green tag, what proportion of of data was served in which countries?
 * This is needed to calculate average CO2 per GB for each tag, as different countries
 * have different fuel balances etc.
 * @param {*} by_adid_country A breakdown from DataLog
 * @returns eg { jozxYqK: { GB: 0.5, US: 0.5}, KWyjiBo: { DE: 0.115, FR: 0.885 } }
 */
const tagToCountryBreakdown = (by_adid_country) => {
	const toReturn = {};

	by_adid_country.buckets.forEach(({key: tagid, by_country}) => {
		toReturn[tagid] = bucketsToFractions(by_country.buckets);
	});
	return toReturn;
};


/**
 * Use the impressions-by-tag distribution and the impressions-by-tag-by-country distribution
 * to calculate the carbon emissions for transferring a quantity of data.
 * @param {*} bytes 
 * @param {*} tagFractions 
 * @param {*} countries 
 * @returns 
 */
const bytesToCarbon = (bytes, tagFractions, countries) => {
	// Iterate through all tags...
	return Object.entries(tagFractions).reduce((acc, [tagId, tFraction]) => {
		const bytesForThisTag = bytes * tFraction;
		const countriesForThisTag = countries[tagId];
		// Divide up the bytes used by this tag into the countries where the tag served
		// and multiply the portions by the bytes-to-carbon conversion factor for each country
		return acc + Object.entries(countriesForThisTag).reduce((acc, [country, cFraction]) => {
			const bytesForTagForCountry = bytesForThisTag * cFraction;
			return acc + (bytesForTagForCountry * DATA_TO_CARBON_BY_COUNTRY[country]);
		}, 0);
	}, 0);
};


/* What does the output of getCarbon look like? (Unused, illustrative purposes only) */
const exampleDataSets = {
	// The name of the requested breakdown
	time: {
		// The bucket keys from the breakdown
		labels: ['2022-01-01', '2022-01-02', '2022-01-03', '2022-01-04'],
		// Total impressions for each "label" bucket
		imps: [123456, 789012, 345678, 901234],
		// Bytes transferred for each bucket
		bytes: {
			total: [12345678901, 23456789012, 34567890123, 45678901234],
			media: [10000000000, 20000000000, 30000000000, 40000000000], // How much was due to the creative?
			publisher: [2000000000, 3000000000, 4000000000, 5000000000], // How much was publisher-side overhead (JS and data on client's computer)
			dsp: [345678901, 456789012, 567890123, 678901234], // How much was DSP-side overhead (bidding interactions)
			// TODO Is DSP overhead data-independent? Should it be omitted here and only added at the carbon stage?
		},
		// Carbon emissions caused by data transfer
		carbon: {
			total: [3.456, 6.789, 9.012, 12.345],
			media: [1.34, 2.25, 3.3, 4.2],
			publisher: [0.616, 1.089, 1.412, 2.045],
			dsp: [1.50, 3.45, 4.3, 6.1],
		}
	}
}


/**
 * Query for green ad tag impressions, then connect IDs to provided tags, calculate data usage & carbon emissions, and output ChartJS-ready data
 * CAUTION: To avoid a dimensional explosion, we assume that the "fraction of impressions per advert per country" is homogeneous across other breakdowns.
 * This means it's possible to have weird cases where - for instance - an advert which only runs in the UK in the daytime and in Australia at night
 * might produce an inaccurate time-of-day carbon breakdown, as it will be calculated on the assumption that its country distribution is the same at all times.
 * We think this will be lost in measurement noise in "real" data, and our results will still be self-consistent and repeatables, so we accept the potential inaccuracy.
 * @param {Object} options
 * @param {String} options.q Query string - eg "campaign:myCampaign", "adid:jozxYqK OR adid:KWyjiBo"
 * @param {String[]} options.breakdowns Only first-order breakdowns - each will be augmented to eg "time" -> "time/adid" to enable calculations
 * @param {String} start Loose time parsing permitted (eg "24 hours ago") otherwise prefer ISO-8601 (full or partial)
 * @param {String} end Loose time parsing permitted (eg "24 hours ago") otherwise prefer ISO-8601 (full or partial)
 * @param {GreenAdTag[]} tags The Green Ad Tags which relate to the dataset to be retrieved. TODO Should these be retrieved by this code, AFTER the DataLog response?
 * @returns Data in ChartJS-friendly arrays: See exampleDataSets above for format.
 */
export const getCarbon = ({q = '', breakdowns = [], start = '1 month ago', end = 'now', tags, ...rest}) => {
	// Add ad-ID cross-breakdown to all breakdowns - it's needed to calculate data usage
	const augmentedBreakdowns = breakdowns.map(b => `${b}/adid`)

	const data = {
		dataspace: 'green',
		q: q ? `evt:pixel AND (${q})` : 'evt.pixel',
		breakdown: [...augmentedBreakdowns, 'adid', 'adid/country'],
		start, end, ...rest
	};

	return DataStore.fetch(['misc', 'DataLog', 'green', md5(JSON.stringify(data))], () => {
		// Chained promise: first get raw impression counts, then convert them to data and CO2 figures in chart-ready datasets
		return ServerIO.load(ServerIO.DATALOG_ENDPOINT, {data, swallow: true}).then(({cargo}) => {
			const tagsById = byId(tags);
			
			// What countries did we serve in, proportionally?
			// TODO Insert a shim for unset countries
			const countries = tagToCountryBreakdown(cargo.by_adid_country);
			// This will hold the transformed-for-ChartJS breakdowns
			const datasets = {};

			// Construct a fake breakdown that the code below will process into a "total" dataset
			cargo.by_total_adid = { buckets: [{ key: 'total', by_adid: { buckets: cargo.by_adid.buckets } }] }

			// For each requested breakdown...
			Object.keys(cargo).forEach(key => {
				 // Only process by_xxxx_adid breakdowns!
				const matches = key.match(/by_(\w+)_adid/)
				if (!matches) return;
				const breakdownName = matches[1];
				const { buckets } = cargo[key]; // These will be the buckets for the outer breakdown - eg by_time_adid for time/adid

				const labels = [];
				const imps = [];
				const bytes = {total: [], media: [], publisher: [], dsp: []};
				const kgCarbon = {total: [], media: [], publisher: [], dsp: []};

				// For each entry in the breakdown, calculate data usage
				// and carbon emissions and append to the data series
				buckets.forEach(({key, by_adid}) => {
					if (breakdownName === 'total') {
						// debugger;
					}
					labels.push(key);
					// total impressions for this bucket = sum counts of all bottom-level buckets
					imps.push(by_adid.buckets.reduce((acc, {count}) => acc + count, 0));
					// calculate the data transfer for impressions in this bucket
					const thisBytes = calcBytes(by_adid.buckets, tagsById);
					// append each sub-value of the calculated data transfer to its corresponding array
					// eg append calcBytes.total to bytes['total'], calcBytes.media to bytes['media'] etc
					const tagFractions = bucketsToFractions(by_adid.buckets); // fraction of this bucket's impressions corresponding to each tag ID
					Object.entries(thisBytes).forEach(([key, value]) => {
						bytes[key].push(value);
						// calculate carbon for each sub-value and append that too
						kgCarbon[key].push(bytesToCarbon(value, tagFractions, countries));
					});
				});
				datasets[breakdownName] = { labels, imps, bytes, kgCarbon };
			});
			
			return datasets;
		});
	});
};