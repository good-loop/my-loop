import React from 'react';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';
import pivot from 'data-pivot';
import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Person from '../base/data/Person';
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

const CampaignHeaderWidget = ({cparentLogo, brandLogo}) => {
	if (cparentLogo) {
		return (
			<div>
				<img alt='Sponsor Logo' src={brandLogo} />
				<span> Supports </span>
				<img alt='Charity Logo' src={cparentLogo} />
			</div>
		);
	}
	return (<img alt='Sponsor Logo' src={brandLogo} />);
};

const SocialMediaFooterWidget = ({type, name, src}) => {
	return (
		<div className={'social '.concat(type)}>
			<p>{name}</p>
			{src.fb_url? <a href={src.fb_url} target='_blank'><img src='https://lg.good-loop.com/cdn/images/facebook.png' /></a> : null}
			{src.tw_url? <a href={src.tw_url} target='_blank'><img src='https://lg.good-loop.com/cdn/images/twitter.png' /></a> : null}
			{src.insta_url? <a href={src.insta_url} target='_blank'><img src='https://lg.good-loop.com/cdn/images/instagram.png' /></a> : null}
			{src.yt_url? <a href={src.yt_url} target='_blank'><img src='/img/youtube.png' /></a> : null}
		</div>
	);
};

// TODO fix handleClick
let _handleClick = (circleIndex) => {
	let toggle = [false, false, false];
	toggle[circleIndex] = true;
	return toggle;
};

