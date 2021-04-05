/*
 * 
 */
import _ from 'lodash';
import PromiseValue from 'promise-value';
import React from 'react';
import { Col, Container, Row, Alert } from 'reactstrap';
import ErrAlert from '../../base/components/ErrAlert';
import { Cite } from '../../base/components/LinkOut';
import Misc from '../../base/components/Misc';
import StyleBlock from '../../base/components/StyleBlock';
import Advert from '../../base/data/Advert';
import Campaign from '../../base/data/Campaign';
import { getId } from '../../base/data/DataClass';
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import Money from '../../base/data/Money';
import { getDataItem } from '../../base/plumbing/Crud';
import { getDataLogData, pivotDataLogData } from '../../base/plumbing/DataLog';
import DataStore from '../../base/plumbing/DataStore';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import SearchQuery from '../../base/searchquery';
import { assert, assMatch } from '../../base/utils/assert';
import { asDate, isMobile, mapkv, sum, uniq, uniqById, yessy } from '../../base/utils/miscutils';
import C from '../../C';
import ActionMan from '../../plumbing/ActionMan';
import ServerIO from '../../plumbing/ServerIO';
import MyLoopNavBar from '../MyLoopNavBar';
import AdvertsCatalogue from './AdvertsCatalogue';
import CampaignSplashCard from './CampaignSplashCard';
import Charities, { CharityDetails, fetchSogiveData } from './Charities';
import DevLink from './DevLink';
import Roles from '../../base/Roles';


/**
 * HACK hard-coded list of campaigns which have PDF versions
 * TODO put this in portal or somewhere else
 * @param {Campaign} campaign 
 */
const pdfLookup = (campaign) => {
	let pdf = {
		//"collectivecampaign" : "/resources/Good-loop_H&M_campaign.pdf"
		coop_selfserve: "/resources/Good-loop_and_TheCooperativeBank.pdf",
		drynites: "/resources/Good-loop_and_KimberlyClark.pdf"
	}[campaign];

	return pdf;
};

const tomsCampaigns = /(josh|sara|ella)/; // For matching TOMS campaign names needing special treatment
/**
 * HACK fix campaign name changes to clean up historical campaigns
 * @param {Object} viewcount4campaign
 * @param {!Advert} ad
 * @returns {Number}
 */
const viewCount = (viewcount4campaign, ad) => {
	if (!ad.campaign) return null;

	// HACK TOMS?? ella / josh / sara
	// Don't crunch down TOMS ads that aren't in the sara/ella/josh campaign group
	if (ad.vertiser === 'bPe6TXq8' && ad.campaign.match(tomsCampaigns)) {
		let keyword = 'josh';
		if (ad.campaign.includes('sara')) keyword = 'sara';
		if (ad.campaign.includes('ella')) keyword = 'ella';
		// Total views across all ads for this influencer
		return Object.keys(viewcount4campaign).reduce((acc, cname) => {
			return cname.includes(keyword) ? acc + viewcount4campaign[cname] : acc;
		}, 0);
	}


	let vc = viewcount4campaign[ad.campaign];
	if (vc) return vc;
	return null;
};


/**
 * @returns fetches for all the data: `{pvTopCampaign, pvCampaigns, pvAgencies, pvAds, pvAdvertisers}`
 */
