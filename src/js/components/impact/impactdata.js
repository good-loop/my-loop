
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import PromiseValue from '../../base/promise-value';
import { getDataItem, getDataList, setWindowTitle } from '../../base/plumbing/Crud';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import SearchQuery from '../../base/searchquery';
import { space } from '../../base/utils/miscutils';
import ServerIO from '../../plumbing/ServerIO';
import md5 from 'md5';
import Campaign from '../../base/data/Campaign';

/* ------- Data Functions --------- */

export const fetchImpactItems = filters => {
	if (!filters.status) filters.status = KStatus.PUBLISHED;

	let pvBrand = filters.brand ? getDataItem({ type: C.TYPES.Advertiser, id: filters.brand, status, swallow: true }) : {};
	let pvBrand2 = filters.brand2 ? getDataItem({ type: C.TYPES.Advertiser, id: filters.brand2, status, swallow: true }) : {};
	let pvAgency = filters.agency ? getDataItem({ type: C.TYPES.Agency, id: filters.agency, status, swallow: true }) : {};
	let pvCampaign = filters.campaign ? getDataItem({ type: C.TYPES.Campaign, id: filters.campaign, status, swallow: true }) : {};
	let pvCharity = filters.cid ? getDataItem({ type: C.TYPES.NGO, id: filters.cid, status, swallow: true }) : {};
	let brandId = filters.brand2 || filters.brand;
	let brand1 = pvBrand.value;
	let brand2 = pvBrand2.value;    
	let agency = pvAgency.value;
	let charity = pvCharity.value;
	let campaign = pvCampaign.value;
	// prefer the child brand, brand, agency, charity
	let focusItem;
	if (filters.brand2) focusItem = brand2;
	else if (filters.brand) focusItem = brand1;
	else if (filters.agency) focusItem = agency;
	else if (filters.cid) focusItem = charity; 
	else if (filters.campaign) focusItem = campaign; 

	// HACK - poke q onto the filters
	let sq = SearchQuery.setProp(null, "vertiser", brandId);
	sq = SearchQuery.setProp(sq, "campaign", filters.campaign);
	sq = SearchQuery.setProp(sq, "agencyId", filters.agency);
	sq = SearchQuery.setProp(sq, "impact.charity", filters.cid);
	filters.q = sq.query;
	return {focusItem, brand1, brand2, agency, charity, campaign};
};

/**
 * TODO this relies on Portal making ImpactDebit objects. Which it doesn't yet.
 * See CampaignServlet
 * @param {Object} p
 * @param {ImpactFilters} p.filters
 * @returns {PromiseValue} List hits:ImpactDebit[]
 */
export const getImpactDebits = ({ filters }) => {
	let pvImpactDebits = getDataList({ type: C.TYPES.ImpactDebit, ...filters, swallow: true });
	// console.log("pvImpactDebits", pvImpactDebits);
	return pvImpactDebits;
};

/**
 * @param {Object} p
 * @param {ImpactFilters} p.filters
 * @returns {PromiseValue} List hits:Campaign[] Does not include master campaigns
 */
const getCampaigns = ({ filters }) => {
	let q = filters.q;
	q = space(q, "-master:true"); // no master campaigns (master=false or unset)
	let pvCampaigns = getDataList({ type: C.TYPES.Campaign, q, start:filters.start, end:filters.end, status:filters.status, swallow: true });
	// console.log("pvCampaigns", pvCampaigns);
	return pvCampaigns;
};

const getCharities = ({ filters }) => {
	// get the ImpactDebits
	let pvItems0 = getImpactDebits({ filters });
	// ...then get the charities
	let pvCharities = PromiseValue.then(pvItems0, item0s => {
		let cids = List.hits(item0s).map(i0 => i0.impact?.charity).filter(x => x);
		if (!cids.length) {
			return new List();
		}
		const pv2 = getDataList({ type: "NGO", status: filters.status, ids: cids, swallow: true });
		return pv2;
	});
	// console.group("pvCharities", pvCharities);
	return pvCharities;
}


export const getImpressionsByCampaignByCountry = ({ baseObjects, start = '', end = 'now', locationField='country', ...rest }) => {

	let {campaign, subCampaigns} = baseObjects
	if(!campaign && (!subCampaigns || subCampaigns.length == 0)) return []

	let searchData = campaign ? [campaign] : subCampaigns // if campaign is set, then the user has filtered to a single campaign (no subcampaigns)

	let campaignImpsByCountry = searchData.map(country => Campaign.viewcountByCountry({campaign: country, status: KStatus.PUBLISHED}))


	if(!campaignImpsByCountry || campaignImpsByCountry.length === 0) return []

	// for every campaign we can search through, find the viewcount for it's target country & unset countries
	let campaignViews = campaignImpsByCountry.reduce((regionMap, regions) => {
		// ASSUMPTION: 	afaik, a campaign will have a country it's aimed at that decision is not handled by us.
		// 				as a result, we don't access to that info. Instead, guess by what country has the most views,
		//				this is usually higher by several orders of magnitude so it's *usually* a safe bet.

		if(!regions || regions.length == 0) return regionMap // handle campaign still loading and campaigns with no results 

		let campaignRegions = Object.keys(regions)	// all regions this campaign was in
		let currentRegion = campaignRegions.find((val) => val !== "unset") // set country with most impressions
		let targetedRegions = Object.keys(regionMap) // all regions already seen (used if multiple campaigns are being read)

		if(currentRegion){
			if(targetedRegions.includes(currentRegion)){
				regionMap[currentRegion].impressions += regions[currentRegion];
				regionMap[currentRegion].campaignsInRegion += 1;
			} else {
				regionMap[currentRegion] = {impressions: regions[currentRegion], campaignsInRegion: 1}
			}
		}		

		// also track unset, needed to describe discrepency in campaigns used before we stored impression locations
		if (campaignRegions.includes("unset")){
			regionMap["unset"].impressions += regions["unset"];
			regionMap["unset"].campaignsInRegion += 1;
		}

		return regionMap
	},
		{unset: {impressions: 0, campaignsInRegion: 0}}
	)

	return campaignViews;
};

/* ------- End of Data Functions --------- */