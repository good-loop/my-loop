import React from 'react';
import { Row, Col } from 'reactstrap';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import Roles from '../../base/Roles';
import PropControl from '../../base/components/PropControl';
import ConsentWidget from '../ConsentWidget';
import { getConsents, getProfilesNow } from '../../base/Profiler';
import SignUpConnectCard from '../cards/SignUpConnectCard';
import Login from 'you-again';

const AccountSettings = ({xids}) => {
	return <div className="settings">
		<h2 className="text-center mb-5">Your settings</h2>
		<ConsentSettings xids={xids}/>
		<SignUpConnectCard className="mb-5" allIds={xids}/>
		<YourDataSettings className={isPortraitMobile() ? "" : "w-50"}/>
		{/* Spacer for mobile */}
		<div className="pb-3 pb-md-0"/>
		<small>We will never share your data without your consent unless there is a legal obligation.<br/>See our <a href='https://doc.good-loop.com/policy/privacy-policy.html' rel='noopener noreferrer' target='_blank'>privacy policy</a> for more information.</small>
	</div>;
};

const ConsentSettings = ({xids}) => {
	// debug
	let profiles = getProfilesNow(xids);
	let consents = getConsents({profiles});

	return (<div className="consents">
		<ConsentWidget xids={xids}/>
		<div className="pt-3"/>
		{/*{Roles.isDev() && <div className="dev-text"><small>IDs: {xids.join(", ")}</small></div>}
		{Roles.isDev() && <div className="dev-text"><small>Consents: {JSON.stringify(consents)}</small></div>}*/}
	</div>);
};

/**
 * TODO collect and maintain data about the user - eg common demographics
 */
const YourDataSettings = ({className}) => {
	const path = ['widget', 'YourDataWidget', 'details'];
	return (<div className={space("your-data-form", className)}>
		<h4>Your data:</h4>
		<Row className="align-items-center user-setting">
			<Col md={4}>Name:</Col>
			<Col md={6}>
				<PropControl 
					path={path} 
					prop="name"
					type="text" 
					saveFn={null}
					placeholder="James Bond"
				/>
			</Col>
			<Col md={2}><a href="TODO">Change</a></Col>
		</Row>
		<Row className="align-items-center user-setting mt-4 mt-md-0">
			<Col md={4}>Email:</Col>
			<Col md={6}>
				<PropControl 
					path={path} 
					prop="email"
					type="text" 
					saveFn={null} 
					placeholder="jamesbond@mi7.com"
				/>
			</Col>
			<Col md={2}><a href="TODO">Change</a></Col>
		</Row>
		<div className="normal">
			If you want to change your password, please go through password reset.
		</div>
	</div>);
};

export default AccountSettings;
