
import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, ModalBody, ModalHeader } from 'reactstrap';
import CloseButton from '../base/components/CloseButton';
import { getShowLogin, LoginWidgetEmbed, setShowLogin } from '../base/components/LoginWidget';
import Misc from '../base/components/Misc';
import { getId } from '../base/data/DataClass';
import DataStore from '../base/plumbing/DataStore';
import { getBrowserVendor, isMobile, space, stopEvent, toTitleCase } from '../base/utils/miscutils';
import Login from '../base/youagain';
import SubscriptionBox, { SubscriptionForm } from './cards/SubscriptionBox';
import CharityLogo from './CharityLogo';
import { T4GPluginButton } from './pages/CommonComponents';

// Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517111672164&cot=14
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing


const SUPPORTED_BROWSERS = ["CHROME","EDGE"];

const WIDGET_PATH = ['widget', 'T4GSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const STATUS_PATH = [...WIDGET_PATH, 'status'];

const showLogin = (s=true) => {
	DataStore.setValue(SHOW_PATH, s);
};

export const T4GSignUpButton = ({className,children}) => {		
	return (
		<a className={space("T4GSignUpButton btn btn-primary", className)} href={window.location} 
			onClick={e => stopEvent(e) && showLogin()} >
			{children || "Sign Up For Tabs For Good"}
		</a>
	);
};

/**
 * 
 * @param {Object} p
 * @param {?NGO} p.charity For a charity-specific sign up
 */
export const T4GSignUpModal = ({charity}) => {
	const show = DataStore.getValue(SHOW_PATH);
	// close on nav
	useEffect(function() {
		console.log("T4G signup cleanup called show:"+show);
	}, [""+window.location]);

	return (
		<Modal
			isOpen={show}
			className="T4G-modal"
			toggle={() => showLogin(!show)}
			size="lg"
		>
			<ModalBody>
				<CloseButton size='lg' onClick={() => showLogin(false)}/>
				{charity && <CharityLogo charity={charity} />}
				{isMobile()? <MobileSendEmail charity={charity} /> : <DesktopSignUp charity={charity} />}
			</ModalBody>
		</Modal>
	);
};

const DesktopSignUp = ({charity}) => {
	const browser = getBrowserVendor();
	if ( ! SUPPORTED_BROWSERS.includes(browser)) {
		return <NotAvailableYet browser={browser} />
	}	
	// Step one or two?
	if (Login.isLoggedIn()) {
		return <>TODO <T4GPluginButton /></>
	}
	return <LoginWidgetEmbed verb='register' onLogin={() => console.warn("TODO set charity??")}/>;
};

const NotAvailableYet = ({browser,charity}) => {
	return (<>
		<p>We'll send you an email to let you know when Tabs-for-Good is available on <span>{toTitleCase(browser)}</span></p>
		<SubscriptionForm purpose="preregister" charityId={getId(charity)} />
		</>);
};

const MobileSendEmail = ({charity}) => {
	return (<Form>
		<div style={{textTransform:"capitalize"}}>
			We'll email you a link for desktop so you can start raising money for charity while you browse
		</div>
		<SubscriptionForm purpose="getT4Glink" charityId={getId(charity)} />
	</Form>);
};