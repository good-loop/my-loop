import React from 'react';
import { Col, Row } from 'reactstrap';
import Person, { getAllXIds, getEmail, getProfile, hasConsent, PURPOSES } from '../../base/data/Person';
import DataStore from '../../base/plumbing/DataStore';
import Login from '../../base/youagain';
import {MyDataSignUpButton, MyDataSignUpModal} from './MyDataSignUp';

const MyDataDashboard = () => {
	let xids = getAllXIds();
	let user = Login.getUser();
	let name = user.name || user.xid;

	return <>
		<Row>
			<h1>Dashboard</h1>
			<h2>Hello, {name}</h2>
		</Row>
		<Row>
			<MyDataSignUpButton />
			<MyDataSignUpModal />
		</Row>
		<Row>
			<a className='btn btn-seconday'>Print my Data</a>
		</Row>
	</>
}

export default MyDataDashboard;