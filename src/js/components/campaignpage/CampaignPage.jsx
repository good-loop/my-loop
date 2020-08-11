/*
 * 
 */
import React from 'react';
import Login from 'you-again';
import _ from 'lodash';
import { Container, Alert } from 'reactstrap';
import pivot from 'data-pivot';
import PV from 'promise-value';

import Roles from '../../base/Roles';
import {isPortraitMobile, sum} from '../../base/utils/miscutils';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import Footer from '../Footer';
import MyLoopNavBar from '../MyLoopNavBar';
import Money from '../../base/data/Money';
import CampaignPageDC from '../../data/CampaignPage';
import SearchQuery from '../../base/searchquery';
import ACard from '../cards/ACard';
import CharityCard from '../cards/CharityCard';
import {sortByDate} from '../../base/utils/SortFn';
import Counter from '../../base/components/Counter';
import printer from '../../base/utils/printer';
import CSS from '../../base/components/CSS';
import GoodLoopAd from './GoodLoopAd';
import PublishersCard from './PublishersCard';
import CampaignSplashCard from './CampaignSplashCard';
import ErrorAlert from '../../base/components/ErrorAlert';
import ListLoad from '../../base/components/ListLoad';

const tomsCampaigns = /(josh|sara|ella)/; // For matching TOMS campaign names needing special treatment
/**
 * HACK fix campaign name changes to clean up historical campaigns
 * @param {Object} viewcount4campaign
 * @param {!Advert} ad
 * @returns {Number}
 */
