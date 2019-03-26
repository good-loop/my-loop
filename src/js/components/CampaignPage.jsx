import React from 'react';
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

const CampaignHeaderWidget = ({glLogo, brandLogo}) => {
	return (
		<div className="header-logos">
			<OptimisedImage 
				alt='Sponsor Logo'
				render={ props => <img {...props} />} 
				src={brandLogo} 
				style={{ display: brandLogo ? 'inline-block' : 'none' }} 
			/>
			<img alt='Good-Loop Logo' src={glLogo} />
		</div>
	);
};

// const CampaignHeaderWidget = ({cparentLogo, brandLogo, supports, displayChtyLogo}) => {
// 	if (cparentLogo) {
// 		return (
// 			<div>
// 				<img alt='Sponsor Logo' src={brandLogo} />
// 				{supports ? <span> Supports </span> : null}
// 				<img alt='Charity Logo' src={cparentLogo} style={displayChtyLogo} />
// 			</div>
// 		);
// 	}
// 	return (<img alt='Sponsor Logo' src={brandLogo} />);
// };

const DonationSlideWidget = ({cparent, clist, index=0, active, status, brandColorTxtStyle}) => {	
	let cids = clist.map(x => x.id);
	let cnames = clist.map(x => x.name);
	let clogos = clist.map(x => x.logo || x.logo_white);
	let chighResPhotos = clist.map(x => x.highResPhoto || x.photo);
	let ccrop = clist.map(x => x.circleCrop);
	let cbgColor = clist.map(x => x.color); // TODO: does this exist?
	let ctxtColor = clist.map(x => x.txtColor); // TODO: does this exist?
	let cdescs = clist.map(x => x.description);
	//let cPhoto = chighResPhotos[index] ? chighResPhotos[index] : '';

	// set the photo if it has one
	let photoStyle = {};
	if (chighResPhotos[index]) {
		photoStyle = {
			backgroundImage: 'url(' + chighResPhotos[index] + ')',
		};
	}

	let slideStyle = {
		backgroundColor: cbgColor[index],
		color: ctxtColor[index] ? ctxtColor[index] : 'white',
	};

	// this uses the circleCrop value set in the portal to crop the logo/photo to fit neatly into the circle 
	let ccropDiff = (100-ccrop[index])/100;
	let circleCropStyle = {
		objectFit: 'contain',
		width: ccrop[index] ? ccrop[index]+'%' : '100%',
		height: ccrop[index] ? ccrop[index]+'%' : '100%',
		marginTop: ccrop[index] ? "calc(50px*" + ccropDiff + ")" : null,
	};

	let logoStyle = {
		margin: '0 auto',
		//float: cdescs[index] ? 'right' : 'unset',
		backgroundColor: 'white', //TODO: do we want this to be editable in the portal? it could be the same color as the chty foreground used for text #minor
		borderRadius: '50%',
		height: '5.5vw', 
		width: '5.5vw',
		textAlign: 'center',
		/* margin-top: 25px; */
		overflow: 'hidden',
		color: 'black'
	};

	// is the item currently active (aka show in carousel)
	let itemClass = active ? 'item active' : 'item';

	// if there's no chty title or logo, we shouldn't show the slide in the carousel
	if (!clist[index].name && !clist[index].logo) {
		return(null);
	}

	// if there's no chty description, then we should just show the chty title and logo and center them
	if (!cdescs[index]) {
		slideStyle.height = '22vh';
		return (
			<div className={itemClass} style={slideStyle}>
				<div>
					<div className="col-md-3" />
					<div className="col-md-6">
						<div className="slide-header" style={{marginTop: '6vh', height: '10vh'}}>
							<div className="slide-logo" style={logoStyle}>
								<img alt={cparent+' '+cnames[index]} src={clogos[index]} style={circleCropStyle} />
							</div>	
							<div className="slide-title" style={{paddingTop: '3%', color: ctxtColor[index] ? ctxtColor[index] : 'white'}}>
								{cnames[index]}
							</div>	
						</div>		
					</div>
				</div>
			</div>
		);
	}

	// if we have a chty photo we should display it alongside the rest of the data, otherwise display just the rest 
	return (
		<div className={itemClass} style={slideStyle}>
			{ chighResPhotos[index] ? 
				<div>
					<div className="col-md-1" />
					<div className="col-md-5">
						<div className="slide-header">
							<div className="col-md-1" />
							<div className="col-md-2">
								<div className="slide-logo" style={logoStyle}>
									<img alt={cparent+' '+cnames[index]} src={clogos[index]} style={circleCropStyle} />
								</div>	
							</div>	
							<div className="col-md-6 slide-title" style={{color: ctxtColor[index] ? ctxtColor[index] : 'white'}}>
								{cnames[index]}
							</div>	
						</div>
						<div className="slide-desc">
							<MDText source={cdescs[index]} />
						</div>						
					</div>	
					<div className="col-md-4 slide-photo" style={photoStyle}></div>
					<div className="col-md-2" />
				</div>
				:
				<div>
					<div className="col-md-3" />
					<div className="col-md-6">
						<div className="slide-header">
							<div className="col-md-1" />
							<div className="col-md-2">
								<div className="slide-logo" style={logoStyle}>
									<img alt={cparent+' '+cnames[index]} src={clogos[index]} style={circleCropStyle} />
								</div>	
							</div>	
							<div className="col-md-6 slide-title" style={{color: ctxtColor[index] ? ctxtColor[index] : 'white'}}>
								{cnames[index]}
							</div>	
						</div>
						<div className="slide-desc">
							<MDText source={cdescs[index]} />
						</div>						
					</div>	
					<div className="col-md-3" />
				</div>
			} 
		</div>	
	);
};

