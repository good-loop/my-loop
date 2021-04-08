/**
 * Copy-pasta from LoginWidget but restyled
 * Shareable page dedicated to creating an account for T4G and myloop, and selecting a charity by default at the same time
 */

import React, { useState, useEffect } from 'react';
import Login from '../../base/youagain';
import MyLoopNavBar from '../MyLoopNavBar';
import WhiteCircle from '../campaignpage/WhiteCircle';
import { assert, assMatch } from '../../base/utils/assert';
import C from '../../C';
import { emailLogin } from '../../base/components/LoginWidget';
import { Row, Col } from 'reactstrap';
import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import ErrAlert from '../../base/components/ErrAlert';
import { space, stopEvent } from '../../base/utils/miscutils';
import { setSelectedCharityId } from './TabsForGoodSettings';
import { fetchCharity } from './MyCharitiesPage';
import { getAllXIds, getClaimValue, getProfilesNow, savePersons, setClaimValue } from '../../base/data/Person';

const LOGIN_PATH = ['widget', 'tabLogin', 'login'];
const LOGIN_VERB_PATH = [...LOGIN_PATH, 'verb'];

const switchToVerb = (e, verb) => {
	if (e) stopEvent(e);
	DataStore.setValue(LOGIN_VERB_PATH, verb);
};

const NewtabCharityLogin = () => {

	// Remove cookie consent - blocks iframe content
	window.$(".ch2").remove();

	const verb = DataStore.getValue(LOGIN_VERB_PATH);
	// Default to register
	useEffect(() => {
		if (!verb) DataStore.setValue(LOGIN_VERB_PATH, "register");
    });

    const charityId = DataStore.getValue(['location', 'params', 'charity']);
    let charity;
    if (charityId) {
        charity = fetchCharity(charityId);
    }

	const register = verb === "register";

	const headers = {
		"register": "Sign up (Step 1 of 2)",
		"t4g_chrome_store": "Sign up (Step 2 of 2)"
	};
	
	let error = Login.error;
	if (error) console.error("LOGIN ERROR", error);

	if (error && error.text === "error") {
		error.text = "Could not login. Check your credentials are correct.";
    }
	// ??minor: it might be nice to have a transition on the verb switch

	const onRegisterLogin = () => {
		// profiler - record product sign up - TODO make this automatic via YouAgain talking with Profiler
		let xids = getAllXIds();
		let persons = getProfilesNow(xids);
		setClaimValue({persons, key:"product.t4g", value:true, swallow:true});
		
		if (charityId) setSelectedCharityId(charityId);		
		DataStore.setValue(LOGIN_VERB_PATH, "t4g_chrome_store");
	};

	// why not use a BS modal??
	return <>
		<div className="position-absolute d-flex unset-margins justify-content-center align-items-center charity-register"
			style={{width: "100vw", height:"100vh", top: 0, left: 0, background:"white", border: "1px solid grey"}}>
			<div className="flex-column unset-margins justify-content-center align-items-stretch">
				<h4 className="mb-3">{headers[verb]}</h4>
				<LogInForm
					onLogin={onRegisterLogin}
					onRegister={onRegisterLogin}
				/>
				<ErrAlert error={error} />
			</div>
		</div>
        {/*charity ? <>
			<WhiteCircle className="position-absolute" style={{top: "75%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, boxShadow:"none", background:"none"}} width={200} circleCrop={100}>
				{!chromeRedirect &&
					<div className={space("flex-row justify-content-center align-items-stretch w-100 h-100", register ? "charity-register-circle" : "charity-register-circle-flipped")}>
						<div className="bg-white w-100 h-100"/>
						<div className="bg-gl-turquoise w-100 h-100"/>
					</div>
				}
				<WhiteCircle style={{boxShadow:"0 0 3px rgba(0,0,0,0.5)", top:"50%", left:"50%", transform:"translate(-50%, -50%)"}} className="position-absolute charity-circle-img" width={140}>
					{charity.logo ?
						<img src={charity.logo}/>
						: <h3>{charity.displayName}</h3>
					}
				</WhiteCircle>
			</WhiteCircle>
			<div className="position-absolute px-2" style={{top: titleTop, width:"50%", right: "50.25%" /* Account slightly for text and visual pleasantness *//*, textAlign:"right"}}>
				<h1 className={!chromeRedirect ? "text-white" : "color-gl-turquoise"}>Supporting </h1>
			</div>
			<div className="position-absolute px-2" style={{top: titleTop, width:"50%", left: "50%", textAlign:"left"}}>
				<h1 className="color-gl-turquoise"> {charity.displayName}</h1>
			</div>
		</>: null*/}
	</>;
};

const LogInForm = ({onRegister, onLogin}) => {

	const verb = DataStore.getValue(LOGIN_VERB_PATH);
	// we need a place to stash form info. Maybe appstate.widget.LoginWidget.name etc would be better?
	const path = ['data', C.TYPES.User, 'loggingIn'];
	let person = DataStore.getValue(path);

	const doItFn = e => {
		stopEvent(e);
		if ( ! person) {			
			Login.error = {text:'Please fill in email and password'};
			DataStore.update();
			return;
		}
		if ( person.confpassword !== person.password ) {
			Login.error = {text:'Your confirmed password does not match'};
			DataStore.update();
			return;
		}
		emailLogin({verb, onRegister, onLogin, ...person});
	};

	// login/register

	return verb === "register" ? <form id="loginByEmail" onSubmit={doItFn} className="flex-column unset-margins justify-content-center align-items-stretch">
		<PropControl type="email" path={path} item={person} prop="email" placeholder="Email" className="mb-3"/>			
		<PropControl type="password" path={path} item={person} prop="password" placeholder="Password" className="mb-3"/>
		<PropControl type="password" path={path} item={person} prop="confpassword" placeholder="Confirm password" className="mb-3"/>
		<div className="form-group mb-3">
			<button className="btn btn-primary w-100" type="submit">
				SUBMIT
			</button>
		</div>
	</form> : <>
		<p>Step 1 complete!<br/>
		Now install the plugin for Chrome.</p>
		<a className="btn btn-primary mt-2"
			target="_blank"
			href="https://chrome.google.com/webstore/detail/good-loop-tabs-for-good/baifmdlpgkohekdoilaphabcbpnacgcm?hl=en&authuser=1">
			CHROME STORE
		</a>
	</>
};

export default NewtabCharityLogin;
