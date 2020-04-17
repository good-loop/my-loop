/*
 * 
 */
import React, { memo, useEffect, createRef } from 'react';
import Login from 'you-again';
import _ from 'lodash';
import { Container } from 'reactstrap';
import pivot from 'data-pivot';

import Roles from '../../base/Roles';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import {ListItems} from '../../base/components/ListLoad';
import Footer from '../Footer';
import MyLoopNavBar from '../MyLoopNavBar';
import Money from '../../base/data/Money';
import CampaignPageDC from '../../data/CampaignPage';
import SearchQuery from '../../base/searchquery';
import BS from '../../base/components/BS';
import ACard from '../cards/ACard';
import CharityCard from '../cards/CharityCard';
// import AdvertCard from '../cards/AdvertCard';
import {sortByDate} from '../../base/utils/SortFn';
import Counter from '../../base/components/Counter';
import printer from '../../base/utils/printer';
import publishers from '../../data/PublisherList';
import CSS from '../../base/components/CSS';

const tomsCampaigns = /(josh|sara|ella)/; // For matching TOMS campaign names needing special treatment
/**
 * HACK fix campaign name changes to clean up historical campaigns
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


// SoGive occasionally provides duplicated charity objects, so we check and filter them first.
// TODO: This check shouldn't be here, maybe SoGive can filter its stuff before sending it over?
// NB Also used on adverts for similar reasons
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
		via,
		q = '',
		status = C.KStatus.PUB_OR_ARC,
		landing,
	} = DataStore.getValue(['location', 'params']) || {};
	
	// Is the campaign page being used as a click-through advert landing page?
	// If so, change the layout slightly, positioning the advert video on top.
	const isLanding = (landing !== undefined) && (landing !== 'false');

	// If user is using a mobile device on portrait mode we'll present the appropriate adunit in the AdvertCard
	const isPortraitMobile = window.matchMedia("only screen and (max-width: 768px)").matches && window.matchMedia("(orientation: portrait)").matches;

	let sq = new SearchQuery(q);
	// NB: convert url parameters into a backend ES query against the Advert.java object
	if (adid) sq = SearchQuery.setProp(sq, 'id', adid);
	if (vertiserid) sq = SearchQuery.setProp(sq, 'vertiser', vertiserid);
	if (via) sq = SearchQuery.setProp(sq, 'via', via);
	q = sq.query;
	const slug = DataStore.getValue('location', 'path', 1);
	const all = slug === 'all';
	if ( ! q && ! all) {
		// No query -- show a list
		// TODO better graphic design before we make this list widget public
		if ( ! Login.isLoggedIn()) {
			return <div>Missing: campaign or advertiser ID. Please check the link you used to get here.</div>;
		}
		return <ListItems type={C.TYPES.Advert} servlet='campaign' />;
	}

	// TODO server side support to do this cleaner "give me published if possible, failing that archived, failing that draft"
	// Try to get ads based on spec given in URL params
	let pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});
	if ( ! pvAds.resolved) {
		return <Misc.Loading text='Loading campaign info...' />;
	}
	// No published ads?
	let pvAdsDraft = null; // Be ready to fall back to ALL_BAR_TRASH if requested ad is draft-only
	if (pvAds.resolved && ( ! pvAds.value || ! pvAds.value.hits || ! pvAds.value.hits.length)) {
		pvAdsDraft = ActionMan.list({type: C.TYPES.Advert, status: C.KStatus.ALL_BAR_TRASH, q});
		console.warn(`Unable to find ad ${adid} with status ${status}, falling back to ALL_BAR_TRASH`);
		if ( ! pvAdsDraft.resolved) {
			return <Misc.Loading text='Loading draft campaign info...' />;
		}
	}

	// If it's remotely possible to have an ad now, we have it. Which request succeeded, if any?
	const pvAdsSuccess = [pvAds, pvAdsDraft].find(pv => pv && pv.resolved && pv.value && pv.value.hits);
	let ads = pvAdsSuccess && pvAdsSuccess.value && pvAdsSuccess.value.hits;
	if (ads && ! all) ads = ads.slice(0, 10); // Limit to first 10 results unless we're on #campaign/all
	if ( ! ads || ! ads.length) {
		return <BS.Alert>Could not load adverts for {q} {status}</BS.Alert>; // No ads?!
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
	
	const soloAd = ads.length === 1 ? ads[0] : null;
	// const startDateString = soloAd && soloAd.startDate;
	// const smallPrint = soloAd && soloAd.smallPrint;

	// individual charity data
	let charities = uniqueIds(_.flatten(ads.map(
		ad => ad.charities && ad.charities.list || []
	)));
	let cids = charities.map(x => x.id);

	// Unfortunately need to repeat structure as ActionMan.list does not return a promise
	let sqDon = new SearchQuery();
	for (let i = 0; i < ads.length; i++) {
		sqDon = SearchQuery.or(sqDon, 'vert:' + ads[i].id);
		if (ads[i].campaign) sqDon = SearchQuery.or(sqDon, 'campaign:' + ads[i].campaign);
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
		campaignByName[name] = Object.assign({}, campaignByName[name], ad);
	});

	let campaigns = Object.values(campaignByName);
	// sort by date
	campaigns.sort(sortByDate(ad => ad.end || ad.start));

	// Get ad viewing data
	let pvViewData = DataStore.fetch(['misc', 'views', q], () => {
		// filter to these ads
		let qads = '(vert:'+ads.map(ad => ad.id).join(" OR vert:")+')';
		let filters = {
			dataspace: 'gl',
			q: 'evt:minview AND '+qads // minview vs spend ??
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
	const pubData = pvViewData.value;

	// Array of publisher logos from mockup.
	// TODO: Get proper
	let campaignPublishers = [];
	if (pubData && pubData.by_pub) {
		// for each bucket (ie data on a publisher this campaign ran on)
		pubData.by_pub.buckets.forEach(pBucket => {
			// find the publisher object which matches it
			const pub = publishers.find(thisPub => pBucket.key === thisPub.name);
			if (!pub) return;
			// and render, if found
			campaignPublishers.push(
				<div key={pub.name} className="pb-5 pub-div d-inline-block" style={{width: '33%'}}>
					<img src={pub.branding.logo} alt={pub.name} />
				</div>
			);
		});
	}

	/** Calculates total donations per charity based on percentage available, adding [donation] and [donationPercentage] to the charities object  */ 
	const assignUnsetDonations = () => {
		if ( ! ndonationValue) {
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

	let charitiesById = _.uniq(_.flattenDeep(ads.map(c => c.charities.list)));
	let charIds = [];
	charitiesById.forEach(c => {
		if (!charIds.includes(c.name)) {
			charIds.push(c.name);
		}
	});

	/** Picks one video from each campaign to display as a sample.  */
	const sampleAdFromEachCampaign = () => {
		const campaignNames = {};
		// 1 ad per campaign, no adverts without a valid video
		return uniqueIds(ads).filter((ad) => {
			let cname;
			// HACK FOR TOMS 2019 The normal code returns 5 campaigns where there are 3 synthetic campaign groups
			// Dedupe on "only the first josh/sara/ella campaign" instead
			if (ad.vertiser === 'bPe6TXq8' && ad.campaign.match(tomsCampaigns)) {
				cname = ad.campaign.match(tomsCampaigns)[0];
			} else {
				cname = ad.campaign;
			}

			if ( ! campaignNames[cname] && ad.videos[0].url) {
				campaignNames[cname] = true;
				return true;
			}
			return false;
		});
	};

	// const campaignsObject = () => {
	// 	const campaignNames = pvViewData.value.buckets.reduce
	// };

	// Sum of the views from every ad in the campaign. We use this number for display
	// and to pass it to the AdvertCards to calculate the money raised against the total.
	let totalViewCount = sampleAdFromEachCampaign().reduce((acc, ad) => {
		return acc + viewCount(viewcount4campaign, ad);
	}, 0);

	assignUnsetDonations();

	return (<>
		<MyLoopNavBar brandLogo={branding.logo} logo="/img/new-logo-with-text-white.svg" style={{backgroundColor: brandColor}} />
		<CSS css={campaignPage.advanced && campaignPage.advanced.customcss} />
		<CSS css={branding.customCss} />
		<div className="widepage CampaignPage text-center">
			<SplashCard branding={branding} campaignPage={campaignPage} donationValue={ndonationValue} totalViewCount={totalViewCount} landing={isLanding} adId={adid} />
			<div className="container-fluid" style={{backgroundColor: '#af2009'}}>
				<div className="intro-text">
					<span>
						At {(nvertiser && nvertiser.name) || ads[0].name} we want to give back.
						We work with Good-Loop to put out Ads for Good, and donate money to charity.
						Together with <span className="font-weight-bold">{printer.prettyNumber(totalViewCount, 4)}</span> people
						we've raised funds for the following causes and can't wait to see our positive impact go even further.
						See our impact below.
					</span>
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

			{ campaignPublishers.length ?
				<div className="section pub-container d-flex justify-content-center">
					<div className="header-font text-center pb-5 pl-4 pr-4">This is where you might have seen our campaign</div>
					<div className="text-center">
						{campaignPublishers}
					</div>
				</div> : ''
			}
			
			{ isLanding ? '' : (
				<Container fluid className="advert-bg">
					<br />
					{/* <DemoPlayer vertId={adid} production /> */}
					<Container className="pt-4 pb-5">
						<h4 className="sub-header-font pb-4">The campaign</h4>
						{sampleAdFromEachCampaign().map(
							ad => <AdvertCard
								ad={ad}
								vertId={ad.id}
								size="landscape"
								nonce={`landscape${ad.id}`}
								production
								isPortraitMobile={isPortraitMobile}

								viewCountProp={viewCount(viewcount4campaign, ad)}
								donationTotal={ndonationValue}
								totalViewCount={totalViewCount}
							/>
						)}
					</Container>
				</Container>
			)}
			<Footer />
		</div>
	</>
	);
}; // ./CampaignPage


const AdvertCard = ({ ad, viewCountProp, donationTotal, totalViewCount, isPortraitMobile }) => {
	const durationText = ad.start || ad.end ? (<>
		This advert ran
		{ ad.start ? <span> from {<Misc.RoughDate date={ad.start} />}</span> : null}
		{ ad.end ? <span> to {<Misc.RoughDate date={ad.end} />}</span> : '' }
	</>) : '';
	const thisViewCount = viewCountProp || '';

	// Money raised by ad based on viewers
	const moneyRaised = donationTotal * (thisViewCount / totalViewCount);
	const size = isPortraitMobile ? 'portrait' : 'landscape';

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

// FIXME how does this relate to GoodLoopAd.jsx or GoodLoopUnit.jsx??
const GoodLoopAd = memo(({ vertId, size, nonce, production, social, glParams = { 'gl.play': 'onclick' } }) => {
	let prefix = '';
	if (window.location.hostname.match(/^local/)) prefix = 'local';
	if (window.location.hostname.match(/^test/)) prefix = 'test';
	if (production) prefix = '';

	const glUnitUrl = new URL(`https://${prefix}as.good-loop.com/unit.js`);
	// const fullUnitUrl = glUnitUrl + (vertId ? `?gl.vert=${vertId}&gl.debug=true` : '' );
	if (vertId) glUnitUrl.searchParams.set('gl.vert', vertId);
	Object.entries(glParams).forEach(([key, value]) => {
		glUnitUrl.searchParams.set(key, value);
	});

	let adContainer = createRef();
	let script;

	const createScript = () => {
		script = document.createElement('script');
		script.setAttribute('src', glUnitUrl);
		script.setAttribute('key', `${nonce}-script`);
		return script;
	};

	useEffect(() => {
		adContainer.current.append(createScript());
	}, [nonce]);

	return (
		<div className={`ad-sizer ${size} ${social ? 'slide-in' : ''}`} ref={adContainer} >
			<div className="aspectifier" />
			<div className="goodloopad" data-format={size} data-mobile-format={size} key={nonce + '-container'} />
		</div>
	);
});


const SplashCard = ({ branding, donationValue, adId, landing }) => {
	return (<ACard className="hero">
		<div className='flex-row flex-centre p-1'>
			<img className='hero-logo' src={branding.logo} alt='advertiser-logo' />
		</div>
		{ landing ? <div className="top-advert-player">
			<GoodLoopAd vertId={adId} size="landscape" nonce={`landscape${adId}`} production />
		</div> : '' }
		<div className='sub-header p-1'>
			<div>
				<span>Together our ads for good have raised</span>
			</div>
			{donationValue? <div className='header' style={{color: 'black'}}>&pound;<Counter sigFigs={4} value={donationValue} minimumFractionDigits={2} /></div> : 'money'}
		</div>
	</ACard>);
};


/**
 * TODO link to a part of a page. How do we do this, given that we already use #foo for page nav??
 * TODO move into Misc?
 */
const ScrollTo = ({aName, children}) => {
	let url = window.location+"#"+escape(aName); // TODO modify to include something that will trigger a scroll to the target aName
	return <a href={url}>{children}</a>;
};


export default CampaignPage;
