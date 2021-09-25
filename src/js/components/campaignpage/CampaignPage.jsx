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
import { getId, getType } from '../../base/data/DataClass';
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import Money from '../../base/data/Money';
import { getDataItem } from '../../base/plumbing/Crud';
import { getDataLogData, pivotDataLogData } from '../../base/plumbing/DataLog';
import DataStore from '../../base/plumbing/DataStore';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import SearchQuery from '../../base/searchquery';
import { assert, assMatch } from '../../base/utils/assert';
import { asDate, ellipsize, encURI, is, isMobile, mapkv, space, sum, uniq, uniqById, yessy } from '../../base/utils/miscutils';
import C from '../../C';
import ActionMan from '../../plumbing/ActionMan';
import ServerIO from '../../plumbing/ServerIO';
import MyLoopNavBar from '../MyLoopNavBar';
import AdvertsCatalogue from './AdvertsCatalogue';
import CampaignSplashCard from './CampaignSplashCard';
import CharitiesSection, { CharityDetails } from './CharitiesSection';
import DevLink from './DevLink';
import Roles from '../../base/Roles';
import HowDoesItWork from './HowDoesItWork';
import NGO from '../../base/data/NGO';
import { setNavContext, setNavProps } from '../../base/components/NavBar';


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
 * @returns fetches for all the data: `{pvTopCampaign, pvAgencies, pvAds, pvAdvertisers}`
 */
 const fetchIHubData = () => {
	const path = DataStore.getValue(['location', 'path']);
	let topCampaignId = path[1];
	// What adverts should we look at?
	let {
		'gl.status': glStatus, // deprecated
		status,
		query
		// q = '', TODO
	} = DataStore.getValue(['location', 'params']) || {};
	// Merge gl.status into status & take default value
	if ( ! status) status = (glStatus || C.KStatus.PUB_OR_ARC);
	// Data, assemble
	let pvTopCampaign, pvAgencies, pvAdvertisers;
	if ( ! topCampaignId) {
		// by advertiser or agency?
		let pvTop;
		let advid = DataStore.getUrlValue("advertiser") || DataStore.getUrlValue("gl.vertiser");
		if (advid) {
			pvTop = getDataItem({type:"Advertiser", id:advid, status});
		} else {
			let agid = DataStore.getUrlValue("agency");
			if ( ! agid) throw new Error("Need Campaign, Advertiser, or Agency");
			pvTop = getDataItem({type:"Agency", id:agid, status});
		}
		if ( ! pvTop.value) {
			return {
				pvTopCampaign:{},
				pvAgencies:{},
				pvAds:{},
				pvAdvertisers:{}
			};
		}
		// master campaign
		topCampaignId = pvTop.value.campaign;
		assert(topCampaignId);
	}

	// ...by Campaign (this is now the only supported way - Sept 2021)
	pvTopCampaign = getDataItem({type:C.TYPES.Campaign,status,id:topCampaignId});
	// ads
	const pvAds = pvTopCampaign.value? Campaign.pvAds({campaign: pvTopCampaign.value, status, query}) : null;
	// advertiser
	if (pvTopCampaign.value && pvTopCampaign.value.vertiser) {
		const pvAdvertiser = getDataItem({type:C.TYPES.Advertiser,status,id:pvTopCampaign.value.vertiser});
		// wrap as a list
		pvAdvertisers = fetchIHubData2_wrapAsList(pvAdvertiser);
	}

	// ...fill in from adverts
	if (pvAds && pvAds.value && pvAds.value.hits && pvAds.value.hits.length && pvAds.value.hits[0]) {
		// NB: This should be only one advertiser and agency
		let ids = uniq(pvAds.value.hits.map(Advert.advertiserId));
		if (yessy(ids)) {
			let advq = SearchQuery.setPropOr(null, "id", ids).query;
			pvAdvertisers = ActionMan.list({type: C.TYPES.Advertiser, status, q:advq});
		}
	}
	// fill in any waiting ones with blanks for convenience
	return {
		pvTopCampaign:pvTopCampaign||{},
		pvAgencies:pvAgencies||{},
		pvAds:pvAds||{},
		pvAdvertisers:pvAdvertisers||{}
	};
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
 * TODO support q=... flexible query
 * TODO support agency and ourselves! with multiple adverts
 * Split: branding - a vertiser ID, vs ad-params
 */
const CampaignPage = () => {
	let {
		via,
		landing,
		status,
		query,
		'gl.status': glStatus
	} = DataStore.getValue(['location', 'params']) || {};
	if (!status) status = (glStatus || C.KStatus.PUB_OR_ARC);

	// What adverts etc should we look at?
	let {pvTopItem, pvTopCampaign, pvAds, pvAdvertisers, pvAgencies} = fetchIHubData();

	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	const isLanding = (landing !== undefined) && (landing !== 'false');

	if (!pvTopCampaign.resolved && !pvAds.resolved) {
		console.log("Looking for master campaign...", pvTopItem);
		// TODO display some stuff whilst ads are loading
		// Debug info - What are we loading??
		let msg = space("Loading page info...",
			pvTopCampaign.value? "Top Campaign: "+pvTopCampaign.value.id : pvTopCampaign.error,
			pvAds.value? "Ads loaded" : pvAds.error
		);
		return <Misc.Loading text={msg} />;
	}
	if ( ! pvTopCampaign.value) {
		return <Misc.Loading pv={pvTopCampaign} />
	}

	// Combine Campaign settings
	/** @type{Campaign} */
	let campaign = pvTopCampaign.value;
	if ( ! campaign) {
		return <Misc.Loading pv={pvTopCampaign} />;
	}

	const ads = List.hits(pvAds.value) || [];

	let totalViewCount = Campaign.viewcount({campaign, status});


	// Combine branding
	// Priority: TopCampaign, Adverts
	let branding = {};
	if (pvAdvertisers.value) {
		List.hits(pvAdvertisers.value).forEach(adv => Object.assign(branding, adv.branding));
	}
	if (pvAgencies.value) {
		List.hits(pvAgencies.value).forEach(adv => Object.assign(branding, adv.branding));
	}
	ads.forEach(ad => Object.assign(branding, ad.branding));
	if (campaign.branding) {
		Object.assign(branding, campaign.branding);
	}

	// set NavBar brand
	let {type, id} = Campaign.masterFor(campaign);
	let pvBrandItem = getDataItem({type, id, status});
	let brandItem = pvBrandItem.value;
	if (brandItem) {
		const prop = type.toLowerCase();
		let nprops = { // advertiser link and logo			
			brandLink:'/#campaign?'+prop+'='+encURI(getId(brandItem)),
			brandLogo: brandItem.branding && (brandItem.branding.logo_white || brandItem.branding.logo),
			brandName: brandItem.name || getId(brandItem)
		};
		setNavProps(nprops);
	}

	// initial donation record
	let donation4charityUnscaled = Campaign.dntn4charity(campaign, status);
	assert(donation4charityUnscaled, "CampaignPage.jsx falsy donation4charity?!");
	console.log("[DONATION4CHARITY]", "FILLED", donation4charityUnscaled);
	const ad4Charity = {};
	// individual charity data, attaching ad ID
	let charities = Campaign.charities(campaign, status);
	// Attach ads after initial sorting and merging, which can cause ad ID data to be lost
	charities.forEach(charity => {
		charity.ad = ad4Charity[charity.id] ? ad4Charity[charity.id].id : null;
	});

	// Donation total
	// NB: allow 0 for "use the live figure" as Portal doesn't save edit-to-blank (Feb 2021)
	// Total up all campaign donations - map to donations, filter nulls
	const donationTotal = Campaign.dntn(campaign) || new Money(0);

	// Scale once to get values in the right ballpark
	let donation4charityScaled = Campaign.scaleCharityDonations(campaign, donationTotal, donation4charityUnscaled, charities);

	// filter charities by low £s and campaign.hideCharities
	charities = Campaign.filterLowDonations({charities, campaign, donationTotal, donation4charity:donation4charityScaled});

	// Scale again to make up for discrepencies introduced by filtering
	donation4charityScaled = Campaign.scaleCharityDonations(campaign, donationTotal, donation4charityUnscaled, charities);

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
	let sqe = new SearchQuery("evt:minview");
	let sqads = ads.length && SearchQuery.setPropOr(null, "vert", ads.map(ad => ad.id));
	let sq = SearchQuery.and(sqe, sqads);

	// Is this campaign ongoing? Guess from ad dates if unset (is this needed??)
	if (!is(campaign.ongoing)) {
		// when is the last advert due to stop?
		let endDate = new Date(2000,1,1);
		ads.forEach(ad => {
			let tli = ad.topLineItem;
			if (!tli) return;
			let end = asDate(tli.end) || new Date(3000,1,1); // unset will be treated as ongoing. TODO a check on last activity (but offline, periodically)
			if (end.getTime() > endDate.getTime()) {
				endDate = end;
			}
		});
		if (endDate.getTime() > new Date().getTime()) {
			console.warn("CampaignPage.jsx - HACK local `ongoing=true`"); // might be over-written
			campaign.ongoing = true;
		}
	}

	// Sort by donation value, largest first
	try {
		charities.sort((a,b) => - Money.compare(donation4charityScaled[a.id], donation4charityScaled[b.id]));
	} catch(err) {
		// currency conversion?? Keep on going unsorted
		console.error(err);
	}

	// NB: some very old ads may not have charities
	let noCharityAds = ads.filter(ad => !ad.charities);
	// minor todo - clean these up in the portal
	if (noCharityAds.length) console.warn("Ads without charities data", noCharityAds.map(ad => [ad.id, ad.campaign, ad.name, ad.status]));

	// Get name of advertiser from nvertiser if existing, or ad if not
	let nvertiser = pvAdvertisers.value && List.hits(pvAdvertisers.value)[0];
	let agency = pvAgencies.value && List.hits(pvAgencies.value)[0];
	let nvertiserName = agency? agency.name : (nvertiser? nvertiser.name : (ads[0]? ads[0].vertiserName : "Advertiser"));
	const nvertiserNameNoTrail = nvertiserName ? nvertiserName.replace(/'s$/g, "") : null;

	let shareButtonMeta = {
		title: nvertiserNameNoTrail ? nvertiserNameNoTrail + "'s Good-Loop Impact - My-Loop" : "Good-Loop Impact - My-Loop",
		image: campaign.bg || "https://my.good-loop.com/img/redcurve.svg",
		description: nvertiserNameNoTrail ? "See " + nvertiserNameNoTrail + "'s impact from Good-Loop ethical advertising" : "See our impact from Good-Loop ethical advertising"
	};

	return <>
		<StyleBlock>{campaign && campaign.customCss}</StyleBlock>
		<StyleBlock>{branding.customCss}</StyleBlock>
		<div className="widepage CampaignPage gl-btns">
			<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" hidePages/>
			<div className="text-center">
				<CampaignSplashCard branding={branding} shareMeta={shareButtonMeta} pdf={pdf} campaignPage={campaign}
					donationValue={donationTotal} charities={charities}
					totalViewCount={totalViewCount} landing={isLanding} status={status}/>

				<HowDoesItWork nvertiserName={nvertiserName} charities={charities} ongoing={campaign.ongoing}/>

				{isLanding ? null : (
					<AdvertsCatalogue
						campaign={campaign}
						ads={ads}
						donationTotal={donationTotal}
						nvertiserName={nvertiserName}
						totalViewCount={totalViewCount}
						vertisers={pvAdvertisers.value && List.hits(pvAdvertisers.value)}
						canonicalAds={ads} // maybe wrong should be all ads
					/>
				)}

				<CharitiesSection charities={charities} donation4charity={donation4charityScaled} campaign={campaign}/>

				<div className="bg-white">
					<Container>
						<h2 className="my-5">Where can you see our ads?</h2>
						<p className="w-60 mx-auto">Good-Loop distributes ethical online ads to millions of people every month in premium websites across the world’s best publishers and social platforms.</p>
					</Container>
					{isMobile() ? (
						<img src="/img/Graphic_metro_mobile.800w.png" className="w-100" alt="publishers" />
					) : (
						<img src="/img/Graphic_metro.1920w.png" className="w-100" alt="publishers" />
					)}
				</div>

				<SmallPrintInfo ads={ads} charities={charities} campaign={campaign} pvTopItem={pvTopItem} />

			</div>
		</div>
	</>;
}; // ./CampaignPage


/**
 * Charity details + campaign details
 * @param {Object} p
 * @param {Campaign} p.campaign
 */
const SmallPrintInfo = ({ads, charities, campaign, pvTopItem}) => {
	// set min/max donation-per-ad and start/end dates from ad
	let dmin,dmax,start,end;
	for(let i = 0; i < ads.length; i++) {
		let adi = ads[i];
		let tli = adi.topLineItem;
		if (!tli) continue;
		let dPerAd = tli && tli.maxBid;
		if (dPerAd) {
			try {
				if (!dmin || Money.compare(dPerAd, dmin) < 0) dmin = dPerAd;
				if (!dmax || Money.compare(dPerAd, dmin) > 0) dmax = dPerAd;
			} catch(e) {
				// Continue without comparison
				console.error(e);
			}
		}
		let starti = tli && asDate(tli.start);
		let endi = tli && asDate(tli.end);
		if (starti && (!start || starti.getTime() < start.getTime())) start = starti;
		if (endi && (!end || endi.getTime() > end.getTime())) end = endi;
	}

	let totalBudget = campaign.maxDntn;
	if (!totalBudget) {
		let amounts = ads.map(ad => Advert.budget(ad) && Advert.budget(ad).total);
		totalBudget = Money.total(amounts);
	}

	// Did we use an impact model?
	const impactModels = charities.map(c => c.simpleImpact).filter(m => m);

	return <div className="container py-5">
			<CharityDetails charities={charities} />
			<div className="text-center smallprint">
				 <span className="small">
					{dmin && <>Donation Amount: <Misc.Money amount={dmin} /> { dmax &&!Money.eq(dmin,dmax) && <> to <Misc.Money amount={dmax} /></>} per video viewed <br/></>}
					50% of the advertising cost for each advert is donated. Most of the rest goes to pay the publisher and related companies.
					Good-Loop and the advertising exchange make a small commission. The donations depend on viewers watching the adverts.
				</span>
				<br/>
				<span className="small">
					{!!Money.value(totalBudget) && <>Limitations on Donation: <Misc.Money amount={totalBudget} /> <br/></>}
					{start && end && <>Dates: <Misc.DateTag date={start} /> through <Misc.DateTag date={end} /> <br/></>}
					{!start && end && <>End date: <Misc.DateTag date={end} /> <br/></>}
					{!!impactModels.length && <span>
						If impacts {impactModels[0].name && `such as "${impactModels[0].name}"`} are listed above, these are representative.
						We don't ring-fence funding, as the charity can better assess the best use of funds.
						Cost/impact figures are as reported by the charity or by the impact assessor SoGive.
						</span>}
				</span>
				<br/>
				<span className="small">
					Donations are provided without conditions. The charities are not recommending or endorsing the products in return.
					They're just doing good &mdash; which we are glad to support.
				</span>
				<br/>
				<span className="small">
					Amounts for campaigns that are in progress or recently finished are estimates and may be subject to audit.
				</span>
			</div>
		<span className="small">This information follows the guidelines of the New York Attorney General for best practice in cause marketing,
			<Cite href="https://www.charitiesnys.com/cause_marketing.html"/> and the Better Business Bureau's standard for donations in marketing.
		</span>
		{campaign && campaign.id? <DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/'+escape(campaign.id)} target="_portal">Campaign Editor</DevLink> : ""}
		{campaign.smallPrint &&	<div className="text-center">
			<span className="small">
				{campaign.smallPrint}
			</span>
		</div>}
	</div>;
};


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
