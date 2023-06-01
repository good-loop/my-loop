import _ from 'lodash';
import PromiseValue from '../../base/promise-value';
import React, {useState} from 'react';
import { Col, Container, Row, Alert } from 'reactstrap';
import ErrAlert from '../../base/components/ErrAlert';
import { Cite } from '../../base/components/LinkOut';
import Misc from '../../base/components/Misc';
import StyleBlock from '../../base/components/StyleBlock';
import Advert from '../../base/data/Advert';
import { getId, getType } from '../../base/data/DataClass';
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import Money from '../../base/data/Money';
import { getDataItem, setWindowTitle } from '../../base/plumbing/Crud';
import { getDataLogData, pivotDataLogData } from '../../base/plumbing/DataLog';
import DataStore from '../../base/plumbing/DataStore';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import SearchQuery from '../../base/searchquery';
import { assert, assMatch } from '../../base/utils/assert';
import { ellipsize, encURI, getUrlVars, is, isMobile, mapkv, space, sum, uniq, uniqById, yessy } from '../../base/utils/miscutils';
import C from '../../C';
import ActionMan from '../../plumbing/ActionMan';
import ServerIO from '../../plumbing/ServerIO';
import AdvertsCatalogue from './AdvertsCatalogue';
import CampaignSplashCard from './CampaignSplashCard';
import CharitiesSection, { CharityDetails } from './CharitiesSection';
import DevLink from './DevLink';
import Roles from '../../base/Roles';
import HowDoesItWork from './HowDoesItWork';
import NGO from '../../base/data/NGO';
import { setNavContext, setNavProps } from '../../base/components/NavBar';
import Messaging, { notifyUser } from '../../base/plumbing/Messaging';
import { PageCard, TriCards } from '../pages/Comm\onComponents';
import ModalCTA from './CampaignModalTFG';
import ImpactDebit from '../../base/data/ImpactDebit';
import { asDate } from '../../base/utils/date-utils';

