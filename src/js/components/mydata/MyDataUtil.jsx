import React, { useEffect, useState } from 'react';
import { getClaimValue, getProfile, setClaimValue, savePersons } from '../../base/data/Person';
import DataStore from '../../base/plumbing/DataStore';
import Login from '../../base/youagain';


/**
 * Set a claim value on a person locally
 * @param {String} key 
 * @param {String|Boolean|Number} value 
 */
 const setPersonSetting = (key, value) => {
	assMatch(key, String, "setPersonSetting - no key");
	assMatch(value, "String|Number|Boolean");
	const xid = Login.getId();
	assert(xid, "setPersonSetting - no login");
	let pvp = getProfile({ xid });
	let person = pvp.value || pvp.interim;
	assert(person, "setPersonSetting - no person", pvp);
	console.log("setPersonSetting", xid, key, value, person);
	setClaimValue({ person, key, value });
	DataStore.update();
};

/**
 * Save all current local edits to server
 * @param {Function} callback triggers once save is complete
 */
const savePersonSettings = (callback) => {
	let xid = Login.getId();
	if (!xid) return null;
	let pvp = getProfile({xid});
	let person = pvp.value || pvp.interim;
	const pv = savePersons({ person });
	pv.promise.then(re => {
		console.log("... saved person settings");
		callback && callback();
	}).catch(e => {
		console.error("FAILED PERSON SAVE", e);
	});
}

/**
 * Get a claim value
 * @param {String} key 
 * @returns 
 */
const getPersonSetting = (key) => {
	let xid = Login.getId();
	if (!xid) return null;
	let pvp = getProfile({xid});
	let person = pvp.value || pvp.interim;
	return getClaimValue({person, key});
}

export {
    setPersonSetting,
    getPersonSetting,
    savePersonSettings
};