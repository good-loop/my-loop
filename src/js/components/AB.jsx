import React from 'react';
import DataStore from '../base/plumbing/DataStore';
import {assMatch, assert} from 'sjtest';
import {is} from 'wwutils';

/**
 * For A/B testing
 * @param {!String} label What are we versioning?
 * @param {!Number} n How many options?
 * Version is stored as v{label}= on the url -- so it should get logged in most analytics tools :)
 * Also, you can set it for testing or explicit control.
 * 
 * @returns {!Number} in [0, n-1]
 */
const getVersion = (label, n) => {	
	// A random int. Use it % n to get version choices (it is up to you what you do with this - the v is not meaningful, but can be examined)
	let vkey = "v"+label;
	let version = DataStore.getUrlValue(vkey);
	if (version || version===0) { // dont ignore 0!
		let vi = parseInt(version);
		if ( ! isNaN(vi)) return vi;
		console.error("AB: odd non-int version: v="+version);
		return 0;
	}
	version = Math.floor(Math.random()*n);
	DataStore.setValue(['location','params',vkey], version, false); // NB: called inside render, so no update
	return version;
};

/**
 * Randomly pick what to display.
 * @param {!String} label - What is this a version of? E.g. "bgcolor". Can be used separately with `AB.getVersion()`
 * @param {!JSX[]} children - Several jsx elements to choose one of
 */
const AB = ({label, children}) => {
	if ( ! children) return null;
	if (children.filter) children = children.filter(x => !! x);
	else children = [children]; // paranoia - not an array?!

	if (children.length === 0) return null;
	if (children.length === 1) return children[0];

	let vi = getVersion(label, children.length);	
	let child = children[vi]
	console.log("AB: "+label+" picked "+vi+" of "+children.length);
	return child;
};

AB.getVersion = getVersion;

export default AB;
export {getVersion}
// for debug
window.AB = AB;