const DonationCircleWidget = ({cparent, clist, campaignTotalSlice, index=0, name='left', shown}) => {
	let cids = clist.map(x => x.id);
	let cnames = clist.map(x => x.name);
	let cphotos = clist.map(x => x.photo);

	return (
		<div className={'circle '.concat(name)} onClick={(e) => _handleClick(index)}>
			<p className='bebas-font'><span className='frank-font'>{campaignTotalSlice[index].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p>
			<img alt={cparent+' '+cnames[index]} src={cphotos[index]} />
			<div className='project-name frank-font'>
				{cnames[index]}
			</div>
			{ shown ? <div className='arrow-up' /> : null }
		</div>
	);
};

const DonationDetailsWidget = ({cparent, clist, index=0, name='left'}) => {
	let cnames = clist.map(x => x.name);
	let cphotos = clist.map(x => x.photo);
	let curls = clist.map(x => x.url);
	let cdescs = clist.map(x => x.description);

	return (
		<div className={'details '.concat(name)}>
			<div className='innards'>
				<img alt={cparent+' '+cnames[0]} src={cphotos[0]} />
				<div className="text">
					<div className='title frank-font'>{cnames[0].toUpperCase()}</div>
					<div className='description helvetica-font'>
						<MDText source={cdescs[0]} />
					</div>
					<div className='btnlink frank-font' onClick={(e) => window.open(curls[0], '_blank')}>
						Find out more about the<br/> {cparent}
					</div>	
				</div>
			</div>
		</div>
	);
};

const DonationCirclesWidget = ({cparent, clist, campaignTotalSlice}) => {
	let toggle = [true, false, false];

	return (
		<div className='donation-circles'>
			{						
			//	For functions like handleCLick()
			//	 -- pass in a model-level value in preference to a display-level css name
			//	(e.g. elsewhere we typically use cid for charity/project ID)
			}
			<DonationCircleWidget cparent={cparent} clist={clist} campaignTotalSlice={campaignTotalSlice} index={0} name={'left'} shown={toggle[0]} />
			<DonationCircleWidget cparent={cparent} clist={clist} campaignTotalSlice={campaignTotalSlice} index={1} name={'middle'} shown={toggle[1]} />
			<DonationCircleWidget cparent={cparent} clist={clist} campaignTotalSlice={campaignTotalSlice} index={2} name={'right'} shown={toggle[2]} />
			{ toggle[0] ? 
				<DonationDetailsWidget cparent={cparent} clist={clist} index={0} name={'left'} />
				: null
			}
			{ toggle[1] ? 
				<DonationDetailsWidget cparent={cparent} clist={clist} index={1} name={'middle'} />
				: null
			}
			{ toggle[2] ? 
				<DonationDetailsWidget cparent={cparent} clist={clist} index={2} name={'right'} />
				: null
			}
		</div>
	);
};

/**
 * @param path {!String[]} The deciphered url path - e.g. ['campaign', 'kitkatadid']
 */
const CampaignPage = ({path}) => {

	let adid = path ? path[1] : '';
	
	if (!path[1]) {
		return <Misc.Loading text='Unable to find campaign' />;	
	}

	// get the ad for display (so status:published - unless this is a preview, as set by the url)
	let status = DataStore.getUrlValue("gl.status") || C.KStatus.PUBLISHED;
	let pvAdvert = ActionMan.getDataItem({type:C.TYPES.Advert, id:adid, status:C.KStatus.DRAFT, domain: ServerIO.PORTAL_DOMAIN});
	if ( ! pvAdvert.resolved ) {
		return <Misc.Loading text='Loading campaign data' />;	
	}

	console.log(pvAdvert.value);

	// advertiser data
	const ad = pvAdvert.value;
	let cadvertiser = pvAdvert.value.name;

	// branding
	let brand = pvAdvert.value.branding;
	let brandColor = brand.color;
	let brandLogo = brand.logo;

	// goodloop social
	let gl_social = {
		fb_url: 'https://www.facebook.com/the.good.loop/',
		tw_url: 'https://twitter.com/goodloophq',
		insta_url: 'https://www.instagram.com/good.loop.ads/',
	};

	// campaign 
	let campaign = pvAdvert.value.campaignPage;
	let startDate = '';
	if (pvAdvert.value.start) {
		startDate = 'This campaign started on '.concat(pvAdvert.value.start.substring(0, 10));
	}
	let smallPrint = campaign.smallPrint ? campaign.smallPrint : '';
	let bg = campaign.bg;
	let headerStyle = {
		backgroundImage: 'url(' + bg + ')',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center',
		backgroundAttachment: 'fixed'
	};
	console.log(headerStyle);
	let desc_title = campaign.desc_title;
	let desc_body = campaign.desc_body;

	// parent charity data 
	let parent = pvAdvert.value.charities.parent;
	let cparent = parent.name;
	let cparentLogo = parent.logo;

	// individual charity data
	let clist = pvAdvert.value.charities.list;
	let cids = clist.map(x => x.id);

	// load the community total for the ad
	let pvCommunityTotal = DataStore.fetch(['widget','CampaignPage','communityTotal', adid], () => {
		let q = ad.campaign? 'campaign: '+ad.campaign : 'vert: '+ad.vert;
		// TODO "" csv encoding for bits of q (e.g. campaign might have a space)
		return ServerIO.getDonationsData({q});
	});
	// TODO: fix datafn fetching
	// if ( ! pvCommunityTotal.resolved ) {
	// 	return <Misc.Loading text='Donations data' />;
	// }

	let communityDonationsByCharity = pvCommunityTotal.value? pivot(pvCommunityTotal.value.by_cid.buckets, "$bi.{key, "+dntn+".sum.$n}", "$key.$n") : {};

	// make rows
	let rows = cids.map(cid => {
		return {cid, userTotal: cids[cid], communityTotal: communityDonationsByCharity[cid]};
	});

	let communityDonations = rows.reduce((acc, current) => acc + current.communityTotal, 0);

	let campaignTotalSlice = rows.map(row => {
		return {charityName: row.cid, percentageTotal: Math.round(row.communityTotal/communityDonations*100)};
	});

	return (<div className='campaign-page'>
		<div className='grid'>
			<div className='grid-tile top'> 
				<div className='vertiser-head frank-font'>
					<CampaignHeaderWidget cparentLogo={cparentLogo} brandLogo={brandLogo} />
				</div>
				<div className='header-img' style={headerStyle} >
					<div className='darken-overlay'>
						<div className='title frank-font'>
							<div><Misc.Money amount={communityDonations} /></div>
							<div>RAISED SO FAR</div>
						</div>
						<div className='ads-for-good'>
							<img alt='Good Loop Ads For Good Logo' src='/img/for-good.png' />
						</div>
						<div className='arrow'>
							<Link activeClass='active' className='arrowhead' to='arrowhead' spy={true} smooth={true} duration={2000}>
								<span></span>
								<span></span>
							</Link>
						</div>
					</div>	
				</div>
			</div>
			<div className='grid-tile middle'>
				<Element name='arrowhead' className='element'>
					<div className='inside'>
						<div className='title frank-font'>
							<MDText source={desc_title} />							
						</div>
						<div className='subtitle helvetica-font'>
							<MDText source={desc_body} />							
						</div>
						<p className='link bebas-font'>
							<a href={'http://as.good-loop.com/?gl.vert='+encURI(adid)+"&status="+encURI(status)} target='_blank'>
							WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH NESTLÉ® COCOA PLAN® PROJECT YOU WOULD LIKE TO FUND.
							</a>
						</p>
						<DonationCirclesWidget cparent={cparent} clist={clist} campaignTotalSlice={campaignTotalSlice} />
					</div>
				</Element>
			</div>
			<div className='grid-tile bottom'>
				<div className='foot bebas-font'>			
					<SocialMediaFooterWidget type={'vertiser'} name={cadvertiser} src={brand} />
					<SocialMediaFooterWidget type={'campaign'} name={cparent} src={campaign} />
					<SocialMediaFooterWidget type={'goodloop'} name={'GOOD-LOOP'} src={gl_social} />
				</div>
			</div>
		</div>
		<Footer leftFooter={startDate} rightFooter={smallPrint} />
	</div>);
};

export default CampaignPage;
