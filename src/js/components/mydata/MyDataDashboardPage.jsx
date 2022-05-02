import React, { useState } from 'react';
import { Col, Row, Container, TabContent, TabPane, Card, CardTitle, CardText, Button, Nav, NavItem, NavLink } from 'reactstrap';
import Person, { getAllXIds, getEmail, getProfile, getPVClaim, hasConsent, PURPOSES } from '../../base/data/Person';
import DataStore from '../../base/plumbing/DataStore';
import Login from '../../base/youagain';
import {MyDataSignUpButton, MyDataSignUpModal} from './MyDataSignUp';
import { getPersonSetting, getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import classnames from 'classnames';
import MyDataDashboardHomeTab from './MyDataDashboardHomeTab';
import MyDataDashboardProfileTab from './MyDataDashboardProfileTab';
import { ProfileDot, ProfileDotRow } from './MyDataCommonComponents';
import { countryListAlpha2 } from '../../base/data/CountryRegion';
import CharityLogo from '../CharityLogo';
import MyDataBadge from './MyDataBadge';
import TickerTotal from '../TickerTotal';
import { getTabsOpened } from '../pages/TabsForGoodSettings';
import { Collapse } from "reactstrap";
import Misc from '../../base/components/Misc';
import { Tab, Tabs } from '../../base/components/Tabs';
import { modifyPage } from '../../base/plumbing/glrouter';
import C from '../../C';

/**
 * @returns {?Date} 
 */
 const getJoinedDate = () => {
	const person = getProfile().value;
	if (!person) {
		return 1;
	}
	// use the oldest claim (TODO lets have a register claim and use that)
	let claims = Person.claims(person);
	// const claims = getClaims({persons, key:"app:t4g.good-loop.com"});
	// find the oldest
	const claimDates = claims.map(c => c.t).filter(t => t);
	claimDates.sort();
	const oldest = claimDates[0];
	if (!oldest) {
		console.warn("getJoinedMonth - No claim date");
		return null;
	}
	const dateJoined = new Date(oldest);
	return dateJoined;
};

/**
 * @returns {Number} [0,1] percentage completed and shared
 */
export const getDataProgress = () => { 
	let count = 0;
	const keys = ["name", "email", "dob", "gender", "country", "location-region", "causes", "adstype"]
	const claims = keys.map(key => getPVClaim({key}).value);

	claims.forEach(claim => {
		if ( ! claim || ! claim.v) return; // unset				
		let consent = Claim.consent(claim);
		if (consent==="public" || consent==="careful") count++;
		else if (consent==="private") count += 0.1; // private
		else count += 0.25; // unset / other
	});

	return count/keys.length;
}

/**
 * 
 * @returns {Number} [0,2] progress of T4G in tabs viewed
 */
const getT4GProgress = () =>{
	let pvTabsOpened = getTabsOpened();
	if ( ! pvTabsOpened || ! pvTabsOpened.value) {
		return 0;
	}
	let tabs = pvTabsOpened.value;
	if (tabs < 25) return 0.25; // earn a chunk of the badge by installing
	if (tabs <= 100) return tabs/100; // linear to level 1
	return 100;	// TODO how do we do level 2??
};

const MyDataDashboardPage = () => {
	let xids = getAllXIds();
	let user = Login.getUser();
	let name = getPersonSetting({key:'name'}) || user.name || user.xid;

	
	const pvNgo = getCharityObject();
	let ngo = null;
	if (pvNgo) ngo = pvNgo.value || pvNgo.interim;
	
	let joinedDate = getJoinedDate();
	let locationCountryCode = getPersonSetting({key:"country"});
	let locationCountry = countryListAlpha2[locationCountryCode];

	const [showBadgeInfo, setShowBadgeInfo] = useState();

	const toggleShowBadgeInfo = (badge) => {
		if (showBadgeInfo===badge) {
			setShowBadgeInfo(null);
		} else {
			setShowBadgeInfo(badge);
		}
	};
	
	const toggleShowInfoTabs = () => {
		setShowInfoTabs(!showInfoTabs);
		// hide any others
		if (show) setShowInfoTabs(false);
		if (showInfoAds) setShowInfoAds(false);
	}

	const toggleShowInfoAds = () => {
		setShowInfoAds(!showInfoAds);
	}

	let activeTabId = DataStore.getUrlValue("tab") || "dashboard"; 

	return <div className='my-data'>
		<Container id='profile'>
			{name && <h4>{name}</h4>}
			{locationCountry && <h5>{locationCountry}</h5>}
			<br/>
			<ProfileDotRow>
				<ProfileDot TODOMYDATA_img className="mt-3 mt-md-0">{joinedDate && <>Joined &nbsp; <Misc.RoughDate date={joinedDate}/></>}</ProfileDot>
				<ProfileDot imgUrl={ngo && ngo.logo}>{ngo && <>Supporting {NGO.displayName(ngo)}</>}</ProfileDot>
				<ProfileDot TODOMYDATA_img ><>
					{/* Show exactly the same amount as what displays on T4G */}
					<p style={{margin: "0"}}><span className="font-weight-bold pr-1"><TickerTotal /></span>
					Raised With Our Global Community</p>
				</></ProfileDot>
			</ProfileDotRow>
		</Container>
		<br/>
		<Container id='badges' className='d-flex justify-content-between'>
			<MyDataBadge badgeName="Data" progress={getDataProgress()} backgroundImage="img/mydata/data-badge.png" 
				// notification={1}  multi-level?? not in this release
				toggle={() => toggleShowBadgeInfo("data")} />
			<MyDataBadge badgeName="Tabs" progress={getT4GProgress()} backgroundImage="img/mydata/tabs-badge.png" 
				toggle={() => toggleShowBadgeInfo("tabs")} />
			<MyDataBadge badgeName="Ads" backgroundImage="img/mydata/ads-badge.png" 
				toggle={() => toggleShowBadgeInfo("ads")} />
			<p>Collect Badges for your activity. Dip into these things when it suits you - ignore them when you're busy.</p>
		</Container>
		<Collapse isOpen={showBadgeInfo==="data"}>
			<div className="speech-bubble">
				<p>The Data-Hero badge: Add to your data profile to earn more and collect this badge.</p>
			</div>
		</Collapse>
		<Collapse isOpen={showBadgeInfo==="tabs"}>
			<div className="speech-bubble">
				<p>The Tab-Star badge: <C.A href='/tabsforgood'>Install {C.T4G}</C.A> then just open those tabs to raise donations and collect this badge.</p>				
			</div>
		</Collapse>
		<Collapse isOpen={showBadgeInfo==="ads"}>
			<div className="speech-bubble">
				{/* TODO a link that opens the MyDataDashboardHomeTab and scrolls you to the watch-an-ad card. Or otherwise takes you to that card */}
				<p>The Ad-Audience badge: Tune in weekly to watch Ads-for-Good to raise donations and collect this badge.</p>
			</div>
		</Collapse>

		<Tabs activeTabId={activeTabId} setActiveTabId={tabId => modifyPage(null, {tab:tabId})} >
			<Tab tabId='dashboard' title={<><img src='img/mydata/home-tab.png' style={{height:'1.5rem',marginRight:'.5em'}} />HOME</>}>
				<MyDataDashboardHomeTab />
			</Tab>
			<Tab tabId='profile' title={<><img src='img/mydata/data-tab.png' style={{height:'1.5rem',marginRight:'.5em'}} />DATA PROFILE</>}>
				<MyDataDashboardProfileTab />
			</Tab>
		</Tabs>
	</div>
}

export default MyDataDashboardPage;