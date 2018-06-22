/** 
 * Wrapper for server calls.
 *
 */
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import {XId, encURI} from 'wwutils';
import C from '../C.js';

import Login from 'you-again';
import NGO from '../data/NGO';

// Try to avoid using this for modularity!
import DataStore from '../base/plumbing/DataStore';
import Messaging, {notifyUser} from '../base/plumbing/Messaging';

import ServerIO from '../base/plumbing/ServerIOBase';
export default ServerIO;

/** The initial part of an API call. Allows for local to point at live for debugging */
ServerIO.APIBASE = ''; // Normally use this for "my server"!
// Comment out the lines below when deploying!
// ServerIO.APIBASE = 'https://testportal.good-loop.com'; // uncomment to let local use the test server's backend
// ServerIO.APIBASE = 'https://portal.good-loop.com'; // use in testing to access live data
	
ServerIO.DATALOG_ENDPOINT = C.HTTPS+'://'+C.SERVER_TYPE+'lg.good-loop.com/data';
// ServerIO.DATALOG_ENDPOINT = 'https://testlg.good-loop.com/data';
ServerIO.DATALOG_ENDPOINT = 'https://lg.good-loop.com/data';

ServerIO.PROFILER_ENDPOINT = `${C.HTTPS}://${C.SERVER_TYPE}profiler.winterwell.com/profile`;
ServerIO.PROFILER_ENDPOINT = 'https://profiler.winterwell.com/profile';

ServerIO.checkBase();

// override for NGO -> SoGive, and Budget
ServerIO.getUrlForItem = ({type, id, status}) => {
	let servlet = ServerIO.getServletForType(type);
	let url = '/'+servlet+'/'+encURI(id)+'.json';
	if (C.TYPES.isNGO(type)) {
		// HACK: call SoGive
		url = 'https://app.sogive.org/charity/'+encURI(id)+'.json';
	}
	return url;
};

/**
 * 
 * @param {*} filters 
 * @param {*} breakdowns TODO
 * @param {?String} name Just for debugging - makes it easy to spot in the network tab
 */
ServerIO.getDataLogData = (filters, breakdowns, name) => {
	if ( ! filters.dataspace) console.warn("No dataspace?!", filters);
	let specs = Object.assign({}, filters);
	let endpoint = ServerIO.DATALOG_ENDPOINT;
	if (filters.dataspace === 'money') { // HACK 'cos money isnt logged from adserver to lg
		endpoint = '/data';
	}
	return ServerIO.load(endpoint+(name? '?name='+encURI(name) : ''), {data: specs});
};

ServerIO.getProfile = ({id, fields}) => {
	return ServerIO.load(`${ServerIO.PROFILER_ENDPOINT}/person/${id}`, {data: {fields}});
};

ServerIO.putProfile = ({id, ...doc}) => {
	return ServerIO.post(`${ServerIO.PROFILER_ENDPOINT}/person/${id}`, {action: 'put', doc: JSON.stringify(doc)});
};
