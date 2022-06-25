import md5 from 'md5';
import KStatus from '../../../base/data/KStatus';
import { getDataList } from '../../../base/plumbing/Crud';
import { assert } from '../../../base/utils/assert';
import C from '../../../C';
import PromiseValue from 'promise-value';
import List from '../../../base/data/List';
import Impact from '../../../base/data/Impact';
import { encURI } from '../../../base/utils/miscutils';
import Campaign from '../../../base/data/Campaign';
import SearchQuery from '../../../base/searchquery';
import { periodFromUrl } from './dashutils';

/** Turn a list of things with IDs into an object mapping IDs to things */
export const byId = things => things.reduce((acc, thing) => {
	acc[thing.id] = thing;
	return acc;
}, {})

/**
 * Turns a list of buckets into an object containing a proportional breakdown
 * @param {Object[]} buckets e.g. [ { key: 'one', count: 100 }, { key: 'two', count: 300} ]
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

// TODO convert the new table format into chart-js friendly stuff
/* (Unused, illustrative purposes only) */
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
 * 
 * @param {Object[][]} table 
 * @param {!string} colName
 * @returns {!number} 
 */
export const getSumColumn = (table, colName) => {
	let ci = table[0].indexOf(colName);
	assert(ci !== -1, "No such column", colName, table[0]);
	let total = 0;
	for(let i=1; i<table.length; i++) {
		const row = table[i];
		const n = row[ci];
		if ( ! n) continue;
		total += 1.0*n;		
	}
	return total;
};


/**
 * 
 * @param {Object[][]} table 
 * @param {!string} colName
 * @returns {Object} {breakdown-key: sum-for-key} 
 */
 export const getBreakdownBy = (table, colNameToSum, colNameToBreakdown) => {
	let ci = table[0].indexOf(colNameToSum);
	let bi = table[0].indexOf(colNameToBreakdown);
	assert(ci !== -1, "No such sum column", colNameToSum, table[0]);
	assert(bi !== -1, "No such breakdown column", colNameToBreakdown, table[0]);
	let totalByX = {};
	for(let i=1; i<table.length; i++) {
		const row = table[i];
		const n = row[ci];
		if ( ! n) continue;
		const b = row[bi]; // breakdown key
		let v = totalByX[b] || 0;
		v += n;		
		totalByX[b] = v;
	}
	return totalByX;
};

/**
 * Query for green ad tag impressions, then connect IDs to provided tags, calculate data usage & carbon emissions, and output tabular data
 * @param {Object} options
 * @param {String} options.q Query string - eg "campaign:myCampaign", "adid:jozxYqK OR adid:KWyjiBo"
 * @param {String} start Loose time parsing permitted (eg "24 hours ago") otherwise prefer ISO-8601 (full or partial)
 * @param {String} end Loose time parsing permitted (eg "24 hours ago") otherwise prefer ISO-8601 (full or partial)
 * @returns {!PromiseValue} {table: [["country","pub","mbl","os","adid","time","count","totalEmissions","baseEmissions","creativeEmissions","supplyPathEmissions"]] }
 */
export const getCarbon = ({q = '', start = '1 month ago', end = 'now', ...rest}) => {
	assert( ! q?.includes("brand:"), q);
	const data = {
		// dataspace: 'green',
		q,
		start, end, 
		...rest
	};

	return DataStore.fetch(['misc', 'DataLog', 'green', md5(JSON.stringify(data))], () => {
		// table of publisher, impressions, carbon rows
		return ServerIO.load(ServerIO.GREENCALC_ENDPOINT, {data, swallow: true});
	}); // /fetch()
};

/**
 * 
 * @param {Object[][]} table 
 * @returns {?PromiseValue} PV of a List of Campaigns
 */
