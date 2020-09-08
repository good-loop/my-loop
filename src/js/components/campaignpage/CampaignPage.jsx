/*
 * 
 */
import React, { Fragment, useState } from 'react';
import Login from 'you-again';
import _ from 'lodash';
import { Container, Alert } from 'reactstrap';
import pivot from 'data-pivot';
import PV from 'promise-value';

import Roles from '../../base/Roles';
import { isPortraitMobile, sum, isMobile } from '../../base/utils/miscutils';
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
import Charities from './Charities';
import { sortByDate } from '../../base/utils/SortFn';
import Counter from '../../base/components/Counter';
import printer from '../../base/utils/printer';
import CSS from '../../base/components/CSS';
import GoodLoopAd from './GoodLoopAd';
import PublishersCard from './PublishersCard';
import CampaignSplashCard from './CampaignSplashCard';
import ErrorAlert from '../../base/components/ErrorAlert';
import ListLoad from '../../base/components/ListLoad';
import DevLink from './DevLink';
import {LoginLink} from '../../base/components/LoginWidget';
import ShareButton from '../ShareButton';


const campaignPdfs = {
	collectivecampaign : '/resources/Good-loop_H&M_campaign.pdf'
};
/**
 * HACK hard-coded list of campaigns which have PDF versions
 * TODO put this in portal or somewhere else
 * @param {Campaign} campaign 
 */
