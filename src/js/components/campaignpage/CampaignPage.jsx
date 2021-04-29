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
import Charities, { CharityDetails } from './Charities';
import DevLink from './DevLink';
import Roles from '../../base/Roles';
import HowDoesItWork from './HowDoesItWork';
import NGO from '../../base/data/NGO';


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
        query
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
		pvCampaigns = null;
		// ads
		pvAds = pvTopCampaign.value && Campaign.fetchAds(pvTopCampaign.value, null, status, query);
        // advertiser
		if (pvTopCampaign.value && pvTopCampaign.value.vertiser) {
			const pvAdvertiser = getDataItem({type:C.TYPES.Advertiser,status,id:pvTopCampaign.value.vertiser});			
			// wrap as a list
			pvAdvertisers = fetchIHubData2_wrapAsList(pvAdvertiser);
		}
    }

	// ...by Advert?
    // !!! DEPRECATED
	if (adid) {
		pvTopItem = getDataItem({type:C.TYPES.Advert,status,id:adid});
		// wrap as a list
		pvAds = fetchIHubData2_wrapAsList(pvTopItem);
	}
	// ...by Advertiser?
	if (vertiserid) {
		const pvAdvertiser = getDataItem({type:C.TYPES.Advertiser,status,id:vertiserid});
		// ads
		let sq = SearchQuery.setProp(new SearchQuery(), "vertiser", vertiserid);
        if (query) sq = SearchQuery.and(sq, new SearchQuery(query));
        const q = sq.query;
        pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});       
        pvTopItem = pvAdvertiser;
        if (pvAdvertiser.value) pvTopCampaign = Campaign.fetchMasterCampaign(pvAdvertiser.value);
        pvCampaigns = Campaign.fetchForAdvertiser(vertiserid, status);
	}
	// ...by Agency?
	if (agency) {		
		pvTopItem = getDataItem({type:C.TYPES.Agency,status,id:agency});
		// wrap as a list
		pvAgencies = fetchIHubData2_wrapAsList(pvTopItem);
		// advertisers
        let q = SearchQuery.setProp(new SearchQuery(), "agencyId", agency).query;
        pvAdvertisers = ActionMan.list({type: C.TYPES.Advertiser, status, q});
		// query adverts by advertisers		
        if (pvAdvertisers.value) {
			assert( ! pvAds, pvAds);
			const ids = uniq(pvAdvertisers.value.hits.map(getId));
			if (yessy(ids)) {
                let adq = SearchQuery.setPropOr(new SearchQuery(), "vertiser", ids);
                if (query) adq = SearchQuery.and(adq, new SearchQuery(query));
        		pvAds = ActionMan.list({type: C.TYPES.Advert, status, q:adq.query});        
			} else {
				console.warn("No Advertisers found for agency",agency,pvTopItem);
			}
        }
        pvCampaigns = Campaign.fetchForAgency(agency, status);
	} // ./agency
	
	if ( ! agency && ! vertiserid && ! adid && ! campaignId1) {
		throw new Error("No Campaign info specified");
	}
	// top campaign?
	if ( ! pvTopCampaign && pvTopItem && pvTopItem.value && pvTopItem.value.campaign) {
		pvTopCampaign = getDataItem({type:C.TYPES.Campaign, status, id:pvTopItem.value.campaign});
	}
	// ...fill in from adverts
	if (pvAds && pvAds.value && pvAds.value.hits && pvAds.value.hits.length && pvAds.value.hits[0]) {
		if ( ! pvAdvertisers) {
			// NB: This should be only one advertiser and agency
			let ids = uniq(pvAds.value.hits.map(Advert.advertiserId));
			if (yessy(ids)) {
				let advq = SearchQuery.setPropOr(null, "id", ids).query;
				pvAdvertisers = ActionMan.list({type: C.TYPES.Advertiser, status, q:advq});
			}
		}
		if ( ! pvAgencies) {
			let ids = uniq(pvAds.value.hits.map(ad => ad.agencyId));
			if (yessy(ids)) {
				let agq = SearchQuery.setPropOr(null, "id", ids).query;
				pvAgencies = ActionMan.list({type: C.TYPES.Agency, status, q:agq});
			}
		}
		if ( ! pvCampaigns) {
			let ids = uniq(pvAds.value.hits.map(ad => ad.campaign));
			if (yessy(ids)) {
				let q = SearchQuery.setPropOr(null, "id", ids).query;
				pvCampaigns = ActionMan.list({type: C.TYPES.Campaign, status, q});
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
        status,
		query,
        'gl.status':glStatus
	} = DataStore.getValue(['location', 'params']) || {};
    if ( ! status) status = (glStatus || C.KStatus.PUB_OR_ARC);
    
	// What adverts etc should we look at?
	let {pvTopItem, pvTopCampaign, pvCampaigns, pvAds, pvAdvertisers, pvAgencies} = fetchIHubData();

	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	const isLanding = (landing !== undefined) && (landing !== 'false');

    if ( ! pvTopCampaign.resolved) {
		console.log("Looking for master campaign...");
		// TODO display some stuff whilst ads are loading
		return <Misc.Loading text="Loading advert info..." />;
	}
	if (!pvTopCampaign.value && !pvCampaigns.value) {
		console.warn("NO CAMPAIGNS FOUND, aborting page generation");
		return <Page404/>;
    }
    
    // Combine Campaign settings
	let campaign = pvTopCampaign.value;
	if ( ! campaign && pvCampaigns.value) {
		let cs = List.hits(pvCampaigns.value);
		campaign = Object.assign({}, ...cs);	
		console.warn("No master campaign found, using:", campaign.name || campaign.id);
	}
    if ( ! campaign) campaign = {};

	// CAMPAIGN IMPACT HUB SETTINGS
	let {
		showNonCampaignAds,
		ongoing,
		forceScaleTotal,
	} = campaign;

    // Get filtered ad list
    const otherCampaigns = pvCampaigns.value && List.hits(pvCampaigns.value).filter(c => c.id!==campaign.id);
	let adStatusList = campaign ? Campaign.advertStatusList({topCampaign:campaign, campaigns:otherCampaigns, status, query, extraAds:pvAds.value && List.hits(pvAds.value)}) : [];
    let ads = adStatusList.filter(ad => ad.ihStatus==="SHOWING");
    let canonicalAds = campaign ? Campaign.advertStatusList({topCampaign:campaign, campaigns:otherCampaigns, status, extraAds:pvAds.value && List.hits(pvAds.value)}).filter(ad => ad.ihStatus==="SHOWING") : [];
    let extraAds = adStatusList.filter(ad => ad.ihStatus==="NO CAMPAIGN");
	console.log("Fetching data with campaign", campaign.name || campaign.id, "and extra campaigns", otherCampaigns && otherCampaigns.map(c => c.name || c.id), "and extra ads", extraAds);
	console.log("ADS LENGTH:", ads.length);

	console.log("AD STATUS LIST:", adStatusList.map(ad => ad.ihStatus));

	let totalViewCount = Campaign.viewcount({topCampaign:campaign, campaigns:otherCampaigns, extraAds});
    
    // Merge in ads with no campaigns if asked - less controls applied
    if (showNonCampaignAds && pvAds.value) {
        const hideAds = Campaign.hideAdverts(campaign, otherCampaigns);
        extraAds.forEach(ad => {
            if (!ads.includes(ad) && !hideAds.includes(ad.id)) ads.push(ad);
        });
    }
    if (!yessy(ads)) return <Misc.Loading text="Loading advert info..." />;

	// Combine branding
	// Priority: TopCampaign, TopItem, Adverts
	let branding = {};
	ads.forEach(ad => Object.assign(branding, ad.branding));	
	if (pvTopItem && pvTopItem.value && pvTopItem.value.branding) {
		Object.assign(branding, pvTopItem.value.branding);
	}
	Object.assign(branding, campaign.branding);

    // initial donation record
    let donation4charityUnscaled = Campaign.dntn4charity(campaign, otherCampaigns, extraAds, status);
    console.log("[DONATION4CHARITY]", "FILLED", donation4charityUnscaled);

    const ad4Charity = {};
	// individual charity data, attaching ad ID
	let charities = Campaign.charities(campaign, otherCampaigns, extraAds, status);
	// Add in any from campaign.dntn4charity - which can include strayCharities
	if (!Campaign.isDntn4CharityEmpty(campaign)) {
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
    charities = NGO.fetchSogiveData(charities);
    console.log("CHARITIESSSSSS", charities);
    console.log("AD 4 CHARITY:",ad4Charity)
    // Attach ads after initial sorting and merging, which can cause ad ID data to be lost
    charities.forEach(charity => {
        charity.ad = ad4Charity[charity.id] ? ad4Charity[charity.id].id : null;
    });

	// Donation total
	assert(donation4charityUnscaled, "CampaignPage.jsx falsy donation4charity?!");
	// NB: allow 0 for "use the live figure" as Portal doesn't save edit-to-blank (Feb 2021)
	// Total up all campaign donations - map to donations, filter nulls
    const donationTotal = Campaign.donationTotal(campaign, otherCampaigns, donation4charityUnscaled, forceScaleTotal);

    // Scale once to get values in the right ballpark
    let donation4charityScaled = Campaign.scaleCharityDonations(campaign, donationTotal, donation4charityUnscaled, charities);
    
    console.log("[DONATION4CHARITY]", "DONATION SCALED", donation4charityScaled);

    // filter charities by low £s and campaign.hideCharities
    charities = Campaign.filterLowDonations({charities, campaign, donationTotal, donation4charity:donation4charityScaled});
    
    // Scale again to make up for discrepencies introduced by filtering
	donation4charityScaled = Campaign.scaleCharityDonations(campaign, donationTotal, donation4charityUnscaled, charities);

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

	// Is this an interim total or the full amount? Interim if not fixed by campaign, and not ended
	if ( ! ongoing && ! campaign.dntn) {
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

	// Get name of advertiser from nvertiser if existing, or ad if not
	let nvertiser = pvAdvertisers.value && List.hits(pvAdvertisers.value)[0];
    let agency = pvAgencies.value && List.hits(pvAgencies.value)[0];
	let nvertiserName = agency ? agency.name : (nvertiser ? nvertiser.name : ads[0].vertiserName);
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
					donationValue={donationTotal} charities={charities}
					totalViewCount={totalViewCount} landing={isLanding} />

				<HowDoesItWork nvertiserName={nvertiserName} charities={charities} ongoing={ongoing}/>

				{isLanding ? null : (
					<AdvertsCatalogue
						campaign={campaign}
						ads={ads}
						canonicalAds={canonicalAds}
						donationTotal={donationTotal}
						nvertiserName={nvertiserName}
						totalViewCount={totalViewCount}
						vertisers={pvAdvertisers.value && List.hits(pvAdvertisers.value)}
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
			<Col md={6} className="text-center pl-md-5 smallprint">
				 <span className="small">
					{dmin && <>Donation Amount: <Misc.Money amount={dmin} /> { dmax && ! Money.eq(dmin,dmax) && <> to <Misc.Money amount={dmax} /></>} per video viewed <br/></>}
					50% of the advertising cost for each advert is donated. Most of the rest goes to pay the publisher and related companies. 
					Good-Loop and the advertising exchange make a small commission. The donations depend on viewers watching the adverts.
				</span>
                <br/>
				<span className="small">
					{ !! Money.value(totalBudget) && <>Limitations on Donation: <Misc.Money amount={totalBudget} /> <br/></>}
					{start && end && <>Dates: <Misc.DateTag date={start} /> through <Misc.DateTag date={end} /> <br/></>}
					{ ! start && end && <>End date: <Misc.DateTag date={end} /> <br/></>}
					{ !! impactModels.length && <span>
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
			</Col>
		</Row>
		<br/>
		<span className="small">This information follows the guidelines of the New York Attorney General for best practice in cause marketing,
			<Cite href='https://www.charitiesnys.com/cause_marketing.html'/> and the Better Business Bureau's standard for donations in marketing.			
		</span>
		{campaign && campaign.id && <DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/'+escape(campaign.id)} target="_portal">Campaign Editor</DevLink>}
        {campaign.smallPrint &&
        <div className="text-center">
            <span className="small">
                {campaign.smallPrint}
            </span>
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
