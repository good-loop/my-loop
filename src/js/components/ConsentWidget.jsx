
import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import Cookies from 'js-cookie';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import PropControl from '../base/components/PropControl';
import {convertConsents, getConsents, setConsents, saveProfile, getProfilesNow} from '../base/Profiler';
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

// handle an edit
const togglePerm = ({prop, value, peeps}) => {
	// Will be sent once per session
	ServerIO.mixPanelTrack({mixPanelTag: 'Consent control clicked'});

	let dataspace = ServerIO.dataspace; // ??
	// full perms set
	// NB: this also means perm settings are synchronised across linked profiles by an edit.
	let consents = DataStore.getValue(path);
	assert(consents[prop] === value, "ConsentWidget.jsx - mismatch",consents,prop,value);
	// set each
	peeps.forEach(person => {
		setConsents({person, dataspace, consents});
		// save (after a second)
		let pid = getId(person);
		let saveProfileDebounced = debounceForSameInput(pid, saveProfile, 1000);
		saveProfileDebounced(person);
	});
};

const toggleDNT = ({perms, dnt, value}) => {
	perms.cookies = value;
	dnt = value === "yes" ? '1' : '0';
	Cookies.set('DNT', dnt, {path:'/', domain:'good-loop.com', expires:365});
};

/** Little convenience for registration
 * Wanted to be able to save perms after user has registered
 */
const saveAllPerms = () => {
	const peeps = DataStore.getValue(['data', 'Person', 'xids']);
	const convertedConsents = convertConsents(DataStore.getValue(path));

	saveProfile({id: peeps, c: convertedConsents});
	// peeps.forEach( peep => {
		// saveProfile();
	// });
};

/**
 */
const ConsentWidget = ({xids}) => {
	if( !xids.length ) return null;

	let peeps = getProfilesNow(xids);
	// get and combine the consents
	const perms = DataStore.getValue(path) || DataStore.setValue(path, {}, false);
	peeps.forEach(person => {
		// hm - orefer true/false/most-recent??
		let peepPerms = getConsents({person});
		if (peepPerms) {
			Object.assign(perms, peepPerms);
		}
	});
	// update DataStore
	DataStore.setValue(path, perms, false);

	// The cookie setting is managed by a cookie, as its needed at add-time -- c.f. in unit.js.
	let dnt = Cookies.get('DNT');
	perms.cookies = (dnt === '1' ? 'yes' : 'no'); // allow cookies unless DNT=1

	return (
		<div className="consent-widget">
			<PropControl path={path} prop='cookies' 
				label='Allow cookies' 
				type='yesNo' saveFn={props => { toggleDNT({...props, perms, dnt}); togglePerm({...props, peeps}); }} 
			/>
			{perms.cookies === false? <small>OK - no cookies. Except ironically this has to set a cookie to work.</small> : null}

			<PropControl path={path} prop='personaliseAds' label='Allow ad targetting' type='yesNo' 
				saveFn={props => togglePerm({...props, peeps})}
			/>

			<PropControl path={path} prop='sendMessages' label='Allow us to email you updates and commerical messages' type='yesNo' 
				saveFn={props => togglePerm({...props, peeps})}
			/>
			<p>
				These settings can be updated at any time from the account menu
			</p>
		</div>
	);
};

export default ConsentWidget;
export {
	saveAllPerms
};
