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
import MyDataProfileCreated, { ExplainPrivacyPages } from './MyDataProfileCreated';
import LinkOut from '../../base/components/LinkOut';
import { modifyPage } from '../../base/plumbing/glrouter';
import Person, { getProfile } from '../../base/data/Person';
import Misc from '../../base/components/Misc';

const WIDGET_PATH = ['widget', 'MyDataSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const PAGE_PATH = [...WIDGET_PATH, 'page'];

export const showMyDataSignUpModal = (s=true) => {
	DataStore.setValue(SHOW_PATH, s); 
};

/**
 * A button to start the MyData sign-up flow.
 */
 export const MyDataSignUpButton = ({className,children}) => {		
	return (
		<a className={space("btn btn-primary", className)} href={window.location} 
			onClick={e => {
				stopEvent(e);
				showMyDataSignUpModal();
			}} >
			{children || "Sign Up for My.Data"}
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
				<CloseButton className='mydata-signup-close' size='lg' onClick={() => showMyDataSignUpModal(false)}/>
				<MyDataSignUp />
			</ModalBody>
		</Modal>
	);
};

const SignUpForm = () => {
	const user = Login.isLoggedIn() ? Login.getUser() : null;
	const [loading, setLoading] = useState(false);

	if (user) DataStore.setValue(PAGE_PATH, 1); // skip email signin if already logged in
	else DataStore.setValue(PAGE_PATH, 0); // If user logged out then went back to signup, make sure to reset

	const onRegister = () => {
		setLoading(false);
		const name = DataStore.getValue(PERSON_PATH.concat("name"));
		const emailperms = DataStore.getValue(PERSON_PATH.concat("emailperms"));
		const pvPerson = getProfile();
		Person.setHasApp(pvPerson.value || pvPerson.interim, "my.data");
		console.log("SET HAS APP");
		setPersonSetting({key:"name", value:name});
		setPersonSetting({key: "emailperms", value: emailperms, callback:nextSignupPage}); // TODO do this as set-consent-on-email
	}
	
	// const SignedInDiv = () => {
	// 	return <div className='text-center'>
	// 		<hr/>
	// 		<p>You are already logged in as {user.name || user.xid}.</p>
	// 		<p>Click to sign up for My.Data under your Account</p>
	// 		<a className='btn btn-primary' onClick={nextSignupPage} >Continue</a>
	// 		</div>
	// }

	return (<>
		<h1 className="mb-3">Sign Up for My.Data</h1>
		<p className="text-center">Use your data as a force for good and help us transform online advertising</p>

		<div className={space("signup-form", loading && "d-none")}>
			<PropControl type="text" prop="name" path={PERSON_PATH} label="Your name"/>
			<EmailSignin
				verb="register"
				onRegister={onRegister}
				onSubmit={() => setLoading(true)}
				onError={() => setLoading(false)}
				disableVerbSwitch
				agreeToTerms={<>I agree to the <LinkOut href="https://doc.good-loop.com/terms/terms-of-use.html">Terms of Service</LinkOut></>}
			>

			<PropControl type="checkbox" prop="emailperms" path={PERSON_PATH}
				label="Good-Loop can send me news & marketing emails. I can unsubscribe at any time."
				help="For My.Good-Loop to work properly for you, we want to communicate with you - so please do tick this box! Don't worry, we won't send many emails, and you can always unsubscribe." />
			</EmailSignin>
		</div>
		{loading && <Misc.Loading/>}

		<div className="d-none d-md-block mt-5 py-5"/>
		<img src="/img/mydata/sign-up.png" alt="" className="planet"/>
	</>);
};

const PAGES = [
	SignUpForm, // 1
	MyDataSelectCharity, //2
	MyDataGetStarted, //3
	MyDataInterests, //4
	MyDataDetails, //5
	MyDataProfileCreated, //6
	...ExplainPrivacyPages // 7,8,9
];

export const prevSignupPage = () => {
	const page = DataStore.getValue(PAGE_PATH) || 0;
	if (page !== 0) DataStore.setValue(PAGE_PATH, page - 1);
};

export const nextSignupPage = () => {
	const page = DataStore.getValue(PAGE_PATH) || 0;
	DataStore.setValue(PAGE_PATH, page + 1); // NB: this can count off the end! which triggers moving on
};

const MyDataSignUp = () => {
	
	const page = DataStore.getUrlValue("page") || DataStore.getValue(PAGE_PATH) || 0;
	if (page >= PAGES.length) {
		// done!
		modifyPage(["account"], {tab:"dashboard"});//,dashboard:"profile"})
		DataStore.setValue(PAGE_PATH, 0);
		showMyDataSignUpModal(false);
		return null;
	}
	
	const PageComponent = PAGES[page];

	return <div className="mydata-signup">
		{window.isDebug && <div className="debug">
			*debug page selector (hidden on live)*: <a onClick={prevSignupPage}>Back</a> /	<a onClick={nextSignupPage}>Next</a>
		</div>}
		<PageComponent />
	</div>;
};