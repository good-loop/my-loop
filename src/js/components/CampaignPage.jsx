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
import { SocialMediaGLFooterWidget, SocialMediaFooterWidget, SocialMediaShareWidget } from './SocialLinksWidget';
import NavBar from './NavBar';
import CardAccordion, { Card } from '../base/components/CardAccordion';
import OptimisedImage from './Image';
import OnboardingCardMini from './OnboardingCardMini';
import SocialMediaCard from './SocialMediaCard';
import ShareAnAd from './ShareAnAd';

const DonationSlideWidget = ({active, name, logo, logo_white, highResPhoto, photo, txtColor, description, hideImpactData, id}) => {	
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

	let slideStyle = {
		color: txtColor || 'white',
	};

	// is the item currently active (aka show in carousel)
	let itemClass = active ? 'item active' : 'item';

	// if there's no chty title or logo, we shouldn't show the slide in the carousel
	if (!name && !logo) {
		return null;
	}

	// Layout changes based on whether or not image has been provided for each charity
	return (
		<div className={itemClass} style={slideStyle}>
			<div className='container-fluid'>
				<div className='flex row'>
					<div className='col-md-1' />
					<div className='col-md-5 flex-column'>
						<div className="slide-header">
							<div className="col-md-3" />
							<div className="col-md-6 slide-title h3" style={slideStyle}>
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
						<DonationCircleWidget highResPhoto={highResPhoto} photo={photo} logo={logo} logo_white={logo_white} />
					</div>
					<div className='col-md-2' />
				</div>
			</div>
		</div>
	);
};

