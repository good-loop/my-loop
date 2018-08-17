

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
					<span></span>
					<span></span>
				</div>
			</div>
		</div>
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
			</div>
		</div>
		<div className="wrapper">
			<div className="three"></div>
		</div>
		<div className="wrapper">
			<div className="four">
				<div className="wrapper">
					<p>
					KITKAT®
					</p>
					<p>
					NESTLÉ® COCOA PLAN®
					</p>
					<p>
					GOOD LOOP
					</p>
				</div>
			</div>
		</div>
	</div>);
};

export default CampaignPage;
