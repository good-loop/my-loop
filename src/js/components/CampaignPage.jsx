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
				<p className="title">
					£15,563.80<br/> 
					RAISED SO FAR
				</p>
				<div className="arrow">
					<Link activeClass="active" className="arrowhead" to="arrowhead" spy={true} smooth={true} duration={2000}>
							<span></span>
							<span></span>
					</Link>
				</div>
			</div>
		</div>
		<Element name="arrowhead" className="element">
			<div className="wrapper">
				<div className="two">
						<p className="title">
							OUR COMMITMENT
						</p>
						<p className="subtitle">
							At Nestlé we’re committed to improving the lives of cocoa farmers.<br/>
					So we have committed to donating half of our KITKAT® advertising money to
					support the NESTLÉ® COCOA PLAN®, through the ‘Ads for Good’ player.
						</p>
						<p className="link">
							<a href=''>
							WATCH AN ADVERT, UNLOCK A FREE DONATION, AND CHOOSE WHICH NESTLÉ® COCOA PLAN® PROJECT YOU WOULD LIKE TO FUND.
							</a>
						</p>
						<div className="donation-circles">
							<div className="circle">
								<p><span>26%</span><br/> HAS BEEN DONATED TO...</p>
								<img src="https://www.musthavegifts.org/media/catalog/product/cache/1/small_image/400x400/17f82f742ffe127f42dca9de82fb58b1/d/4/d485-0770-36_870901_1200x1200.jpg" />
								<div className="charity-name">
									Vegetable Growing Kit
								</div>
							</div>
							<div className="circle">
								<p><span>36%</span><br/> HAS BEEN DONATED TO...</p>
								<img src="https://www.musthavegifts.org/media/catalog/product/cache/1/small_image/400x400/17f82f742ffe127f42dca9de82fb58b1/d/4/d485-0770-36_870901_1200x1200.jpg" />
								<div className="charity-name">
									Solar Chargers
								</div>
							</div>
							<div className="circle">
								<p><span>
								38%</span><br/> HAS BEEN DONATED TO...</p>
								<img src="https://www.musthavegifts.org/media/catalog/product/cache/1/small_image/400x400/17f82f742ffe127f42dca9de82fb58b1/d/4/d485-0770-36_870901_1200x1200.jpg" />
								<div className="charity-name">
									School Kits
								</div>
							</div>

						</div>
				</div>
			</div>
		</Element>

		<div className="wrapper">
			<div className="three">
			</div>
		</div>
		<div className="wrapper">
			<div className="four">
				<div className="wrapper">
					<div>
						<p>KITKAT®</p>
						<img src="https://i.imgur.com/6JwS1Tj.png"/>
						<img src="https://i.imgur.com/sLaWazJ.png"/>
						<img src="https://i.imgur.com/5rDki1U.png"/>
					</div>
					<div>
						<p>NESTLÉ® COCOA PLAN®</p>
						<img src="https://i.imgur.com/6JwS1Tj.png"/>
						<img src="https://i.imgur.com/sLaWazJ.png"/>
						<img src="https://i.imgur.com/5rDki1U.png"/>
					</div>
					<div>
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
