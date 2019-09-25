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

	// TODO replace with a ServerIO.log method which can abstract what backend we use
	ServerIO.mixPanelTrack({mixPanelTag: 'Campaign page render', data: {adid, vertiserid}});

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

	let branding = {};
	let campaignPage = {};
	// ??last ad wins any branding settings!
	ads.forEach(ad => Object.assign(branding, ad.branding));
	ads.forEach(ad => Object.assign(campaignPage, ad.campaignPage));
	
	let brandColor = branding.color || branding.backgroundColor;
	let brandLogo = branding.logo; 

	// Use background image given to adunit, or show default image of sand dune 
	const backgroundImage = (campaignPage && campaignPage.bg) || (ServerIO.MYLOOP_ENDPONT + '/img/wheat_fields.jpg');

	const soloAd = ads.length===1? ads[0] : null;
	const startDateString = soloAd && soloAd.startDate;
	const smallPrint = soloAd && soloAd.smallPrint;

	// individual charity data
	let charities = _.flatten(ads.map(ad => ad.charities.list));
	let cids = charities.map(x => x.id);

	// Unfortunately need to repeat structure as ActionMan.list does not return a promise
	let sqDon = new SearchQuery();
	for(let i=0; i<ads.length; i++) {
		sqDon = sqDon.or('vert:' + ads[i].id);
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

	// ?? doc - what is this?
	let filteredBreakdown = cids.map(cid => {
		const value100p = (pvDonationsBreakdown.value.by_cid[cid] && 
			pvDonationsBreakdown.value.by_cid[cid].value100p
		) || 0;
		return { cid, value100p };
	});

	let campaignTotal = pvDonationsBreakdown.value.total; 
	let donationValue = campaignPage && campaignPage.donation? campaignPage.donation : campaignTotal; // check if statically set and, if not, then update with latest figures
	
	let charityTotal = filteredBreakdown.reduce((acc, current) => acc + current.value100p, 0);
	
	// TODO campaignSlice is cryptic -- Good that it's documented here. 
	// But better to give this a semantic name, e.g. percentageForCharityID, so its clear elsewhere too.
	let campaignSlice = {}; // campaignSlice is of the form { cid: {percentageTotal: ...} } so as to ensure the correct values are extracted later (checking for cid rather than index)

	filteredBreakdown.forEach(function(obj) {
		const rawFraction = obj.value100p / charityTotal || 0; 
		campaignSlice[obj.cid] = {percentageTotal: Math.round(rawFraction*100)}; 
	});

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
								<div>Together we've raised</div>
								{donationValue? <div className='header' style={{color: brandColor || '#000'}}><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
								<div>for</div>
							</div>
						</div>
						<div className='charities-container'>
							{charities.map( charity => <CharityCard key={charity.id} charity={charity} />)}
						</div>
					</div>
				</div>
			</div>
			<div className='container-fluid'>
				<div className='row pad1'>
					<div className='col-md-2' /> 
					<div className='col-md-8'>
						{ads.length && ads[0].videos && ads[0].videos.length 
							&& <ShareAnAd adHistory={{...ads[0].videos[0], vert: adid}} mixPanelTag='ShareAnAd' color={brandColor} />
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
	const pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:charity.id, status:C.KStatus.PUBLISHED});
	let sogiveCharity = pvCharity.value;
	let cid = charity.id;
	if (sogiveCharity) {		
		// HACK: prefer short description
		if (sogiveCharity.summaryDescription) sogiveCharity.description = sogiveCharity.summaryDescription;
		// merge in SoGive as defaults
		charity = Object.assign({}, sogiveCharity, charity);
		cid = NGO.id(sogiveCharity); // see ServerIO's hacks to handle bad data entry in the Portal
	}
	let photo = charity.highResPhoto || charity.images;

	return (
		<div className='charity-card top-pad1 bottom-pad1' key={charity.name}>
			<a className='flex-row charity' href={charity.url} target="_blank" rel="noopener noreferrer">
				<SquareLogo url={photo} />
				<span className='name sub-header pad1 white contrast-text'>
					{charity.name}
				</span>
			</a>
			<div className='charity-description text-block'>
				<ReactMarkdown source={charity.description} />
			</div>
			{Roles.isDev()? <small><a href={'https://app.sogive.org/#simpleedit?charityId='+escape(cid)} target='_sogive'>SoGive</a></small> : null}
		</div>);
};

export default CampaignPage;
