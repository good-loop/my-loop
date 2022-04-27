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
	
	return <>
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
			<ProfileDot><>£3,928,120 Rasied With Our Global Community</></ProfileDot>
		</Container>

		<Container id='badges'>
			<Row>
				<Col xs={4} className="text-center">
					<img src="/img/placeholder-circle.png" className='w-100' />
					Badge Name
				</Col>
				<Col xs={4} className="text-center">
					<img src="/img/placeholder-circle.png" className='w-100' />
					Badge Name
				</Col>
				<Col xs={4} className="text-center">
					<img src="/img/placeholder-circle.png" className='w-100' />
					Badge Name
				</Col>
			</Row>
		</Container>

		<DashboardTab />

		<Container>
			<MyDataSignUpButton />
			<MyDataSignUpModal />
		</Container>
	</>
}

export default MyDataDashboard;