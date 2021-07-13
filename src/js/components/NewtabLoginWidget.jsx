/**
 * Copy-pasta from LoginWidget but restyled
 * TODO refactor to reuse code from LoginWidget. Login flows are notoriously error-prone, so we don't want to maintain two copies.
 */

import React, { useEffect } from 'react';
import { Row, Col } from 'reactstrap';

import Login from '../base/youagain';
import { assMatch } from '../base/utils/assert';
import C from '../C';
import { emailLogin } from '../base/components/LoginWidget';
import DataStore from '../base/plumbing/DataStore';
import PropControl from '../base/components/PropControl';
import ErrAlert from '../base/components/ErrAlert';
import { space, stopEvent } from '../base/utils/miscutils';

const LOGIN_PATH = ['widget', 'tabLogin', 'login'];
const LOGIN_OPEN_PATH = [...LOGIN_PATH, 'open'];
const LOGIN_VERB_PATH = [...LOGIN_PATH, 'verb'];

const setShowTabLogin = (showLogin) => {
	DataStore.setValue(LOGIN_OPEN_PATH, showLogin);
};

const getShowTabLogin = () => {
	return DataStore.getValue(LOGIN_OPEN_PATH);
};

const switchToVerb = (e, verb) => {
	if (e) stopEvent(e);
	DataStore.setValue(LOGIN_VERB_PATH, verb);
};

const NewtabLoginWidget = ({onLogin, onRegister}) => {

	const open = DataStore.getValue(LOGIN_OPEN_PATH);
	if ( ! open) return null;

	let verb = DataStore.getValue(LOGIN_VERB_PATH);
	// Default to register
	useEffect(() => {
		if ( ! verb) {
			verb = DataStore.setValue(LOGIN_VERB_PATH, "register", true);
		}
	}, []);

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

	// ??minor: it might be nice to have a transition on the verb switch

	// why not use a BS modal??
	return <>
		<div className="position-absolute" style={{width: "100vw", height: "100vh", top: 0, left: 0, zIndex: 999, background:"rgba(0,0,0,0.5)"}} />
		<Row className={space("tab-login-widget position-absolute bg-white shadow", register? "" : "flex-row-reverse", verb==="thankyou" && "thankyou")}
			style={{width: 700, height:450, zIndex:9999, top: "50%", left:"50%", transform:"translate(-50%, -75%)"}}>
			{verb === "thankyou" ? <RegisterThankYou/> : <>
				{/* BLUE SIDE - shows the OPPOSITE of the current login verb, allows switching */}
				<Col xs={5} className="bg-gl-turquoise flex-column unset-margins justify-content-center align-items-center text-white text-center m-0 p-3">
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
				<Col xs={7} className="login-content flex-column unset-margins justify-content-center align-items-center">
					<h4 className="mb-3">{headers[verb]}</h4>
					<LogInForm
						onLogin={() => {
							if (onLogin) onLogin();
							setShowTabLogin(false);
						}}
						onRegister={() => {
							if (onRegister) onRegister();
							setShowTabLogin(false);
						}}
					/>
					<ErrAlert error={error} />
				</Col>
			</>}
		</Row>
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

const NewtabLoginLink = ({className, children}) => {
	/* toggle open */
	const onClick = e => {
		stopEvent(e);
		setShowTabLogin( ! getShowTabLogin());
	};

	return <a className={className} onClick={onClick}>
		{children}
	</a>;

};

export {NewtabLoginLink, setShowTabLogin};
export default NewtabLoginWidget;