const fetchIHubData = () => {
	// What adverts should we look at?
	let {
		'gl.vert': adid, // deprecated - prefer campaign
		'gl.vertiser': vertiserid,
		'gl.status': glStatus,
		status,
		agency,
		// q = '', TODO
	} = DataStore.getValue(['location', 'params']) || {};
	let campaignId1 = DataStore.getValue(['location','path'])[1];
	// Merge gl.status into status & take default value
	if ( ! status) status = (glStatus || C.KStatus.PUB_OR_ARC);
	// Data, assemble
	// let campaignIds, agencyIds, adIds, advertiserIds;
	let pvTopItem, pvTopCampaign, pvCampaigns, pvAgencies, pvAds, pvAdvertisers;
	// ...by Campaign?
	if (campaignId1) {		
		pvTopItem = pvTopCampaign = getDataItem({type:C.TYPES.Campaign,status,id:campaignId1});
		// wrap as a list
		pvCampaigns = fetchIHubData2_wrapAsList(pvTopCampaign);
		// ads
		let q = SearchQuery.setProp(new SearchQuery(), "campaign", campaignId1).query;
		pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});		
        // advertiser
		if (pvTopCampaign.value && pvTopCampaign.value.vertiser) {
			const pvAdvertiser = getDataItem({type:C.TYPES.Advertiser,status,id:pvTopCampaign.value.vertiser});			
			// wrap as a list
			pvAdvertisers = fetchIHubData2_wrapAsList(pvAdvertiser);
		}
    }

	// ...by Advert?
	if (adid) {
		console.log("Getting " + adid + " ad...");
		pvTopItem = getDataItem({type:C.TYPES.Advert,status,id:adid});
		// wrap as a list
		pvAds = fetchIHubData2_wrapAsList(pvTopItem);
		console.log("pvAds", pvAds, "pvTopItem", pvTopItem); // debug
	}
	// ...by Advertiser?
	if (vertiserid) {
		const pvAdvertiser = getDataItem({type:C.TYPES.Advertiser,status,id:vertiserid});
		// ads
		let q = SearchQuery.setProp(new SearchQuery(), "vertiser", vertiserid).query;
        pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});        
        if ( ! pvTopItem) pvTopItem = pvAdvertiser;
	}
	// ...by Agency?
	if (agency) {		
		pvTopItem = getDataItem({type:C.TYPES.Agency,status,id:agency});
		// wrap as a list
		pvAgencies = fetchIHubData2_wrapAsList(pvTopItem);
		// advertisers
        let q = SearchQuery.setProp(new SearchQuery(), "agencyId", agency).query;
        pvAdvertisers = ActionMan.list({type: C.TYPES.Advertiser, status, q});

        ////////////////////////////////////////////////////////////////////////////
        //          !!!!!!!!!!  HACK  !!!!!!!!!!
        ////////////////////////////////////////////////////////////////////////////
        // For Omnicare Agency 2/4/2021
        if (agency === "ACriJf2n") {
            const adIDs = [
                "hZOHTstn",
                "9oj4eG9J",
                "ZWDiHRZSHP",
                "Eu01hiCRvJ",
                "YkCuD4s3KE",
                "ubJudO7S4i"
            ];
            const adq = SearchQuery.setPropOr(new SearchQuery(), "id", adIDs).query;
            pvAds = ActionMan.list({type: C.TYPES.Advert, status, q:adq});
        }

		// query adverts by advertisers		
        else if (pvAdvertisers.value) {
			assert( ! pvAds, pvAds);
			const ids = uniq(pvAdvertisers.value.hits.map(getId));
			console.log("ADVERTISER IDs", ids);
			if (yessy(ids)) {
                let adq = SearchQuery.setPropOr(new SearchQuery(), "vertiser", ids).query;
        		pvAds = ActionMan.list({type: C.TYPES.Advert, status, q:adq});        
			} else {
				console.warn("No Advertisers found for agency",agency,pvTopItem);
			}
		}
	} // ./agency
	
	if ( ! agency && ! vertiserid && ! adid && ! campaignId1)  {
		throw new Error("No Campaign info specified");
	}
	// top campaign?
	if ( ! pvTopCampaign && pvTopItem && pvTopItem.value && pvTopItem.value.campaign) {
		pvTopCampaign = getDataItem({type:C.TYPES.Campaign, status, id:pvTopItem.value.campaign});
	}	
	// ...fill in from adverts
	if (pvAds && pvAds.value && pvAds.value.hits && pvAds.value.hits.length && pvAds.value.hits[0]) {
		console.log("PVADS VALUE", pvAds.value);
		if ( ! pvAdvertisers) {
			// NB: This should be only one advertiser and agency
			let ids = uniq(pvAds.value.hits.map(Advert.advertiserId));
			console.log("ADVERTISER IDs", ids);
			if (yessy(ids)) {
				let advq = SearchQuery.setPropOr(null, "id", ids).query;
				pvAdvertisers = ActionMan.list({type: C.TYPES.Advertiser, status:KStatus.PUB_OR_DRAFT, q:advq});
			}
		}
		console.log("PVADVERTISER", pvAdvertisers);
		if ( ! pvAgencies) {
			let ids = uniq(pvAds.value.hits.map(ad => ad.agencyId));
			if (yessy(ids)) {
				let agq = SearchQuery.setPropOr(null, "id", ids).query;
				pvAgencies = ActionMan.list({type: C.TYPES.Agency, status:KStatus.PUB_OR_DRAFT, q:agq});
			}
		}
		if ( ! pvCampaigns) {
			let ids = uniq(pvAds.value.hits.map(ad => ad.campaign));
			if (yessy(ids)) {
				let q = SearchQuery.setPropOr(null, "id", ids).query;
				pvCampaigns = ActionMan.list({type: C.TYPES.Campaign, status:KStatus.PUB_OR_DRAFT, q});
			}
		}
	}
	// fill in any waiting ones with blanks for convenience
	return {
		pvTopItem:pvTopItem||{},
		pvTopCampaign:pvTopCampaign||{},
		pvCampaigns:pvCampaigns||{}, 
		pvAgencies:pvAgencies||{}, 
		pvAds:pvAds||{}, 
		pvAdvertisers:pvAdvertisers||{}
	}
};

/**
 * 
 * @param {PromiseValue} pvTopItem 
 * @returns {PromiseValue} pvList
 */
const fetchIHubData2_wrapAsList = pvTopItem => {
	if (pvTopItem.resolved) {
		return new PromiseValue(new List([pvTopItem.value])); // NB: this will lose the top-level error, but oh well
	}
	// NB: If pvTopItem were resolved, this would still work -- but not instantly, which would cause issues, as these wrappers keep getting remade
	return new PromiseValue(pvTopItem.promise.then(
		v => new List([v]),
	));
};