const viewCount = (viewcount4campaign, ad) => {
	if ( ! ad.campaign) return null;

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
		'gl.vert': adid,
		'gl.vertiser': vertiserid,
		'gl.status': glStatus,
		status,
		via,
		q = '',
		landing,
	} = DataStore.getValue(['location', 'params']) || {};

	// Merge gl.status into status & take default value
	if (!status) status = (glStatus || C.KStatus.PUB_OR_ARC);
	
	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	const isLanding = (landing !== undefined) && (landing !== 'false');

	// Which advert(s)?
	const sq = adsQuery({q, adid, vertiserid, via});
	let pvAds = fetchAds({searchQuery: sq, status});
	if ( ! pvAds) {
		// No query -- show a list
		// TODO better graphic design before we make this list widget public
		if (!Login.isLoggedIn()) {
			return <div>Missing: campaign or advertiser ID. Please check the link you used to get here.</div>;
		}
		return <ListLoad type={C.TYPES.Advert} servlet="campaign" />;
	}
	if (!pvAds.resolved) {
		return <Misc.Loading text="Loading campaign info..." />;
	}
	if (pvAds.error) {		
		return <ErrorAlert>Error loading advert data</ErrorAlert>;
	}

	// If it's remotely possible to have an ad now, we have it. Which request succeeded, if any?
	/** @type {Advert[]} */
	let ads = pvAds.value.hits;
	if (ads && ! isAll()) {
		ads = ads.slice(0, 10); // Limit to first 10 results unless we're on #campaign/all
	}
	if ( ! ads || ! ads.length) {
		return <Alert>Could not load adverts for {sq.query} {status}</Alert>; // No ads?!
	}

	// Get the advertiser's name (TODO append to advert as vertiserName)
	const pvVertiser = ActionMan.getDataItem({type: C.TYPES.Advertiser, id: ads[0].vertiser, status: C.KStatus.PUBLISHED});
	const nvertiser = pvVertiser.value;

	// Combine campaign page and branding settings from all ads
	// Last ad wins any branding settings!
	// TODO support for agency level (and advertiser level) branding to win through
	let branding = {};
	let campaignPage = {};
	ads.forEach(ad => Object.assign(branding, ad.branding));
	ads.forEach(ad => Object.assign(campaignPage, ad.campaignPage));
	
	// individual charity data
	let charities = uniqueIds(_.flatten(ads.map(
		ad => ad.charities && ad.charities.list || []
	)));
	let cids = charities.map(x => x.id);

	// Fetch donations data
	let sqDon = new SearchQuery();
	for (let i = 0; i < ads.length; i++) {
		sqDon = SearchQuery.or(sqDon, 'vert:' + ads[i].id);
		if (ads[i].campaign) {
			let sqc = SearchQuery.setProp(new SearchQuery(), 'campaign', ads[i].campaign);
			sqDon = SearchQuery.or(sqDon, sqc);
		}
	}

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget','CampaignPage','communityTotal', sqDon.query], () => {
		// TODO campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
		// Argh: Loop.Me have not logged vert, only campaign.
		// but elsewhere vert is logged and not campaign.
		// let q = ad.campaign? '(vert:'+adid+' OR campaign:'+ad.campaign+')' : 'vert:'+adid;
		// TODO "" csv encoding for bits of q (e.g. campaign might have a space)
		return ServerIO.getDonationsData({q:sqDon.query});
	}, true, 5*60*1000);

	// DEBUG HACK - to test handling of slow donations data, uncomment these lines
	// pvDonationsBreakdown.resolved = false;
	// pvDonationsBreakdown.value = null;

	if (pvDonationsBreakdown.error) {
		// TODO let's refactor this out into a standard error card -- possibly stick it in wwappbase or Misc
		return <div>Error: {pvDonationsBreakdown.error}. Try reloading the page. Contact us if this persists.</div>;
	}

	let ncampaignTotal = pvDonationsBreakdown.value && pvDonationsBreakdown.value.total;
	let ndonationValue = ncampaignTotal; // check if statically set and, if not, then update with latest figures
	// Allow the campaign page to override and specify a total
	let campaignPageDonations = ads.map(ad => ad.campaignPage && CampaignPageDC.donation(ad.campaignPage)).filter(x => x);
	if (campaignPageDonations.length === ads.length) {
		ndonationValue = Money.total(campaignPageDonations);
	}
	if (ndonationValue && ndonationValue.value) ndonationValue = ndonationValue.value; // WTF??
	// also the per-charity numbers
	let ndonByCid = pvDonationsBreakdown.value && pvDonationsBreakdown.value.by_cid;

	let brandColor = branding.color || branding.backgroundColor;

	// Group ads by campaign {String: Advert}
	let campaignByName = {};
	ads.forEach(ad => {
		let name = ad.campaign || ad.id;
		campaignByName[name] = {
			...campaignByName[name],
			...ad
		};
	});

	let campaigns = Object.values(campaignByName);
	// sort by date
	campaigns.sort(sortByDate(ad => ad.end || ad.start));

	// Get ad viewing data
	let pvViewData = DataStore.fetch(['misc', 'views', isAll()? 'all' : sq.query], () => {
		// filter to these ads
		let qads = ads.map(({id}) => `vert:${id}`).join(' OR ');
		let filters = {
			dataspace: 'gl',
			q: `evt:minview AND (${qads})` // minview vs spend ??
		};
		// start = early for all data
		return ServerIO.getDataLogData({filters, breakdowns:['campaign', 'pub'], start:'2017-01-01', name:'view-data'});
		// return ServerIO.getDonationsData({cid:'ashoka', start: '2017-01-01T00:00:00Z', end: '2019-10-15T23:59:59Z'})
	});

	let viewcount4campaign = {};
	if (pvViewData.value) {
		window.pivot = pivot; // for debug
		viewcount4campaign = pivot(pvViewData.value, "by_campaign.buckets.$bi.{key, doc_count}", "$key.$doc_count");
	}

	/** Calculates total donations per charity based on percentage available, adding [donation] and [donationPercentage] to the charities object  */ 
	const assignUnsetDonations = () => {
		if (!ndonationValue) {
			console.warn("Missing ndonationValue");
			return;
		}
		charities = charities.map(char => {
			if (ndonByCid && ndonByCid[char.id]) { // if the charities have been edited after the campaign they might be missing values.
				return { ...char, donation: Math.floor(ndonByCid[char.id].value)};
			} return char;
		});

		charities = charities.filter(c => c.donation); // Get rid of charities with no logged donations.
		const donationTotalMinusUnset = Object.values(charities).reduce((t, {donation}) => t + donation, 0);
		charities = charities.map(e => {
			const percentage = e.donation * 100 / donationTotalMinusUnset;
			const calculatedDonation = percentage * ndonationValue / 100;
			return {...e, donation: calculatedDonation, donationPercentage: percentage};
		});
	};

	{	// NB: some very old ads may not have charities
		let noCharityAds = ads.filter(ad => ! ad.charities);
		// minor todo - clean these up in the portal
		if (noCharityAds.length) console.warn("Ads without charities data", noCharityAds.map(ad => [ad.id, ad.campaign, ad.name, ad.status]));
	}
	let charitiesById = _.uniq(_.flattenDeep(ads.map(ad => ad.charities && ad.charities.list)));
	let charIds = [];
	charitiesById.forEach(c => {
		if (c && ! charIds.includes(c.name)) {
			charIds.push(c.name);
		}
	});

	// Sum of the views from every ad in the campaign. We use this number for display
	// and to pass it to the AdvertCards to calculate the money raised against the total.
	let totalViewCount = 0;
	{
		const ad4c = {};
		ads.forEach(ad => ad4c[campaignNameForAd(ad)] = ad);
		let ads1perCampaign = Object.values(ad4c);
		let views = ads1perCampaign.map(ad => viewCount(viewcount4campaign, ad));		
		totalViewCount = sum(views);
	}

	

	const descHeader = campaignPage.desc_title ? (
		<h3>{campaignPage.desc_title}</h3>
	) : null;

	const descBody = campaignPage.desc_body ? (
		<span>{campaignPage.desc_body}</span>
	) : (
		<span>
			At {(nvertiser && nvertiser.name) || ads[0].name} we want to give back.
			We work with Good-Loop to put out Ads for Good, and donate money to charity.
			Together with <span className="font-weight-bold">{printer.prettyNumber(totalViewCount, 4)}</span> people
			we've raised funds for the following causes and can't wait to see our positive impact go even further.
			See our impact below.
		</span>
	);

	assignUnsetDonations();

	return (<>
		<MyLoopNavBar brandLogo={branding.logo} logo="/img/new-logo-with-text-white.svg" style={{backgroundColor: brandColor}} />
		<CSS css={campaignPage && campaignPage.customCss} />
		<CSS css={branding.customCss} />
		<div className="widepage CampaignPage text-center">
			<CampaignSplashCard branding={branding} campaignPage={campaignPage} donationValue={ndonationValue} totalViewCount={totalViewCount} landing={isLanding} adId={adid} />

			<div className="container-fluid" style={{backgroundColor: '#af2009'}}>
				<div className="intro-text">
					{descHeader}
					{descBody}
				</div>
			</div>

			<div className="charity-card-container section clearfix">
				{charities.map((charity, i) => (
					<CharityCard
						i={i} key={charity.id}
						imageLeft={i % 2 === 0} /* Alternate L/R/L/R */
						charity={charity}
						donationValue={charity.donation}
						donationBreakdown={pvDonationsBreakdown}
					/>
				))}
			</div>

			<PublishersCard pvViewData={pvViewData} />

			{isLanding ? null : (
				<AdvertsCatalogue
					ads={ads}
					viewcount4campaign={viewcount4campaign}
					ndonationValue={ndonationValue}
					totalViewCount={totalViewCount}
				/>
			)}

			{campaignPage.smallPrint ? (
				<div className="small-print"><small>{campaignPage.smallPrint}</small></div>
			) : null}

			<Footer />
		</div>
	</>
	);
}; // ./CampaignPage

