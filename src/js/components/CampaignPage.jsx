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
	let campaignPage = {
		// bg: http;klsw
	};
	// TODO advert & campaign from the path
	const lpath = DataStore.getValue(['location','path']);
	let vertId = lpath[1];
	return (<div className='campaign-page'>
		<div className='wrapper'>
			<div className='one'>
				<div className='kitkat-head frank-font'>
					<img alt='Kitkat Logo' src='/img/kitkat-logo-scaled.png' />
					<span> Supports </span>
					<img alt='Cocoa Plan Logo' src='/img/cocoa-plan-logo-scaled.png' />
				</div>
				<div className='header-img'>
					<div className='darken-overlay'>
						<div className='title frank-font'>
							<div>£15,563.80</div>
							<div>RAISED SO FAR</div>
						</div>
						<div className='ads-for-good'>
								<img alt='Good Loop Ads For Good Logo' src='/img/ads-for-good.png' />
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
							<a href='http://as.good-loop.com/?status=ALL_BAR_TRASH&gl.vert=HSSI0nvg' target='_blank'>
							WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH NESTLÉ® COCOA PLAN® PROJECT YOU WOULD LIKE TO FUND.
							</a>
						</p>
						<div className='donation-circles'>
							<div className='circle c1' onClick={(e) => handleClick('a1','d1')}>
								<p className='bebas-font'><span className='frank-font'>26%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Cocoa Plan Vegetable Growing Kit project' src='/img/stats1.jpg' />
								<div className='project-name frank-font'>
									Vegetable Growing Kit
								</div>
								<div className='arrow-up a1'></div>
							</div>
							<div className='circle c2' onClick={(e) => handleClick('a2','d2')}>
								<p className='bebas-font'><span className='frank-font'>36%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Cocoa Plan Solar Chargers project' src='/img/stats2.jpg' />
								<div className='project-name frank-font'>
									Solar Chargers
								</div>
								<div className='arrow-up a2 hidden'></div>
							</div>
							<div className='circle c3' onClick={(e) => handleClick('a3','d3')}>
								<p className='bebas-font'><span className='frank-font'>38%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Cocoa Plan School Kits project' src='/img/stats3-scaled.jpg' />
								<div className='project-name frank-font'>
									School Kits
								</div>
								<div className='arrow-up a3 hidden'></div>
							</div>
							<div className='details d1'>
								<div className='innards'>
									<img alt='Vegetable Growing Kit' src='/img/stats1.jpg' />
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
									<img alt='Solar Chargers' src='/img/stats2.jpg' />
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
									<img alt='School Kits' src='/img/stats3-scaled.jpg' />
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
						<a href='https://www.facebook.com/kitkatuk/' target='_blank'><img src='\img\facebook.png' /></a>
						<a href='https://twitter.com/KITKAT' target='_blank'><img src='\img\twitter.png' /></a>
						<a href='https://www.instagram.com/kitkat' target='_blank'><img src='\img\instagram.png' /></a>
					</div>
					<div className='social nestle'>
						<p>NESTLÉ<span>®</span> COCOA PLAN<span>®</span></p>
					</div>
					<div className='social goodloop'>
						<p>GOOD-LOOP</p>
						<a href='https://www.facebook.com/the.good.loop/' target='_blank'><img src='\img\facebook.png' /></a>
						<a href='https://twitter.com/goodloophq' target='_blank'><img src='\img\twitter.png' /></a>
						<a href='https://www.instagram.com/good.loop.ads/' target='_blank'><img src='\img\instagram.png' /></a>
					</div>
				</div>
			</div>
		</div>
	</div>);
};

export default CampaignPage;
