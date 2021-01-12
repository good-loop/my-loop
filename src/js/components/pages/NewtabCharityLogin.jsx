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

const LOGIN_PATH = ['widget', 'tabLogin', 'login'];
const LOGIN_VERB_PATH = [...LOGIN_PATH, 'verb'];

const switchToVerb = (e, verb) => {
	if (e) stopEvent(e);
	DataStore.setValue(LOGIN_VERB_PATH, verb);
};

const NewtabCharityLogin = () => {

	if (window.innerWidth < 767) {
		return <div className="bg-gl-turquoise flex-column justify-content-center align-items-center text-center unset-margins position-absolute" style={{top: 0, left: 0, width: "100vw", height: "100vh"}}>
			<img src="/img/TabsForGood/TabsForGood_logo.png" className="w-50 mb-5"/>
			<p className="w-75 text-white"><b>Unfortunately Tabs-for-Good only works on desktop chrome. Please use a desktop to sign up!</b></p>
		</div>;
	}

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
		"login": "Sign in",
		"register": "Create account",
		"reset": "Reset password"
	};
	
	let error = Login.error;
	if (error) console.error("LOGIN ERROR", error);

	if (error && error.text === "error") {
		error.text = "Could not login. Check your credentials are correct.";
    }
    
    const chromeRedirect = verb === "t4g_chrome_store";

	const titleTop = window.innerHeight > 700 ? 200 : 100;
	// ??minor: it might be nice to have a transition on the verb switch

	// why not use a BS modal??
	return <>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg"/>
		{!chromeRedirect && <Row className={space("tab-login-widget bg-white position-absolute unset-margins", register? "" : "flex-row-reverse", verb==="thankyou" && "thankyou")} noGutters
			style={{width: "100vw", height:"100vh", top: 0, left: 0}}>
			{verb === "thankyou" ? <RegisterThankYou/> : <>
				{/* BLUE SIDE - shows the OPPOSITE of the current login verb, allows switching */}
				<Col xs={6} className="bg-gl-turquoise flex-column unset-margins justify-content-start align-items-center text-white text-center login-left">
					{register ? <>
						<h4 className="mb-3">Welcome back!</h4>
						<p className="mb-3">Already have an account?<br/>Please login to keep track of your results.</p>
					</> : <>
						<h4 className="mb-3">Create account</h4>
						<p className="mb-3">Create an account to track how much you contribute to good causes by using Tabs for Good!</p>
					</>}
					<a className="btn btn-secondary" onClick={e => switchToVerb(e, register ? "login" : "register")}>{register ? "Log in" : "Register"}</a>
				</Col>
				{/* FORM SIDE - shows the login form according to the verb */}
				<Col xs={6} className="login-content flex-column unset-margins justify-content-start align-items-center login-right">
					<h4 className="mb-3">{headers[verb]}</h4>
					<LogInForm
						onLogin={() => {
                            const charityID = DataStore.getValue(['location', 'params', 'charity']);
                            setSelectedCharityId(charityID);
                            if (charity) {
                                DataStore.setValue(LOGIN_VERB_PATH, "t4g_chrome_store");
                            }
						}}
						onRegister={() => {
                            const charityID = DataStore.getValue(['location', 'params', 'charity']);
                            setSelectedCharityId(charityID);
                            if (charity) {
                                DataStore.setValue(LOGIN_VERB_PATH, "t4g_chrome_store");
                            }
						}}
					/>
					<ErrAlert error={error} />
				</Col>
			</>}
		</Row>}
        {chromeRedirect &&
            <div className="tab-login-widget bg-white flex-column justify-content-center align-items-center unset-margins" 
			    style={{width: "100vw", height:"100vh"}}>
                    <h3>You're registered!</h3>
                    <p className="mt-2">Tabs for Good is set up to support your charity.</p>
                    <a className="btn btn-primary mt-2"
                        href="https://chrome.google.com/webstore/detail/good-loop-tabs-for-good/baifmdlpgkohekdoilaphabcbpnacgcm?hl=en&authuser=1">
                        Get Tabs-for-Good
                    </a>
            </div>
        }
        {charity ? <>
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
						: <h3>{charity.name}</h3>
					}
				</WhiteCircle>
			</WhiteCircle>
			<div className="position-absolute px-2" style={{top: titleTop, width:"50%", right: "50.25%" /* Account slightly for text and visual pleasantness */, textAlign:"right"}}>
				<h1 className={!chromeRedirect ? "text-white" : "color-gl-turquoise"}>Supporting </h1>
			</div>
			<div className="position-absolute px-2" style={{top: titleTop, width:"50%", left: "50%", textAlign:"left"}}>
				<h1 className="color-gl-turquoise"> {charity.name}</h1>
			</div>
		</>: null}
	</>;
};