const campaignNameForAd = ad => {
	// HACK FOR TOMS 2019 The normal code returns 5 campaigns where there are 3 synthetic campaign groups
	// Dedupe on "only the first josh/sara/ella campaign" instead
	if (ad.vertiser === 'bPe6TXq8' && ad.campaign.match(tomsCampaigns)) {
		let cname = ad.campaign.match(tomsCampaigns)[0];
		return cname;
	}
	return ad.campaign;
};

/**
 * List of adverts with some info about them (like views, dates)
 * @param {*} param0 
 */
const AdvertsCatalogue = ({ads, viewcount4campaign, ndonationValue, totalViewCount}) => {
	/** Picks one Ad (with a video) from each campaign to display as a sample.  */
	let sampleAd4Campaign = {};
	ads.forEach(ad => {
		let cname = campaignNameForAd(ad);
		if (sampleAd4Campaign[cname]) return;
		if ( ! ad.videos || ! ad.videos[0].url) return;
		sampleAd4Campaign[cname] = ad;
	});
	const sampleAds = Object.values(sampleAd4Campaign);	

	return (<>
		<Container fluid className="advert-bg">
			<br />
			<Container className="pt-4 pb-5">
				<h4 className="sub-header-font pb-4">The campaign</h4>
				{sampleAds.map(
					ad => <AdvertCard
						key={ad.id}
						ad={ad}
						viewCountProp={viewCount(viewcount4campaign, ad)}
						donationTotal={ndonationValue}
						totalViewCount={totalViewCount}
					/>
				)}
			</Container>
		</Container>
	</>);
};

