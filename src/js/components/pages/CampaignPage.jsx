import React from 'react';
import Login from 'you-again';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
// import pivot from 'data-pivot';
import Roles from '../../base/Roles';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import {ListItems} from '../../base/components/ListLoad';
import Footer from '../Footer';
import NavBar from '../MyLoopNavBar';
import { SquareLogo } from '../Image';
import ShareAnAd from '../cards/ShareAnAd';
import NGO from '../../base/data/NGO';
import Money from '../../base/data/Money';
import CampaignPageDC from '../../data/CampaignPage';
import SearchQuery from '../../base/searchquery';
import BS from '../../base/components/BS';
import ACard from '../cards/ACard';
import CharityCard from '../cards/CharityCard';
import AdvertCard from '../cards/AdvertCard';
import {sortByDate} from '../../base/utils/SortFn';
import Counter from '../../base/components/Counter';
import pivot from 'data-pivot';
import CSS from '../../base/components/CSS';

/**
 * HACK fix campaign name changes to clean up historical campaigns
 */
const viewCount = (viewcount4campaign, ad) => {
	if ( ! ad.campaign) return null;
	let vc = viewcount4campaign[ad.campaign];
	if (vc) return vc;

	// HACK TOMS?? ella / josh / sara
	if (ad.vertiser==='bPe6TXq8') {
		let keyword = ad.campaign.includes('sara')? 'sara' : ad.campaign.includes('ella')? 'ella' : 'josh';
		let total = 0;
		Object.keys(viewcount4campaign).filter(c => c.includes(keyword)).forEach(c => total += viewcount4campaign[c]);
		return total;
	}
	return null;
};

/**
 * Expects url parameters: `gl.vert` or `gl.vertiser`
 * TODO support q=flexible query
 * TODO support agency and ourselves! with multiple adverts
 * Split: branding - a vertiser ID, vs ad-params
 */