/**
 * @param {Object} p
 * @param {?Money} p.donationTotal
 * @param {NGO[]} p.charities From adverts (not SoGive)
 * @param {Object} p.donation4charity scaled (so it can be compared against donationTotal)
 * @returns {NGO[]}
 */
const filterLowDonations = ({charities, campaign, donationTotal, donation4charity}) => {

	// Low donation filtering data is represented as only 2 controls for portal simplicity
	// lowDntn = the threshold at which to consider a charity a low donation
	// hideCharities = a list of charity IDs to explicitly hide - represented by keySet as an object (explained more below line 103)

    console.log("[FILTER]", "Filtering with dntn4charity", donation4charity);

	// Filter nulls
	charities = charities.filter(x => x);

	if (campaign.hideCharities) {
		let hc = Campaign.hideCharities(campaign);
        const charities2 = charities.filter(c => ! hc.includes(normaliseSogiveId(getId(c))));
        console.log("[FILTER]","HIDDEN CHARITIES: ",hc);
		charities = charities2;
	}
	
	let lowDntn = campaign.lowDntn;	
	if ( ! lowDntn || ! Money.value(lowDntn)) {
		if ( ! donationTotal) {
			return charities;
		}
		// default to 0	
		lowDntn = new Money(donationTotal.currencySymbol + "0");
	}
	console.warn("[FILTER]","Low donation threshold for charities set to " + lowDntn);
    
	/**
	 * @param {!NGO} c 
	 * @returns {?Money}
	 */
	const getDonation = c => {
		let d = donation4charity[c.id] || donation4charity[c.originalId]; // TODO sum if the ids are different
		return d;
	};

	charities = charities.filter(charity => {
        const dntn = getDonation(charity);
        let include = dntn && Money.lessThan(lowDntn, dntn);
        if (!include) console.log("[FILTER]","BELOW LOW DONATION: ",charity, dntn);
		return include;
    });
	return charities;
} // ./filterLowDonations

/**
 * Scale a list of charities to match the money total.
 * This will scale so that sum(donations to `charities`) = donationTotal
 * Warning: If a charity isn't on the list, it is assumed that donations to it are noise, to be reallocated.
 * 
 * @param {Campaign} campaign 
 * @param {Money} donationTotal 
 * @param {Object} donation4charityUnscaled
 */
const scaleCharityDonations = (campaign, donationTotal, donation4charityUnscaled, charities) => {
	// Campaign.assIsa(campaign); can be {}
	//assMatch(charities, "NGO[]");	- can contain dummy objects from strays
	if (campaign.dntn4charity) {
		assert(campaign.dntn4charity === donation4charityUnscaled);
		return campaign.dntn4charity; // explicitly set, so don't change it
	}
	if ( ! Money.value(donationTotal)) {
		console.log("Scale donations - dont scale to 0");
		return Object.assign({}, donation4charityUnscaled); // paranoid copy
	}
	Money.assIsa(donationTotal);
    // NB: only count donations for the charities listed
    let monies = charities.map(c => getId(c) !== "unset" ? donation4charityUnscaled[getId(c)] : null);
    monies = monies.filter(x=>x);
	let totalDntnByCharity = Money.total(monies);
	if ( ! Money.value(totalDntnByCharity)) {
		console.log("Scale donations - cant scale up 0");
		return Object.assign({}, donation4charityUnscaled); // paranoid copy
	}
	// scale up (or down)	
	let ratio = Money.divide(donationTotal, totalDntnByCharity);
	const donation4charityScaled = {};
	mapkv(donation4charityUnscaled, (k,v) => 
		k==="total" || k==="unset"? null : donation4charityScaled[k] = Money.mul(donation4charityUnscaled[k], ratio));
	console.log("Scale donations from", donation4charityUnscaled, "to", donation4charityScaled);
    return donation4charityScaled;
};

/**
 * Expects url parameters: `gl.vert` or `gl.vertiser` or `via`
 * TODO support q=... flexible query
 * TODO support agency and ourselves! with multiple adverts
 * Split: branding - a vertiser ID, vs ad-params
 */
