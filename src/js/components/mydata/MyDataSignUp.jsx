import React, { useState, useEffect } from 'react';
import DataStore from '../../base/plumbing/DataStore';
import { Modal, ModalBody, Container, Row, Col } from 'reactstrap';
import CloseButton from '../../base/components/CloseButton';
import { getBrowserVendor, isMobile, space, stopEvent, toTitleCase } from '../../base/utils/miscutils';
import C from '../../C';
import Login from '../../base/youagain';
import PropControl from '../../base/components/PropControl';
import { EmailSignin, PERSON_PATH, VERB_PATH } from '../../base/components/LoginWidget';
import { setPersonSetting, getPersonSetting, savePersonSettings } from './MyDataUtil';
import MyDataSelectCharity from './MyDataSelectCharity';
import MyDataGetStarted from './MyDataGetStarted';

const WIDGET_PATH = ['widget', 'MyDataSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const STATUS_PATH = [...WIDGET_PATH, 'status'];

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
	const show = DataStore.getValue(SHOW_PATH);

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
			<ModalBody className='pt-0'>
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
		setPersonSetting("name", name);
		setPersonSetting("emailperms", emailperms);
		savePersonSettings(() => {
			nextPage();
		});
	}

	return (<>
		<h1>Sign Up for My.Data</h1>
		<p>Use your data as a force for good and help us transform online advertising</p>
		{/* <a className="btn btn-secondary" onClick={nextPage}>Next</a> */}

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

const MyDataSignUp = () => {
	
	const PAGES = [
		SignUpForm,
		MyDataSelectCharity,
		MyDataGetStarted
	];
	
	const [page, setPage] = useState(0);

	const prevPage = () => {
		if (page !== 0) setPage(page - 1);
	};

	const nextPage = () => {
		if (page !== PAGES.length - 1) setPage(page + 1);
	};

	const PageComponent = PAGES[page];
	
	return <div className="mydata-signup">
		<PageComponent />
		<a className="btn btn-secondary" onClick={prevPage}>Back</a>
		<a className="btn btn-secondary" onClick={nextPage}>Next</a>
	</div>;
};