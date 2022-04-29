import React from 'react';
import { Col, Row, Container, TabContent, TabPane, Card, CardTitle, CardText, Button, Nav, NavItem, NavLink } from 'reactstrap';
import Person, { getAllXIds, getEmail, getProfile, hasConsent, PURPOSES } from '../../base/data/Person';
import DataStore from '../../base/plumbing/DataStore';
import Login from '../../base/youagain';
import {MyDataSignUpButton, MyDataSignUpModal} from './MyDataSignUp';
import { getPersonSetting, getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import classnames from 'classnames';
import DashboardHome from './DashboardHome';
import DashboardProfile from './DashboardProfile';
import { ProfileDot } from './MyDataCommonComponents';
import { countryListAlpha2 } from '../../base/data/CountryRegion';
import CharityLogo from '../CharityLogo';
import MyDataBadge from './MyDataBadge';
import TickerTotal from '../TickerTotal';
import { getTabsOpened } from '../pages/TabsForGoodSettings';

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
							className={classnames({ active: this.state.activeTab === '1' })}
							onClick={() => { this.toggle('1'); }}
						>
							HOME
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink
							className={classnames({ active: this.state.activeTab === '2' })}
							onClick={() => { this.toggle('2'); }}
						>
							DATA PROFILE
						</NavLink>
					</NavItem>
				</Nav>
				<TabContent activeTab={this.state.activeTab}>
					<TabPane tabId="1">
						<DashboardHome />
					</TabPane>

					<TabPane tabId="2">
						<DashboardProfile />
					</TabPane>
				</TabContent>
			</div>
		);
	}
}

/**
 * 
 * @returns int
 */
export const getDataProgress = () => { 
	let sharedPercentage = 100;	
	const keys = ["name", "email", "birthday", "gender", "location-country", "location-region", "causes", "adstype"]
	const claims = keys.map(k => getPersonSetting({key: k}));
	const privacyClaims = keys.map(k => getPersonSetting({key: k + "-privacy"}));

	for (let [index, val] of claims.entries()) {
		if (keys[index] == "email") continue; // email should always pass 

		// Is this data point not set? Then deduct points and continue on to the next claim.
		if(val == null) {
			sharedPercentage -= 100/claims.length; 
			continue
		}
		
		// 0 = Private data setting, deduct 2/3 points
		// 1 (or null) = Default privacy setting, deduct 1/3 points
		// 2 = Public data setting, deduct no points
		if (privacyClaims[index] == '0') sharedPercentage -= (100/claims.length)*2/3
		if (privacyClaims[index] == '1' || privacyClaims[index] == null) sharedPercentage -= (100/claims.length)*1/3
	}

	return Math.round(sharedPercentage);
}

/**
 * 
 * @returns progress of T4G, max 100
 */
const getT4GProgress = () =>{
	let pvTabsOpened = getTabsOpened();
	if (pvTabsOpened && pvTabsOpened.value) {
		if (pvTabsOpened.value <= 100) {
			return pvTabsOpened.value;
		} else return 100;
	}
}

const MyDataDashboard = () => {
	let xids = getAllXIds();
	let user = Login.getUser();
	let name = getPersonSetting({key:'name'}) || user.name || user.xid;

	
	const pvNgo = getCharityObject();
	let ngo = null;
	if (pvNgo) ngo = pvNgo.value || pvNgo.interim;
	
	let joinedMonthYear = getJoinedMonthYear();
	let locationCountryCode = getPersonSetting({key:"location-country"});
	let locationCountry = countryListAlpha2[locationCountryCode];
	
	return <div className='my-data'>
		<Container id='profile'> 
			<Row>
				<Col xs={8}>
					{name && <h4>{name}</h4>}
					{locationCountry && <h5>{locationCountry}</h5>}
				</Col>
				<Col xs={4}>
					{ngo && <CharityLogo charity={ngo} className="w-100"/>}
				</Col>
			</Row>
			<ProfileDot className="mt-3">{joinedMonthYear && <>Joined {joinedMonthYear}</>}</ProfileDot>
			<ProfileDot>{ngo && <>Supporting {ngo.name}</>}</ProfileDot>
			<ProfileDot><>
				{/* Show exactly the same amount as what displays on T4G */}
				<p style={{margin: "0"}}><span className="font-weight-bold pr-1"><TickerTotal /></span>
				Rasied With Our Global Community</p>
			</></ProfileDot>
		</Container>

		<Container id='badges' className='d-flex justify-content-between'>
			<MyDataBadge badgeName="Data" progress={getDataProgress()} backgroundImage="img/mydata/data-badge.png" notification={1}/>
			<MyDataBadge badgeName="Tabs" progress={getT4GProgress()} />
			<MyDataBadge badgeName="Ads"/>
		</Container>

		<DashboardTab />
	</div>
}

export default MyDataDashboard;