const DonationCarouselWidget = ({cparent, clist, campaignSlice, brandColorBgStyle, brandColorTxtStyle, logoStyle, adid, status, toggle}) => {	 // todo: remove useless params
	
	return (
		<div id="donation-carousel" className="carousel slide" data-interval={toggle} data-ride="carousel">
			{/* <!-- Indicators --> */}
			<ol className="carousel-indicators">
				{/* // TODO: repeated code, make this check more efficient */}
				{ clist[0] && clist[0].name && clist[0].logo ? <li data-target="#donation-carousel" data-slide-to="0" className="active" /> : null}
				{ clist[1] && clist[1].name && clist[1].logo ? <li data-target="#donation-carousel" data-slide-to="1" /> : null}
				{ clist[2] && clist[2].name && clist[2].logo ? <li data-target="#donation-carousel" data-slide-to="2" /> : null}
			</ol>
			{/* <!-- Content --> */}
			<div className="carousel-inner" role="listbox">	
				{ clist[0] ? <DonationSlideWidget cparent={cparent} clist={clist} index={0} status={status} brandColorTxtStyle={brandColorTxtStyle} active /> : null}
				{ clist[1] ? <DonationSlideWidget cparent={cparent} clist={clist} index={1} status={status} brandColorTxtStyle={brandColorTxtStyle} active={false} /> : null}
				{ clist[2] ? <DonationSlideWidget cparent={cparent} clist={clist} index={2} status={status} brandColorTxtStyle={brandColorTxtStyle} active={false} /> : null}					
			</div>
			{/* <!-- Previous/Next controls --> */}
			{ clist.length > 1 ? 
				<a className="left carousel-control" href="#donation-carousel" role="button" data-slide="prev">
					<span className="icon-prev" aria-hidden="true" />
					<span className="sr-only">Previous</span>
				</a> : null }
			{ clist.length > 1 ? 
				<a className="right carousel-control" href="#donation-carousel" role="button" data-slide="next">
					<span className="icon-next" aria-hidden="true" />
					<span className="sr-only">Next</span>
				</a> : null }
		</div>
	);
};