const CampaignPage = () => {
	// What adverts should we look at?
	let { 'gl.vert': adid, 'gl.vertiser': vertiserid, q='', status=C.KStatus.PUB_OR_ARC } = DataStore.getValue(['location', 'params']) || {};	
	let sq = new SearchQuery(q);
	// NB: convert url parameters into a backend ES query against the Advert.java object
	if (adid) sq = sq.setProp('id', adid);
	if (vertiserid) sq = sq.setProp('vertiser', vertiserid);
	q = sq.query;
	console.log("query", q);

	if ( ! q) {
		// No query -- show a list
		// TODO better graphic design before we make this list widget public
		if ( ! Login.isLoggedIn()) {
			return <div>Missing: campaign or advertiser ID. Please check the link you used to get here.</div>;
		}
		return <ListItems type={C.TYPES.Advert} servlet='campaign' />;		
	}

	let pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});

	if ( ! pvAds.resolved ) {
		return <Misc.Loading text='Loading campaign data...' />;
	}

	let ads = pvAds.value.hits;

	// No ads?!
	if ( ! ads.length) {
		return <BS.Alert>Could not load adverts for {q} {status}</BS.Alert>;
	}

	// console.log(ads)

	// Combine campaign page and branding settings from all ads
	// Last ad wins any branding settings!
	let branding = {};
	let campaignPage = {};
	ads.forEach(ad => Object.assign(branding, ad.branding));
	ads.forEach(ad => Object.assign(campaignPage, ad.campaignPage));
	
	const soloAd = ads.length===1? ads[0] : null;
	const startDateString = soloAd && soloAd.startDate;
	const smallPrint = soloAd && soloAd.smallPrint;

	// SoGive occasionally provides duplicated charity objects, so we check and filter them first.
	// TODO: This check shouldn't be here, maybe SoGive can filter its stuff before sending it over?
	const removeDuplicateCharities = arr => {
		let ids = [];
		return arr.filter(obj => {
			if (ids.includes(obj.id)) { return; }
			ids.push(obj.id);
			return obj;
		});
	};

	// individual charity data
	let charities = removeDuplicateCharities(_.flatten(ads.map(ad => ad.charities.list)));
	let cids = charities.map(x => x.id);

	// Unfortunately need to repeat structure as ActionMan.list does not return a promise
	let sqDon = new SearchQuery();
	for(let i=0; i<ads.length; i++) {
		sqDon = sqDon.or('vert:' + ads[i].id);
		if (ads[i].campaign) sqDon = sqDon.or('campaign:' + ads[i].campaign);
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

	// console.log(pvDonationsBreakdown);

	if ( ! pvDonationsBreakdown.resolved ) {
		return <Misc.Loading text='Loading campaign donations...' />;
	}
	if ( ! pvDonationsBreakdown.value ) {
		// TODO let's refactor this out into a standard error card -- possibly stick it in wwappbase or Misc
		return <div>Error: {pvDonationsBreakdown.error}. Try reloading the page. Contact us if this persists.</div>;
	}

	let campaignTotal = pvDonationsBreakdown.value.total; 
	let donationValue = campaignTotal; // check if statically set and, if not, then update with latest figures
	// Allow the campaign page to override and specify a total
	let campaignTotalViews = pvDonationsBreakdown.value.stats.count;
	console.log(`campaign total views: `, campaignTotalViews);
	let campaignPageDonations = ads.map(ad => ad.campaignPage && CampaignPageDC.donation(ad.campaignPage)).filter(x => x);
	if (campaignPageDonations.length === ads.length) {
		donationValue = Money.sum(campaignPageDonations);
	}
	donationValue = donationValue.value;
	// also the per-charity numbers	
	let donByCid = pvDonationsBreakdown.value.by_cid;

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
	let pvViewData = DataStore.fetch(['misc','views',q], () => {
		// filter to these ads
		let qads = '(vert:'+ads.map(ad => ad.id).join(" OR vert:")+')';
		let filters = { 
			dataspace: 'gl', 
			q: 'evt:minview AND '+qads // minview vs spend ??
		};
		// start = early for all data
		return ServerIO.getDataLogData({filters, breakdowns:['campaign'], start:'2017-01-01', name:'view-data'});
		// return ServerIO.getDonationsData({cid:'ashoka', start: '2017-01-01T00:00:00Z', end: '2019-10-15T23:59:59Z'})
	});

	let viewcount4campaign = {};
	window.viewcount4campaign = viewcount4campaign;
	if (pvViewData.value) {
		window.pivot = pivot; // for debug
		console.log(pvViewData.value);
		viewcount4campaign = pivot(pvViewData.value, "by_campaign.buckets.$bi.{key, doc_count}", "$key.$doc_count");
	}
	
	// TODO: refactor this because it's very similar now to mypage
	return (<>
		<CSS css={campaignPage.advanced && campaignPage.advanced.customcss} />
		<CSS css={branding.customCss} />
		<div className="widepage CampaignPage text-center">
			<NavBar brandLogo={branding.logo} style={{backgroundColor: brandColor}} />
			<div className='avoid-navbar' />

			<SplashCard branding={branding} campaignPage={campaignPage} donationValue={donationValue} />
			
			<div className="charity-card-container clearfix">
				{charities.map( (charity, i) => <CharityCard i={i} key={charity.id} charity={charity} donationValue={donByCid[charity.id]} />)}				
			</div>
			
			<div className="advert-card-container clearfix">
				<div className="pt-5 pb-5">{campaignTotalViews} people watched an ad in this campaign to unlock a donation</div>
				<div className="row justify-content-center mx-auto">
					{campaigns.filter(campaign => campaign.videos[0].url).map( 
						(ad, i) => <AdvertCard key={ad.id} i={i} advert={ad} viewCount={viewCount(viewcount4campaign, ad)} />)}
				</div>
			</div>
		</div>
	</>
	);
}; // ./CampaignPage


const SplashCard = ({branding, campaignPage, donationValue}) => {
	// Use background image given to adunit, or show default image of sand dune 
	const backgroundImage = (campaignPage && campaignPage.bg) || (ServerIO.MYLOOP_ENDPONT + '/img/wheat_fields.jpg');
	return (<ACard className="hero" backgroundImage={backgroundImage}>
		<div className='flex-row flex-centre p-1'>
			<img className='hero-logo' src={branding.logo} alt='advertiser-logo' />
		</div>
		<div className='sub-header p-1 white contrast-text'>
			<div>Together our Ads for Good have raised</div>
			{donationValue? <div className='header' style={{color: 'white'}}>&pound;<Counter value={donationValue} minimumFractionDigits={2} /></div> : 'money'}
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
