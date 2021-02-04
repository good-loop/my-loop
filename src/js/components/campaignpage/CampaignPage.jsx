/*
 * 
 */
import pivot from 'data-pivot';
import _ from 'lodash';
import React, { useState } from 'react';
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
import { asDate, isMobile, sum, yessy } from '../../base/utils/miscutils';
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
 * Expects url parameters: `gl.vert` or `gl.vertiser` or `via`
 * TODO support q=... flexible query
 * TODO support agency and ourselves! with multiple adverts
 * Split: branding - a vertiser ID, vs ad-params
 */
const CampaignPage = () => {
	// What adverts should we look at?
	let {
		'gl.vert': adid, // deprecated - prefer campaign
		'gl.vertiser': vertiserid,
		'gl.status': glStatus,
		status,
		via,
		q = '',
		landing,
	} = DataStore.getValue(['location', 'params']) || {};
	// campaign ID -- from url or from advert
	let campaignId = DataStore.getValue(['location','path'])[1];
	let pvAd;
	if ( ! campaignId && adid) {
		pvAd = getDataItem({type:C.TYPES.Advert,status,id:adid});
		if (pvAd.value) {
			campaignId = Advert.campaign(pvAd.value);
		}
	}

	// Merge gl.status into status & take default value
	if (!status) status = (glStatus || C.KStatus.PUB_OR_ARC);
	
	// Is this for one campaign?
	// FIXME what about when we have multiple campaigns??
	let pvCampaign = campaignId? getDataItem({type:C.TYPES.Campaign,status,id:campaignId}) : {};
	const campaign = pvCampaign.value || {};

	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	const isLanding = (landing !== undefined) && (landing !== 'false');

	// Which advert(s)?
	let sq = adsQuery({ q, adid, vertiserid, campaignId, via });
	let pvAds = pvAd || fetchAds({ searchQuery: sq, status }); // HACK avoid a 2nd search request if adid was specified
	if ( ! pvAds) {
		// No query -- show a list
		// TODO better graphic design before we make this list widget public
		if (!Login.isLoggedIn()) {
			return <div>Missing: campaign or advertiser ID. Please check the link you used to get here.</div>;
		}
		return <ListLoad type={C.TYPES.Advert} servlet="campaign" />;
	}
	if ( ! pvAds.resolved) {
		return <Misc.Loading text="Loading campaign info..." />;
	}
	if (pvAds.error) {
		return <ErrAlert>Error loading advert data</ErrAlert>;
	}

	// If it's remotely possible to have an ad now, we have it. Which request succeeded, if any?
	let ads = pvAd? [pvAd.value] : pvAds.value.hits; // NB: unpack the pvAds = pvAd hack
	console.log(ads);
	if ( ! ads || ! ads.length) {
		return <Alert>Could not load adverts for {sq.query} {status}</Alert>; // No ads?!
	}

	// Get the advertiser's name (TODO append to advert as vertiserName)
	const pvVertiser = ActionMan.getDataItem({ type: C.TYPES.Advertiser, id: ads[0].vertiser, status: C.KStatus.PUBLISHED });
	const nvertiser = pvVertiser.value;

	// Combine branding settings from all ads
	// Vertiser branding wins, ad branding fallback, last ad wins
	let branding = {};	
	let useVertiser = true;
	if (!nvertiser) {
		useVertiser = false;
	} else if (!nvertiser.branding) {
		useVertiser = false;
	} else if (!nvertiser.branding.logo) {
		useVertiser = false;
	}
	ads.forEach(ad => Object.assign(branding, (useVertiser ? nvertiser.branding : ad.branding)));

	// individual charity data
	let charities = uniqueIds(_.flatten(ads.map(
		ad => ad.charities && ad.charities.list || []
	)));
	let cids = charities.map(x => x.id);

	let brandColor = branding.color || branding.backgroundColor;

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

	let campaigns = Object.values(campaignByName);
	// sort by date
	campaigns.sort(sortByDate(ad => ad.end || ad.start));

	// Get ad viewing data
	sq = new SearchQuery("evt:minview");
	if (campaignId) {
		sq = SearchQuery.setProp(sq, "campaign", campaignId);
	} else {
		let qads = ads.map(({ id }) => `vert:${id}`).join(' OR ');
		sq = SearchQuery.and(sq, qads);
	}
	let pvViewData = getDataLogData({q:sq.query, breakdowns:['campaign'], start:'2017-01-01', end:'now', name:"view-data",dataspace:'gl'});
	let viewcount4campaign = {};
	if (pvViewData.value) {
		viewcount4campaign = pivotDataLogData(pvViewData.value, ["campaign"]);
	}

	const donation4charity = yessy(campaign.dntn4charity)? campaign.dntn4charity : fetchDonationData({ ads });
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
		if (cid) { // TODO refactor everything to be based around a list of campaigns
			let sq = SearchQuery.setProp(new SearchQuery(), "campaign", cid);
			let pvPeepsData = getDataLogData({q:sq.query, breakdowns:[], start:'2017-01-01', end:'now', name:"view-data",dataspace:'gl'});
			if (pvPeepsData.value) {
				campaign.numPeople = pvPeepsData.value.all;
				totalViewCount = campaign.numPeople;
			}
		} else {
			const ad4c = {};
			ads.forEach(ad => ad4c[campaignNameForAd(ad)] = ad);
			let ads1perCampaign = Object.values(ad4c);
			let views = ads1perCampaign.map(ad => viewCount(viewcount4campaign, ad));
			totalViewCount = sum(views);
		}
	}

	// Get name of advertiser from nvertiser if existing, or ad if not
	const nvertiserName = (nvertiser && nvertiser.name) || ads[0].name;
	const nvertiserNameNoTrail = nvertiserName.replace(/'s$/g, "");

	let shareButtonMeta = {
		title: nvertiserNameNoTrail + "'s Good-Loop Impact - My-Loop",
		image: campaign.bg ? campaign.bg : "https://testmy.good-loop.com/img/redcurve.svg",
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
					totalViewCount={totalViewCount} landing={isLanding} adId={adid} />

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

				<Charities charities={charities} donation4charity={donation4charity} campaignPage={campaign} />

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
						<h2 className="text-white w-75 mx-auto">Download Tabs for Good - Chrome search plugin to raise money</h2>
						<p className="py-5">Every time you open a new tab you raise money for real causes.</p>
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

	return <div className="container">
		<h4>Donation Information</h4>
		<Row>
			<Col md={6} ><CharityDetails charities={charities} /></Col>
			<Col md={6} className="text-left">
				 {dmin && <>Donation Amount: <Misc.Money amount={dmin} /> { dmax && ! Money.eq(dmin,dmax) && <> to <Misc.Money amount={dmax} /></>} per video viewed <br/></>}
				 50% of the advertising cost for each advert is donated. Most of the rest goes to pay the publisher and related companies. 
				 Good-Loop and the advertising exchange make a small commission. The donations depend on viewers watching the adverts.<br/>
				 {totalBudget && <>Limitations on Donation: <Misc.Money amount={totalBudget} /> <br/></>}
				 {start && end && <>Dates: <Misc.DateTag date={start} /> through <Misc.DateTag date={end} /> <br/></>}
				 {Roles.isDev()? <DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/'+escape(campaign.id)} target="_portal">Portal Editor: Campaign</DevLink> : null}
				 <p>If impacts such as "trees planted" are listed above, these are representative. 
				 We don't ring-fence funding, as the charity can better assess the best use of funds. 
				 Cost/impact figures are as reported by the charity or by the impact assessor SoGive.
				 </p>

				{campaign.smallPrint &&
					<div className="small-print">
						<small>
							{campaign.smallPrint}
						</small>
					</div>}
			</Col>
		</Row>
		<p><small>This information follows the guidelines of the New York Attorney General for best practice in cause marketing,
			<Cite href='https://www.charitiesnys.com/cause_marketing.html'/> and the Better Business Bureau's standard for donations in marketing.			
			</small></p>
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

/**
 * List of adverts with some info about them (like views, dates)
 * @param {*} param0 
 */
const AdvertsCatalogue = ({ ads, viewcount4campaign, donationTotal, nvertiserName, totalViewCount }) => {
	const [selected, setSelected] = useState(0);

	console.log("Ads for catalogue: ", ads);
	/** Picks one Ad (with a video) from each campaign to display as a sample.  */
	let sampleAd4Campaign = {};
	ads.forEach(ad => {
		let cname = campaignNameForAd(ad);
		if (sampleAd4Campaign[cname]) {
			let showcase = ad.campaignPage && ad.campaignPage.showcase;
			// Prioritise ads with a start and end time attached
			let startProvided = !sampleAd4Campaign[cname].start && ad.start;
			let endProvided = !sampleAd4Campaign[cname].end && ad.end;
			// If the ad cannot provide a new value for start or end, skip it
			if (!startProvided && !endProvided && !showcase) {
				return;
			}
		}
		//if (!ad.videos || !ad.videos[0].url) return;
		sampleAd4Campaign[cname] = ad;
	});

	const sampleAds = Object.values(sampleAd4Campaign);
	const selectedAd = sampleAds[selected];

	console.log("Sample ads: ", sampleAds);

	let views = viewCount(viewcount4campaign, selectedAd);

	if (sampleAds.length > 1) {
		views = totalViewCount;
	}

	views = printer.prettyNumber(views);

	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);
	
	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	}

	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	}

	const goToIndex = (newIndex) => {
		if (animating) return;
		setActiveIndex(newIndex);
	}

	const carouselSlides = sampleAds.map((ad, i) =>
		<CarouselItem
			onExiting={() => setAnimating(true)}
			onExited={() => setAnimating(false)}
			key={i}
		>
			<AdvertCard
				ad={ad}
				viewCountProp={views}
				donationTotal={donationTotal}
				totalViewCount={totalViewCount}
			/>
			<CarouselCaption captionText={<Misc.DateDuration startDate={ad.start} endDate={ad.end} />}/>
		</CarouselItem>
	);

	return (<>
		<Container className="py-5">
			<h2>Watch the {nvertiserName} ad{sampleAds.length > 1 ? "s" : ""} that raised <Counter currencySymbol="£" sigFigs={4} amount={donationTotal} minimumFractionDigits={2} preserveSize /><br />with {views} ad viewers</h2>
			<Carousel
				activeIndex={activeIndex}
				next={next}
				previous={previous}
			>
				<CarouselIndicators items={sampleAds} activeIndex={activeIndex} onClickHandler={goToIndex} cssModule={{backgroundColor:"#000"}}/>
				{carouselSlides}
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous}/>
				<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
			</Carousel>
			{/*<AdvertCard
				ad={selectedAd}
				viewCountProp={views}
				donationTotal={donationTotal}
				totalViewCount={totalViewCount}
			/>
			{sampleAds.length > 1 &&
				<div className="row justify-content-center mt-5">
					{sampleAds.map((ad, i) =>
						<AdvertPreviewCard
							key={i}
							ad={ad}
							selected={selectedAd == ad}
							handleClick={() => setSelected(i)}
						/>
					)}
				</div>}
			{//<a className="btn btn-transparent" href="TODO">Campaign performance & brand study</a>
			}
		*/}
		</Container>
	</>);
};
const AdvertCard = ({ ad }) => {
	const size = 'landscape';
	return (
		<div className="position-relative" style={{ minHeight: "100px", maxHeight: "750px" }}>
			<div className="position-relative ad-card">
				<img src="/img/LandingBackground/white_iphone.png" className="w-100 invisible" />
				{/*<img src="/img/redcurve.svg" className="position-absolute tv-ad-player" style={{height: "80%"}} />*/}
				<img src="/img/LandingBackground/white_iphone.png" className="position-absolute d-none d-md-block unit-shadow" style={{ left: "50%", width: "80%", top: "50%", zIndex: 2, pointerEvents: "none", transform: "translate(-50%, -50%)" }} />
				<div className="position-absolute theunit">
					<GoodLoopUnit vertId={ad.id} size={size} />
				</div>
			</div>
			{Roles.isDev() ? <DevLink href={'https://portal.good-loop.com/#advert/' + escape(ad.id)} target="_portal">Portal Editor</DevLink> : null}
			{/*<span className="position-absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 0 }}>If you're seeing this, you likely have ad-blocker enabled. Please disable ad-blocker to see the demo!</span>*/}
		</div>
	);
};