const AdvertCard = ({ad, viewCountProp, donationTotal, totalViewCount}) => {
	const durationText = ad.start || ad.end ? <>
		This advert ran
		{ ad.start ? <span> from <Misc.RoughDate date={ad.start} /></span> : null}
		{ ad.end ? <span> to <Misc.RoughDate date={ad.end} /></span> : '' }
	</> : '';
	const thisViewCount = viewCountProp || '';

	// Money raised by ad based on viewers
	const moneyRaised = donationTotal * (thisViewCount / totalViewCount);
	const size = isPortraitMobile() ? 'portrait' : 'landscape';

	return (
		<div className="ad-card">
			<GoodLoopAd vertId={ad.id} size={size} nonce={`${size}${ad.id}`} production />
			{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(ad.id)} target='_portal'>Portal Editor</a></small> : null}
			<div className="pt-3 pb-5 mb-2 advert-impact-text" style={{margin: '0 auto'}}>
				<span>{printer.prettyNumber(thisViewCount)} people raised &pound;<Counter sigFigs={4} value={moneyRaised} /> by watching an ad in this campaign</span>
			</div>
		</div>
	);
};

const isAll = () => {
	const slug = DataStore.getValue('location', 'path', 1);
	return slug === 'all';
};


/**
 * @returns {!SearchQuery}
 */
const adsQuery = ({q,adid,vertiserid,via}) => {
	let sq = new SearchQuery(q);
	// NB: convert url parameters into a backend ES query against the Advert.java object
	if (adid) sq = SearchQuery.setProp(sq, 'id', adid);
	if (vertiserid) sq = SearchQuery.setProp(sq, 'vertiser', vertiserid);
	if (via) sq = SearchQuery.setProp(sq, 'via', via);
	return sq;
};
/**
 * 
 * @returns { ? PV<Advert[]>} null if no query
 */
const fetchAds = ({ searchQuery, status }) => {
	let q = searchQuery.query;	
	if ( ! q && ! isAll()) {
		return null;
	}
	// TODO server side support to do this cleaner "give me published if possible, failing that archived, failing that draft"
	// Try to get ads based on spec given in URL params
	let pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});
	// HACK No published ads? fall back to ALL_BAR_TRASH if requested ad is draft-only
	if (pvAds.resolved && ( ! pvAds.value || ! pvAds.value.hits || ! pvAds.value.hits.length)) {
		let pvAdsDraft = ActionMan.list({type: C.TYPES.Advert, status: C.KStatus.ALL_BAR_TRASH, q});
		console.warn(`Unable to find ad ${q} with status ${status}, falling back to ALL_BAR_TRASH`);
		return pvAdsDraft;
	}
	return pvAds;
};

export default CampaignPage;
