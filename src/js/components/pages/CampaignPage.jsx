import React from 'react';
import Login from 'you-again';

// import pivot from 'data-pivot';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import {ListItems} from '../../base/components/ListLoad';
import Footer from '../Footer';
import MDText from '../../base/components/MDText';
import NavBar from '../NavBar';
import { RoundLogo } from '../Image';
import ShareAnAd from '../cards/ShareAnAd';
import {RegisterLink} from '../../base/components/LoginWidget';

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
	const backgroundImage = campaign && campaign.bg;

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
						<div className={backgroundImage ? 'header-block' : ''}>
							<div className='flex-row flex-centre pad1'>
								<img src={brandLogo} style={{width: '10rem', display: 'block'}} />
							</div>
							<div className='sub-header pad1'>
								<div>Together we've raised</div>													
								{donationValue? <div className='header white' style={{color: brandColor || '#000'}}><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
								<div>for</div>
							</div>
							<div className='img-block img-hero' style={{backgroundImage: 'url(' + backgroundImage + ')'}} />
						</div>
						<div className='container-fluid pad1'>
							<div className='row'>
								{
									clist.map( charity => (
										<div className={'col-md-' + 12 / clist.length}>
											<div className='flex-row pad1'>
												<a src={charity.url}>
													<RoundLogo url={charity.logo} />
												</a>
											</div>
											<div className='text-block'>
												<div className='sub-header text-center pad1'> 
													{charity.name}
												</div>
												<MDText source={charity.description} />									
											</div>
										</div>
									))
								}
							</div>
						</div>
						{/* <EmailCTA /> */}
					</div>
				</div>
			</div>
			<div className='container-fluid'>
				{
					Login.isLoggedIn()
					|| (
						<div className='row'> 
							<RegisterLink className='bg-gl-light-grey white sub-header btn btn-gl' style={{backgroundColor: brandColor, borderColor: brandColor}} verb='Sign-Up' />								
						</div>
					)
				}
				<div className='row pad1'>
					<div className='col-md-3' /> 
					<div className='col-md-6'>
						{ ad && ad.videos && ad.videos.length && <ShareAnAd adHistory={{...ad.videos[0], vert: adid}} mixPanelTag='ShareAnAd' color={brandColor} />}
					</div> 
					<div className='col-md-3' /> 				
				</div>
			</div>
			<Footer leftFooter={startDate} rightFooter={smallPrint} />
		</div>
	);
}; // ./CampaignPage

export default CampaignPage;
