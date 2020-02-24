import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';

// Fetch advert data from backend
const fetchCampaignData = async () => {
	let { 'gl.vert': adid, 'gl.vertiser': vertiserid, via, q='', status=C.KStatus.PUB_OR_ARC } = DataStore.getValue(['location', 'params']) || {};
	const data = await ServerIO.getDataItem({type: C.TYPES.Advert, id:adid, status: status});
	return data;
};

// Fetch data on donations for specific campaign/advert
const fetchCommunityTotal = (campaignData) => {
	let sqDon = new SearchQuery();
	sqDon = sqDon.or('vert:' + campaignData.id);
	if (campaignData.campaign) sqDon = sqDon.or('campaign:' + campaignData.campaign);
	return ServerIO.getDonationsData({q:sqDon.query});
};

// Fetch view stats for a specific vert, broken down by campaign and pubs
const fetchViewData = (campaignData) => {
	const params = {
		data: {
			name: 'view-data',
			q: `evt:minview AND vert:${campaignData.id}`,
			dataspace: 'gl',
			breakdowns: ['campaign', 'pub'],
			start: '2017-01-01'
		}
	};
	const url = 'https://lg.good-loop.com/data?name=view-data';
	return ServerIO.load(url,params);
};

/**
 * 
 * @param {String} charity 
 * @param {Object} communityTotal 
 */
const calculateCharityDonation = (charity, communityTotal) => {
	const setDonation = Math.floor(communityTotal.by_cid[charity].value);
	const unset = Math.floor(communityTotal.by_cid.unset.value);
	const charityIdsArray = Object.keys(communityTotal.by_cid).filter(key => key !== 'unset');
	const total = charityIdsArray.reduce((a, v) => a + Math.floor(communityTotal.by_cid[v].value), 0);
	// We return the sum of the value already set for the charity,
	// and the percentage of unset that corresponds to it.
	const charPercentage = (parseInt(setDonation) * 100) / parseInt(total);
	const result = parseInt(setDonation) + parseInt(charPercentage * parseInt(unset) / 100);
	return result;
};

/**
 * Most campaigns show a large percentage of donations as 'unset
 * This function distributes this value among the charities in the campaign
 * based on the amount currently assigned to each one as % of total.
 */
const charitiesWithNoUnsetDonations = campaignData => {
	if (!campaignData.communityTotal) return '';
	const communityTotal = campaignData.communityTotal;
	const charities = campaignData.charities.list;
	const updatedCharities = charities.map(charity => {
		return {...charity, donated: calculateCharityDonation(charity.id, communityTotal)};
	});
	return updatedCharities;
};

export { fetchCampaignData, fetchCommunityTotal, fetchViewData, charitiesWithNoUnsetDonations };