export const getCampaigns = (table) => {
	if (!table) return null;

	const tagIdSet = {};
	table.forEach((row, i) => {
		if (i === 0) return;
		let adid = row[4];
		if (adid && adid !== 'unset') {
			tagIdSet[adid] = true;
		}
	});

	const ids = Object.keys(tagIdSet);
	if (!ids.length) return null;

	// ??does PUB_OR_DRAFT work properly for `ids`??

	let pvTags = getDataList({type: C.TYPES.GreenTag, status: KStatus.PUB_OR_DRAFT, ids});

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

/**
 * 
 * @returns {?Impact} null if loading data
 */
export const calculateDynamicOffset = ({campaign, offset, period}) => {
	Campaign.assIsa(campaign);
	if ( ! Impact.isDynamic(offset)) return offset; // paranoia
	let n;
	// HACK: carbon offset?
	if (Impact.isCarbonOffset(offset)) {
		let sq = SearchQuery.setProp(null, "campaign", campaign.id);
		if ( ! period) period = periodFromUrl();
		let pvCarbonData = getCarbon({
			q:sq.query, 
			start: period?.start.toISOString() || "2022-01-01", 
			end: period?.end.toISOString() || "now"
		});
		if ( ! pvCarbonData.value) {
			return null;
		}
		let table = pvCarbonData.value.table;
		let totalEmissions = getSumColumn(table, "totalEmissions");
		n = totalEmissions;
	} else {
		// check it is per impression
		if (offset.input) assert(offset.input.substring(0, "impression".length) === "impression", offset);
		// how many impressions?
		let impressions = Campaign.viewcount({campaign});
		console.log("impressions", impressions, campaign);
		if ( ! impressions) {
			return null;
		}
		n = impressions * offset.rate;
	}
	// copy and set n
	let snapshotOffset = new Impact(offset);	
	snapshotOffset.n = n;
	delete snapshotOffset.rate;
	delete snapshotOffset.input;	
	return snapshotOffset;
};

/** 
 * @param {Object} p
 * @param {!Campaign} p.campaign If `campaign` is a master, then this function WILL look up sub-campaigns and include them.
 * @param {?Object} p.period {start, end}
 * @returns {Object} {isLoading:boolean, carbon: [], carbonTotal: Number, trees: [], treesTotal:Number, coral: [], pvAllCampaigns }
 */
export const getOffsetsByType = ({campaign, status, period}) => {
	console.warn("getOffsetsByType", campaign, status, period);
	// Is this a master campaign?
	let pvAllCampaigns = Campaign.pvSubCampaigns({campaign, status});
	
	const allFixedOffsets = [];
	if (pvAllCampaigns.value) {
		// for each campaign:
		// - collect offsets
		// - Fixed or dynamic offsets? If dynamic, get impressions
		// - future TODO did it fund eco charities? include those here		
		List.hits(pvAllCampaigns.value).forEach(campaign => {
			let offsets = Campaign.offsets(campaign);
			let fixedOffsets = offsets.map(offset => Impact.isDynamic(offset)? calculateDynamicOffset({campaign, offset, period}) : offset);
			allFixedOffsets.push(...fixedOffsets);
		});				
		console.log("allFixedOffsets", allFixedOffsets);
	}
	const offsets4type = {};
	// HACK - return this too
	offsets4type.pvAllCampaigns = pvAllCampaigns;
	// kgs of CO2
	let co2 = campaign.co2; // manually set for this campaign?
	let carbonOffsets;
	if ( ! co2) {	// from offsets inc dynamic
		carbonOffsets = allFixedOffsets.filter(o => Impact.isCarbonOffset(o));
		co2 = carbonOffsets.reduce((x,offset) => x + offset.n, 0);
	} else {
		// HACK use our default, gold-standard
		carbonOffsets = [new Impact({charity:"gold-standard",rate:1,name:"carbon offset"})];
	}
	offsets4type.carbon = carbonOffsets;
	offsets4type.carbonTotal = co2;

	// Trees	
	offsets4type.trees = allFixedOffsets.filter(o => o?.name?.substring(0,4)==="tree");	
	offsets4type.treesTotal = offsets4type.trees.reduce((x,offset) => x + offset.n, 0);

	// coral
	offsets4type.coral = allFixedOffsets.filter(o => o?.name?.substring(0,4)==="coral");	
	offsets4type.coralTotal = offsets4type.coral.reduce((x,offset) => x + offset.n, 0);

	let isLoading = ! pvAllCampaigns.resolved || allFixedOffsets.includes(null);
	offsets4type.isLoading = isLoading;
	return offsets4type;
};
