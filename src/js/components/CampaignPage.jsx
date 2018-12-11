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

const CampaignHeaderWidget = ({cparentLogo, brandLogo, supports}) => {
	if (cparentLogo) {
		return (
			<div>
				<img alt='Sponsor Logo' src={brandLogo} />
				{supports ? <span> Supports </span> : null}
				<img alt='Charity Logo' src={cparentLogo} />
			</div>
		);
	}
	return (<img alt='Sponsor Logo' src={brandLogo} />);
};

const SocialMediaFooterWidget = ({type, name, src}) => {
	return (
		<div className={'social '.concat(type)}>
			<MDText source={name} />
			{src && src.fb_url? <a href={src.fb_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/facebook.png' /></a> : null}
			{src && src.tw_url? <a href={src.tw_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/twitter.png' /></a> : null}
			{src && src.insta_url? <a href={src.insta_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/instagram.png' /></a> : null}
			{src && src.yt_url? <a href={src.yt_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/youtube.png' /></a> : null}
		</div>
	);
};

let _handleClick = (circleIndex) => {
	let toggle = [false, false, false];
	toggle[circleIndex] = true;
	DataStore.setValue(['widget', 'donationCircles', 'active'], toggle);
};

const DonationCircleWidget = ({cparent, clist, campaignSlice, index=0, name='left', shown, brandColorBgStyle, logoStyle}) => {
	let cids = clist.map(x => x.id);
	let cnames = clist.map(x => x.name);
	let chighResPhotos = clist.map(x => x.highResPhoto || x.photo || x.logo);

	return (
		<div className={'circle '.concat(name)} onClick={(e) => _handleClick(index)}>
			{cparent? <p className='bebas-font'><span className='frank-font'>{campaignSlice[cids[index]].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p> : null}
			<img alt={cparent+' '+cnames[index]} src={chighResPhotos[index]} style={!(clist[index].highResPhoto || clist[index].photo) ? logoStyle : null}/>
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

	let cnames = clist.map(x => x.name);
	let chighResPhotos = clist.map(x => x.highResPhoto || x.photo || x.logo);
	let curls = clist.map(x => x.url);
	let cdescs = clist.map(x => x.description);

	return (
		<div className={'details '.concat(name)}>
			<div className='innards'>
				<img alt={cparent+' '+cnames[index]} src={chighResPhotos[index]} style={!(clist[index].highResPhoto || clist[index].photo) ? logoStyle : null}/>
				<div className="text">
					<div className='title frank-font' style={brandColorTxtStyle}>
						<MDText source={cnames[index].toUpperCase()} />
					</div>
					<div className='description helvetica-font'>
						<MDText source={cdescs[index]} renderers={{link: LinkRenderer}} />
					</div>
					<div className='btnlink frank-font' style={brandColorBgStyle} onClick={(e) => window.open(curls[index], '_blank')}>
						{cparent ? 'Find out more about the' : 'Find out more'} 
						<br/> <MDText source={cparent} />
					</div>	
				</div>
			</div>
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

	let msg = 'WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH ' + cparent + ' PROJECT YOU WOULD LIKE TO FUND.';
	let url = 'https://demo.good-loop.com/?gl.vert='+encURI(adid)+"&gl.status="+encURI(status);
	let md = "[" + msg + "](" + url + ")";
	
	return (
		<p className='link bebas-font'>
			<MDText source={md} renderers={{link: LinkRenderer}} />
		</p>
	);
};

/**
 * @param path {!String[]} The deciphered url path - e.g. ['campaign', 'kitkatadid']
 */
const CampaignPage = ({path}) => {
	
	let adid = path ? path[1] : '';

	ServerIO.mixPanelTrack('Campaign page render', adid);	

	if (!path[1]) {
		return <Misc.Loading text='Unable to find campaign' />;	
	}

	// get the ad for display (so status:published - unless this is a preview, as set by the url)
	let status = DataStore.getUrlValue("gl.status") || C.KStatus.PUBLISHED; 
	console.log(status);
	let pvAdvert = ActionMan.getDataItem({type:C.TYPES.Advert, id:adid, status:C.KStatus.DRAFT, domain: ServerIO.PORTAL_DOMAIN});
	if ( ! pvAdvert.resolved ) {
		return <Misc.Loading text='Loading campaign data...' />;
	}

	console.log(pvAdvert.value);

	// default data
	let defaultImg = "https://i.ibb.co/Xy6HD5J/empty.png"; // hack to be used when we don't have an image, and we want to default to an "empty" transparent image

	// advertiser data
	const ad = pvAdvert.value;
	let cadvertiser = pvAdvert.value.name;
	let brand = pvAdvert.value.branding;
	// use good-loop branding if adv branding is not there 
	let brandColor = brand.color ? brand.color : '#C83312'; 
	let brandLogo = brand.logo ? brand.logo : defaultImg;
	let brandColorBgStyle = {
		backgroundColor: brandColor,
		color: 'white'
	};
	let brandColorTxtStyle = {
		color: brandColor
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

	// goodloop data
	let gl_social = {
		fb_url: 'https://www.facebook.com/the.good.loop/',
		tw_url: 'https://twitter.com/goodloophq',
		insta_url: 'https://www.instagram.com/good.loop.ads/',
	};

	// campaign data
	let campaign = pvAdvert.value.campaignPage;
	let startDate = '';
	if (pvAdvert.value.start) {
		startDate = 'This campaign started on '.concat(pvAdvert.value.start.substring(0, 10));
	}
	let smallPrint = campaign && campaign.smallPrint ? campaign.smallPrint : '';
	let bg = '';
	let headerStyle = {};
	let desc_title = '';
	let desc_body = '';
	if(campaign) {
		bg = campaign.bg;
		headerStyle = {
			backgroundImage: 'url(' + bg + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			backgroundAttachment: 'fixed'
		};
		desc_title = campaign.desc_title;
		desc_body = campaign.desc_body;
	}
	// parent charity data 
	let parent = pvAdvert.value.charities.parent;
	let cparent = parent && parent.name ? parent.name : '';
	let cparentLogo = parent && parent.logo ? parent.logo : defaultImg;
	let supports = brand.logo && parent && parent.logo; // whether we want to show the "Supports" text at the top in between the 2 logos

	// individual charity data
	let clist = pvAdvert.value.charities.list;
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
	let donationValue = 0;
	donationValue = campaign && campaign.donation ? campaign.donation : campaignTotal; // check if statically set and, if not, then update with latest figures
	
	let charityTotal = filteredBreakdown.reduce((acc, current) => acc + current.value100p, 0);
	let campaignSlice = {}; // campaignSlice is of the form { cid: {percentageTotal: ...} } so as to ensure the correct values are extracted later (checking for cid rather than index)
	filteredBreakdown.forEach(function(obj) {
		const rawFraction = obj.value100p / charityTotal || 0; 
		campaignSlice[obj.cid] = {percentageTotal: Math.round(rawFraction*100)}; 
	});
	
	return (<div className='campaign-page'>
		<div className='grid'>
			<div className='grid-tile top'> 
				<div className='vertiser-head frank-font' style={brandColorBgStyle} >
					<CampaignHeaderWidget cparentLogo={cparentLogo} brandLogo={brandLogo} supports={supports} />
				</div>
				<div className='header-img' style={headerStyle} >
					<div className='darken-overlay'>
						<div className='title frank-font'>
							<div>{cadvertiser}</div>	
							<div>{
								campaign && campaign.donation? "have donated so far" : "are donating"
								}</div>							
							{campaign && campaign.donation? <div><Misc.Money amount={donationValue} minimumFractionDigits={2} /></div> : null}
							<div>to charity</div>
						</div>
						<div className='ads-for-good' style={brandColorBgStyle}>
							<a href='https://my.good-loop.com/' target='_blank'>
								<img alt='Good Loop Ads For Good Logo' src='img/gl-logo-2018-11-white-overlay.png' />
							</a>
						</div>
						<div className='arrow'>
							<Link activeClass='active' className='arrowhead' to='arrowhead' spy smooth duration={2000}>
								<span></span>
								<span></span>
							</Link>
						</div>
					</div>	
				</div>
			</div>
			<div className='grid-tile middle' style={compliColorBgStyle}>
				<Element name='arrowhead' className='element'>
					<div className='inside'>
						<div className='title frank-font' style={brandColorTxtStyle}>
							<MDText source={desc_title} />							
						</div>
						<div className='subtitle helvetica-font'>
							<MDText source={desc_body} />							
						</div>
						<LinkToAdWidget cparent={cparent} adid={adid} status={status} brandColorTxtStyle={brandColorTxtStyle} />
						<DonationInfoWidget cparent={cparent} clist={clist} campaignSlice={campaignSlice} brandColorBgStyle={brandColorBgStyle} brandColorTxtStyle={brandColorTxtStyle} logoStyle={logoStyle}/>
					</div>
				</Element>
			</div>
			<div className='grid-tile bottom' style={brandColorBgStyle}>
				<div className='foot bebas-font'>			
					<SocialMediaFooterWidget type={'vertiser'} name={cadvertiser} src={brand} />
					<SocialMediaFooterWidget type={'campaign'} name={cparent} src={campaign} />
					<SocialMediaFooterWidget type={'goodloop'} name={'GOOD-LOOP'} src={gl_social} />
				</div>
			</div>
		</div>
		<Footer leftFooter={startDate} rightFooter={smallPrint} brandColorBgStyle={brandColorBgStyle} />
	</div>);
};

export default CampaignPage;
