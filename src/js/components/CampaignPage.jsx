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

let handleClick = (param) => {
	let dList = ['d1','d2','d3'];
	let d = document.getElementsByClassName(param)[0];
	if (d.classList.contains('hidden')) {
		console.log("gonna wanna show " + param);
		dList.forEach(function(val,index) { 
			console.log("looking at " + val);
			let temp = document.getElementsByClassName(val)[0];
			if (!temp.classList.contains('hidden')) {
				console.log("but first let's hide " + val);
				temp.classList.add('hidden');
			}
		});
		d.classList.remove('hidden');
		//d.style.display = 'block';
	} else {
		console.log("gonna hide " + param);
		d.classList.add('hidden');
		//d.style.display = 'none';
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
				<p className='kitkat frank-font'>
					<img alt='Kitkat Logo' src='/img/kitkat-logo.png' />
					<span> Supports </span>
					<img alt='Cocoa Plan Logo' src='/img/cocoa-plan-logo.png' />
				</p>
				<div className='header-img'>
					<div className='darken-overlay'>
						<p className='title frank-font'>
							<p>£15,563.80</p>
							<p>RAISED SO FAR</p>
						</p>
						<p className='ads-for-good'>
							<img alt='Good Loop Ads For Good Logo' src='/img/ads-for-good.png' />
						</p>
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
							At Nestlé we’re committed to improving the lives of cocoa farmers.<br/>
					So we have committed to donating half of our KITKAT® advertising money to
					support the NESTLÉ® COCOA PLAN®, through the ‘Ads for Good’ player.
						</p>
						<p className='link bebas-font'>
							<a href='http://as.good-loop.com/' target='_blank'>
							WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH NESTLÉ® COCOA PLAN® PROJECT YOU WOULD LIKE TO FUND.
							</a>
						</p>
						<div className='donation-circles'>
							<div className='circle c1' onClick={(e) => handleClick('d1')}>
								<p className='bebas-font'><span className='frank-font'>26%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Vegetable Growing Kit' src='/img/stats1.jpg' />
								<div className='project-name frank-font'>
									Vegetable Growing Kit
								</div>
							</div>
							<div className='circle c2' onClick={(e) => handleClick('d2')}>
								<p className='bebas-font'><span className='frank-font'>36%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='Solar Chargers' src='/img/stats2.jpg' />
								<div className='project-name frank-font'>
									Solar Chargers
								</div>
							</div>
							<div className='circle c3' onClick={(e) => handleClick('d3')}>
								<p className='bebas-font'><span className='frank-font'>38%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt='School Kits' src='/img/stats3.jpg' />
								<div className='project-name frank-font'>
									School Kits
								</div>
							</div>
							<div className='details d1'>
								<div className='arrow-up'></div>
								<div className='innards'>
									<div className='top bebas-font'>
										MORE INFORMATION ABOUT THIS CAUSE
									</div>
									<div className='title frank-font'>Vegetable Growing Kit</div>
									<div className='description helvetica-font'>
										Lorem ipsum dolor sit amet, consectetuer adipiscing
										elit, sed diam nonummy Lorem ipsum dolor sit amet,
										consectetuer adipiscing elit, sed diam nonummy nibh
										euismod tincidunt ut laoreet dolore magna aliquam erat
										volutpat. Ut wisi enim ad minim veniam, quis nostrud
										exerci tation ullamcorper suscipit lobortis nisl ut aliquip
										ex ea commodo consequat.
									</div>
									<div className='btnlink frank-font'>
										<a href='http://www.nestlecocoaplan.com/'>
											Find out more about the<br/> Nestlé® Cocoa Plan®
										</a>
									</div>
								</div>
							</div>
							<div className='details d2 hidden'>
								<div className='arrow-up'></div>
								<div className='innards'>
									<div className='top bebas-font'>
										MORE INFORMATION ABOUT THIS CAUSE
									</div>
									<div className='title frank-font'>Solar Chargers</div>
									<div className='description helvetica-font'>
										Lorem ipsum dolor sit amet, consectetuer adipiscing
										elit, sed diam nonummy Lorem ipsum dolor sit amet,
										consectetuer adipiscing elit, sed diam nonummy nibh
										euismod tincidunt ut laoreet dolore magna aliquam erat
										volutpat. Ut wisi enim ad minim veniam, quis nostrud
										exerci tation ullamcorper suscipit lobortis nisl ut aliquip
										ex ea commodo consequat.
									</div>
									<div className='btnlink frank-font'>
										<a href='http://www.nestlecocoaplan.com/'>
											Find out more about the<br/> Nestlé® Cocoa Plan®
										</a>
									</div>
								</div>
							</div>
							<div className='details d3 hidden'>
								<div className='arrow-up'></div>
								<div className='innards'>
									<div className='top bebas-font'>
										MORE INFORMATION ABOUT THIS CAUSE
									</div>
									<div className='title frank-font'>School Kits</div>
									<div className='description helvetica-font'>
										Lorem ipsum dolor sit amet, consectetuer adipiscing
										elit, sed diam nonummy Lorem ipsum dolor sit amet,
										consectetuer adipiscing elit, sed diam nonummy nibh
										euismod tincidunt ut laoreet dolore magna aliquam erat
										volutpat. Ut wisi enim ad minim veniam, quis nostrud
										exerci tation ullamcorper suscipit lobortis nisl ut aliquip
										ex ea commodo consequat.
									</div>
									<div className='btnlink frank-font'>
										<a href='http://www.nestlecocoaplan.com/'>
											Find out more about the<br/> Nestlé® Cocoa Plan®
										</a>
									</div>
								</div>
							</div>

						</div>
					</div>
				</Element>
			</div>
			<div className='four bebas-font'>
				<div className='foot'>
					<div className='social'>
						<p>KITKAT®</p>
						<a href='https://www.facebook.com/kitkatuk/' target='_blank'><img src='\img\facebook.png' /></a>
						<a href='https://twitter.com/KITKAT' target='_blank'><img src='\img\twitter.png' /></a>
						<a href='https://www.instagram.com/kitkat' target='_blank'><img src='\img\instagram.png' /></a>
					</div>
					<div className='social'>
						<p>NESTLÉ® COCOA PLAN®</p>
						<a href='https://www.facebook.com/Nestle' target='_blank'><img src='\img\facebook.png' /></a>
						<a href='https://twitter.com/Nestle' target='_blank'><img src='\img\twitter.png' /></a>
						<a href='https://www.instagram.com/nestlecocoaplan' target='_blank'><img src='\img\instagram.png' /></a>
					</div>
					<div className='social'>
						<p>GOOD LOOP</p>
						<a href='https://www.facebook.com/the.good.loop/' target='_blank'><img src='\img\facebook.png' /></a>
						<a href='https://twitter.com/goodloophq' target='_blank'><img src='\img\twitter.png' /></a>
						<a href='' target='_blank'><img src='\img\instagram.png' /></a>
					</div>
				</div>
			</div>
		</div>
	</div>);
};

export default CampaignPage;
