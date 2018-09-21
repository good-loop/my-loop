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

let handleClick = (targetArrow, targetDetails) => {
	let aList = ['a1','a2','a3'];
	let dList = ['d1','d2','d3'];
	let d = document.getElementsByClassName(targetDetails)[0];
	let a = document.getElementsByClassName(targetArrow)[0];
	if (d.classList.contains('hidden')) {
		dList.forEach(function(val,index) { 
			let temp = document.getElementsByClassName(val)[0];
			if (!temp.classList.contains('hidden')) {
				temp.classList.add('hidden');
			}
		});
		d.classList.remove('hidden');

		aList.forEach(function(val,index) { 
			let temp2 = document.getElementsByClassName(val)[0];
			if (!temp2.classList.contains('hidden')) {
				temp2.classList.add('hidden');
			}
		});
		a.classList.remove('hidden');
	} else {
		d.classList.add('hidden');
		a.classList.add('hidden');
	}
};

const CampaignHeader = ({cparentLogo, brandLogo}) => {
	console.log(cparentLogo);
	if (cparentLogo) {
		return (
			<div>
				<img alt='KitKat Logo' src={brandLogo} />
				<span> Supports </span>
				<img alt='Nestle Cocoa Plan Logo' src={cparentLogo} />
			</div>
		);
	}
	return (<img alt='KitKat Logo' src={brandLogo} />);
};

