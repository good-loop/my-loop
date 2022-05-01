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

/**
 * @returns {!Number}
 */
 const getJoinedMonthYear = () => {
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
	const dmsecs = new Date(oldest).getTime();
	let monthYear = new Date(dmsecs).toUTCString().split(" ").slice(2,4).join(" ");
	return monthYear;
};

class DashboardTab extends React.Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		
		if (DataStore.getUrlValue('dashboard') == "profile") { // account?tab=dashboard&dashboard=profile
			this.state = {activeTab: '2'};
		} else {
			this.state = {activeTab: '1'};
		}
	}

	toggle(tab) {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab
			});
		}
	}

	render() {
		return (
			<div>
				<Nav tabs>
					<NavItem>
						<NavLink
							className={classnames({ active: this.state.activeTab === '1' }) + " text-left"}
							onClick={() => { this.toggle('1'); }}
						>
							<img src='img/mydata/home-tab.png' style={{height:'1.5rem',marginRight:'.5em'}} />HOME
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink
							className={classnames({ active: this.state.activeTab === '2' }) + " text-left"}
							onClick={() => { this.toggle('2'); }}
						>
							<img src='img/mydata/data-tab.png' style={{height:'1.5rem',marginRight:'.5em'}} />DATA PROFILE
						</NavLink>
					</NavItem>
				</Nav>
				<TabContent activeTab={this.state.activeTab}>
					<TabPane tabId="1">
						<MyDataDashboardHomeTab />
					</TabPane>

					<TabPane tabId="2">
						<MyDataDashboardProfileTab />
					</TabPane>
				</TabContent>
			</div>
		);
	}
}

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
	
	let joinedMonthYear = getJoinedMonthYear();
	let locationCountryCode = getPersonSetting({key:"country"});
	let locationCountry = countryListAlpha2[locationCountryCode];

	const [showInfoData, setShowInfoData] = useState(false);
	const [showInfoTabs, setShowInfoTabs] = useState(false);
	const [showInfoAds, setShowInfoAds] = useState(false);

	const toggleShowInfoData = () => {
		setShowInfoData(!showInfoData);
	}
	
	const toggleShowInfoTabs = () => {
		setShowInfoTabs(!showInfoTabs);
	}

	const toggleShowInfoAds = () => {
		setShowInfoAds(!showInfoAds);
	}
	
	return <div className='my-data'>
		<Container id='profile'>
			{name && <h4>{name}</h4>}
			{locationCountry && <h5>{locationCountry}</h5>}
			<br/>
			<ProfileDotRow>
				<ProfileDot TODOMYDATA_img className="mt-3 mt-md-0">{joinedMonthYear && <>Joined {joinedMonthYear}</>}</ProfileDot>
				<ProfileDot imgUrl={ngo && ngo.logo}>{ngo && <>Supporting {NGO.displayName(ngo)}</>}</ProfileDot>
				<ProfileDot TODOMYDATA_img ><>
					{/* Show exactly the same amount as what displays on T4G */}
					<p style={{margin: "0"}}><span className="font-weight-bold pr-1"><TickerTotal /></span>
					Rasied With Our Global Community</p>
				</></ProfileDot>
			</ProfileDotRow>
		</Container>
		<br/>
		<Container id='badges' className='d-flex justify-content-between'>
			<MyDataBadge badgeName="Data" progress={getDataProgress()} backgroundImage="img/mydata/data-badge.png" notification={1} toggle={toggleShowInfoData}/>
			<MyDataBadge badgeName="Tabs" progress={getT4GProgress()} backgroundImage="img/mydata/tabs-badge.png" toggle={toggleShowInfoTabs} />
			<MyDataBadge badgeName="Ads" backgroundImage="img/mydata/ads-badge.png" toggle={toggleShowInfoAds} />
		</Container>
		<Collapse isOpen={showInfoData}>
			<div className="speech-bubble">
				<p>Complete Your Data Profile To Earn Your Badge And Raise Even More For ...</p>
			</div>
		</Collapse>
		<Collapse isOpen={showInfoTabs}>
			<div className="speech-bubble">
				<p>Complete Your Data Profile To Earn Your Badge And Raise Even More For ...</p>
			</div>
		</Collapse>
		<Collapse isOpen={showInfoAds}>
			<div className="speech-bubble">
				<p>Complete Your Data Profile To Earn Your Badge And Raise Even More For ...</p>
			</div>
		</Collapse>

		<br/>
		<DashboardTab />
	</div>
}

export default MyDataDashboardPage;