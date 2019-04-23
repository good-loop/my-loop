import React, {useEffect, useState} from 'react';
import { encURI } from 'wwutils';
// import pivot from 'data-pivot';
import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Money from '../base/data/Money';
import Misc from '../base/components/Misc';
import ActionMan from '../plumbing/ActionMan';
import {ListItems, ListFilteredItems} from '../base/components/ListLoad';
import Footer from './Footer';
import MDText from '../base/components/MDText';
import PropControl from '../base/components/PropControl';
import { SocialMediaShareWidget } from './SocialLinksWidget';
import NavBar from './NavBar';
import OptimisedImage, { RoundLogo } from './Image';
import ShareAnAd from './ShareAnAd';

const DonationSlideWidget = ({active, name, logo, description, hideImpactData, id}) => {	
	// This data will never be used outside of this component, so I have chosen to manage state locally
	// impactData is actually the "projects" field in SoGive data
	const [impactData, setImpactData] = useState([]);
	// Think what we need to do is call setImpactData on ServerIO callback
	useEffect(() => {
		if( !hideImpactData ) {
			ServerIO.getDataItem({type: 'NGO', id, status: 'PUBLISHED'})
				// Grab projects, but ignore any results that do not contain a "costPerBeneficiary" field
				// Will give a blank array if none are found
				.then(res => 
					res 
					&& res.cargo 
					&& res.cargo.projects 
					&& setImpactData(
						res.cargo.projects
							.reduce( (out, data) => data.outputs && data.outputs.length > 0 ? [...out, ...data.outputs] : out, [])
							.filter( data => data.costPerBeneficiary )
					));
		}
	}, [id]);

	// is the item currently active (aka show in carousel)
	let itemClass = active ? 'item active' : 'item';

	// if there's no chty title or logo, we shouldn't show the slide in the carousel
	if (!name && !logo) {
		return null;
	}

	// Layout changes based on whether or not image has been provided for each charity
	return (
		<div className={itemClass}>
			<div className='container-fluid'>
				<div className='flex row'>
					<div className='col-md-1' />
					<div className='col-md-5 flex-column'>
						<div className="slide-header">
							<div className="col-md-3" />
							<div className="col-md-6 slide-title h3">
								{name}
							</div>	
						</div>
						<div className="slide-desc">
							<MDText source={description} />
							{
								impactData.map( data => (
									<MDText key={data} source={`**Average cost: ${Money.CURRENCY[data.costPerBeneficiary.currency] || ''}${data.costPerBeneficiary.value} per ${data.name || 'unit'} **`} />
								))
							}
						</div>		
					</div>
					<div className='col-md-4 slide-photo margin-auto'>
						<RoundLogo url={logo} />
					</div>
					<div className='col-md-2' />
				</div>
			</div>
		</div>
	);
};

/**
 *
 * connect with us by email 
 */
