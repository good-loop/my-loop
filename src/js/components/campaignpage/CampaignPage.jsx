/*
 * 
 */
import pivot from 'data-pivot';
import _ from 'lodash';
import React, { useState } from 'react';
import PromiseValue from 'promise-value';
import {
	Alert,
	Carousel,
	CarouselCaption, CarouselControl,
	CarouselIndicators, CarouselItem, Col, Container, Row
} from 'reactstrap';
import Counter from '../../base/components/Counter';
import CSS from '../../base/components/CSS';
import ErrAlert from '../../base/components/ErrAlert';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import { Cite } from '../../base/components/LinkOut';
import ListLoad from '../../base/components/ListLoad';
import Misc from '../../base/components/Misc';
import StyleBlock from '../../base/components/StyleBlock';
import Advert from '../../base/data/Advert';
import Campaign from '../../base/data/Campaign';
import Money from '../../base/data/Money';
import { getDataItem } from '../../base/plumbing/Crud';
import { getDataLogData, pivotDataLogData } from '../../base/plumbing/DataLog';
import DataStore from '../../base/plumbing/DataStore';
import Roles from '../../base/Roles';
import SearchQuery from '../../base/searchquery';
import { assert } from '../../base/utils/assert';
import { asDate, isMobile, sum, uniq, yessy } from '../../base/utils/miscutils';
import printer from '../../base/utils/printer';
import { sortByDate } from '../../base/utils/SortFn';
import Login from '../../base/youagain';
import C from '../../C';
import ActionMan from '../../plumbing/ActionMan';
import ServerIO from '../../plumbing/ServerIO';
import MyLoopNavBar from '../MyLoopNavBar';
import CampaignSplashCard from './CampaignSplashCard';
import Charities, { CharityDetails } from './Charities';
import DevLink from './DevLink';
import AdvertsCatalogue from './AdvertsCatalogue';
import List from '../../base/data/List';
import KStatus from '../../base/data/KStatus';


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


/** SoGive occasionally provides duplicated charity objects, so we check and filter them first.
// TODO: This check shouldn't be here, maybe SoGive can filter its stuff before sending it over?
// NB Also used on adverts for similar reasons
 */