const LogInForm = ({onRegister, onLogin}) => {

	const verb = DataStore.getValue(LOGIN_VERB_PATH);
	// we need a place to stash form info. Maybe appstate.widget.LoginWidget.name etc would be better?
	const path = ['data', C.TYPES.User, 'loggingIn'];
	let person = DataStore.getValue(path);
	if (verb === "reset") return <EmailReset person={person}/>;
	const register = verb === "register";

	const doItFn = e => {
		stopEvent(e);
		if ( ! person) {			
			Login.error = {text:'Please fill in email and password'};
			return;
		}
		let email = person.email;
		emailLogin({verb, onRegister, onLogin, ...person});
	};

	// login/register

	return <form id="loginByEmail" onSubmit={doItFn} className="flex-column unset-margins justify-content-center align-items-center">
		<PropControl type="email" path={path} item={person} prop="email" placeholder="Email" className="mb-3"/>			
		<PropControl type="password" path={path} item={person} prop="password" placeholder="Password" className="mb-3"/>
		<div className="form-group mb-3">
			<button className="btn btn-primary" type="submit">
				{register ? "Sign up" : "Log in"}
			</button>
		</div>
		{!register ? <a onClick={e => switchToVerb(e, "reset")} className="text-primary mb-3">Forgotten your password?</a> : null}
		{/*<ResetLink verb={verb} />*/}
	</form>;
};

const RegisterThankYou = () => {
	return <>
		<h3>Welcome!</h3>
		<p>Thanks for signing up with us! You can now choose a charity to fund, and access all the benefits of My-Loop. See your new account <a href="/#account" className="text-primary">here</a>.</p>
		<a onClick={() => setShowTabLogin(false)} className="btn btn-primary">Back to Tabs-for-Good</a>
	</>;
};

const EmailReset = ({person}) => {
	const requested = DataStore.getValue([...LOGIN_PATH, 'reset-requested']);
	const path = ['data', C.TYPES.User, 'loggingIn'];

	const doEmailReset = e => {
		stopEvent(e);		
		if ( ! person) {
			Login.error = {text:'Please fill in email and password'};
			DataStore.update();
			return;
		}
		let email = person.email;
		assMatch(email, String);
		let call = Login.reset(email).then(res => {
			if (res.success) {
				DataStore.setValue([...LOGIN_PATH, 'reset-requested'], true);
				//if (onLogin) onLogin(res);
			} else {
				DataStore.update({}); // The error will be in state, provoke a redraw to display it
			}
		});
	};

	return (
		<form id="loginByEmail" onSubmit={doEmailReset} className="flex-column unset-margins justify-content-center align-items-center text-center">
			<p className="mb-3">Forgotten your password?<br/>No problem - we will email you a link to reset it.</p>
			<PropControl className="mb-3" type="email" path={path} item={person} prop="email" placeholder="Email" />			
			{requested ? <div className="alert alert-info mb-3">A password reset email has been sent out.<br/>Still having trouble? Contact us: support@good-loop.com</div> : ''}
			<div className="form-group mb-3">
				<button className="btn btn-primary" type="submit">
					Submit
				</button>
			</div>
			<a onClick={e => switchToVerb(e, "login")} className="text-primary mb-3">Back to login</a>
		</form>
	);
};

export default NewtabCharityLogin;