const AdvertPreviewCard = ({ ad, handleClick, selected = false }) => {
	let size = 'landscape';

	return (
		<div className="col-md-4 col-6">
			<div onClick={e => { e.preventDefault(); handleClick(); }} className={"pointer-wrapper" + (selected ? " selected" : "")}>
				<div className="ad-prev shadow">
					<GoodLoopUnit vertId={ad.id} size={size} />
				</div>
			</div>
			<div>
				<Misc.DateDuration startDate={ad.start} endDate={ad.end} />
			</div>
		</div>
	);
};
const isAll = () => {
	const slug = DataStore.getValue('location', 'path', 1);
	return slug === 'all';
};
/**
 * @returns {!SearchQuery} for fetching Adverts
 */
const adsQuery = ({ q, adid, vertiserid, campaignId, via }) => {
	let sq = new SearchQuery(q);
	// NB: convert url parameters into a backend ES query against the Advert.java object
	if (campaignId) sq = SearchQuery.setProp(sq, 'campaign', campaignId);
	if (adid) sq = SearchQuery.setProp(sq, 'id', adid);	
	if (vertiserid) sq = SearchQuery.setProp(sq, 'vertiser', vertiserid);
	if (via) sq = SearchQuery.setProp(sq, 'via', via);
	return sq;
};
/**
 * @param {Object} p
 * @param {!SearchQuery} p.searchQuery
 * @returns ?PV(Advert[]) null if no query
 */
const fetchAds = ({ searchQuery, status }) => {
	let q = searchQuery.query;
	if (!q && !isAll()) {
		return null;
	}
	// TODO server side support to do this cleaner "give me published if possible, failing that archived, failing that draft"
	// Try to get ads based on spec given in URL params
	let pvAds = ActionMan.list({ type: C.TYPES.Advert, status, q });
	// HACK No published ads? fall back to ALL_BAR_TRASH if requested ad is draft-only
	if (pvAds.resolved && (!pvAds.value || !pvAds.value.hits || !pvAds.value.hits.length)) {
		let pvAdsDraft = ActionMan.list({ type: C.TYPES.Advert, status: C.KStatus.ALL_BAR_TRASH, q });
		console.warn(`Unable to find ad ${q} with status ${status}, falling back to ALL_BAR_TRASH`);
		return pvAdsDraft;
	}
	return pvAds;
};

export default CampaignPage;
export { hackCorrectedDonations };