const uniqueIds = arr => {
	let ids = {};
	return arr.filter(obj => {
		if (!obj || !obj.id || ids[obj.id]) return false;
		ids[obj.id] = true;
		return true;
	});
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
	}
	// ...by Advert?
	else if (adid) {
		console.log("Getting " + adid + " ad...");
		pvTopItem = getDataItem({type:C.TYPES.Advert,status,id:adid});
		// wrap as a list
		pvAds = fetchIHubData2_wrapAsList(pvTopItem);
		console.log("pvAds", pvAds, "pvTopItem", pvTopItem); // debug
	}
	// ...by Advertiser?
	else if (vertiserid) {		
		pvTopItem = getDataItem({type:C.TYPES.Advertiser,status,id:vertiserid});
		// wrap as a list
		pvAdvertisers = fetchIHubData2_wrapAsList(pvTopItem);
		// ads
		let q = SearchQuery.setProp(new SearchQuery(), "vertiser", vertiserid).query;
		pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});
	}
	// ...by Agency?
	else if (agency) {		
		pvTopItem = getDataItem({type:C.TYPES.Agency,status,id:agency});
		// wrap as a list
		pvAgencies = fetchIHubData2_wrapAsList(pvTopItem);
		// ads
		let q = SearchQuery.setProp(new SearchQuery(), "agencyId", agency).query;
		pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});
	} else {
		throw new Error("No Campaign info specified");
	}
	// top campaign?
	if ( ! pvTopCampaign && pvTopItem && pvTopItem.value && pvTopItem.value.campaign) {
		pvTopCampaign = getDataItem({type:C.TYPES.Campaign, status, id:pvTopItem.value.campaign});
	}	
	// ...fill in from adverts
	if (pvAds.value && pvAds.value.hits && pvAds.value.hits.length && pvAds.value.hits[0]) {
		console.log("PVADS VALUE", pvAds.value);
		if ( ! pvAdvertisers) {
			// NB: This should be only one advertiser and agency
			let ids = uniq(pvAds.value.hits.map(Advert.advertiserId));
			if (yessy(ids)) {
				let advq = SearchQuery.setPropOr(null, "id", ids).query;
				pvAdvertisers = ActionMan.list({type: C.TYPES.Advertiser, status:KStatus.PUB_OR_DRAFT, q:advq});
			}
		}
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
 * Expects url parameters: `gl.vert` or `gl.vertiser` or `via`
 * TODO support q=... flexible query
 * TODO support agency and ourselves! with multiple adverts
 * Split: branding - a vertiser ID, vs ad-params
 */
const CampaignPage = () => {
	let {
		via,
		landing,
	} = DataStore.getValue(['location', 'params']) || {};
	// What adverts etc should we look at?
	let {pvTopItem, pvTopCampaign, pvCampaigns, pvAds, pvAdvertisers, pvAgencies} = fetchIHubData();

	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	const isLanding = (landing !== undefined) && (landing !== 'false');

	if ( ! pvAds.resolved) {
		// TODO display some stuff whilst ads are loading
		return <Misc.Loading text="Loading advert info..." />;
	}
	if (pvAds.error || !pvAds.value.hits || (pvAds.value.hits.length == 1 && !pvAds.value.hits[0])) {
		return <ErrAlert>Error loading advert data</ErrAlert>;
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
	// TODO fill in if no Campaign objects
	// TODO fill in blanks like donation total and peeps
	// Priority: TopCampaign, Agency, Advertiser, Campaigns, Adverts
	// TODO combine branding
	let branding = {};	
	ads.forEach(ad => Object.assign(branding, ad.branding));

	// individual charity data
	let charities = uniqueIds(_.flatten(ads.map(
		ad => ad.charities && ad.charities.list || []
	)));

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

	console.log(yessy(campaign.dntn4charity) ? "Using campaign donation data" : "Using sogive donation data");
	const donation4charity = yessy(campaign.dntn4charity)? campaign.dntn4charity : fetchDonationData({ ads });
	console.log("DONATION 4 CHARITY", donation4charity);
	const donationTotal = campaign.dntn || donation4charity.total;

	{	// NB: some very old ads may not have charities
		let noCharityAds = ads.filter(ad => !ad.charities);
		// minor todo - clean these up in the portal
		if (noCharityAds.length) console.warn("Ads without charities data", noCharityAds.map(ad => [ad.id, ad.campaign, ad.name, ad.status]));
	}
	let charitiesById = _.uniq(_.flattenDeep(ads.map(ad => ad.charities && ad.charities.list)));
	let charIds = [];
	charitiesById.forEach(c => {
		if (c && !charIds.includes(c.name)) {
			charIds.push(c.name);
		}
	});

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
	}

	// Get name of advertiser from nvertiser if existing, or ad if not
	let nvertiser = (pvAdvertisers.value && pvAdvertisers.value.hits[0]);
	const nvertiserName = nvertiser ? nvertiser.name : ads[0].vertiserName;
	const nvertiserNameNoTrail = nvertiserName.replace(/'s$/g, "");

	let shareButtonMeta = {
		title: nvertiserNameNoTrail + "'s Good-Loop Impact - My-Loop",
		image: campaign.bg || "https://my.good-loop.com/img/redcurve.svg",
		description: "See " + nvertiserNameNoTrail + "'s impact from Good-Loop ethical advertising"
	};

	return (<>
		<StyleBlock>{campaign && campaign.customCss}</StyleBlock>
		<StyleBlock>{branding.customCss}</StyleBlock>
		<div className="widepage CampaignPage gl-btns">
			<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" hidePages/>
			<div className="text-center">
				<CampaignSplashCard branding={branding} shareMeta={shareButtonMeta} pdf={pdf} campaignPage={campaign} 
					donationValue={donationTotal} 
					totalViewCount={totalViewCount} landing={isLanding} />

				<HowDoesItWork nvertiserName={nvertiserName} />

				{isLanding ? null : (
					<AdvertsCatalogue
						ads={ads}
						viewcount4campaign={viewcount4campaign}
						donationTotal={donationTotal}
						nvertiserName={nvertiserName}
						totalViewCount={totalViewCount}
					/>
				)}

				<Charities charities={charities} donation4charity={donation4charity} campaign={campaign} />

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
			if ( ! dmin || Money.compare(dPerAd, dmin) < 0) dmin = dPerAd;
			if ( ! dmax || Money.compare(dPerAd, dmin) > 0) dmax = dPerAd;
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

	return <div className="container py-5">
		<Row>
			<Col md={6} style={{borderRight:"2px solid grey"}}><CharityDetails charities={charities} /></Col>
			<Col md={6} className="text-center pl-5">
				 <small>
					{dmin && <>Donation Amount: <Misc.Money amount={dmin} /> { dmax && ! Money.eq(dmin,dmax) && <> to <Misc.Money amount={dmax} /></>} per video viewed <br/></>}
					50% of the advertising cost for each advert is donated. Most of the rest goes to pay the publisher and related companies. 
					Good-Loop and the advertising exchange make a small commission. The donations depend on viewers watching the adverts.<br/>
					{totalBudget && <>Limitations on Donation: <Misc.Money amount={totalBudget} /> <br/></>}
					{start && end && <>Dates: <Misc.DateTag date={start} /> through <Misc.DateTag date={end} /> <br/></>}
					<p>If impacts such as "trees planted" are listed above, these are representative. 
					We don't ring-fence funding, as the charity can better assess the best use of funds. 
					Cost/impact figures are as reported by the charity or by the impact assessor SoGive.
					</p>
				</small>

				{campaign.smallPrint &&
					<div className="small-print">
						<small>
							{campaign.smallPrint}
						</small>
					</div>}
			</Col>
		</Row>
		<br/>
		<p><small>This information follows the guidelines of the New York Attorney General for best practice in cause marketing,
			<Cite href='https://www.charitiesnys.com/cause_marketing.html'/> and the Better Business Bureau's standard for donations in marketing.			
		</small></p>
		<DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/'+escape(campaign.id)} target="_portal">Campaign Editor</DevLink>
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
	let charityIds = _.flatten(ads.map(Advert.charityList));

	// HACK return hacked values if Cheerios or Purina
	for (let i = 0; i < ads.length; i++) {
		const ad = ads[i];
		const donation = hackCorrectedDonations(ad.id);
		if (donation) return donation;
	}
	if (!donationForCharity.total) {
		// Campaign level total info?
		let campaignPageDonations = ads.map(ad => ad.campaignPage && Campaign.dntn(ad.campaignPage)).filter(x => x);
		if (campaignPageDonations.length === ads.length) {
			let donationTotal = Money.total(campaignPageDonations);
			donationForCharity.total = donationTotal;
		}
	}
	// Campaign level per-charity info?	
	let campaignsWithoutDonationData = [];
	for (let i = 0; i < ads.length; i++) {
		const ad = ads[i];
		const cp = ad.campaignPage;
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
	// NB: quoting for campaigns if they have a space (crude not 100% bulletproof) 
	let sq2 = campaignIds.map(id => "campaign:" + (id.includes(" ") ? '"' + id + '"' : id)).join(" OR ");
	let sqDon = SearchQuery.or(sq1, sq2);

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget', 'CampaignPage', 'communityTotal', sqDon.query], () => {
		return ServerIO.getDonationsData({ q: sqDon.query });
	}, true, 5 * 60 * 1000);
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

	// assign unallocated money?
	if (!donationForCharity.total) {
		console.warn("No donation total?!");
		return donationForCharity;
	}
	// NB: minus total, cos total also gets included in the sum-of-values
	const allocatedMoney = Money.sub(Money.total(Object.values(donationForCharity)), donationForCharity.total);
	const unallocatedMoney = Money.sub(donationForCharity.total, allocatedMoney);
	if (Money.value(unallocatedMoney) <= 0) {
		return donationForCharity;
	}
	// share it out based on the allocated money
	charityIds.forEach(cid => {
		let cDntn = donationForCharity[cid];
		if (!cDntn) return;
		let share = Money.divide(cDntn, allocatedMoney);
		assert(share >= 0 && share <= 1, cid);
		let extra = Money.mul(unallocatedMoney, share);
		donationForCharity[cid] = Money.add(cDntn, extra);
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

const HowDoesItWork = ({ nvertiserName }) => {
	// possessive form - names with terminal S just take an apostrophe, all others get "'s"
	// EG Sharp's (brewery) ==> "Sharp's' video... " vs Sharp (electronics manufacturer) ==> "Sharp's video"
	const nvertiserNamePoss = nvertiserName.replace(/s?$/, match => ({ s: 's\'' }[match] || '\'s'));
	return (
		<div className="bg-gl-light-pink py-5">
			<div className="container py-5">
				<h2 className="pb-5">How does it work?</h2>
				<div className="row mb-3 text-center align-items-start">
					<div className="col-md d-flex flex-column">
						<img src="/img//Graphic_tv.scaled.400w.png" className="w-100" alt="wrapped video" />
						1. {nvertiserNamePoss} video ad was ‘wrapped’ into Good-loop’s ethical ad frame, as you can see on the video below.
					</div>
					<div className="col-md d-flex flex-column mt-5 mt-md-0">
						<img src="/img/Graphic_video_with_red_swirl.scaled.400w.png" className="w-100" alt="choose to watch" />
						2. When the users choose to engage (by watching, swiping or clicking) they unlocked a donation, funded by {nvertiserName}.
					</div>
					<div className="col-md d-flex flex-column mt-5 mt-md-0">
						<img src="/img/Graphic_leafy_video.scaled.400w.png" className="w-100" alt="choose charity" />
						3. Once the donation was unlocked, the user could then choose which charity they wanted to fund with 50% of the ad money.
					</div>
				</div>
			</div>
			<div className="flex-row justify-content-center align-items-center">
				<a className="btn btn-primary" href="https://my.good-loop.com/#howitworks">Learn more</a>
			</div>
		</div>
	);
};

const isAll = () => {
	const slug = DataStore.getValue('location', 'path', 1);
	return slug === 'all';
};

export default CampaignPage;
export { hackCorrectedDonations };
