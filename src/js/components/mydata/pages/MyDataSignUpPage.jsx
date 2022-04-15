import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { EmailSignin, PERSON_PATH, VERB_PATH } from '../../../base/components/LoginWidget';
import PropControl from '../../../base/components/PropControl';
import { setPersonSetting, getPersonSetting, savePersonSettings } from '../MyDataUtil';
import DataStore from '../../../base/plumbing/DataStore';
import Login from '../../../base/youagain';
import SelectCharityPage from './SignupFlow/SelectCharityPage';


window.DEBUG = false;

const SignUpForm = () => {
	const user = Login.isLoggedIn() ? Login.getUser() : null;

	const onRegister = () => {
		const firstname = DataStore.getValue(PERSON_PATH.concat("firstname"));
		const surname = DataStore.getValue(PERSON_PATH.concat("surname"));
		const emailperms = DataStore.getValue(PERSON_PATH.concat("emailperms"));
		setPersonSetting("firstname", firstname);
		setPersonSetting("surname", surname);
		setPersonSetting("emailperms", emailperms);
		savePersonSettings(() => {
			nextPage();
		});
	}

	const fn = getPersonSetting("firstname");
	const sn = getPersonSetting("surname");
	const ep = getPersonSetting("emailperms");

	return (<>
		<h1>Sign Up for My.Data</h1>
		<p>Use your data as a force for good and help us transform online advertising</p>
		
		<Row>
			<Col xs={6}>
				<PropControl type="text" prop="firstname" path={PERSON_PATH} label="First name"/>
			</Col>
			<Col xs={6}>
				<PropControl type="text" prop="surname" path={PERSON_PATH} label="Surname"/>
			</Col>
		</Row>

		<EmailSignin
			verb="register"
			onRegister={onRegister}
			disableVerbSwitch
		>
			<PropControl type="checkbox" prop="emailperms" path={PERSON_PATH}
				help="Permission to use your email address - opt in to xyzyzxy... Permission to use your email for nefarious purposes..."/>
		</EmailSignin>

		<p>EMAIL PERMS?? {user && `${ep} ${fn} ${sn}`}</p>
	</>);
};

const PAGES = [
	SignUpForm,
	SelectCharityPage
];

const prevPage = () => DataStore.setUrlValue("page", Math.max(DataStore.getUrlValue("page") - 1, 0));
const nextPage = () => DataStore.setUrlValue("page", Math.min(DataStore.getUrlValue("page") + 1, PAGES.length - 1));

const MyDataSignUpPage = () => {
	
	const page = DataStore.getUrlValue("page") || 0;
	const PageComponent = PAGES[page];

	return <PageComponent/>;

};

export default MyDataSignUpPage;
export {nextPage, prevPage};
