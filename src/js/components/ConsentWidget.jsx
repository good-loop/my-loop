import React from 'react';
import { Container, Col, Row } from 'reactstrap';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import Cookies from 'js-cookie';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import PropControl from '../base/components/PropControl';
import {convertConsents, getConsents, setConsents, saveProfile, getProfilesNow, PURPOSES} from '../base/Profiler';
import { getId } from '../base/data/DataClass';

const _debounceFnForKey = {};
/**
 * Cache the debounce function.
 * This allows you to use "overlapping" debounces
 * 
 * @param {!String} key 
 * @param {!Function} fn 
 * @param other extra _.debounce args
 */
const debounceForSameInput = (key, fn, ...other) => {
	assMatch(key, String, "debounceForSameInput");
	assMatch(fn, Function, "debounceForSameInput "+key);
	let dbfn = _debounceFnForKey[key];
	if (dbfn) return dbfn;
	dbfn = _.debounce(person => saveProfile(person), ...other);
	_debounceFnForKey[key] = dbfn;
	return dbfn;
};

const path = ['widget', 'ConsentWidget', 'perms'];

/** handle an edit
 * 
 * ??What does this do exactly??
 *  */
const togglePerm = ({prop, value, profiles}) => {

	let dataspace = ServerIO.dataspace; // ??
	// full perms set
	// NB: this also means perm settings are synchronised across linked profiles by an edit.
	let consents = DataStore.getValue(path);

	// set each
	profiles.forEach(person => {
		setConsents({person, dataspace, consents});
		// save (after a second)
		let pid = getId(person);
		let saveProfileDebounced = debounceForSameInput(pid, saveProfile, 1000);
		// TODO save a diff instead of the whole doc!
		saveProfileDebounced(person);
	});
};

const toggleDNT = ({perms, dnt, newValue}) => {
	perms.cookies = newValue;
	dnt = newValue === true ? '1' : '0';
	const secure = window.location.protocol==='https:';
	// ref: https://web.dev/samesite-cookies-explained/
	Cookies.set('DNT', dnt, {path:'/', domain:'good-loop.com', expires:365, sameSite:secure?'None':'Lax', secure});
};
window.Cookies = Cookies; // debug 

/** Little convenience for registration
 * Wanted to be able to save perms after user has registered
 */
const saveAllPerms = () => {
	const peeps = DataStore.getValue(['data', 'Person', 'xids']);
	const convertedConsents = convertConsents(DataStore.getValue(path));

	saveProfile({id: peeps, c: convertedConsents});
};

/** 
 *  @param label (String) header (e.g "Allow cookies") 
 *  @param subtext (String) smaller text that provides a bit more info
 *  @param textOn (String) will only appear if the user has given permission 
 *  @param saveFn {!Function} Do the edit! `({event, path, prop, newValue}) -> any`
*/
const PermissionControl = ({header, prop, subtext, textOn, saveFn}) => {
	const value = DataStore.getValue([...path, prop]);

	return (
		<Row>
			<div className='col-md-6 text-left'>
				<div className="hover-info">
					{header}
					{subtext ? <div className="extra-info">
						{subtext}
					</div> : null}
				</div>
			</div>
			<div className='col-md-3 flex-row'>
				<PropControl 
					path={path} 
					prop={prop}
					type='yesNo' 
					saveFn={saveFn} 
				/>
			</div>
			<div className='col-md-3'>
				{ value && <div className='color-gl-light-red'>{textOn}</div> }
			</div>
		</Row>
	);
};

/**
 */
const ConsentWidget = ({xids}) => {
	if( !xids.length ) return null;

	let profiles = getProfilesNow(xids);
	// get and combine the consents
	let perms = getConsents({profiles});
	DataStore.setValue(path, perms, false);

	// The cookie setting is managed by a cookie, as its needed at advert-time -- c.f. in unit.js.
	let dnt = Cookies.get('DNT');
	perms.cookies = (dnt === '1'); // allow cookies unless DNT=1
	console.log("perms", perms);

	// TODO allow all
	return (
		<>
			<PermissionControl 
				header='Allow analytical cookies'
				prop={PURPOSES.cookies_analytical}
				saveFn={props => { toggleDNT({...props, perms, dnt}); togglePerm({...props, profiles}); }}
				subtext='Allow us to track your donations and avoid showing you the same advert twice'
				textOn='Thank you!'
			/>
			{/* Spacer for mobile */}
			<div className="pb-3 pb-md-0"/>
			<PermissionControl 
				header='Allow ad targeting'
				prop={PURPOSES.personalize_ads}
				saveFn={props => togglePerm({...props, profiles})}
				subtext='Get Good-Loop ads tailored to you'
				textOn='Thank you!'
			/>
			{/* Spacer for mobile */}
			<div className="pb-3 pb-md-0"/>
			<PermissionControl 
				header='Allow Good-Loop marketing emails'
				prop={PURPOSES.email_marketing}
				saveFn={props => togglePerm({...props, profiles})}
				textOn='Thank you!'
			/>
		</>
	);
};

export default ConsentWidget;
export {
	saveAllPerms
};