const DonationCircleWidget = ({cparent, id, name, highResPhoto, photo, logo, logo_white, campaignSlice, pos='left'}) => (
	<div 
		className={'circle flex-vertical-align ' + pos} 
		style={{
			background: `url(${highResPhoto || photo || logo || logo_white})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center center',
			backgroundRepeat: 'no-repeat'
		}}
	>
		{cparent &&
			<div className="circle-info">
				<p>
					<span>
						{campaignSlice[id]['percentageTotal']}%
					</span>
					<br /> 
					HAS BEEN DONATED TO...
					<br />
					<span className='project-name'>
						{name}
					</span>
				</p>
			</div>
		}
	</div>
);

const DonationCarouselWidget = ({cparent, clist, toggle}) => (	
	<div id="donation-carousel" className="carousel slide container-fluid" data-interval={toggle} data-ride="carousel">
		{/* <!-- Content --> */}
		<div className="carousel-inner flex-column" role="listbox">	
			{ clist[0] && <DonationSlideWidget {...clist[0]} cparent={cparent} active />}
			{ clist[1] && <DonationSlideWidget {...clist[1]} cparent={cparent} />}
			{ clist[2] && <DonationSlideWidget {...clist[2]} cparent={cparent} />}
			{/* <!-- Indicators --> */}
			<div className='carousel-container'>
				<ol className="carousel-indicators">
					{/* // TODO: repeated code, make this check more efficient */}
					{ clist[0] && clist[0].name && clist[0].logo && <li data-target="#donation-carousel" data-slide-to="0" className="active" />}
					{ clist[1] && clist[1].name && clist[1].logo && <li data-target="#donation-carousel" data-slide-to="1" />}
					{ clist[2] && clist[2].name && clist[2].logo && <li data-target="#donation-carousel" data-slide-to="2" />}
				</ol>	
			</div>				
		</div>
		{/* <!-- Previous/Next controls --> */}
		{ clist.length > 1 && 
			<a className="left carousel-control" href="#donation-carousel" role="button" data-slide="prev">
				<span className="icon-prev" aria-hidden="true" />
				<span className="sr-only">Previous</span>
			</a>}
		{ clist.length > 1 && 
			<a className="right carousel-control" href="#donation-carousel" role="button" data-slide="next">
				<span className="icon-next" aria-hidden="true" />
				<span className="sr-only">Next</span>
			</a>}
	</div>
);

const LinkToAdWidget = ({adid, status}) => {
	// this is needed to be able to both control the look of the link in MDText
	function LinkRenderer(props) {
		return <a href={props.href} target="_blank">{props.children}</a>;
	}

	let msg = 'Watch an advert, unlock a free donation, and choose which project you would like to fund.';
	// adapts the link to the demo page to local/test/production
	let url = `${C.HTTPS}://${C.SERVER_TYPE}demo.good-loop.com/?gl.vert=`+encURI(adid)+"&gl.status="+encURI(status);
	let md = "[" + msg + "](" + url + ")";
	
	return (
		<div className='link watch-cta'>
			<MDText source={md} renderers={{link: LinkRenderer}} />
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
	//TODO this is the same mypage, refactor out of here
	let xids = getAllXIds();

	const { 'gl.vert': adid, 'gl.vertiser': vertiserid } = DataStore.getValue(['location', 'params']) || {};

	// Specific adid gets priority over advertiser id
	const id = adid || vertiserid;

	ServerIO.mixPanelTrack('Campaign page render', {adid, vertiserid});	

	if ( !adid && !vertiserid ) {
		// No ID -- show a list
		return <ListItems type={C.TYPES.Advert} status={C.KStatus.PUBLISHED} servlet='campaign' />;		
	}

	// get the ad for display (so status:published - unless this is a preview, as set by the url)
	let status = DataStore.getUrlValue("gl.status") || C.KStatus.PUBLISHED; 

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
	let complimentaryColor = '#51808a'; // default color (complimentary to the gl-red) for the middle tile that contains donations info
	let brandColor = branding.backgroundColor || branding.color || complimentaryColor;
	let brandLogo = branding.logo_white || branding.logo || null; 
	let brandColorBgStyle = {
		backgroundColor: brandColor,
		color: branding.lockAndTextColor || 'white',
	};

	// hack to show appropriately styled logo if it can't find anything better (used in DonationCircleWidget and DonationDetailsWidget)
	let logoStyle = {
		objectFit: 'contain',
		borderWidth: 'medium',
		borderColor: '#d4c7c7',
		borderStyle: 'double'
	};

	// campaign data
	let campaign = ad && ad.campaignPage;
	let startDate = ad.start ? 'This campaign started on '.concat(ad.start.substring(0, 10)) : '';
	let smallPrint = null;
	let bg = null;

	if(campaign) {
		smallPrint = campaign.smallPrint || '';
		if (campaign.bg) {
			bg = campaign.bg;
			brandColorBgStyle = {
				// Now handled via OpimisedImage
				// backgroundImage: 'url(' + bg + ')',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
				backgroundAttachment: 'fixed',
				backgroundColor: brandColor,
				color: branding.lockAndTextColor || 'white' 
			};
		}
	}

	// if there is no charity data, tell the user
	// TODO: do we want to deal with this in a more elegant way?
	if (!ad.charities) {
		return <Misc.Loading text='Cannot find charity data' />;	
	}

	// parent charity data 
	let parent = ad.charities.parent;
	// minor TODO just pass parent around
	let cparent = parent && parent.name ? parent.name : '';

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

	// toggle carousel (true means it spins automatically)
	let toggle = "false";

	// TODO: refactor this because it's very similar now to mypage
	return (
		<div className="page MyPage">
			<NavBar brandLogo={brandLogo} />
			{/* TODO: get rid of old css classes, previous to refactor */}
			<div className='grid-tile top'> 
				<OptimisedImage
					src={bg}
					render={({src}) => (
						<div className='header' style={{...brandColorBgStyle, backgroundImage: 'url(' + src + ')'}}>
							<div className='header-text'>
								<div className='header-title'>
									<div>Together we've raised</div>													
									{donationValue? <div><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
									<div>for charity</div>
								</div>
								<div className='flex-row flex-centre'>
									<DonationCircleWidget {...clist[0]} cparent={cparent} campaignSlice={campaignSlice} pos='left' />
									<DonationCircleWidget {...clist[1]} cparent={cparent} campaignSlice={campaignSlice} pos='middle' />
									<DonationCircleWidget {...clist[2]} cparent={cparent} campaignSlice={campaignSlice} pos='right' />
								</div>
								{/* <EmailCTA /> */}
							</div>
						</div>
					)}
				/>
			</div>
			<div className='grid-tile middle'>
				<div className='inside'>
					<DonationCarouselWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} brandColorBgStyle={brandColorBgStyle} logoStyle={logoStyle} adid={adid} status={status} toggle={toggle} />
				</div>
			</div>
			<CardAccordion multiple >	
				<Card title="How Good-Loop Ads Work" className="StatisticsCard MiniCard background-dark-green" defaultOpen>
					<OnboardingCardMini/>
				</Card>							
				<Card title="Boost Your Impact" className="boostImpact background-dark-blue" defaultOpen>
					<SocialMediaCard allIds={xids} className="socialConnect"/>
					{ ad && ad.videos && ad.videos.length && <ShareAnAd adHistory={{...ad.videos[0], vert: adid}} />}
				</Card> 
			</CardAccordion>
			<div className='grid-tile bottom background-gl-red' style={glColorBgStyle}>
				<div className='foot header-font'>		
					<SocialMediaGLFooterWidget />
					<SocialMediaFooterWidget type={'vertiser'} name={ad.name} branding={branding} />
					<SocialMediaShareWidget adName={ad.name} donationValue={donationValue} charities={clist} />
				</div>
			</div>
			<Footer leftFooter={startDate} rightFooter={smallPrint} />
		</div>
	);
}; // ./CampaignPage

export default CampaignPage;
