
import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getShowLogin, setShowLogin } from '../base/components/LoginWidget';
import Misc from '../base/components/Misc';
import DataStore from '../base/plumbing/DataStore';
import { space, stopEvent } from '../base/utils/miscutils';

const WIDGET_PATH = ['widget', 'T4GSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const STATUS_PATH = [...WIDGET_PATH, 'status'];

const showLogin = (s=true) => {
	DataStore.setValue(SHOW_PATH, true);
};

export const T4GSignUpButton = ({className,children}) => {		
	return (
		<a className={space("btn btn-primary", className)} href={window.location} 
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
			className="login-modal"
			toggle={() => showLogin(!show)}
			size="lg"
		>
			<ModalHeader toggle={() => showLogin(!show)}>				
				Sign Up
			</ModalHeader>
			<ModalBody>
				TODO
			</ModalBody>
		</Modal>
	);
};