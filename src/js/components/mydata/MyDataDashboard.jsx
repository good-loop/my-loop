import React from 'react';
import { Col, Row, Container } from 'reactstrap';
import Person, { getAllXIds, getEmail, getProfile, hasConsent, PURPOSES } from '../../base/data/Person';
import DataStore from '../../base/plumbing/DataStore';
import Login from '../../base/youagain';
import {MyDataSignUpButton, MyDataSignUpModal} from './MyDataSignUp';
import { getPersonSetting, setPersonSetting, savePersonSettings } from './MyDataUtil';

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


const MyDataDashboard = () => {
	let xids = getAllXIds();
	let user = Login.getUser();
	let name = user.name || user.xid;
	const joinedMonthYear = getJoinedMonthYear();
	
	const charity = getPersonSetting("charity");
	
	const ProfileDot = ({children}) => {
		return (
			<Row>
				<Col xs={1}>
					<img src="/img/placeholder-circle.png" style={{width:'1rem'}} />
				</Col>
				<Col xs={9}>
					{children}
				</Col>
			</Row>
		)
	}
	
	return <>
		<Container id='profile'> 
			<Row>
				<Col xs={8}>
					{name && <h3>{name}</h3>}
					<h3 className='TODO'>Location?</h3>
				</Col>
				<Col xs={4}>
					<img src="/img/placeholder-circle.png" className='w-100' />
				</Col>
			</Row>
			<ProfileDot>{joinedMonthYear && <p>Joined {joinedMonthYear}</p>}</ProfileDot>
			<ProfileDot>{charity && <p>Supporting {charity}</p>}</ProfileDot>
			<ProfileDot><p>£3,928,120 Rasied With Our Global Community</p></ProfileDot>
		</Container>

		<Container id='badges'>
			<Row>
				<Col xs={4}>
					<img src="/img/placeholder-circle.png" className='w-100' />
					Badge Name
				</Col>
				<Col xs={4}>
					<img src="/img/placeholder-circle.png" className='w-100' />
					Badge Name
				</Col>
				<Col xs={4}>
					<img src="/img/placeholder-circle.png" className='w-100' />
					Badge Name
				</Col>
			</Row>
		</Container>

		<Container>
			<MyDataSignUpButton />
			<MyDataSignUpModal />
		</Container>
	</>
}

export default MyDataDashboard;