// NB: code was copy-pasted from adunit. But it will diverge.
const EmailCTA = () => {
	// Will name-space by ad or vertiser id
	const { 'gl.vert': adid, 'gl.vertiser': vertiserid } = DataStore.getValue(['location', 'params']) || {};

	const path = ['widget', 'CampaignPage'].concat(adid || vertiserid);
	const emailPath = path.concat('email');
	const submittedPath = path.concat('submitted');

	// Check cookies to see if user has already submitted an email here or via the adunit
	// Only need to check this once
	DataStore.fetch(submittedPath, () => {
		// TODO replace with js-cookie here
		const cookies = document.cookie;
		return cookies.split(';').filter( item => item.includes('cta-email=email')).length;
	});

	const email = DataStore.getValue(emailPath);
	const submitted = DataStore.getValue(submittedPath);


	const emailSubmit = () => {
		// Don't submit a blank form
		if ( !email ) return;

		// Pass to profiler for processing
		ServerIO.post(ServerIO.PROFILER_ENDPOINT + '/form/gl/', { email })
			.then( () => {
				// Don't ask for their email again
				document.cookie = `cta-email=email;max-age=${60 * 60 * 24 * 365};domain=.good-loop.com;path=/`;
				DataStore.setValue(submittedPath, true);
			});
	};

	if (submitted) return <div className="cta-email">Thank you for providing your email address!</div>;

	return (
		<div className="cta-email">
			<p className="cta-lead"><span>Double your donation by joining<br/> Good-Loop's mailing list</span></p>
			<div className="input-group">
				<PropControl path={path} prop='email' type='email' placeholder="Email address" />
				<span className="input-group-addon sign-up-btn" id="basic-addon2" onClick={emailSubmit}>Sign Up</span> 
			</div>
			<p className="cta-help">You can unsubscribe at any time. We will not share your email. 
				<span> <a href="https://my.good-loop.com" target="_blank">more info</a></span>
			</p>
		</div>
	);
}; // ./connect

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

	// Only pull vertiser data if no adid has been provided
	let adPv;
	if( adid ) {
		adPv = ActionMan.getDataItem({type:C.TYPES.Advert, id, status:C.KStatus.DRAFT, domain: ServerIO.PORTAL_DOMAIN});
	} else {
		// find out whether the vertiser has just 1 ad, if so then just redirect them to the campaign page of that ad
		let pvItems = ActionMan.list({type: C.TYPES.Advert, status:C.KStatus.ALL_BAR_TRASH, q:id }); 
		let adItems = pvItems.value && pvItems.value.hits && pvItems.value.hits.length;
		// if there's have more than 1 ad, then list them
		if (adItems > 1) {
			return <ListFilteredItems type={C.TYPES.Advert} status={C.KStatus.PUBLISHED} servlet='campaign' q={id}/>;		
		}
		// if there's just 1, then it's easy 
		adPv = pvItems;
	}

	if ( ! adPv.resolved ) {
		return <Misc.Loading text='Loading campaign data...' />;
	}
	// Assume we have data for single advert if adid exists
	// Pull out first advert from advertiser data if not
	let ad = adid ? adPv.value : ( adPv.value && adPv.value.hits && adPv.value.hits[0] );

	// good-loop branding
	let glColorBgStyle = {
		color: 'white'
	};

	let {branding={}} = ad;
	// default styling if adv branding is not there 

	let brandColor = branding.color || branding.backgroundColor || (ad.mockUp && ad.mockUp.backgroundColor);
	let brandLogo = branding.logo; 

	// campaign data
	let campaign = ad && ad.campaignPage;
	let startDate = ad.start ? 'This campaign started on '.concat(ad.start.substring(0, 10)) : '';
	let smallPrint = null;

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

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget','CampaignPage','communityTotal', id], () => {
		// TODO campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
		// Argh: Loop.Me have not logged vert, only campaign.
		// but elsewhere vert is logged and not campaign.
		// let q = ad.campaign? '(vert:'+adid+' OR campaign:'+ad.campaign+')' : 'vert:'+adid;		
		let q = 'vert:'+id;
		// TODO "" csv encoding for bits of q (e.g. campaign might have a space)
		return ServerIO.getDonationsData({q});		
	});

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
		<div className="page MyPage">
			<NavBar brandLogo={brandLogo} style={{backgroundColor: brandColor}} />
			{/* TODO: get rid of old css classes, previous to refactor */}
			<div className='container-fluid'>
				<div className='row'>
					<div className='header-text'>
						<div className='flex-row flex-centre bottom-pad1'>
							<img className='margin-auto' src={brandLogo} style={{width: '10rem', display: 'block'}} />
						</div>
						<div className='sub-header pad1'>
							<div>Together we've raised</div>													
							{donationValue? <div className='header' style={{color: brandColor}}><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
							<div>for</div>
						</div>
						<div className='container-fluid pad1'>
							<div className='row'>
								<div className='col-md-4'>
									<div className='flex-row pad1'>
										<a className='margin-auto' src={clist[0].url}>
											<RoundLogo url={clist[0].logo} />
										</a>
									</div>
									<div className='margin-auto text-block'>
										<div className='sub-header text-center pad1'> 
											{clist[0].name}
										</div>
										<MDText source={clist[0].description} />									
									</div>
								</div>
								<div className='col-md-4'>
									<div className='flex-row pad1'>
										<a className='margin-auto' src={clist[1].url}>
											<RoundLogo url={clist[1].logo} />
										</a>
									</div>
									<div className='margin-auto text-block'>
										<div className='sub-header text-center pad1'> 
											{clist[1].name}
										</div>
										<MDText source={clist[1].description} />
									</div>
								</div>
								<div className='col-md-4'>
									<div className='flex-row pad1'>
										<a className='margin-auto' src={clist[2].url}>
											<RoundLogo url={clist[2].logo} />
										</a>
									</div>
									<div className='margin-auto text-block'>
										<div className='sub-header text-center pad1'> 
											{clist[2].name}
										</div>
										<MDText source={clist[2].description} />
									</div>
								</div>	
							</div>
						</div>
						{/* <EmailCTA /> */}
					</div>
				</div>
			</div>
			<div className='container-fluid'>
				<div className='row pad1'>
					<div className='col-md-3' /> 
					<div className='col-md-6'>
						{ ad && ad.videos && ad.videos.length && <ShareAnAd adHistory={{...ad.videos[0], vert: adid}} mixPanelTag='ShareAnAd' color={brandColor} />}
					</div> 
					<div className='col-md-3' /> 				
				</div>
			</div>
			<Footer className='background-gl-red' leftFooter={startDate} rightFooter={smallPrint} style={{backgroundColor: brandColor}} />
		</div>
	);
}; // ./CampaignPage

export default CampaignPage;