const CampaignPage = () => {
	let {
		via,
        landing,
        showNonServed
	} = DataStore.getValue(['location', 'params']) || {};
	// What adverts etc should we look at?
	let {pvTopItem, pvTopCampaign, pvCampaigns, pvAds, pvAdvertisers, pvAgencies} = fetchIHubData();

	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	const isLanding = (landing !== undefined) && (landing !== 'false');
    
    console.log("AAAAAAADS", pvAds);

	if ( ! pvAds.resolved) {
		// TODO display some stuff whilst ads are loading
		return <Misc.Loading text="Loading advert info..." />;
	}
	if (pvAds.error || !pvAds.value.hits || (pvAds.value.hits.length == 1 && !pvAds.value.hits[0])) {
		return <ErrAlert>Error loading advert data</ErrAlert>;
	}
	if (pvAds.value.hits.length == 0) {
		console.warn("NO ADS FOUND, aborting page generation");
		return <Page404/>;
	}
	let ads = List.hits(pvAds.value);

	// Combine Campaign settings
	let campaign = pvTopCampaign.value;
	if ( ! campaign && pvCampaigns.value) {
		let cs = List.hits(pvCampaigns.value);
		campaign = Object.assign({}, ...cs);	
		console.log("Not top campaign, using:", campaign);
	} else {
		console.log("Using top campaign ", campaign);
	}
    if ( ! campaign) campaign = {};
    
    // Merge all hide advert and charity lists together from all campaigns
    console.log("pvCAMPAIGNS", pvCampaigns);
    let allCampaigns = List.hits(pvCampaigns.value);
    console.log("ALL CAMPAIGNS", allCampaigns);
    if (allCampaigns) {
        if (!campaign.hideAdverts) campaign.hideAdverts = {};
        if (!campaign.hideCharities) campaign.hideCharities = {};
        allCampaigns && allCampaigns.forEach(c => {
            if (c.hideAdverts) {
                Object.keys(c.hideAdverts).forEach(hideAd => {
                    if (c.hideAdverts[hideAd]) {
                        //console.log("Ad " + hideAd + " hidden by campaign " + c.id);
                        campaign.hideAdverts[hideAd] = true;
                    }
                });
            }
            if (c.hideCharities) {
                Object.keys(c.hideCharities).forEach(hideCharity => {
                    let sogiveId = normaliseSogiveId(hideCharity);
                    if (c.hideCharities[hideCharity]) campaign.hideCharities[sogiveId] = true;
                });
            }
        });
    }
    console.log("FINAL HIDE ADS LIST", campaign.hideAdverts);
    console.log("FINAL HIDE CHARITIES LIST", campaign.hideCharities);
	// TODO fill in blanks like donation total and peeps

	// Combine branding
	// Priority: TopCampaign, TopItem, Adverts
	let branding = {};	
	ads.forEach(ad => Object.assign(branding, ad.branding));	
	if (pvTopItem && pvTopItem.value && pvTopItem.value.branding) {
		Object.assign(branding, pvTopItem.value.branding);
	}
	Object.assign(branding, campaign.branding);

    console.log("ADS BEFORE CHARITY SORTING", ads);

    // initial donation record
    let donation4charityUnscaled = yessy(campaign.dntn4charity)? campaign.dntn4charity : {};
    // Merge all other campaign donations - top campaign taking priority on conflicts
    allCampaigns && allCampaigns.forEach(c => {
        if (c.dntn4charity) Object.keys(c.dntn4charity).forEach(dntn => {
            if (!donation4charityUnscaled[dntn]) donation4charityUnscaled[dntn] = c.dntn4charity[dntn];
        });
    });
    // Get live numbers
    const fetchedDonationData = fetchDonationData({ ads });
    console.log("[DONATION4CHARITY]", "INITIAL", donation4charityUnscaled);
    // Assign fetched data to fill holes and normalise IDs
    const allCharities = Object.keys(donation4charityUnscaled);
    Object.keys(fetchedDonationData).forEach(cid => !allCharities.includes(cid) && allCharities.push(cid));
    allCharities.forEach(cid => {
        const sogiveCid = normaliseSogiveId(cid);
        console.log("[DONATION4CHARITY]", cid + " >>> " + sogiveCid);
        // First fill in normalized ID
        if (!donation4charityUnscaled[sogiveCid]) {
            console.warn("[DONATION4CHARITY]","Replacing " + cid + " with " + sogiveCid);
            donation4charityUnscaled[sogiveCid] = donation4charityUnscaled[cid];
            delete donation4charityUnscaled[cid];
        }
        // If still empty, fill in fetched data
        if (!donation4charityUnscaled[sogiveCid]) {
            donation4charityUnscaled[sogiveCid] = fetchedDonationData[cid];
        }
    });

    const ad4Charity = {};
	// individual charity data, attaching ad ID
	let charities = uniqById(_.flatten(ads.map(ad => {
        const clist = (ad.charities && ad.charities.list).slice() || [];
		return clist.map(c => {
			if ( ! c) return null; // bad data paranoia						
			if ( ! c.id || c.id==="unset" || c.id==="undefined" || c.id==="null" || c.id==="total") { // bad data paranoia						
				console.error("CampaignPage.jsc charities - Bad charity ID", c.id, c);
				return null;
			}
			const id2 = normaliseSogiveId(c.id);
			if (id2 !== c.id) {
				console.warn("Changing charity ID to normaliseSogiveId "+c.id+" to "+id2+" for ad "+ad.id);
				c.id = id2;
			}
			ad4Charity[c.id] = ad; // for Advert Editor dev button so sales can easily find which ad contains which charity
			return c;
		});
    })));
	// Add in any from campaign.dntn4charity - which can include strayCharities
	if (campaign.dntn4charity) {
		let cids = Object.keys(campaign.dntn4charity);
		let clistIds = charities.map(getId);
		cids.forEach(cid => {
			cid = normaliseSogiveId(cid);
			if ( ! clistIds.includes(cid) && cid !== "total") {
				const c = new NGO({id:cid});
				console.log("Adding stray charity "+cid,c);
				charities.push(c);
			}
		});
	}
    // NB: Don't append extra charities found in donation data. This can include noise.
    // Fill in blank in charities with sogive data
    charities = fetchSogiveData(charities);
    console.log("CHARITIESSSSSS", charities);
    console.log("AD 4 CHARITY:",ad4Charity)
    // Attach ads after initial sorting and merging, which can cause ad ID data to be lost
    charities.forEach(charity => {
        charity.ad = ad4Charity[charity.id] ? ad4Charity[charity.id].id : null;
    });
	// Donation total
	assert(donation4charityUnscaled, "CampaignPage.jsx falsy donation4charity?!");
	console.log("DONATION 4 CHARITY", donation4charityUnscaled);
	// NB: allow 0 for "use the live figure" as Portal doesn't save edit-to-blank (Feb 2021)
	const donationTotal = Money.value(campaign.dntn)? campaign.dntn : donation4charityUnscaled.total;

    // Scale once to get values in the right ballpark
    let donation4charityScaled = scaleCharityDonations(campaign, donationTotal, donation4charityUnscaled, charities);
    
    console.log("DONATION SCALED", donation4charityScaled);

    // filter charities by low £s and campaign.hideCharities
    charities = filterLowDonations({charities, campaign, donationTotal, donation4charity:donation4charityScaled});
    
    // Scale again to make up for discrepencies introduced by filtering
	donation4charityScaled = scaleCharityDonations(campaign, donationTotal, donation4charityUnscaled, charities);

    console.log("After Filter CHARITIES", charities);

	// PDF version of page
	let pdf = null;

	// Group ads by campaign {String: merged-Advert}
	let campaignByName = {};
	ads.forEach(ad => {
		let name = ad.campaign || ad.id;
		campaignByName[name] = {
			...campaignByName[name],
			...ad
		};
		// Fetch PDF by campaign (last ad wins)
		pdf = pdfLookup(ad.campaign);
	});

	console.log("CAMPAIGN BY NAME: ", campaignByName);
	// Get ad viewing data
	let sq = new SearchQuery("evt:minview");
	let qads = ads.map(({ id }) => `vert:${id}`).join(' OR ');
	sq = SearchQuery.and(sq, qads);

	let pvViewData = getDataLogData({q:sq.query, breakdowns:['campaign'], start:'2017-01-01', end:'now', name:"view-data",dataspace:'gl'});
	let viewcount4campaign = {};
	if (pvViewData.value) {
		viewcount4campaign = pivotDataLogData(pvViewData.value, ["campaign"]);
	}

	// Is this an interim total or the full amount? Interim if not fixed by campaign, and not ended
	let ongoing = false;
	if ( ! campaign.dntn) {
		// when is the last advert due to stop?
		let endDate = new Date(2000,1,1);
		ads.forEach(ad => {
			let tli = ad.topLineItem;
			if ( ! tli)	return;
			let end = asDate(tli.end) || new Date(3000,1,1); // unset will be treated as ongoing. TODO a check on last activity (but offline, periodically)
			if (end.getTime() > endDate.getTime()) {
				endDate = end;
			}
		});
		if (endDate.getTime() > new Date().getTime()) {
			ongoing = true;
		}
    }

	// Sort by donation value, largest first
	try {
		charities.sort((a,b) => - Money.compare(donation4charityScaled[a.id], donation4charityScaled[b.id]));
	} catch(err) {
		// currency conversion?? Keep on going unsorted
		console.error(err);
	}

	{	// NB: some very old ads may not have charities
		let noCharityAds = ads.filter(ad => !ad.charities);
		// minor todo - clean these up in the portal
		if (noCharityAds.length) console.warn("Ads without charities data", noCharityAds.map(ad => [ad.id, ad.campaign, ad.name, ad.status]));
	}

	// Sum of the views from every ad in the campaign. We use this number for display
	// and to pass it to the AdvertCards to calculate the money raised against the total.
	let totalViewCount = campaign.numPeople; // hard set by the Campaign object?
	if ( ! totalViewCount) {
		// if (campaignId) { // TODO refactor everything to be based around a list of campaigns
		// 	let sq = SearchQuery.setProp(new SearchQuery(), "campaign", campaignId);
		// 	let pvPeepsData = getDataLogData({q:sq.query, breakdowns:[], start:'2017-01-01', end:'now', name:"view-data",dataspace:'gl'});
		// 	if (pvPeepsData.value) {
		// 		campaign.numPeople = pvPeepsData.value.all;
		// 		totalViewCount = campaign.numPeople;
		// 	}
		// } else {
		const ad4c = {};
		ads.forEach(ad => ad4c[campaignNameForAd(ad)] = ad);
		let ads1perCampaign = Object.values(ad4c);
		let views = ads1perCampaign.map(ad => viewCount(viewcount4campaign, ad));
		totalViewCount = sum(views);
		// }
	} else {
        Object.keys(viewcount4campaign).forEach(ad => {
            viewcount4campaign[ad] = totalViewCount;
        })
    }

	// Get name of advertiser from nvertiser if existing, or ad if not
	let nvertiser = pvAdvertisers.value && List.hits(pvAdvertisers.value)[0];
    let agency = pvAgencies.value && List.hits(pvAgencies.value)[0];
	let nvertiserName = agency ? agency.name : (nvertiser ? nvertiser.name : ads[0].vertiserName);
	console.log("NVERTISER", nvertiser, "nvertiserName", nvertiserName);
	const nvertiserNameNoTrail = nvertiserName ? nvertiserName.replace(/'s$/g, "") : null;

	let shareButtonMeta = {
		title: nvertiserNameNoTrail ? nvertiserNameNoTrail + "'s Good-Loop Impact - My-Loop" : "Good-Loop Impact - My-Loop",
		image: campaign.bg || "https://my.good-loop.com/img/redcurve.svg",
		description: nvertiserNameNoTrail ? "See " + nvertiserNameNoTrail + "'s impact from Good-Loop ethical advertising" : "See our impact from Good-Loop ethical advertising"
	};
	return (<>
		<StyleBlock>{campaign && campaign.customCss}</StyleBlock>
		<StyleBlock>{branding.customCss}</StyleBlock>
		<div className="widepage CampaignPage gl-btns">
			<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" hidePages/>
			<div className="text-center">
				<CampaignSplashCard branding={branding} shareMeta={shareButtonMeta} pdf={pdf} campaignPage={campaign} 
					donationValue={donationTotal} ongoing={ongoing}
					totalViewCount={totalViewCount} landing={isLanding} />

				<HowDoesItWork nvertiserName={nvertiserName} charities={charities}/>

				{isLanding ? null : (
					<AdvertsCatalogue
						campaign={campaign}
						ads={ads}
						viewcount4campaign={viewcount4campaign}
						donationTotal={donationTotal}
						nvertiserName={nvertiserName}
                        totalViewCount={totalViewCount}
                        showNonServed={showNonServed}
					/>
				)}

				<Charities charities={charities} donation4charity={donation4charityScaled} campaign={campaign}/>

				<div className="bg-white">
					<Container>
						<h2 className="my-5">Where can you see our ads?</h2>
						<p className="w-60 mx-auto">Good-Loop distributes ethical online ads to millions of people every month in premium websites across the world’s best publishers and social platforms.</p>
					</Container>
					{isMobile() ?
						<img src="/img/Graphic_metro_mobile.800w.png" className="w-100" alt="publishers" />
						:
						<img src="/img/Graphic_metro.1920w.png" className="w-100" alt="publishers" />}
				</div>

				<div className="bg-gl-light-red">
					<Container className="py-5 text-white">
						<div className="pt-5" />
						<h3 className="text-white w-75 mx-auto">Download Tabs for Good - Chrome search plugin to raise money</h3>
						<p className="py-3" style={{fontSize:"1.3rem"}}>Every time you open a new tab you raise money for real causes.</p>
						<div className="py-4 flex-row justify-content-center align-items-center">
							<a href="https://chrome.google.com/webstore/detail/good-loop-tabs-for-good/baifmdlpgkohekdoilaphabcbpnacgcm?hl=en&authuser=1" className="btn btn-secondary">Download</a>
						</div>
						<div className="pb-5" />
					</Container>
				</div>

				<SmallPrintInfo ads={ads} charities={charities} campaign={campaign} />

			</div>
		</div>
	</>);
}; // ./CampaignPage


/**
 * Charity details + campaign details
 * @param {Object} p
 * @param {Campaign} p.campaign
 */
const SmallPrintInfo = ({ads, charities, campaign}) => {
	// set min/max donation-per-ad and start/end dates from ad
	let dmin,dmax,start,end;
	for(let i=0; i<ads.length; i++) {
		let adi = ads[i];
		let tli = adi.topLineItem;
		if ( ! tli)	continue;
		let dPerAd = tli && tli.maxBid;
		if (dPerAd) {
            try {
                if ( ! dmin || Money.compare(dPerAd, dmin) < 0) dmin = dPerAd;
                if ( ! dmax || Money.compare(dPerAd, dmin) > 0) dmax = dPerAd;
            } catch(e) {
                // Continue without comparison
                console.error(e);
            }
		}
		let starti = tli && asDate(tli.start);
		let endi = tli && asDate(tli.end);
		if (starti && ( ! start || starti.getTime() < start.getTime())) start = starti;
		if (endi && ( ! end || endi.getTime() > end.getTime())) end = endi;
	}
	console.log("campaignPage",campaign);
	
	let totalBudget	= campaign.maxDntn;
	if ( ! totalBudget) {
        let amounts = ads.map(ad => Advert.budget(ad) && Advert.budget(ad).total);
		totalBudget = Money.total(amounts);
	}

	// Did we use an impact model?
	const impactModels = charities.map(c => c.simpleImpact).filter(m => m);

	return <div className="container py-5">
		<Row>
			<Col md={6} style={{borderRight:"2px solid grey"}}><CharityDetails charities={charities} /></Col>
			<Col md={6} className="text-center pl-md-5">
				 <small>
					{dmin && <>Donation Amount: <Misc.Money amount={dmin} /> { dmax && ! Money.eq(dmin,dmax) && <> to <Misc.Money amount={dmax} /></>} per video viewed <br/></>}
					50% of the advertising cost for each advert is donated. Most of the rest goes to pay the publisher and related companies. 
					Good-Loop and the advertising exchange make a small commission. The donations depend on viewers watching the adverts.<br/>
					{ !! Money.value(totalBudget) && <>Limitations on Donation: <Misc.Money amount={totalBudget} /> <br/></>}
					{start && end && <>Dates: <Misc.DateTag date={start} /> through <Misc.DateTag date={end} /> <br/></>}
					{ ! start && end && <>End date: <Misc.DateTag date={end} /> <br/></>}
					{ !! impactModels.length && <p>
						If impacts {impactModels[0].name && `such as "${impactModels[0].name}"`} are listed above, these are representative. 
						We don't ring-fence funding, as the charity can better assess the best use of funds. 
						Cost/impact figures are as reported by the charity or by the impact assessor SoGive.
					</p>}
					<p>
						Donations are provided without conditions. The charities are not recommending or endorsing the products in return.
						They're just doing good &mdash; which we are glad to support.
					</p>
					<p>Amounts for campaigns that are in progress or recently finished are estimates and may be subject to audit.</p>
				</small>
			</Col>
		</Row>
		<br/>
		<p><small>This information follows the guidelines of the New York Attorney General for best practice in cause marketing,
			<Cite href='https://www.charitiesnys.com/cause_marketing.html'/> and the Better Business Bureau's standard for donations in marketing.			
		</small></p>
		{campaign && campaign.id && <DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/'+escape(campaign.id)} target="_portal">Campaign Editor</DevLink>}
        {campaign.smallPrint &&
        <div className="text-center">
            <small>
                {campaign.smallPrint}
            </small>
        </div>}
	</div>;
}

/**
 * HACK correct donation values that are wrong till new portal controls are released
 * TODO remove this!!
 */
const hackCorrectedDonations = id => {
	const donation = {
		"yhPf2ttbXW": {
			total: new Money("$125000"),
			"no-kid-hungry": new Money("$125000")
		},
		"5ao5MthZ": {
			total: new Money("£25000"),
			"canine-partners-for-independence": new Money("£5850"),
			"cats-protection": new Money("£5875"),
			"royal-society-for-the-prevention-of-cruelty-to-animals": new Money("£13275")
		}
	}[id];
	return donation;
};

/**
 * This may fetch data from the server. It returns instantly, but that can be with some blanks.
 * 
 * ??Hm: This is an ugly long method with a server-side search-aggregation! Should we do these as batch calculations on the server??
 * 
 * @param {!Advert[]} ads
 * @returns {cid:Money} donationForCharity, with a .total property for the total
 */
const fetchDonationData = ({ ads }) => {
	const donationForCharity = {};
	if (!ads.length) return donationForCharity; // paranoia
	// things
	let adIds = ads.map(ad => ad.id);
    let campaignIds = ads.map(ad => ad.campaign);
    // Filter bad IDs
    campaignIds = campaignIds.filter(x=>x);
	let charityIds = _.flatten(ads.map(Advert.charityList));

	// HACK return hacked values if Cheerios or Purina
	for (let i = 0; i < ads.length; i++) {
		const ad = ads[i];
		const donation = hackCorrectedDonations(ad.id);
		if (donation) return donation;
	} // ./hack
	
	// Campaign level per-charity info?	
	let campaignsWithoutDonationData = [];
	for (let i = 0; i < ads.length; i++) {
		const ad = ads[i];
		const cp = ad.campaignPage;
		// FIXME this is old!! Need to work with new campaigns objects
		// no per-charity data? (which is normal)
		if (!cp || !cp.dntn4charity || Object.values(cp.dntn4charity).filter(x => x).length === 0) {
			if (ad.campaign) {
				campaignsWithoutDonationData.push(ad.campaign);
				console.log("No per-charity data with ad " + ad.id);
			} else {
				console.warn("Advert with no campaign: " + ad.id);
			}
			continue;
		}

		Object.keys(cp.dntn4charity).forEach(cid => {
			let dntn = cp.dntn4charity[cid];
			if (!dntn) return;
			if (donationForCharity[cid]) {
				dntn = Money.add(donationForCharity[cid], dntn);
			}
			assert(cid !== 'total', cp); // paranoia
			donationForCharity[cid] = dntn;
		});
	};
	// Done?
	if (donationForCharity.total && campaignsWithoutDonationData.length === 0) {
		console.log("Using ad data for donations");
		return donationForCharity;
	}

	// Fetch donations data	
	// ...by campaign or advert? campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
	// (old data) Loop.Me have not logged vert, only campaign. But elsewhere vert is logged and not campaign.
    let sq1 = adIds.map(id => "vert:" + id).join(" OR ");
	// NB: quoting for campaigns if they have a space (crude not 100% bulletproof ??use SearchQuery.js instead) 
	let sq2 = campaignIds.map(id => "campaign:" + (id.includes(" ") ? '"' + id + '"' : id)).join(" OR ");
	let sqDon = SearchQuery.or(sq1, sq2);

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget', 'CampaignPage', 'communityTotal', sqDon.query], () => {
		return ServerIO.getDonationsData({ q: sqDon.query });
	}, {}, true, 5 * 60 * 1000);
	if (pvDonationsBreakdown.error) {
		console.error("pvDonationsBreakdown.error", pvDonationsBreakdown.error);
		return donationForCharity;
	}
	if (!pvDonationsBreakdown.value) {
		return donationForCharity; // loading
	}

	let lgCampaignTotal = pvDonationsBreakdown.value.total;
	// NB don't override a campaign page setting
	if (!donationForCharity.total) {
		donationForCharity.total = new Money(lgCampaignTotal);
	}

	// set the per-charity numbers
	let donByCid = pvDonationsBreakdown.value.by_cid;
	Object.keys(donByCid).forEach(cid => {
		let dntn = donByCid[cid];
		if (!dntn) return;
		if (donationForCharity[cid]) {
			dntn = Money.add(donationForCharity[cid], dntn);
		}
		assert(cid !== 'total', cid); // paranoia
		donationForCharity[cid] = dntn;
	});
	// done	
	return donationForCharity;
}; // ./fetchDonationData()


