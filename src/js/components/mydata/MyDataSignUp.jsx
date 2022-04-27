import React, { useState, useEffect } from 'react';
import DataStore from '../../base/plumbing/DataStore';
import { Modal, ModalBody, Container, Row, Col } from 'reactstrap';
import CloseButton from '../../base/components/CloseButton';
import { getBrowserVendor, isMobile, space, stopEvent, toTitleCase } from '../../base/utils/miscutils';
import C from '../../C';
import Login from '../../base/youagain';
import PropControl from '../../base/components/PropControl';
import { EmailSignin, PERSON_PATH, VERB_PATH } from '../../base/components/LoginWidget';
import { setPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import MyDataSelectCharity from './MyDataSelectCharity';
import MyDataGetStarted from './MyDataGetStarted';
import MyDataInterests from './MyDataInterests';
import MyDataDetails from './MyDataDetails';
import MyDataProfileCreated from './MyDataProfileCreated';

const WIDGET_PATH = ['widget', 'MyDataSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const PAGE_PATH = [...WIDGET_PATH, 'page'];

const showMyDataSignUpModal = (s=true) => {
	DataStore.setValue(SHOW_PATH, s); 
};

/**
 * A button to start the MyData sign-up flow.
 */
 export const MyDataSignUpButton = ({className}) => {		
	return (<>
		<MyDataSignUpLink className={space("MyDataSignUpButton btn btn-primary", className)}/>
	</>);
};

const MyDataSignUpLink = ({className, children, onClick}) => {
	return (
		<a className={space(className)} href={window.location} 
			onClick={e => {
				stopEvent(e);
				showMyDataSignUpModal();
				if (onClick) onClick();
			}} >
			{children || "Sign Up for My Data"}
		</a>
	);
}

/**
 * 
 * @param {Object} p
 */
export const MyDataSignUpModal = () => {
	const show = DataStore.getUrlValue("page") !== null || DataStore.getValue(SHOW_PATH);

	// close on nav
	useEffect(function() {
		console.log("MyData signup cleanup called show:"+show);
	}, [""+window.location]);

	return (
		<Modal
			isOpen={show}
			className="mydata-modal"
			toggle={() => showMyDataSignUpModal(!show)}
			size="lg"
		>
			<ModalBody>
				<CloseButton size='lg' onClick={() => showMyDataSignUpModal(false)}/>
				<MyDataSignUp />
			</ModalBody>
		</Modal>
	);
};

const SignUpForm = () => {
	const user = Login.isLoggedIn() ? Login.getUser() : null;

	const onRegister = () => {
		const name = DataStore.getValue(PERSON_PATH.concat("name"));
		const emailperms = DataStore.getValue(PERSON_PATH.concat("emailperms"));
		setPersonSetting({key:"name", value:name});
		setPersonSetting({key: "emailperms", value: emailperms, callback:nextSignupPage});
	}

	return (<>
		<h1>Sign Up for My.Data</h1>
		<p>Use your data as a force for good and help us transform online advertising</p>

		<PropControl type="text" prop="name" path={PERSON_PATH} label="Your name"/>

		<EmailSignin
			verb="register"
			onRegister={onRegister}
			disableVerbSwitch
		>
			<PropControl type="checkbox" prop="emailperms" path={PERSON_PATH}
				help="Permission to use your email address - opt in to xyzyzxy... Permission to use your email for nefarious purposes..."/>

		</EmailSignin>
	</>);
};

const PAGES = [
	MyDataDetails, //5
	SignUpForm, // 1
	MyDataSelectCharity, //2
	MyDataGetStarted, //3
	MyDataInterests, //4
	MyDataProfileCreated, //6
];

export const prevSignupPage = () => {
	const page = DataStore.getValue(PAGE_PATH) || 0;
	if (page !== 0) DataStore.setValue(PAGE_PATH, page - 1);
};

export const nextSignupPage = () => {
	const page = DataStore.getValue(PAGE_PATH) || 0;
	if (page !== PAGES.length - 1) DataStore.setValue(PAGE_PATH, page + 1);
};

const MyDataSignUp = () => {
	
	const page = DataStore.getUrlValue("page") || DataStore.getValue(PAGE_PATH) || 0;
	const PageComponent = PAGES[page];
	
	return <div className="mydata-signup forced-mobile">
		<PageComponent />
		<a className="btn btn-secondary" onClick={prevSignupPage}>Back</a>
		<a className="btn btn-secondary" onClick={nextSignupPage}>Next</a>
	</div>;
};