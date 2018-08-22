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
import { Link, Element } from "react-scroll";

const CampaignPage = () => {
	let campaignPage = {
		// bg: http;klsw
	};
	// TODO advert & campaign from the path
	const lpath = DataStore.getValue(['location','path']);
	let vertId = lpath[1];
	return (<div className="campaign-page">
		<div className="wrapper">
			<div className="one">
				<p className="kitkat frank-font">
					<img alt="Kitkat Logo" src="/img/kitkat-logo.png" />
					<span> Supports </span>
					<img alt="Cocoa Plan Logo" src="/img/cocoa-plan-logo.png" />
				</p>
				<div className="header-img">
					<div className="darken-overlay">
						<p className="title frank-font">
							<p>£15,563.80</p>
							<p>RAISED SO FAR</p>
						</p>
						<p className="ads-for-good">
							ADS FOR GOOD 
						</p>
						<div className="arrow">
							<Link activeClass="active" className="arrowhead" to="arrowhead" spy={true} smooth={true} duration={2000}>
									<span></span>
									<span></span>
							</Link>
						</div>
					</div>	
  				</div>
			</div>
			<div className="two">
				<Element name="arrowhead" className="element">
					<div className="inside">
						<p className="title frank-font">
							OUR COMMITMENT
						</p>
						<p className="subtitle helvetica-font">
							At Nestlé we’re committed to improving the lives of cocoa farmers.<br/>
					So we have committed to donating half of our KITKAT® advertising money to
					support the NESTLÉ® COCOA PLAN®, through the ‘Ads for Good’ player.
						</p>
						<p className="link bebas-font">
							<a href='http://as.good-loop.com/'>
							WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH NESTLÉ® COCOA PLAN® PROJECT YOU WOULD LIKE TO FUND.
							</a>
						</p>
						<div className="donation-circles">
							<div className="circle">
								<p className="bebas-font"><span className="frank-font">26%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt="Vegetable Growing Kit" src="/img/stats1.jpg" />
								<div className="project-name frank-font">
									Vegetable Growing Kit
								</div>
							</div>
							<div className="circle">
								<p className="bebas-font"><span className="frank-font">36%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt="Solar Chargers" src="/img/stats2.jpg" />
								<div className="project-name frank-font">
									Solar Chargers
								</div>
							</div>
							<div className="circle">
								<p className="bebas-font"><span className="frank-font">38%</span><br/> HAS BEEN DONATED TO...</p>
								<img alt="School Kits" src="/img/stats3.jpg" />
								<div className="project-name frank-font">
									School Kits
								</div>
							</div>
						</div>
					</div>
				</Element>
			</div>
			<div className="four bebas-font">
				<div className="foot">
					<div className="social">
						<p>KITKAT®</p>
						<img src="https://i.imgur.com/6JwS1Tj.png"/>
						<img src="https://i.imgur.com/sLaWazJ.png"/>
						<img src="https://i.imgur.com/5rDki1U.png"/>
					</div>
					<div className="social">
						<p>NESTLÉ® COCOA PLAN®</p>
						<img src="https://i.imgur.com/6JwS1Tj.png"/>
						<img src="https://i.imgur.com/sLaWazJ.png"/>
						<img src="https://i.imgur.com/5rDki1U.png"/>
					</div>
					<div className="social">
						<p>GOOD LOOP</p>
						<img src="https://i.imgur.com/6JwS1Tj.png"/>
						<img src="https://i.imgur.com/sLaWazJ.png"/>
						<img src="https://i.imgur.com/5rDki1U.png"/>
					</div>
				</div>
			</div>
		</div>
	</div>);
};

export default CampaignPage;
