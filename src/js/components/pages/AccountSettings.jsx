import React from 'react';
import { Row, Col } from 'reactstrap';
import { is, space } from '../../base/utils/miscutils';
import PropControl from '../../base/components/PropControl';
import ConsentWidget from '../ConsentWidget';
import Person, { getAllXIds, getClaimValue, getProfile, savePersons, setClaimValue} from '../../base/data/Person';
import SignUpConnectCard from '../cards/SignUpConnectCard';
import { LoginLink } from '../../base/components/LoginWidget';
import { assert } from '../../base/utils/assert';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';

const AccountSettings = () => {
	let xids = getAllXIds();
	return <div className="settings">
		<h2 className="text-center mb-5">Your settings</h2>
		<ConsentSettings xids={xids}/>
		<SignUpConnectCard className="mb-5" allIds={xids}/>
		<YourDataSettings />
		{/* Spacer for mobile */}
		<div className="pb-3 pb-md-0"/>
		<small>We will never share your data without your consent unless there is a legal obligation.<br/>See our <a href="https://doc.good-loop.com/policy/privacy-policy.html" rel="noopener noreferrer" target="_blank">privacy policy</a> for more information.</small>
	</div>;
};

const ConsentSettings = ({xids}) => {
	return (<div className="consents">
		<ConsentWidget xids={xids}/>
		<div className="pt-3"/>
		{/*{Roles.isDev() && <div className="dev-text"><small>IDs: {xids.join(", ")}</small></div>}
		{Roles.isDev() && <div className="dev-text"><small>Consents: {JSON.stringify(consents)}</small></div>}*/}
	</div>);
};

/**
 * TODO move out into its own file
 * @param {Person[]} person
 * @param {!string} prop
 * Other params are as for PropControl (just not path)
 */
const PersonPropControl = ({person, prop, ...pcStuff}) => {
	Person.assIsa(person, "PersonPropControl", person);
	assert( ! pcStuff.path, "path is made here");
	// stash edits whilst typing
	let path = ['widget', 'PersonPropControl', person.id];
	const ppath = path.concat(prop);
	// init the value
	let v = getClaimValue({person, key:prop});
	if (v && ! is(DataStore.getValue(ppath))) {
		DataStore.setValue(ppath, v, false);
	}
	// ...save edits
	let saveFn = ({value, event}) => {
		setClaimValue({person, key:prop, value});
		savePersons({person});
	};
	return <PropControl disabled={pcStuff.disabled} path={path} prop={prop} {...pcStuff} saveFn={saveFn} />;
};

/**
 * TODO collect and maintain data about the user - eg common demographics
 */
const YourDataSettings = ({className}) => {
	let person = getProfile().value;
	if ( ! person) {
		return <Misc.Loading />; // paranoia, probably
	}
	let email = Person.getEmail(person);
	if ( ! email) {
		console.warn("AccountSettings - no email?", person);
	}

	return (<div className={space("your-data-form", className)}>
		<h4>Your data:</h4>
		<Row className="align-items-center user-setting">
			<Col md={2}>Name:</Col>
			<Col md={6}>
				<PersonPropControl
					person={person}
					prop="name"
					type="text"
					placeholder="James Bond"
				/>
			</Col>
		</Row>
		<Row className="align-items-start user-setting mt-4 mt-md-0">
			<Col md={2}>Email:</Col>
			<Col md={6} className="align-left" style={{lineHeight:"100%"}}>
				<code>{email || "unset"}</code><br/>
				<small style={{fontSize:"50%", lineHeight:"50%"}}>Email is set from your login. Let us know if you need to change it by contacting support@good-loop.com.</small>
			</Col>
		</Row>
		<br/>
		<div>
			<LoginLink verb="reset" className="btn btn-transparent fill">Change password</LoginLink>
		</div>
		<br/>
	</div>);
};

export default AccountSettings;