const pdfLookup = (campaign) => campaignPdfs[campaign];

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
	const sq = adsQuery({ q, adid, vertiserid, via });
	let pvAds = fetchAds({ searchQuery: sq, status });
	if (!pvAds) {
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
	let ads = pvAds.value.hits;
	if (!ads || !ads.length) {
		return <Alert>Could not load adverts for {sq.query} {status}</Alert>; // No ads?!
	}

	// Get the advertiser's name (TODO append to advert as vertiserName)
	const pvVertiser = ActionMan.getDataItem({ type: C.TYPES.Advertiser, id: ads[0].vertiser, status: C.KStatus.PUBLISHED });
	const nvertiser = pvVertiser.value;

	// Combine campaign page and branding settings from all ads
	// Vertiser branding wins, ad branding fallback, last ad wins
	let branding = {};
	let campaignPage = {};
	let useVertiser = true;
	if (!nvertiser) {
		useVertiser = false;
	} else if (!nvertiser.branding) {
		useVertiser = false;
	} else if (!nvertiser.branding.logo) {
		useVertiser = false;
	}
	ads.forEach(ad => Object.assign(branding, (useVertiser ? nvertiser.branding : ad.branding)));
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
	let pvDonationsBreakdown = DataStore.fetch(['widget', 'CampaignPage', 'communityTotal', sqDon.query], () => {
		// TODO campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
		// Argh: Loop.Me have not logged vert, only campaign.
		// but elsewhere vert is logged and not campaign.
		// let q = ad.campaign? '(vert:'+adid+' OR campaign:'+ad.campaign+')' : 'vert:'+adid;
		// TODO "" csv encoding for bits of q (e.g. campaign might have a space)
		return ServerIO.getDonationsData({ q: sqDon.query });
	}, true, 5 * 60 * 1000);

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

	// PDF version of page
	let pdf = null;

	// Group ads by campaign {String: Advert}
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
	let pvViewData = DataStore.fetch(['misc', 'views', isAll() ? 'all' : sq.query], () => {
		// filter to these ads
		let qads = ads.map(({ id }) => `vert:${id}`).join(' OR ');
		let filters = {
			dataspace: 'gl',
			q: `evt:minview AND (${qads})` // minview vs spend ??
		};
		// start = early for all data
		return ServerIO.getDataLogData({ filters, breakdowns: ['campaign', 'pub'], start: '2017-01-01', name: 'view-data' });
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
				return { ...char, donation: Math.floor(ndonByCid[char.id].value) };
			} return char;
		});

		charities = charities.filter(c => c.donation); // Get rid of charities with no logged donations.
		const donationTotalMinusUnset = Object.values(charities).reduce((t, { donation }) => t + donation, 0);
		charities = charities.map(e => {
			const percentage = e.donation * 100 / donationTotalMinusUnset;
			const calculatedDonation = percentage * ndonationValue / 100;
			return { ...e, donation: calculatedDonation, donationPercentage: percentage };
		});
	};

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
	let totalViewCount = 0;
	{
		const ad4c = {};
		ads.forEach(ad => ad4c[campaignNameForAd(ad)] = ad);
		let ads1perCampaign = Object.values(ad4c);
		let views = ads1perCampaign.map(ad => viewCount(viewcount4campaign, ad));
		totalViewCount = sum(views);
	}

	// Get name of advertiser from nvertiser if existing, or ad if not
	const nvertiserName = (nvertiser && nvertiser.name) || ads[0].name;
	const nvertiserNameNoTrail = nvertiserName.replace(/\'s$/g, "");

	let shareButtonMeta = {
		title: nvertiserNameNoTrail + "'s Good-Loop Impact - My-Loop",
		image: campaignPage.bg ? campaignPage.bg : "https://testmy.good-loop.com/img/redcurve.svg",
		description: "See " + nvertiserNameNoTrail + "'s impact from Good-Loop ethical advertising"
	}

	assignUnsetDonations();

	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" logoScroll="/img/new-logo-with-text.svg"/>
		<CSS css={campaignPage && campaignPage.customCss} />
		<CSS css={branding.customCss} />
		<div className="widepage CampaignPage text-center gl-btns">
			<CampaignSplashCard branding={branding} shareMeta={shareButtonMeta} pdf={pdf} campaignPage={campaignPage} donationValue={ndonationValue} totalViewCount={totalViewCount} landing={isLanding} adId={adid} />

			<HowDoesItWork nvertiserName={nvertiserName} />

			{isLanding ? null : (
				<AdvertsCatalogue
					ads={ads}
					viewcount4campaign={viewcount4campaign}
					ndonationValue={ndonationValue}
					nvertiserName={nvertiserName}
					totalViewCount={totalViewCount}
				/>
			)}

			<Charities charities={charities} />

			<div className="bg-white">
				<Container>
					<h2 className="my-5">Where can you see our ads?</h2>
					<p className="w-60 mx-auto">Good-Loop distributes ethical online ads to millions of people every month in premium websites across the world’s best publishers and social platforms.</p>
				</Container>
				{isMobile() ?
					<img src="/img/Graphic_metro_mobile.800w.png" className="w-100" alt="publishers" />
					:
					<img src="/img/Graphic_metro.1920w.png" className="w-100" alt="publishers" />
				}
			</div>

			<div className="bg-gl-light-red">
				<Container className="py-5 text-white">
					<div className="pt-5" />
					<h2 className="text-white">Join the revolution and support ads<br />that make a difference</h2>
					<p className="py-5">Help us do even more good in the world! All you have to do is sign up with your email or social account. This will help us boost the donations you generate by seeing our ads.</p>
					<div className="py-5 w-50 row mx-auto">
						<div className="col-md">
							<LoginLink><div className="btn btn-secondary w-100">Sign up</div></LoginLink>
						</div>
						<div className="col-md">
							<ShareButton className="btn-transparent btn-white w-100 mt-3 mt-md-0" meta={shareButtonMeta} url={window.location.href}>Share the love</ShareButton>
						</div>
					</div>
					<div className="pb-5" />
				</Container>
			</div>

			<div className="bg-gl-light-pink">
				<Container className="py-5">
					<div className="pt-5" />
					<h2>Are you a brand or an agency?</h2>
					<p className="py-5">Company website: <a href="http://www.good-loop.com">www.good-loop.com</a><br />Email: <b>hello@good-loop.com</b></p>
					<div className="py-5 flex-column flex-md-row justify-content-center">
						<a className="btn btn-primary mr-md-3" target="_blank" href="https://www.good-loop.com/contact">Book a call</a>
						{pdf ? <a className="btn btn-transparent mt-3 mt-md-0" href={pdf}>Download pdf version</a> : null}
					</div>
					<div className="pb-5" />
				</Container>
			</div>

			{campaignPage.smallPrint ? (
				<div className="small-print"><small>{campaignPage.smallPrint}</small></div>
			) : null}

			<Footer />
		</div>
	</>
	);
}; // ./CampaignPage

/**
 * @param {!Advert} ad 
 * @returns {!string} Can be "unknown" to fill in for no-campaign odd data items
 */
const campaignNameForAd = ad => {
	if ( ! ad.campaign) return "unknown";
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
	const nvertiserNamePoss = nvertiserName.replace(/s?$/, match => ({ s: 's\''}[match] || '\'s'));
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
		</div>
	);
};