/**
 * @param {!Advert} ad 
 * @returns {!string} Can be "unknown" to fill in for no-campaign odd data items
 */
const campaignNameForAd = ad => {
	if (!ad.campaign) return "unknown";
	// HACK FOR TOMS 2019 The normal code returns 5 campaigns where there are 3 synthetic campaign groups
	// Dedupe on "only the first josh/sara/ella campaign" instead
	if (ad.vertiser === 'bPe6TXq8' && ad.campaign && ad.campaign.match(tomsCampaigns)) {
		let cname = ad.campaign.match(tomsCampaigns)[0];
		return cname;
	}
	return ad.campaign;
};

const HowDoesItWork = ({ nvertiserName, charities }) => {
	// possessive form - names with terminal S just take an apostrophe, all others get "'s"
	// EG Sharp's (brewery) ==> "Sharp's' video... " vs Sharp (electronics manufacturer) ==> "Sharp's video"
	const nvertiserNamePoss = nvertiserName ? nvertiserName.replace(/s?$/, match => ({ s: 's\'' }[match] || '\'s')) : null;
	return (
		<div className="bg-gl-light-pink py-5">
			<div className="container py-5">
				<h2 className="pb-5">How does it work?</h2>
				<div className="row mb-3 text-center align-items-start">
					<div className="col-md d-flex flex-column">
						<img src="/img//Graphic_tv.scaled.400w.png" className="w-100" alt="wrapped video" />
						1. {nvertiserNamePoss || "This"} video ad was ‘wrapped’ into Good-loop’s ethical ad frame, as you can see on the video below.
					</div>
					<div className="col-md d-flex flex-column mt-5 mt-md-0">
						<img src="/img/Graphic_video_with_red_swirl.scaled.400w.png" className="w-100" alt="choose to watch" />
						2. When the users choose to engage (by watching, swiping or clicking) they unlocked a donation, funded by {nvertiserName}.
					</div>
					<div className="col-md d-flex flex-column mt-5 mt-md-0">
						<img src="/img/Graphic_leafy_video.scaled.400w.png" className="w-100" alt="choose charity" />
						3. Once the donation was unlocked,
                            {charities.length > 1 ? " the user could then choose which charity they wanted to fund with 50% of the ad money."
                            : " 50% of the ad money raised was sent to " + ((charities.length && charities[0].name) || "charity") + "."}
					</div>
				</div>
			</div>
			<div className="flex-row justify-content-center align-items-center">
				<a className="btn btn-primary" href="https://my.good-loop.com/#howitworks">Learn more</a>
			</div>
		</div>
	);
};

const Page404 = () => <div className="widepage CampaignPage gl-btns">
    <MyLoopNavBar logo="/img/new-logo-with-text-white.svg" hidePages alwaysScrolled />
    <div className="my-5 py-2"/>
    <div className="px-5">
        <h1>404 - Page not found</h1>
        <p>We couldn't find anything here! Check your URL is correct, or find other campaigns <a href="/#ads">here.</a></p>
        {Roles.isDev() && <Alert color="danger">
            No ad data could be loaded for this page - if this URL has a correct campaign/advertiser/agency ID and should be working,
            check that there are any associated ads to provide data.<br/>
            <small>You are seeing this because you are using a developer account - the public cannot see this message.</small>
        </Alert>}
    </div>
    <div className="my-5 py-5"/>
</div>;

const isAll = () => {
	const slug = DataStore.getValue('location', 'path', 1);
	return slug === 'all';
};

export default CampaignPage;
export { hackCorrectedDonations };