const LinkToAdWidget = ({cparent, adid, status}) => {
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
			.then(res => {
				// Don't ask for their email again
				document.cookie = `cta-email=email;max-age=${60 * 60 * 24 * 365};domain=.good-loop.com;path=/`;
				DataStore.setValue(submittedPath, true);
			}, err => {});
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

/** Grabs either standard or mobile-optimised image depending on context
 * @render (21/03/19) made this render props to deal with unusual way that bg image is handled
 * Just providing a thin wrapper to an img element might be easier going forward
 * @param href https://testmedia.good-loop.com/uploads/standard/cat.jpg
 */
const OptimisedImage = (props) => {
	let {render} = props;
	let src = props.src || '';

	const isMobile = DataStore.getValue(['env', 'isMobile']);
	// Logos have different path structure (testmedia.good-loop.com/uploads/img/cat.jpg)
	const isStandardMediaImage = src.includes('media.good-loop.com/uploads/standard/');
	src = isMobile && isStandardMediaImage ? src.replace('uploads/standard', 'uploads/mobile') : src;

	return render({...props, src});
};

/**
 * Expects url parameters: `gl.vert` or `gl.vertiser`
 */
const CampaignPage = () => {
	const { 'gl.vert': adid, 'gl.vertiser': vertiserid } = DataStore.getValue(['location', 'params']) || {};

	// Specific adid gets priority over advertiser id
	const id = adid || vertiserid;

	ServerIO.mixPanelTrack('Campaign page render', {adid, vertiserid});	

	if ( !adid && !vertiserid ) {
		// No ID -- show a list
		return <ListItems type={C.TYPES.Advert} status={C.KStatus.PUBLISHED} servlet='campaign' />;		
		// return <Misc.Loading text='Unable to find campaign' />;	
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
	let glColor = '#C83312'; // TODO: move this to less?
	let glLogo = '/img/logo-white.svg';
	let glColorBgStyle = {
		backgroundColor: glColor,
		color: 'white'
	};

	let {branding={}, mockUp={}} = ad;
	// default styling if adv branding is not there 
	let complimentaryColor = '#51808a'; // default color (complimentary to the gl-red) for the middle tile that contains donations info
	let brandColor = mockUp.backgroundColor || branding.backgroundColor || complimentaryColor;
	let brandLogo = branding.logo_white || branding.logo || null; 
	let brandColorBgStyle = {
		backgroundColor: brandColor,
		color: branding.lockAndTextColor || mockUp.lockAndTextColor || 'white',
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
	let desc_title = null;
	let desc_body = null;

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
				color: mockUp.lockAndTextColor || 'white' 
			};
		}
		desc_title = campaign.desc_title ? campaign.desc_title : null;
		desc_body = campaign.desc_body ? campaign.desc_body : null;
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
	console.log(pvDonationsBreakdown);

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
	//let toggle = 5000; // TODO: set this as a param
	
	return (<div className='campaign-page'>
		<div className='grid'>
			<div className='grid-tile top'> 
				<div className='vertiser-head frank-font' style={glColorBgStyle}>
					<CampaignHeaderWidget glLogo={glLogo} brandLogo={brandLogo} />
				</div>
				<OptimisedImage
					src={bg}
					render={({src}) => (
						<div className='header' style={{...brandColorBgStyle, backgroundImage: 'url(' + src + ')'}}>
							<div className='header-text'>
								<div className='header-title frank-font'>
									<div></div>	{/* TODO: delete this, it's just here because there's a css rule about the 1st div in title*/}
									<div>Together we've raised</div>													
									{donationValue? <div><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
									<div>for charity</div>
								</div>
								<EmailCTA />
							</div>
						</div>
					)}
				/>
			</div>
			<div className='grid-tile middle' style={brandColorBgStyle}>
				<div className='inside'>
					{/* <div className='title frank-font' style={brandColorTxtStyle}>
						<MDText source={desc_title} />							
					</div>
					<div className='subtitle'>
						<MDText source={desc_body} />							
					</div>
					<LinkToAdWidget cparent={cparent} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} />
					<DonationInfoWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} brandColorBgStyle={brandColorBgStyle} brandColorTxtStyle={brandColorTxtStyle} logoStyle={logoStyle}/> */}
					<DonationCarouselWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} brandColorBgStyle={brandColorBgStyle} logoStyle={logoStyle} adid={adid} status={status} toggle={toggle}/>
				</div>
			</div>
			<LinkToAdWidget cparent={cparent} adid={adid} status={status} />
			<div className='grid-tile bottom' style={glColorBgStyle}>
				<div className='foot header-font'>		
					<SocialMediaShareWidget adName={ad.name} donationValue={donationValue} charities={clist} />
					<SocialMediaGLFooterWidget />
					<SocialMediaFooterWidget type={'vertiser'} name={ad.name} branding={branding} />					
				</div>
			</div>
		</div>
		<Footer leftFooter={startDate} rightFooter={smallPrint} glColorBgStyle={glColorBgStyle} />
	</div>);
}; // ./CampaignPage

export default CampaignPage;
