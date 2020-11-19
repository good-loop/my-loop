import React, { useState, useEffect } from 'react';
import DataStore from '../base/plumbing/DataStore';

const loginOpenPath = ['widget', 'tabLogin', 'open'];

const setShowTabLogin = (showLogin) => {
	DataStore.setValue(loginOpenPath, showLogin);
};

const getShowTabLogin = () => {
	return DataStore.getValue(loginOpenPath);
};

const NewtabLoginWidget = () => {

	const open = DataStore.getValue(loginOpenPath);

	return open ? <>
		<div className="position-absolute" style={{width: "100vw", height: "100vh", top: 0, left: 0, zIndex: 999, background:"rgba(0,0,0,0.5)"}} onClick={() => setShowTabLogin(false)}/>
		<div className="tab-login-widget position-absolute bg-white shadow" style={{width: 700, height:450, zIndex:9999, top: "50%", left:"50%", transform:"translate(-50%, -75%)"}}>
        
		</div>
	</> : null;

};

const NewtabLoginLink = () => {
    
	const onClick = e => {
		e.preventDefault();
		setShowTabLogin(!getShowTabLogin());
	};

};

export default NewtabLoginWidget;
