import React from 'react';
import Login from 'you-again';
import ReactMarkdown from 'react-markdown';

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

/**
 * Expects url parameters: `gl.vert` or `gl.vertiser`
 */
const CampaignPage = () => {
	const { 'gl.vert': adid, 'gl.vertiser': vertiserid } = DataStore.getValue(['location', 'params']) || {};

	// Specific adid gets priority over advertiser id
	const id = adid || vertiserid;

	ServerIO.mixPanelTrack({mixPanelTag: 'Campaign page render', data: {adid, vertiserid}});

	if ( !adid && !vertiserid ) {
		// No ID -- show a list
		// TODO better graphic design before we make this list widget public
		if ( ! Login.isLoggedIn()) {
			return <div>Missing: campaign or advertiser ID. Please check the link you used to get here.</div>;
		}
		return <ListItems type={C.TYPES.Advert} status={C.KStatus.PUBLISHED} servlet='campaign' />;		
	}

	let adPv;

	adPv = adid
		? ActionMan.getDataItem({type: C.TYPES.Advert, id, status:C.KStatus.DRAFT, domain: ServerIO.PORTAL_DOMAIN})
		: ActionMan.list({type: C.TYPES.Advert, status:C.KStatus.ALL_BAR_TRASH, q:id });

	if ( ! adPv.resolved ) {
		return <Misc.Loading text='Loading campaign data...' />;
	}
	// Assume we have data for single advert if adid exists
	// Pull out first advert from advertiser data if not
	let ad = (adid ? adPv.value : ( adPv.value && adPv.value.hits && adPv.value.hits[0] )) || {};

	let branding = ad.branding || {};
	// default styling if adv branding is not there 

	let brandColor = branding.color || branding.backgroundColor || (ad.mockUp && ad.mockUp.backgroundColor);
	let brandLogo = branding.logo; 

	// campaign data
	let campaign = ad && ad.campaignPage;
	let startDate = ad.start ? 'This campaign started on '.concat(ad.start.substring(0, 10)) : '';
	let smallPrint = null;

	// Use background image given to adunit, or show default image of sand dune 
	const backgroundImage = (campaign && campaign.bg) || (ServerIO.MYLOOP_ENDPONT + '/img/wheat_fields.jpg');

	if(campaign) {
		smallPrint = campaign.smallPrint || '';
	}

	// if there is no charity data, tell the user
	// TODO: do we want to deal with this in a more elegant way?
	if (!ad.charities) {
		return <span>Cannot find charity data</span>;	
	}

	// individual charity data
	let clist = ad.charities.list;
	let cids = clist.map(x => x.id);

	// Unfortunately need to repeat structure as ActionMan.list does not return a promise
	let q = adid 
		? 'vert:' + id
		: adPv.value.hits.reduce( (query, vert) => query += 'vert:' + vert.id + ' OR ', '');

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget','CampaignPage','communityTotal', id], () => {
		// TODO campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
		// Argh: Loop.Me have not logged vert, only campaign.
		// but elsewhere vert is logged and not campaign.
		// let q = ad.campaign? '(vert:'+adid+' OR campaign:'+ad.campaign+')' : 'vert:'+adid;		
		// TODO "" csv encoding for bits of q (e.g. campaign might have a space)
		return ServerIO.getDonationsData({q});		
	}, true, 5*60*1000);

	if ( ! pvDonationsBreakdown.resolved ) {
		return <Misc.Loading text='Loading campaign donations...' />;
	}

	let filteredBreakdown = cids.map(cid => {
		const value100p = (pvDonationsBreakdown.value.by_cid[cid] && 
			pvDonationsBreakdown.value.by_cid[cid].value100p
		) || 0;
		return { cid, value100p };
	});

	let campaignTotal = pvDonationsBreakdown.value.total; 
	let donationValue = campaign && campaign.donation? campaign.donation : campaignTotal; // check if statically set and, if not, then update with latest figures
	
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
							{clist.map( charity => <CharityCard key={charity.id} charity={charity} />)}
						</div>
					</div>
				</div>
			</div>
			<div className='container-fluid'>
				<div className='row pad1'>
					<div className='col-md-2' /> 
					<div className='col-md-8'>
						{ ad && ad.videos && ad.videos.length 
							&& <ShareAnAd adHistory={{...ad.videos[0], vert: adid}} mixPanelTag='ShareAnAd' color={brandColor} />
						}
					</div> 
					<div className='col-md-2' />
				</div>
			</div>
			<Footer leftFooter={startDate} rightFooter={smallPrint} />
		</div>
	);
}; // ./CampaignPage


const CharityCard = ({charity}) => {
	// fetch extra info from SoGive
	console.log(charity);
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
				<SquareLogo url={photo || logo} className={photo ? '' : 'contain'} />
				<span className='name sub-header pad1 white contrast-text'>
					{photo ? charity.name : ''}
				</span>
			</a>
			<div className='charity-description text-block'>
				<ReactMarkdown source={charity.description} />
			</div>
			{Roles.isDev() && cid? <small><a href={'https://app.sogive.org/#simpleedit?charityId='+escape(cid)} target='_sogive'>SoGive</a></small> : null}
		</div>);
};

export default CampaignPage;
