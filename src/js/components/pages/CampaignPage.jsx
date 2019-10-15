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
import NavBar from '../NavBar';
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
	let campaignPageDonations = ads.map(ad => ad.campaignPage && CampaignPageDC.donation(ad.campaignPage)).filter(x => x);
	if (campaignPageDonations.length === ads.length) {
		donationValue = Money.sum(campaignPageDonations);
	}
	// also the per-charity numbers	
	let donByCid = pvDonationsBreakdown.value.by_cid;

	let brandColor = branding.color || branding.backgroundColor;

	// Group ads by campaign
	let campaignByName = {};
	ads.forEach(ad => {
		let name = ad.campaign || ad.id;
		campaignByName[name] = Object.assign({}, campaignByName[name], ad);
	});
	let campaigns = Object.values(campaignByName);
	// sort by date
	campaigns.sort(sortByDate(ad => ad.end || ad.start));

	// TODO: refactor this because it's very similar now to mypage
	return (
		<div className="widepage CampaignPage text-center">
			<NavBar brandLogo={branding.logo} style={{backgroundColor: brandColor}} />
			{/* TODO: get rid of old css classes, previous to refactor */}
			<div>
				<SplashCard branding={branding} campaignPage={campaignPage} donationValue={donationValue} />
				
				{charities.map( charity => <CharityCard key={charity.id} charity={charity} donationValue={donByCid[charity.id]} />)}				

				{campaigns.map(ad => <AdvertCard key={ad.id} advert={ad} />)}

				{/* This may become redundant ??remove? */}
				<div className='row p-1'>
					<div className='col-md-2' /> 
					<div className='col-md-8'>
						{ads.length && ads[0].videos && ads[0].videos.length 
							&& <ShareAnAd adid={ads[0].id} color={brandColor} />
						}
					</div> 
					<div className='col-md-2' />
				</div>

			</div>
			<Footer leftFooter={startDateString} rightFooter={smallPrint} />
		</div>
	);
}; // ./CampaignPage


const SplashCard = ({branding, campaignPage, donationValue}) => {
	// Use background image given to adunit, or show default image of sand dune 
	const backgroundImage = (campaignPage && campaignPage.bg) || (ServerIO.MYLOOP_ENDPONT + '/img/wheat_fields.jpg');
	return (<ACard backgroundImage={backgroundImage}>
		<div className='flex-row flex-centre p-1'>
			<img className='header-logo' src={branding.logo} alt='advertiser-logo' />
		</div>
		<div className='sub-header p-1 white contrast-text'>
			<div>Together our Ads-for-Good have raised</div>
			{donationValue? <div className='header' style={{color: 'white'}}><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
			<div>for</div>
		</div>
	</ACard>);

		// <div className='header-text'>
		// 	<div 
		// 		className='header-block img-block'
		// 		style={{backgroundImage: 'url(' + backgroundImage + ')'}}
		// 	>
		// 	<div className='container-fluid'></div>
		// 		<div className='flex-row flex-centre p-1'>
		// 			<img className='header-logo' src={branding.logo} alt='advertiser-logo' />
		// 		</div>
		// 		<div className='sub-header p-1 white contrast-text'>
		// 			<div>Together our Ads-for-Good have raised</div>
		// 			{donationValue? <div className='header' style={{color: 'white'}}><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
		// 			<div>for</div>
		// 		</div>
		// 	</div>
		// </div>);
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