// Import from legacy file to initialize it
import Campaign from '../../base/data/DeprecatedImpactHubData';

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
	if ( ! status) status = (glStatus || KStatus.PUB_OR_ARC);
	// Data, assemble
	let pvTopCampaign, pvAgencies, pvAdvertisers;
	if ( ! topCampaignId) {
		// by advertiser or agency?
		let pvTop;
		let advid = DataStore.getUrlValue("brand") // do we use "brand"??
					|| DataStore.getUrlValue("gl.vertiser");
		if (advid) {
			pvTop = getDataItem({type:"Advertiser", id:advid, status});
		} else if (DataStore.getUrlValue("agency")) {
			let agid = DataStore.getUrlValue("agency");
			pvTop = getDataItem({type:"Agency", id:agid, status});
		} else if (DataStore.getUrlValue("gl.vert")) {
			let adid = DataStore.getUrlValue("gl.vert");
			pvTop = getDataItem({type:"Advert", id:adid, status});
		} else {
			console.error("Should give Campaign, Advertiser, or Agency");
			pvTop = {};
		}
		if ( ! pvTop.value) {
			return {
				pvTopCampaign:{},
				pvAgencies:{},
				pvAds:{},
				pvAdvertisers:{}
			};
		}
		topCampaignId = pvTop.value.campaign;
		if ( ! topCampaignId) {
			console.error("Advert without a campaign (check for unpublished!)", query, status);
			// HACK create an ersatz campaign 
			let pvAds={}, pvAdvertisers={};
			if (Advert.isa(pvTop.value)) {
				let ad = pvTop.value;
				let strayCharities = Advert.charityList(ad).map(getId);
				pvTopCampaign = new PromiseValue(new Campaign({vertiser:ad.vertiser, id:"DUMMY", strayCharities}));
				pvAds = fetchIHubData2_wrapAsList(pvTop);
			} else if (Advertiser.isa(pvTop.value)) {
				pvTopCampaign = new PromiseValue(new Campaign({vertiser:pvTop.value.id, id:"DUMMY"}));
				pvAdvertisers = fetchIHubData2_wrapAsList(pvTop);
			}
			return {
				pvTopCampaign,
				pvAgencies:{},
				pvAds,
				pvAdvertisers
			};
		}
	}

	// ...by Campaign (this is now the only supported way - Sept 2021)
	if ( ! pvTopCampaign) {
		pvTopCampaign = getDataItem({type:C.TYPES.Campaign,status,id:topCampaignId});
	}

	// ads
	const pvAds = pvTopCampaign.value? Advert.fetchForCampaign({campaignId:pvTopCampaign.value.id, status, q:query}) : null;//Campaign.pvAdsLegacy({campaign: pvTopCampaign.value, status, query}) : null;
	// advertiser
	if (pvTopCampaign.value && pvTopCampaign.value.vertiser) {
		const pvAdvertiser = getDataItem({type:C.TYPES.Advertiser,status,id:pvTopCampaign.value.vertiser});
		// wrap as a list
		pvAdvertisers = fetchIHubData2_wrapAsList(pvAdvertiser);
	}

	// ...fill in from adverts
	if ( ! pvAdvertisers && pvAds && pvAds.value && pvAds.value.hits && pvAds.value.hits.length && pvAds.value.hits[0]) {
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

const JustTheBeginning = ({ setCtaModalOpen }) => {
	return <div className="w-100 bg-gl-pale-orange" >
		<PageCard className="bg-gl-desat-blue">
			<h1 style={{color:"white",fontWeight:'bold'}}>This is just the beginning.</h1>
			<br/>
			<p className="white text-center"><b>See what else we're doing and join the Good-Loop movement.</b></p>
			<TriCards className="pt-0"
				titles={["Tabs for Good", "Ad Campaigns", "Our Story"]}
				texts={['Raise money for charity every time you open a new tab', 'Explore more examples of our campaigns', 'Meet the cofounders and discover the story of Good-Loop']}
				images={['/img/homepage/slide-1.png', '/img/homepage/UsingAdMoneyForGood.png', '/img/homepage/amyanddaniel.png']}
				links={['/tabsforgood', '/impactoverview', '/ourstory']}
			/>
			<button className="cta-modal-btn btn btn-primary text-uppercase" onClick={e => setCtaModalOpen(true)}>
				want to raise even more?
			</button>
		</PageCard>
	</div>
}

/**
 * TODO support q=... flexible query
 * TODO support agency and ourselves! with multiple adverts
 * Split: branding - a vertiser ID, vs ad-params
 */
const CampaignPage = () => {
	let [ctaModalOpen, setCtaModalOpen] = useState(false)


	let {
		via,
		landing,
		status,
		query,
		'gl.status': glStatus
	} = DataStore.getValue(['location', 'params']) || {};
	if (!status) status = (glStatus || C.KStatus.PUB_OR_ARC);

	// What adverts etc should we look at?
	let {pvTopItem, pvTopCampaign, pvAds, pvAdvertisers, pvAgencies, warning} = fetchIHubData();

	if (warning) {
		notifyUser(warning);
		return <ErrAlert color="warning" error={"Sorry, something went wrong: "+warning.text} />;
	}
	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	let isLanding = (landing !== undefined) && (landing !== 'false');
	if ( DataStore.getUrlValue("utm_medium") == "adunit" ) isLanding = true;

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
		return <Misc.Loading pv={pvTopCampaign} />;
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
		List.hits(pvAdvertisers.value).forEach(adv => adv && Object.assign(branding, adv.branding));
	}
	if (pvAgencies.value) {
		List.hits(pvAgencies.value).forEach(adv => adv && Object.assign(branding, adv.branding));
	}
	ads.forEach(ad => ad && Object.assign(branding, ad.branding));
	if (campaign.branding) {
		Object.assign(branding, campaign.branding);
	}
	
	// set NavBar brand
	if (campaign.vertiser) {
		let pvBrandItem = getDataItem({type:"Advertiser", id:campaign.vertiser, status});
		let brandItem = pvBrandItem.value;
		if (brandItem) {
			setNavProps(brandItem);
		}
	}
	
	// initial donation record
	let donation4charity = Campaign.dntn4charity(campaign);
	// individual charity data, attaching ad ID
	let charities = Campaign.charities(campaign, status);

	// Donation total
	// NB: allow 0 for "use the live figure" as Portal doesn't save edit-to-blank (Feb 2021)
	// Total up all campaign donations - map to donations, filter nulls
	const donationTotal = Campaign.dntn(campaign) || new Money(0);

	// filter charities by low £s and campaign.hideCharities
	charities = Campaign.filterLowDonations({charities, campaign, donationTotal, donation4charity});
	
	// HACK: ersatz campaign? grab charities from advert (NB: unfiltered by low £s)
	if (campaign.id==="DUMMY"&&pvAds&&pvAds.value) {
		charities = Advert.charityList(List.first(pvAds.value));
	}

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
	});
    
	// Get ad viewing data
	let sqe = new SearchQuery("evt:minview");
	let sqads = ads.length && SearchQuery.setPropOr(null, "vert", ads.map(ad => ad.id));
	let sq = SearchQuery.and(sqe, sqads);

	// Sort by donation value, largest first
	try {
		charities.sort((a,b) => - Money.compare(donation4charity[a.id], donation4charity[b.id]));
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

	let windowTitle = campaign? "Campaign: " + campaign.name : "Impact Hub";
	setWindowTitle(windowTitle);

	return <>
		<StyleBlock>{campaign && campaign.customCss}</StyleBlock>
		<StyleBlock>{branding.customCss}</StyleBlock>
		<ModalCTA modalOpen={ctaModalOpen} setModalOpen={setCtaModalOpen} branding={branding} nvertiserName={nvertiserName}/>

		<div className="widepage CampaignPage gl-btns">
			
			<div className="text-center">
				
				<CampaignSplashCard branding={branding} shareMeta={shareButtonMeta} pdf={pdf} campaignPage={campaign}
					donationValue={donationTotal} charities={charities}
					totalViewCount={totalViewCount} landing={isLanding} status={status} nvertiserName={nvertiserName}
					ctaModalOpen={ctaModalOpen} setCtaModalOpen={setCtaModalOpen}
					/>
				<HowDoesItWork nvertiserName={nvertiserName} charities={charities} ongoing={campaign.ongoing} 
					setCtaModalOpen={setCtaModalOpen}
					/>

				{isLanding ? null : (<>
					<AdvertsCatalogue
						campaign={campaign}
						ads={ads}
						donationTotal={donationTotal}
						nvertiserName={nvertiserName}
						totalViewCount={totalViewCount}
						vertisers={pvAdvertisers.value && List.hits(pvAdvertisers.value)}
						canonicalAds={ads} // maybe wrong should be all ads
						setCtaModalOpen={setCtaModalOpen}
						className="my-5"
					/>
				</>)}

				{charities.length !== 0 && 
					<CharitiesSection charities={charities} donation4charity={donation4charity} campaign={campaign} setCtaModalOpen={setCtaModalOpen}/>
				}


				<div className="bg-white">
					<Container>
						<h2 className="my-5">Look out for our ads</h2>
						<p className="w-60 mx-auto">If you see one of our shiny Good-Loop ads online, remember to engage with it to unlock your charity donation. Together we can raise even more money for good causes.</p>
					</Container>
					{isMobile() ? (
						<img src="/img/Graphic_metro_mobile_large.png" className="w-100" alt="publishers" />
					) : (
						<img src="/img/Graphic_metro.1920w.png" className="w-100" alt="publishers" />
					)}
				</div>
				<JustTheBeginning setCtaModalOpen={setCtaModalOpen}/>
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

	// Did we use an impact model?
	const impactModels = charities.map(c => c.simpleImpact).filter(m => m);

	return <div className="container py-5">
			<CharityDetails charities={charities} />
			<div className="text-center smallprint">
				<span className="small">
					{dmin && (Money.value(dmin) || Money.value(dmax))?  /* NB: using && here resulted in a stray "0" */
						<>Donation Amount: <Misc.Money amount={dmin} /> { dmax &&!Money.eq(dmin,dmax) && <> to <Misc.Money amount={dmax} /></>} per video viewed <br/></>
					: null}
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
	<div className="my-5 py-2"/>
	<div className="px-5">
		<h1>404 - Page not found</h1>
		<p>We couldn't find anything here! Check your URL is correct, or find other campaigns <C.A href="/ads">here.</C.A></p>
		{Roles.isDev() && <Alert color="danger">
			No ad data could be loaded for this page - if this URL has a correct campaign/advertiser/agency ID and should be working,
			check that there are any associated ads to provide data.<br/>
			<small>You are seeing this because you are using a developer account - the public cannot see this message.</small>
		</Alert>}
	</div>
	<div className="my-5 py-5"/>
</div>;


export default CampaignPage;
export { hackCorrectedDonations };
