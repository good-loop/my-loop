
import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';
import Cookies from 'js-cookie';
import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import PropControl from '../base/components/PropControl';
import BS from '../base/components/BS3';
import ActionMan from '../plumbing/ActionMan';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import {getPermissions, setPermissions, saveProfile, getProfile, getProfilesNow} from '../base/Profiler';
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

/**
 */
const ConsentWidget = ({xids}) => {
	assert(xids.length, "ConsentWidget.jsx");
	let path = ['widget', 'ConsentWidget', 'perms'];	
	let peeps = getProfilesNow(xids);
	// get and combine the permissions
	const perms = DataStore.getValue(path) || DataStore.setValue(path, {});
	peeps.forEach(person => {
		// hm - orefer true/false/most-recent??
		let peepPerms = getPermissions({person});
		if (peepPerms) {
			Object.assign(perms, peepPerms);
		}
	});
	// update DataStore
	DataStore.setValue(path, perms, false);
	
	// handle an edit
	const togglePerm = ({prop, value, ...x}) => {
		// Will be sent once per session
		ServerIO.mixPanelTrack('Consent control clicked', {});

		let dataspace = ServerIO.dataspace; // ??
		// full perms set
		// NB: this also means perm settings are synchronised across linked profiles by an edit.
		let permissions = DataStore.getValue(path);
		assert(permissions[prop] === value, "ConsentWidget.jsx - mismatch",permissions,prop,value);
		// set each
		peeps.forEach(person => {
			setPermissions({person, dataspace, permissions});
			// save (after a second)
			let pid = getId(person);
			let saveProfileDebounced = debounceForSameInput(pid, saveProfile, 1000);
			saveProfileDebounced(person);
		});
	};

	// The cookie setting is managed by a cookie, as its needed at add-time -- c.f. in unit.js.
	let dnt = Cookies.get('DNT');
	perms.cookies = dnt !== '1'; // allow cookies unless DNT=1
	const toggleDNT = ({value}) => {
		perms.cookies = value;
		dnt = value? '0' : '1';
		Cookies.set('DNT', dnt, {path:'/', domain:'good-loop.com', expires:365});
	};

	return (
		<div>
			<p>Help us boost the money raised for charity using your data - without compromising your privacy.</p>
			<p>Please can we:</p>

			<PropControl path={path} prop='cookies' 
				label='Use cookies to record your charity donations, which ads we show you, and how you react to them (e.g. click / ignore / vomit)' 
				type='yesNo' saveFn={toggleDNT} />
			{perms.cookies === false? <small>OK - no cookies. Except ironically this has to set a cookie to work.</small> : null}

			<PropControl path={path} prop='personaliseAds' label='Pick ads that fit your profile' type='yesNo' 
				saveFn={togglePerm}
			/>

			<PropControl path={path} prop='sendMessages' label='Send updates and commercial messages' type='yesNo' 
				saveFn={togglePerm}
			/>

			Sell your data: Hell No

			<p>
				It's your data: You can change your mind at any time (just edit these settings). 
				You can see and control your profile data - we're working on easy-to-use online tools for that, 
				but in the meantime you can contact us, and our heroic support team will help.
				For more details see our <a href="https://www.good-loop.com/privacy-policy" target="_blank">Privacy Manifesto</a>.
			</p>
		</div>
	);
};

export default ConsentWidget;
