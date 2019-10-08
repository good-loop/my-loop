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
	
	let brandColor = branding.color || branding.backgroundColor;
	let brandLogo = branding.logo; 

	// Use background image given to adunit, or show default image of sand dune 
	const backgroundImage = (campaignPage && campaignPage.bg) || (ServerIO.MYLOOP_ENDPONT + '/img/wheat_fields.jpg');

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


	let campaignTotal = pvDonationsBreakdown.value.total; 
	let donationValue = campaignTotal; // check if statically set and, if not, then update with latest figures
	// Allow the campaign page to override and specify a total
	let campaignPageDonations = ads.map(ad => ad.campaignPage && CampaignPageDC.donation(ad.campaignPage)).filter(x => x);
	if (campaignPageDonations.length === ads.length) {
		donationValue = Money.sum(campaignPageDonations);
	}

	// TODO: refactor this because it's very similar now to mypage
	return (
		<div className="page CampaignPage text-center">
			<NavBar brandLogo={brandLogo} style={{backgroundColor: brandColor}} />
			{/* TODO: get rid of old css classes, previous to refactor */}
			<div className='container-fluid'>
				<div className='row'>
					<div className='header-text'>
						<div 
							className='header-block img-block'
							style={{backgroundImage: 'url(' + backgroundImage + ')'}}
						>
							<div className='flex-row flex-centre pad1'>
								<img className='header-logo' src={brandLogo} alt='advertiser-logo' />
							</div>
							<div className='sub-header pad1 white contrast-text'>
								<div>Together our Ads-for-Good have raised</div>
								{donationValue? <div className='header' style={{color: 'white'}}><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
								<div>for</div>
							</div>
						</div>
						<div className='charities-container'>
							{charities.map( charity => <CharityCard key={charity.id} charity={charity} />)}
						</div>
					</div>
				</div>

				<div className='row'>
					TODO campaign info -- a list of the ads run, with some summary stats of date, 
					thumbnail image, number of views

					??group ads by campaign - eg TOMS run the same campaign over a few languages
				</div>

				<div className='row pad1'>
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


const CharityCard = ({charity}) => {
	// fetch extra info from SoGive
	let cid = charity.id;
	if (cid) {
		const pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:charity.id, status:C.KStatus.PUBLISHED});
		let sogiveCharity = pvCharity.value;
		if (sogiveCharity) {		
			// HACK: prefer short description
			if (sogiveCharity.summaryDescription) sogiveCharity.description = sogiveCharity.summaryDescription;
			// merge in SoGive as defaults
			charity = Object.assign({}, sogiveCharity, charity);
			cid = NGO.id(sogiveCharity); // see ServerIO's hacks to handle bad data entry in the Portal
		}
	}

	// If charity has photo, use it. Otherwise use logo with custom colour bg and eliminate name.
	let photo = charity.highResPhoto || charity.images;
	let logo = charity.logo;

	return (
		<div className='charity-card top-pad1 bottom-pad1' key={charity.name}>
			<a className='flex-row charity' href={charity.url} target="_blank" rel="noopener noreferrer"
				style={photo || !charity.color ? {} : {background: charity.color}}
			>
				<SquareLogo url={photo || logo} className={photo? 'contain' : null} />
				<span className='name sub-header pad1 white contrast-text'>
					{photo ? charity.name : ''}
				</span>
			</a>
			<CharityCard2 charity={charity} />
			{Roles.isDev() && cid? <small><a href={'https://app.sogive.org/#simpleedit?charityId='+escape(cid)} target='_sogive'>SoGive</a></small> : null}
		</div>);
};

const CharityCard2 = ({charity}) => {
	// impact data?? e.g. you funded 10 trees <-- This would be best when we can TODO
	if (charity.description) {
		return <div className='charity-description text-block'><ReactMarkdown source={charity.description} /></div>;
	}
	// TODO money donated to this charity??
	return null;
};

export default CampaignPage;