/**
 * List of adverts with some info about them (like views, dates)
 * @param {*} param0 
 */
const AdvertsCatalogue = ({ ads, viewcount4campaign, ndonationValue, nvertiserName, totalViewCount }) => {

	const [selected, setSelected] = useState(0);

	/** Picks one Ad (with a video) from each campaign to display as a sample.  */
	let sampleAd4Campaign = {};
	ads.forEach(ad => {
		let cname = campaignNameForAd(ad);
		if (sampleAd4Campaign[cname]) {
			// Prioritise ads with a start and end time attached
			let startProvided = !sampleAd4Campaign[cname].start && ad.start;
			let endProvided = !sampleAd4Campaign[cname].end && ad.end;
			// If the ad cannot provide a new value for start or end, skip it
			if (!startProvided && !endProvided)
				return;
		}
		if (!ad.videos || !ad.videos[0].url) return;
		sampleAd4Campaign[cname] = ad;
	});

	const sampleAds = Object.values(sampleAd4Campaign);
	const selectedAd = sampleAds[selected];

	let views = viewCount(viewcount4campaign, selectedAd);
	
	if (sampleAds.length > 1)
		views = totalViewCount;

	views = printer.prettyNumber(views);

	return (<>
		<Container className="py-5">
			<h2>Watch the {nvertiserName} ad{sampleAds.length > 1 ? "s" : ""} that raised <Counter currencySymbol="£" sigFigs={4} value={ndonationValue} minimumFractionDigits={2} /> with<br />{views} ad viewers</h2>
			<AdvertCard
				ad={selectedAd}
				viewCountProp={views}
				donationTotal={ndonationValue}
				totalViewCount={totalViewCount}
			/>
			{sampleAds.length > 1 &&
				<div className="row justify-content-center">
					{sampleAds.map((ad, i) =>
						<AdvertPreviewCard
							key={i}
							ad={ad}
							selected={selectedAd == ad}
							handleClick={() => setSelected(i)}
						/>
					)}
				</div>
			}
			<br/>
			<a className="btn btn-primary mb-3 mb-md-0 mr-md-3" href="/">See all campaigns</a>
			{//<a className="btn btn-transparent" href="TODO">Campaign performance & brand study</a>
			}
		</Container>
	</>);
};

const AdvertCard = ({ ad }) => {

	const size = isPortraitMobile() ? 'mobile' : 'landscape';

	return (
		<div>
			<div className="ad-card">
				<div className="tablet-container">
					<img src="/img/redcurve.svg" className="tablet-bg w-100 h-100"/>
					<div className="tablet-ad-container">
						<GoodLoopAd vertId={ad.id} size={size} nonce={`${size}${ad.id}`} production />
					</div>
				</div>
				{isPortraitMobile() ?
					<img src="/img/hiclipart.com.mobile.cropped.overlay.png" className="w-100 tablet-overlay" />
					:
					<img src="/img/hiclipart.com.overlay.png" className="w-100 tablet-overlay" />
				}
			</div>
			{Roles.isDev() ? <DevLink href={'https://portal.good-loop.com/#advert/' + escape(ad.id)} target="_portal">Portal Editor</DevLink> : null}
		</div>
	);
};

const AdvertPreviewCard = ({ad, handleClick, selected=false}) => {
	let size = 'landscape';
	
	// Show when the campaign ran
	// Fallback to ad creation date
	const durationText = ad.start || ad.end ? <span>
		{ ad.start ? <Misc.RoughDate date={ad.start} /> : ''}
		{ ad.start && ad.end ? ' - ' : null}
		{ad.end ? <Misc.RoughDate date={ad.end} /> : ''}
	</span> : <span>
		{ <Misc.RoughDate date={ad.created} /> }
	</span>;

	return (
		<div className="col-md-3 col-6">
			<div onClick={e => {e.preventDefault(); handleClick()}} className={"pointer-wrapper" + (selected ? " selected" : "")}>
				<div className="ad-prev">
					<GoodLoopAd vertId={ad.id} size={size} nonce={`${size}${ad.id}`} production />
				</div>
			</div>
			<div>
				{durationText}
			</div>
		</div>
	);
}

const isAll = () => {
	const slug = DataStore.getValue('location', 'path', 1);
	return slug === 'all';
};


/**
 * @returns {!SearchQuery}
 */
const adsQuery = ({ q, adid, vertiserid, via }) => {
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
