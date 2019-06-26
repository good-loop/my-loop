
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
	dnt = value === true ? '1' : '0';
	Cookies.set('DNT', dnt, {path:'/', domain:'good-loop.com', expires:365});
};

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
*/
const PermissionControl = ({header, prop, subtext, textOn, saveFn}) => {
	const value = DataStore.getValue([...path, prop]);

	const Slider = () => (
		<>
			<div className='slider-inner'>
				<div className='round-bit' />
			</div>
		</>
	);

	return (
		<>
			<div className='col-md-5 text-left'>
				<div>
					<b>{header}</b>
				</div>
				<span>
					{subtext}
				</span>
			</div>
			<div className='col-md-3 flex-row slider'>
				<span> No </span>
				<PropControl 
					path={path} 
					prop={prop}
					label={<Slider />} 
					type='checkbox' 
					saveFn={saveFn} 
				/>
				<span> Ok </span>
			</div>
			<div className='col-md-4'>
				{ value && <div className='color-gl-red'>{textOn}</div> }
			</div>
		</>
	);
};
// props => { toggleDNT({...props, perms, dnt}); togglePerm({...props, peeps}); }
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
	perms.cookies = (dnt === '1'); // allow cookies unless DNT=1

	return (
		<div className="container">
			<div className='row text-left bottom-pad2'>
				<i>You</i> decide how you want to do good online. As Good-Loop will always donate 50% of all ad revenue to charity, giving Good-Loop permission to use your data in a way that is valuable to advertisers will mean that your donations are worth more. 
			</div>
			<div className='row bottom-pad2'>
				<PermissionControl 
					header='Allow cookies'
					prop='cookies'
					saveFn={props => { toggleDNT({...props, perms, dnt}); togglePerm({...props, peeps}); }}
					subtext='Allow us to track your donations and avoid showing you the same advert twice'
					textOn='Thank you &mdash; this improves our service and raises more money for charity!'
				/>
			</div>
			<div className='row bottom-pad2'>
				<PermissionControl 
					header='Allow ad targeting'
					prop='personaliseAds'
					saveFn={props => togglePerm({...props, peeps})}
					subtext='Only Good-Loop ads for good, of course'
					textOn='Thank you &mdash; this raises more money for charity!'
				/>
			</div>
			<div className='row bottom-pad2'>
				<PermissionControl 
					header='Allow us to email you updates and commercial messages'
					prop='sendMessages'
					saveFn={props => togglePerm({...props, peeps})}
					textOn='Thank you &mdash; this raises more money for charity!'
				/>
			</div>
			<div className='row'>
				We will never share your data or post to your social media account without your consent. See our <a href='https://www.good-loop.com/privacy-policy' rel='noopener noreferrer' target='_blank'> privacy policy </a> for more information.
			</div>
		</div>
	);
};

export default ConsentWidget;
export {
	saveAllPerms
};