const CampaignPage = ({path}) => {

	let adid = path ? path[1] : '';
	
	if (!path[1]){
		return <Misc.Loading text='Unable to find campaign' />;	
	}

	let pvAdvert = ActionMan.getDataItem({type:C.TYPES.Advert, id:adid, status:C.KStatus.DRAFT, domain: ServerIO.PORTAL_DOMAIN});
	if ( ! pvAdvert.resolved ) {
		return <Misc.Loading text='Loading campaign data' />;	
	}

	console.log(pvAdvert.value);

	// advertiser data
	let cadvertiser = pvAdvert.value.name;

	// branding
	let brand = pvAdvert.value.branding;
	let brandColor = brand.color;
	let brandLogo = brand.logo;
	let tw_url = brand.tw_url ? brand.tw_url : '';
	let fb_url = brand.fb_url ? brand.fb_url : '';
	let insta_url = brand.insta_url ? brand.insta_url : '';
	let yt_url = brand.yt_url ? brand.yt_url : '';

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
	let camp_tw_url = campaign.tw_url ? campaign.tw_url : '';
	let camp_fb_url = campaign.fb_url ? campaign.fb_url : '';
	let camp_insta_url = campaign.insta_url ? campaign.insta_url : '';
	let camp_yt_url = campaign.yt_url ? campaign.yt_url : '';

	// parent charity data 
	let parent = pvAdvert.value.charities.parent;
	let cparent = parent.name;
	let cparentLogo = parent.logo;

	// individual charity data
	let clist = pvAdvert.value.charities.list;
	let cids = clist.map(x => x.id);
	let cnames = clist.map(x => x.name);
	let cphotos = clist.map(x => x.photo);
	let curls = clist.map(x => x.url);
	let cdescs = clist.map(x => x.description);

	// // Get donations by user (including all registered tracking IDs)
	let start = '2018-05-01T00:00:00.000Z'; // ??is there a data issue if older??
	const dntn = "count"; // TODO! count is what we used to log, but it not reliable for grouped-by-session events, so we should use dntn. See adserver goodloop.act.donate
	// load the community total for the charity
	//??
	let pvCommunityTotal = DataStore.fetch(['widget','CampaignPage','communityTotal'], () => {
		let qcids = cids.map(xid => 'cid:'+xid).join(' OR ');
		const donationReq = {
			dataspace: 'gl',
			q: 'evt:donation AND ('+qcids+")",
			breakdown: ['cid{"'+dntn+'": "sum"}'],
			start
		};
		return ServerIO.getDataLogData(donationReq, null, 'community-donations').then(res => res.cargo);
	});

	if ( ! pvCommunityTotal.resolved ) {
		return <Misc.Loading text='Donations data' />;
	}

	let communityDonationsByCharity = pvCommunityTotal.value? pivot(pvCommunityTotal.value.by_cid.buckets, "$bi.{key, "+dntn+".sum.$n}", "$key.$n") : {};

	// make rows
	let rows = cids.map(cid => {
		return {cid, userTotal: cids[cid], communityTotal: communityDonationsByCharity[cid]};
	});

	let communityDonations = rows.reduce((acc, current) => acc + current.communityTotal, 0);

	let campaignTotalSlice = rows.map(row => {
		return {charityName: row.cid, percentageTotal: Math.round(row.communityTotal/communityDonations*100)};
	});

	// TODO advert & campaign from the path
	const lpath = DataStore.getValue(['location','path']);
	let vertId = lpath[1];
	return (<div className='campaign-page'>
		<div className='wrapper'>
			<div className='one'>
				<div className='kitkat-head frank-font'>
					<CampaignHeader cparentLogo={cparentLogo} brandLogo={brandLogo} />
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
			<div className='two'>
				<Element name='arrowhead' className='element'>
					<div className='inside'>
						<div className='title frank-font'>
							<MDText source={desc_title} />							
						</div>
						<div className='subtitle helvetica-font'>
							<MDText source={desc_body} />							
						</div>
						<p className='link bebas-font'>
							<a href={'http://as.good-loop.com/?status=PUBLISHED&gl.vert='.concat(adid)} target='_blank'>
							WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH NESTLÉ® COCOA PLAN® PROJECT YOU WOULD LIKE TO FUND.
							</a>
						</p>
						<div className='donation-circles'>
							<div className='circle c1' onClick={(e) => handleClick('a1','d1')}>
								<p className='bebas-font'><span className='frank-font'>{campaignTotalSlice[0].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt={cparent+' '+cnames[0]} src={cphotos[0]} />
								<div className='project-name frank-font'>
									{cnames[0]}
								</div>
								<div className='arrow-up a1'></div>
							</div>
							<div className='circle c2' onClick={(e) => handleClick('a2','d2')}>
								<p className='bebas-font'><span className='frank-font'>{campaignTotalSlice[1].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt={cparent+' '+cnames[1]} src={cphotos[1]} />
								<div className='project-name frank-font'>
									{cnames[1]}
								</div>
								<div className='arrow-up a2 hidden'></div>
							</div>
							<div className='circle c3' onClick={(e) => handleClick('a3','d3')}>
								<p className='bebas-font'><span className='frank-font'>{campaignTotalSlice[2].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt={cparent+' '+cnames[2]} src={cphotos[2]} />
								<div className='project-name frank-font'>
									{cnames[2]}
								</div>
								<div className='arrow-up a3 hidden'></div>
							</div>
							<div className='details d1'>
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
							<div className='details d2 hidden'>
								<div className='innards'>
									<img alt={cparent+' '+cnames[1]} src={cphotos[1]} />
									<div className="text">
										<div className='title frank-font'>{cnames[1].toUpperCase()}</div>
										<div className='description helvetica-font'>
											<MDText source={cdescs[1]} />
										</div>
										<div className='btnlink frank-font' onClick={(e) => window.open(curls[1], '_blank')}>
											Find out more about the<br/> {cparent}
										</div>
									</div>
								</div>
							</div>
							<div className='details d3 hidden'>
								<div className='innards'>
									<img alt={cparent+' '+cnames[2]} src={cphotos[2]} />
									<div className="text">
										<div className='title frank-font'>{cnames[2].toUpperCase()}</div>
										<div className='description helvetica-font'>
											<MDText source={cdescs[2]} />
										</div>
										<div className='btnlink frank-font' onClick={(e) => window.open(curls[2], '_blank')}>
											Find out more about the<br/> {cparent}
										</div>
									</div>
								</div>
							</div>

						</div>
					</div>
				</Element>
			</div>
			<div className='four bebas-font'>
				<div className='foot'>
					<div className='social kitkat'>
						<p>{cadvertiser}</p>
						<a href={fb_url} target='_blank'><img src='https://lg.good-loop.com/cdn/images/facebook.png' /></a>
						<a href={tw_url} target='_blank'><img src='https://lg.good-loop.com/cdn/images/twitter.png' /></a>
						<a href={insta_url} target='_blank'><img src='https://lg.good-loop.com/cdn/images/instagram.png' /></a>
					</div>
					<div className='social nestle'>
						<p>{cparent}</p>
						<a href={camp_yt_url} target='_blank'><img src='/img/youtube.png' /></a>
						<a href={camp_insta_url} target='_blank'><img src='https://lg.good-loop.com/cdn/images/instagram.png' /></a>
					</div>
					<div className='social goodloop'>
						<p>GOOD-LOOP</p>
						<a href='https://www.facebook.com/the.good.loop/' target='_blank'><img src='https://lg.good-loop.com/cdn/images/facebook.png' /></a>
						<a href='https://twitter.com/goodloophq' target='_blank'><img src='https://lg.good-loop.com/cdn/images/twitter.png' /></a>
						<a href='https://www.instagram.com/good.loop.ads/' target='_blank'><img src='https://lg.good-loop.com/cdn/images/instagram.png' /></a>
					</div>
				</div>
			</div>
		</div>
		<Footer leftFooter={startDate} rightFooter={smallPrint} />
	</div>);
};

export default CampaignPage;
