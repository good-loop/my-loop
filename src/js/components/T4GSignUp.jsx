
import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, ModalBody, ModalHeader } from 'reactstrap';
import CloseButton from '../base/components/CloseButton';
import { getShowLogin, setShowLogin } from '../base/components/LoginWidget';
import Misc from '../base/components/Misc';
import DataStore from '../base/plumbing/DataStore';
import { getBrowserVendor, isMobile, space, stopEvent } from '../base/utils/miscutils';

// Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517111672164&cot=14
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing


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

export const T4GSignUpModal = () => {
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
				<div className='pull-left'><CloseButton size='lg' onClick={() => showLogin(false)}/></div>
				{isMobile()? <DesktopSignUp /> : <MobileSendEmail />}
			</ModalBody>
		</Modal>
	);
};

const MobileSendEmail = () => {
	return (<Form>
		<div style={{textTransform:"capitalize"}}>
			We'll email you a link for desktop so you can start raising money for charity while you browse
		</div>
		
		<Button>Submit</Button>
	</Form>);
};