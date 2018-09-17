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

let handleClick = (targetArrow, targetDetails) => {
	let aList = ['a1','a2','a3'];
	let dList = ['d1','d2','d3'];
	let d = document.getElementsByClassName(targetDetails)[0];
	let a = document.getElementsByClassName(targetArrow)[0];
	if (d.classList.contains('hidden')) {
		dList.forEach(function(val,index) { 
			console.log("looking at " + val);
			let temp = document.getElementsByClassName(val)[0];
			if (!temp.classList.contains('hidden')) {
				console.log("but first let's hide " + val);
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

const CampaignPage = () => {

	// charities FIXME
	let cids = ["streets_of_london", "wateraid", "mps"];

	// // Get donations by user (including all registered tracking IDs)
	let start = '2018-05-01T00:00:00.000Z'; // ??is there a data issue if older??
	const dntn = "count"; // TODO! count is what we used to log, but it not reliable for grouped-by-session events, so we should use dntn. See adserver goodloop.act.donate
	// load the community total for the charity
	??
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
					<img alt='Kitkat Logo' src='https://lg.good-loop.com/cdn/images/kitkat-logo-scaled.png' />
					<span> Supports </span>
					<img alt='Cocoa Plan Logo' src='https://lg.good-loop.com/cdn/images/cocoa-plan-logo-scaled.png' />
				</div>
				<div className='header-img'>
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
						<p className='title frank-font'>
							OUR COMMITMENT
						</p>
						<p className='subtitle helvetica-font'>
							At Nestlé we’re committed to improving the lives of cocoa farmers. So 
							we have committed to donating half of our KITKAT® advertising money to
							support the NESTLÉ® COCOA PLAN®, through the ‘Ads for Good’ player.
						</p>
						<p className='link bebas-font'>
							<a href='http://as.good-loop.com/?status=ALL_BAR_TRASH&gl.vert=xsINEuJV' target='_blank'>
							WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH NESTLÉ® COCOA PLAN® PROJECT YOU WOULD LIKE TO FUND.
							</a>
						</p>
						<div className='donation-circles'>
							<div className='circle c1' onClick={(e) => handleClick('a1','d1')}>
								<p className='bebas-font'><span className='frank-font'>{campaignTotalSlice[0].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Cocoa Plan Vegetable Growing Kit project' src='https://lg.good-loop.com/cdn/images/stats1.jpg' />
								<div className='project-name frank-font'>
									Vegetable Growing Kit
								</div>
								<div className='arrow-up a1'></div>
							</div>
							<div className='circle c2' onClick={(e) => handleClick('a2','d2')}>
								<p className='bebas-font'><span className='frank-font'>{campaignTotalSlice[1].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Cocoa Plan Solar Chargers project' src='https://lg.good-loop.com/cdn/images/stats2.jpg' />
								<div className='project-name frank-font'>
									Solar Chargers
								</div>
								<div className='arrow-up a2 hidden'></div>
							</div>
							<div className='circle c3' onClick={(e) => handleClick('a3','d3')}>
								<p className='bebas-font'><span className='frank-font'>{campaignTotalSlice[2].percentageTotal}%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Cocoa Plan School Kits project' src='https://lg.good-loop.com/cdn/images/stats3-scaled.jpg' />
								<div className='project-name frank-font'>
									School Kits
								</div>
								<div className='arrow-up a3 hidden'></div>
							</div>
							<div className='details d1'>
								<div className='innards'>
									<img alt='Vegetable Growing Kit' src='https://lg.good-loop.com/cdn/images/stats1.jpg' />
									<div className="text">
										<div className='title frank-font'>VEGETABLE GROWING KITS</div>
										<div className='description helvetica-font'>
										Poverty affects many cocoa-growing households in Côte d’Ivoire. 
										Overreliance on cocoa makes some farmers vulnerable to global 
										market price fluctuations. In order to increase and help 
										diversify their income, Nestlé and the International Cocoa 
										Initiative engage women in vegetable growing, equipping them 
										with skills, tools, seedlings, and fertilizers to grow and 
										market plantain, rice or peppers. Thanks for helping us make 
										this possible!
											<p>Average cost: $619 / group or $155 / woman</p>
										</div>
										<div className='btnlink frank-font'  onClick={(e) => window.open('http://www.nestlecocoaplan.com/', '_blank')}>
											Find out more about the<br/> Nestlé® Cocoa Plan®
										</div>	
									</div>
								</div>
							</div>
							<div className='details d2 hidden'>
								<div className='innards'>
									<img alt='Solar Chargers' src='https://lg.good-loop.com/cdn/images/stats2.jpg' />
									<div className="text">
										<div className='title frank-font'>SOLAR CHARGERS</div>
										<div className='description helvetica-font'>
										Poverty affects many cocoa-growing households. This is 
										why Nestlé and the International Cocoa Initiative have 
										united forces to increase and diversify women’s income, 
										while at the same time addressing the lack of electric 
										grid in large parts of rural Côte d’Ivoire. Thanks to 
										you, we will help women earn an additional income by 
										equipping them with a small solar charging station 
										offering their services to mobile phone owners in their 
										community.
											<p>Average cost: $103 / unit</p>
										</div>
										<div className='btnlink frank-font' onClick={(e) => window.open('http://www.nestlecocoaplan.com/', '_blank')}>
											Find out more about the<br/> Nestlé® Cocoa Plan®
										</div>
									</div>
								</div>
							</div>
							<div className='details d3 hidden'>
								<div className='innards'>
									<img alt='School Kits' src='https://lg.good-loop.com/cdn/images/stats3-scaled.jpg' />
									<div className="text">
										<div className='title frank-font'>SCHOOL KITS</div>
										<div className='description helvetica-font'>
										While primary school is free in cocoa-growing communities of Côte d’Ivoire, 
										some of Nestlé Cocoa Plan farmers struggle to pay for the books and school 
										supplies for their children. Thanks to you, Nestlé and the International 
										Cocoa Initiative will provide school kits so that more children can go to 
										school. School kits contain exercise books, note books, pens, ruler, 
										eraser, chalk and slate.
											<p>Cost: $26 / unit</p>
										</div>
										<div className='btnlink frank-font' onClick={(e) => window.open('http://www.nestlecocoaplan.com/', '_blank')}>
											Find out more about the<br/> Nestlé® Cocoa Plan®
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
						<p>KITKAT<span>®</span></p>
						<a href='https://www.facebook.com/kitkatuk/' target='_blank'><img src='https://lg.good-loop.com/cdn/images/facebook.png' /></a>
						<a href='https://twitter.com/KITKAT' target='_blank'><img src='https://lg.good-loop.com/cdn/images/twitter.png' /></a>
						<a href='https://www.instagram.com/kitkat' target='_blank'><img src='https://lg.good-loop.com/cdn/images/instagram.png' /></a>
					</div>
					<div className='social nestle'>
						<p>NESTLÉ<span>®</span> COCOA PLAN<span>®</span></p>
						<a href='https://www.youtube.com/channel/UC-iTNwTrdA4IXpGAFC3WsMg' target='_blank'><img src='/img/youtube.png' /></a>
						<a href='https://www.instagram.com/nestlecocoaplan/' target='_blank'><img src='https://lg.good-loop.com/cdn/images/instagram.png' /></a>
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
		<Footer leftFooter='This campaign started on the 17th of September 2018' rightFooter='Reg. Trademark of Société des Produits Nestlé S.A.' />
	</div>);
};

export default CampaignPage;
