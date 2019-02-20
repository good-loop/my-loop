import React from 'react';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';
// import pivot from 'data-pivot';
import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Person from '../base/data/Person';
import Money from '../base/data/Money';
import Misc from '../base/components/Misc';
import CardAccordion, {Card} from '../base/components/CardAccordion';
import ActionMan from '../plumbing/ActionMan';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import Login from 'you-again';
import {LoginLink, SocialSignInButton} from '../base/components/LoginWidget';
import {LoginToSee} from './Bits';
import {getProfile, getProfilesNow} from '../base/Profiler';
import ConsentWidget from './ConsentWidget';
import printer from '../base/utils/printer';
import DonationCard from './DonationCard';
import Footer from '../components/Footer';
import { Link, Element } from 'react-scroll';
import MDText from '../base/components/MDText';

const CampaignHeaderWidget = ({glLogo, brandLogo}) => {
	return (
		<div className="header-logos">
			<img alt='Sponsor Logo' src={brandLogo} />
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

/**
 * @param type {!String} vertiser|goodloop
 * @param branding {Branding}
 */
const SocialMediaFooterWidget = ({type, name, branding}) => {
	// FIXME avoid gl-es urls!
	return (
		<div className={'social '.concat(type)}>
			<MDText source={name} />
			{branding && branding.fb_url? <a href={branding.fb_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/facebook.png' /></a> : null}
			{branding && branding.tw_url? <a href={branding.tw_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/twitter.png' /></a> : null}
			{branding && branding.insta_url? <a href={branding.insta_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/instagram.png' /></a> : null}
			{branding && branding.yt_url? <a href={branding.yt_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/youtube.png' /></a> : null}
		</div>
	);
};

// The "share this advert" links
// TODO replace those PNGs with SVGs, preferably inline
// Use function for href as text and url need to be inserted differently for different social media services
const shareOptions = [
	{
		title: 'Facebook',
		hrefFn: ({text, url}) => `http://www.facebook.com/sharer.php?u=${url}&quote=${encodeURIComponent(text)}`,
		logo: '/img/facebook.png'
	},
	{
		title: 'Twitter',
		hrefFn: ({text, url}) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&tw_p=tweetbutton&url=${url}`,
		logo: '/img/twitter.png'
	},
	{
		title: 'LinkedIn',
		hrefFn: ({text, url}) => `https://www.linkedin.com/shareArticle?mini=true&title=Our%20ads%20are%20raising%20money%20for%20charity&url=${url}&summary=${encodeURIComponent(text)}`,
		logo: '/img/linkedin-white.png'
	}
];

const SocialMediaShareWidget = ({type, name, branding, donationValue, charities, adName}) => {
	const SocialShareButton = ({hrefFn, logo, title}, shareText) => (
		<a className="charity" href={hrefFn({text: shareText, url: window.location.href.replace("#", "%23")})} target="_blank" rel="noreferrer" title={title} alt={title}>
			<img alt={{title}+' Logo'} src={logo} crop="50%" title={title} />
		</a>
	);
	
	// What should appear in Tweet/Facebook link/LinkedIn article
	// Contains fallbacks for where donation amount, charities or advertiser name is not specified
	const shareTextFn = ({donationValue, charities, adName="We"}) => {
		const amount = new Money({currency: 'GBP', value: donationValue});
		const currencyCode = Money.CURRENCY[(amount.currency || 'GBP').toUpperCase()];

		const amountText = Money.prettyString({amount}) || 'money';

		let chartiyText;
		if( charities && charities.length !== 0) {
			// Safety: filter out any charities that do not have a human-readable name
			const charityNames = charities && charities.reduce( (arrayOut, charity) => charity.name ? arrayOut.concat(charity.name) : arrayOut, []);
			
			if( !charityNames ) {
				chartiyText = 'charity';
			} else if ( charityNames.length === 1) {
				chartiyText = charityNames[0];
			} else {
				// Pull out last two elements as these are formatted differently
				const finalTwoCharityNames = charityNames.splice(charityNames.length - 2, 2);

				chartiyText = `${charityNames.map( charityName => charityName + ', ')}${finalTwoCharityNames[0]} and ${finalTwoCharityNames[1]}`;
			} 
		}

		return `${adName} helped to raise ${currencyCode}${amountText} for ${chartiyText}`;
	};

	const shareText = shareTextFn({donationValue, charities, adName});

	return (
		<div className="social share-page">
			<MDText source='Share this page' />
			{shareOptions.map(option => SocialShareButton(option, shareText))}
		</div>
	);
};

let _handleClick = (circleIndex) => {
	// TODO document the assumptions / linked code
	let toggle = [false, false, false];
	toggle[circleIndex] = true;
	DataStore.setValue(['widget', 'donationCircles', 'active'], toggle);
};

const DonationCircleWidget = ({cparent, clist, campaignSlice, index=0, name='left', shown, brandColorBgStyle, logoStyle}) => {
	let cids = clist.map(x => x.id);
	let cnames = clist.map(x => x.name);
	let chighResPhotos = clist.map(x => x.highResPhoto || x.photo || x.logo);
	let ccrop = clist.map(x => x.circleCrop);

	// this uses the circleCrop value set in the portal to crop the logo/photo to fit neatly into the circle 
	let ccropDiff = (100-ccrop[index])/100;
	let circleCropStyle = {
		width: ccrop[index]+"%",
		height: ccrop[index]+"%",
		marginTop: "calc(125px*" + ccropDiff + ")",
	};
	let noCropStyle = {
		borderRadius: 'inherit'
	};

	return (
		<div className={'circle '.concat(name)} onClick={(e) => _handleClick(index)}>
			{cparent? <p className='header-font'><span className='frank-font'>{campaignSlice[cids[index]].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p> : null}
			<div className='img-wrapper' style={!(clist[index].highResPhoto || clist[index].photo) ? logoStyle : null}>
				<img alt={cparent+' '+cnames[index]} src={chighResPhotos[index]} style={ccrop[index] ? circleCropStyle : noCropStyle}/>
			</div>
			<div className='project-name frank-font' style={brandColorBgStyle}>
				{cnames[index]}
			</div>
			{ shown ? <div className='arrow-up' /> : null }
		</div>
	);
};

const DonationDetailsWidget = ({cparent, clist, index=0, name='left', brandColorBgStyle, brandColorTxtStyle, logoStyle}) => {
	function LinkRenderer(props) {
		return <a href={props.href} target="_blank" style={brandColorTxtStyle}>{props.children}</a>;
	}

	let cids = clist.map(x => x.id);
	let cnames = clist.map(x => x.name);
	let chighResPhotos = clist.map(x => x.highResPhoto || x.photo || x.logo);
	let curls = clist.map(x => x.url);
	let cdescs = clist.map(x => x.description);

	// get description from sogive if you can't find it in portal
	// NB: getData will call SoGive for NGO data
	let pvcharityData = ActionMan.getDataItem({type:C.TYPES.NGO, id:cids[index], status:C.KStatus.PUBLISHED});
	let sogiveResults = pvcharityData.value;
	let sogiveDesc = (sogiveResults && sogiveResults.summaryDescription);
	
	// this uses the circleCrop value set in the portal to crop the logo/photo to fit neatly into the circle 
	let ccrop = clist.map(x => x.circleCrop);
	let ccropDiff = (100-ccrop[index])/100;
	let circleCropStyle = {
		width: ccrop[index]+"%",
		height: ccrop[index]+"%",
		marginTop: "calc(125px*" + ccropDiff + ")",
	};
	let noCropStyle = {
		borderRadius: 'inherit'
	};

	return (
		<div className={'details '.concat(name)}>
			<div className='innards'>
				<div className='img-wrapper' style={!(clist[index].highResPhoto || clist[index].photo) ? logoStyle : null}>
					<img alt={cparent+' '+cnames[index]} src={chighResPhotos[index]} style={ccrop[index] && ccrop[index]!==100 ? circleCropStyle : noCropStyle}/>
				</div>
				<div className="text">
					<div className='title frank-font' style={brandColorTxtStyle}>
						<MDText source={cnames[index].toUpperCase()} />
					</div>
					<div className='description'>
						<MDText source={(cdescs[index] || sogiveDesc)} renderers={{link: LinkRenderer}} />
					</div>
					{curls[index] ?
						<div className='btnlink frank-font' style={brandColorBgStyle} onClick={(e) => window.open(curls[index], '_blank')}>
							Find out more {curls[index] && cparent ? ' about the' : ''} 
							<br/> <MDText source={cparent} />
						</div>	
						: null }
				</div>
			</div>
		</div>
	);
};

const DonationSlideWidget = ({cparent, clist, index=0, active, adid, status, brandColorTxtStyle}) => {	
	let cids = clist.map(x => x.id);
	let cnames = clist.map(x => x.name);
	let clogos = clist.map(x => x.logo);
	let chighResPhotos = clist.map(x => x.highResPhoto || x.photo);
	let ccrop = clist.map(x => x.circleCrop);
	let ccolor = clist.map(x => x.color); // TODO: does this exist?
	let cdescs = clist.map(x => x.description);
	//let cPhoto = chighResPhotos[index] ? chighResPhotos[index] : '';

	// TODO: move this in less file
	let photoStyle = {};
	if (chighResPhotos[index]) {
		photoStyle = {
			backgroundImage: 'url(' + chighResPhotos[index] + ')',
			backgroundSize: 'contain',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			height: '25vh',
			top: '6vh'
		};
	}

	// TODO: move this in less file
	let slideStyle = {
		backgroundColor: ccolor[index],
		height: '100%',		
		width: '100%',	
		// padding: '50px'
	};

	// this uses the circleCrop value set in the portal to crop the logo/photo to fit neatly into the circle 
	let ccropDiff = (100-ccrop[index])/100;
	let circleCropStyle = {
		width: ccrop[index]+"%",
		height: ccrop[index]+"%",
		marginTop: "calc(125px*" + ccropDiff + ")"
	};
	let noCropStyle = {
		//borderRadius: 'inherit',
		borderRadius: '64px',
		height: clogos[index] ? '6vh' : null,
		margin: '0 auto',
		float: 'right'
	};
	let descStyle = {
		// padding: '2vmin',
		display: 'inline-block',
		width: '36vw',
		margin: '0 auto',
		fontSize: '24px',
		color: 'white'
	};
	let titleStyle = {
		// padding: '2vmin',
		// display: 'inline-block',
		// width: '36vw',
		// margin: '0 auto',
		fontSize: '24px',
		color: 'white'
	};

	// is the item currently active (aka show in carousel)
	let itemClass = active ? 'item active' : 'item';

	return (

		<div className={itemClass} style={slideStyle}>
			{ chighResPhotos[index] ? 
				<div>
					<div className="col-md-1" />
					<div className="col-md-5" style={titleStyle}>
						<div style={{ margin: '2vh 0', height: '5vh'}}>
							<div className="col-md-1" />
							<div className="col-md-2">
								<img alt={cparent+' '+cnames[index]} src={clogos[index]} style={ccrop[index] ? noCropStyle : noCropStyle} />
							</div>	
							<div className="col-md-6" style={{top: '1vh', fontSize: '33px', fontFamily: '\'FrankGothItalicBT\', Fallback, sans-serif'}}>
								{cnames[index]}
							</div>	
						</div>
						<div style={descStyle}>
							<MDText source={cdescs[index]} />
						</div>						
					</div>	
					<div className="col-md-4" style={photoStyle}></div>
					<LinkToAdWidget cparent={cparent} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} />
					<div className="col-md-2" />
				</div>
				:
				<div>
					<img alt={cparent+' '+cnames[index]} src={clogos[index]} style={ccrop[index] ? noCropStyle : noCropStyle} />
					<div style={descStyle}>{cdescs[index]}</div>
					<LinkToAdWidget cparent={cparent} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} />
				</div>	
			}
		</div>	
	);
};

const DonationCarouselWidget = ({cparent, clist, campaignSlice, brandColorBgStyle, brandColorTxtStyle, logoStyle, adid, status, toggle}) => {	 // todo: remove useless params
	// TODO: move this in less file
	let innerCarouselStyle = {
		height: '47vh',
		width: '100vw',
		margin: 'auto'
	};
	let carouselIndicatorsStyle = {
		bottom: '5px'
	};
	let carouselInnerStyle = {
		height: '100%',
		width: '100%'
	};

	return (
		<div id="donation-carousel" className="carousel slide" data-interval={toggle} data-ride="carousel" style={innerCarouselStyle}>
			{/* <!-- Indicators --> */}
			<ol className="carousel-indicators" style={carouselIndicatorsStyle}>
				<li data-target="#donation-carousel" data-slide-to="0" className="active" />
				<li data-target="#donation-carousel" data-slide-to="1" />
				<li data-target="#donation-carousel" data-slide-to="2" />
			</ol>
			{/* <!-- Content --> */}
			<div className="carousel-inner" role="listbox" style={carouselInnerStyle}>	
				<DonationSlideWidget cparent={cparent} clist={clist} index={0} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} active />
				<DonationSlideWidget cparent={cparent} clist={clist} index={1} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} active={false} />
				<DonationSlideWidget cparent={cparent} clist={clist} index={2} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} active={false} />					
			</div>
			{/* <!-- Previous/Next controls --> */}
			<a className="left carousel-control" href="#donation-carousel" role="button" data-slide="prev">
				<span className="icon-prev" aria-hidden="true" />
				<span className="sr-only">Previous</span>
			</a>
			<a className="right carousel-control" href="#donation-carousel" role="button" data-slide="next">
				<span className="icon-next" aria-hidden="true" />
				<span className="sr-only">Next</span>
			</a>
		</div>
	);
};
const DonationInfoWidget = ({cparent, clist, campaignSlice, brandColorBgStyle, brandColorTxtStyle, logoStyle}) => {
	let toggle = DataStore.getValue(['widget', 'donationCircles', 'active']) || [true, false, false]; // toggles the info charity box to display one at a time
	
	return (
		<div className='donation-circles'>
			<DonationCircleWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} index={0} name={'left'} shown={toggle[0]} brandColorBgStyle={brandColorBgStyle} logoStyle={logoStyle}/>
			<DonationCircleWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} index={1} name={'middle'} shown={toggle[1]} brandColorBgStyle={brandColorBgStyle} logoStyle={logoStyle}/>
			<DonationCircleWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} index={2} name={'right'} shown={toggle[2]} brandColorBgStyle={brandColorBgStyle} logoStyle={logoStyle}/>
			{ toggle[0] ? 
				<DonationDetailsWidget cparent={cparent} clist={clist} index={0} name={'left'} brandColorBgStyle={brandColorBgStyle} brandColorTxtStyle={brandColorTxtStyle} logoStyle={logoStyle}/>
				: null
			}
			{ toggle[1] ? 
				<DonationDetailsWidget cparent={cparent} clist={clist} index={1} name={'middle'} brandColorBgStyle={brandColorBgStyle} brandColorTxtStyle={brandColorTxtStyle} logoStyle={logoStyle}/>
				: null
			}
			{ toggle[2] ? 
				<DonationDetailsWidget cparent={cparent} clist={clist} index={2} name={'right'} brandColorBgStyle={brandColorBgStyle} brandColorTxtStyle={brandColorTxtStyle} logoStyle={logoStyle}/>
				: null
			}
		</div>
	);
};

const LinkToAdWidget = ({cparent, adid, status, brandColorTxtStyle}) => {
	// this is needed to be able to both control the look of the link in MDText
	function LinkRenderer(props) {
		return <a href={props.href} target="_blank" style={brandColorTxtStyle}>{props.children}</a>;
	}

	let msg = 'WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH PROJECT YOU WOULD LIKE TO FUND.';
	// TODO: adapt this to local/test/prod
	let url = 'https://demo.good-loop.com/?gl.vert='+encURI(adid)+"&gl.status="+encURI(status);
	let md = "[" + msg + "](" + url + ")";
	
	return (
		<p className='link header-font'>
			<MDText source={md} renderers={{link: LinkRenderer}} />
		</p>
	);
};

/**
 * connect with us by email 
 */
const EmailCTA = () => {

	return (
		<div className="cta-email">
			<form>
				<span className="cta-lead">Double your donation by joining Good-Loop's mailing list</span>
				{/* <input type="email" className="form-control" name="email" placeholder="Email address" />
				<input className="btn btn-primary" type="submit" value="Sign Up" /> */}
				<div className="input-group">
					<input type="email" className="form-control" name="email" placeholder="Email address" />
					<span className="input-group-addon" id="basic-addon2" style={{textShadow: 'initial'}}>Sign Up</span>
				</div>
				<p className="cta-help">You can unsubscribe at any time. We will not share your email. 
					<span> <a href="https://my.good-loop.com" target="_blank">more info</a></span>
				</p>
			</form>
		</div>
	);
}; // ./connect

/**
 * @param path {!String[]} The deciphered url path - e.g. ['campaign', 'kitkatadid']
 */
const CampaignPage = ({path}) => {
	
	let adid = path ? path[1] : '';

	ServerIO.mixPanelTrack('Campaign page render', {adid});	

	if (!path[1]) {
		return <Misc.Loading text='Unable to find campaign' />;	
	}

	// get the ad for display (so status:published - unless this is a preview, as set by the url)
	let status = DataStore.getUrlValue("gl.status") || C.KStatus.PUBLISHED; 

	//  checking for both adid and advertiser id in the url like this means that the user will get an error message, although the page will still load "404: http://localportal.good-loop.com/vert/gl/h1PY8Fir.json?status=DRAFT&status=DRAFT&app=good-loop&as=marvin%40irinapreda.me%40email&withCredentials=true"
	// TODO: either use url params instead (e.g. adid=qHejwewq) or remove the error in this case (that might be confusing for us devs)
	let pvAdvert = ActionMan.getDataItem({type:C.TYPES.Advert, id:adid, status:C.KStatus.DRAFT, domain: ServerIO.PORTAL_DOMAIN});
	let pvAdvertiser = ActionMan.list({type: C.TYPES.Advert, status:C.KStatus.ALL_BAR_TRASH, q:adid });

	if ( ! pvAdvert.resolved && ! pvAdvertiser.resolved ) {
		return <Misc.Loading text='Loading campaign data...' />;
	}

	// good-loop branding
	let glColor = '#C83312'; 
	let glLogo = 'https://i.ibb.co/XY3trPW/Good-Loop-Logos-Good-Loop-Logo-Mark-White.png';
	let glColorBgStyle = {
		backgroundColor: glColor,
		color: 'white'
	};

	// default data
	let defaultImg = "https://i.ibb.co/Xy6HD5J/empty.png"; // hack to be used when we don't have an image, and we want to default to an "empty" transparent image

	// advertiser data
	let ad = pvAdvert.value ? pvAdvert.value : null;
	console.log("Loading ad data: ",ad);

	if (!ad) {
		console.log("Can't find ad data");
		let advertiser = pvAdvertiser.value ? pvAdvertiser.value : null;	
		ad = advertiser["hits"][0]; // takes one of the advertiser's adverts
		console.log("Loading advertiser's 1st ad data: ",advertiser);
	}

	let brand = ad.branding;
	// use good-loop branding if adv branding is not there 
	let brandColor = brand.color ? brand.color : glColor; 
	let brandLogo = brand.logo ? brand.logo : null; 
	let brandColorBgStyle = {
		backgroundColor: brandColor,
		color: 'white'
	};
	let brandColorTxtStyle = {
		color: 'white', //brandColor

	};
	// TODO (optional): change portal to allow for complimentary color to be modified
	let complimentaryColor = '#f0e7d0'; // color for the middle tile that contains donations info
	let compliColorBgStyle = {
		backgroundColor: complimentaryColor,
	};
	// hack to show appropriately styled logo if it can't find anything better (used in DonationCircleWidget and DonationDetailsWidget)
	let logoStyle = {
		objectFit: 'contain',
		borderWidth: 'medium',
		borderColor: '#d4c7c7',
		borderStyle: 'double'
	};

	// goodloop branding data
	let gl_social = {
		fb_url: 'https://www.facebook.com/the.good.loop/',
		tw_url: 'https://twitter.com/goodloophq',
		insta_url: 'https://www.instagram.com/good.loop.ads/',
	};

	// campaign data
	let campaign = ad.campaignPage;
	let startDate = '';
	if (ad.start) {
		startDate = 'This campaign started on '.concat(ad.start.substring(0, 10));
	}
	let smallPrint = campaign && campaign.smallPrint ? campaign.smallPrint : '';
	let bg = '';
	let headerStyle = {};
	let desc_title = '';
	let desc_body = '';
	if(campaign) {
		if (campaign.bg) {
			bg = campaign.bg;
			headerStyle = {
				backgroundImage: 'url(' + bg + ')',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
				backgroundAttachment: 'fixed'
			};
		}
		desc_title = campaign.desc_title ? campaign.desc_title : null;
		desc_body = campaign.desc_body ? campaign.desc_body : null;
	}

	// parent charity data 
	let parent = ad.charities.parent;
	// minor TODO just pass parent around
	let cparent = parent && parent.name ? parent.name : '';
	let cparentLogo = parent && parent.logo ? parent.logo : defaultImg;
	let displayLogo = parent && parent.logo ? 'inherit' : 'none';
	let displayChtyLogo = {
		backgroundImage: cparentLogo,
		display: displayLogo
	};
	let supports = brand.logo && parent && parent.logo; // whether we want to show the "Supports" text at the top in between the 2 logos

	// individual charity data
	let clist = ad.charities.list;
	let cids = clist.map(x => x.id);

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget','CampaignPage','communityTotal', adid], () => {
		// TODO campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
		// Argh: Loop.Me have not logged vert, only campaign.
		// but elsewhere vert is logged and not campaign.
		// let q = ad.campaign? '(vert:'+adid+' OR campaign:'+ad.campaign+')' : 'vert:'+adid;		
		let q = 'vert:'+adid;
		// TODO "" csv encoding for bits of q (e.g. campaign might have a space)
		return ServerIO.getDonationsData({q});
	});
	if ( ! pvDonationsBreakdown.resolved ) {
		return <Misc.Loading text='Loading campaign donations...' />;
	}
	console.log(pvDonationsBreakdown.value);

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
	//let toggle = 5000; // TODO: set this as a param
	
	return (<div className='campaign-page'>
		<div className='grid'>
			<div className='grid-tile top' style={compliColorBgStyle}> 
				<div className='vertiser-head frank-font' style={glColorBgStyle}>
					<CampaignHeaderWidget glLogo={glLogo} brandLogo={brandLogo} />
				</div>
				<div className='header-img' style={campaign && campaign.bg ? headerStyle : brandColorBgStyle} >
					<div className='darken-overlay'>
						<div className='title frank-font'>
							<div></div>	{/* TODO: delete this, it's just here because there's a css rule about the 1st div in title*/}
							<div>Together we've raised</div>													
							{campaign && campaign.donation? <div><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : 'money'}
							<div>for charity</div>
							<EmailCTA />
						</div>
					</div>	
				</div>
			</div>
			<div className='grid-tile middle' style={compliColorBgStyle}>
				<div className='inside'>
					{/* <div className='title frank-font' style={brandColorTxtStyle}>
						<MDText source={desc_title} />							
					</div>
					<div className='subtitle'>
						<MDText source={desc_body} />							
					</div>
					<LinkToAdWidget cparent={cparent} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} />
					<DonationInfoWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} brandColorBgStyle={brandColorBgStyle} brandColorTxtStyle={brandColorTxtStyle} logoStyle={logoStyle}/> */}
					<DonationCarouselWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} brandColorBgStyle={brandColorBgStyle} brandColorTxtStyle={brandColorTxtStyle} logoStyle={logoStyle} adid={adid} status={status} toggle={toggle}/>
				</div>
			</div>
			<div className='grid-tile bottom' style={glColorBgStyle}>
				<div className='foot header-font'>		
					<SocialMediaShareWidget adName={ad.name} donationValue={donationValue} charities={clist} />
					<SocialMediaFooterWidget type={'goodloop'} name={'GOOD-LOOP'} branding={gl_social} />
					<SocialMediaFooterWidget type={'vertiser'} name={ad.name} branding={brand} />					
				</div>
			</div>
		</div>
		<Footer leftFooter={startDate} rightFooter={smallPrint} glColorBgStyle={glColorBgStyle} />
	</div>);
}; // ./CampaignPage

export default CampaignPage;
