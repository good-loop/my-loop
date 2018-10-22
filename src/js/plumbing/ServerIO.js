/** 
 * Wrapper for server calls.
 *
 */
import _ from 'lodash';
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
import { Server } from 'http';
export default ServerIO;

ServerIO.dataspace = ''; // This is the dataspace used in unit.js for reporting events 

ServerIO.NO_API_AT_THIS_HOST = true;

ServerIO.PORTAL_DOMAIN = `${C.HTTPS}://${C.SERVER_TYPE}portal.good-loop.com`;

/** The initial part of an API call. Allows for local to point at live for debugging */
ServerIO.APIBASE = ServerIO.PORTAL_DOMAIN; // My-Loop has no backend of its own - just use portal domain matching local/test/prod
// Comment out the lines below when deploying!
// ServerIO.APIBASE = 'https://testportal.good-loop.com'; // uncomment to let local use the test server's backend
// ServerIO.APIBASE = 'https://portal.good-loop.com'; // use in testing to access live data

ServerIO.DATALOG_ENDPOINT = `${C.HTTPS}://${C.SERVER_TYPE}lg.good-loop.com/data`;
// ServerIO.DATALOG_ENDPOINT = 'https://testlg.good-loop.com/data';
// ServerIO.DATALOG_ENDPOINT = 'https://lg.good-loop.com/data';

ServerIO.PROFILER_ENDPOINT = `${C.HTTPS}://${C.SERVER_TYPE}profiler.good-loop.com`;
// ServerIO.PROFILER_ENDPOINT = 'https://testprofiler.good-loop.com';
// ServerIO.PROFILER_ENDPOINT = 'https://profiler.good-loop.com';

ServerIO.AS_ENDPOINT = `${C.HTTPS}://${C.SERVER_TYPE}as.good-loop.com`;
// ServerIO.AS_ENDPOINT = `https://testas.good-loop.com`;
// ServerIO.AS_ENDPOINT = `https://as.good-loop.com`;

/**
 * My Loop has no backend, so use profiler
 */
ServerIO.LOGENDPOINT = ServerIO.PROFILER_ENDPOINT + '/log';

ServerIO.checkBase();

/**
 * @deprecated Use getDonationsData or getAllSpend for preference
 * 
 * @param {*} filters 
 * @param {*} breakdowns TODO
 * @param {?String} name Just for debugging - makes it easy to spot in the network tab
 */
ServerIO.getDataLogData = (filters, breakdowns, name) => {
	//?? check all uses
	if ( ! filters.dataspace) console.warn("No dataspace?!", filters);
	let specs = Object.assign({}, filters);
	let endpoint = ServerIO.DATALOG_ENDPOINT;
	return ServerIO.load(endpoint+(name? '?name='+encURI(name) : ''), {data: specs});
};

/**
 * NB: Copy-pasta from Portal ServerIO.js
 * 
 * @param q {String} e.g. pub:myblog
 * @returns Promise {
 * 	by_cid: {String: Money}
 * 	total: {Money},
 * 	stats: {}
 * }
 * @param {?String} name Just for debugging - makes it easy to spot in the network tab 
 */
ServerIO.getDonationsData = ({q, start, end, name}) => {
	let url = ServerIO.AS_ENDPOINT+'/datafn/donations';
	const params = {
		data: {name, q, start, end}
	};
	return ServerIO.load(url, params);
};

/** 
 * NB: Copy-pasta from Portal ServerIO.js
 * 
 * @param vert {?String} Advert ID. If unset, sum all.
 * @returns Promise {
 * 	total: Number,
 * 	money: Money
 * }
 */
ServerIO.getAllSpend = ({vert, name}) => {
	let url = ServerIO.AS_ENDPOINT+'/datafn/sum';
	const params = {
		data: {name, vert}
	};
	return ServerIO.load(url, params);
};

/**
 * @param service e.g "twitter"
 * @returns corresponding jwt string if match is found, null if not.
 */
ServerIO.getJWTForService = (service) => {
	// See if user is logged in via the given service
	// if they are, we can pull in the appropriate jwt tag
	const twitterAlias = Login.aliases.find(alias => alias.service === service);

	return twitterAlias && twitterAlias.jwt ? twitterAlias.jwt : null; 
};

/** Needed to tweak some behaviour in base class
 * @param jwt optional, jwt token string
 * **/
ServerIO.load = function(url, params, jwt) {
	assMatch(url,String);
	// prepend the API base url? e.g. to route all traffic from a local dev build to the live backend.
	if (ServerIO.APIBASE && url.indexOf('http') === -1 && url.indexOf('//') !== 0) {
		url = ServerIO.APIBASE+url;
	}
	console.log("ServerIO.load", url, params);
	params = ServerIO.addDefaultParams(params);
	// sanity check: no Objects except arrays
	_.values(params.data).map(
		v => assert( ! _.isObject(v) || _.isArray(v), v)
	);
	// sanity check: status
	assert( ! params.data.status || C.KStatus.has(params.data.status), params.data.status);
	params.url = url;
	// send cookies & add auth
	Login.sign(params);

	// Login.sign only adds jwt for a single user
	// Problem is, that we rely on 'f' field in Claims to identify which social media service the data was taken from.
	// Simple solution: override behaviour to allow forcing of jwt tokens
	if(jwt && params.data && params.data.jwt) {
		// Copied from you-again "dataPut" (22/10/18)
		if (typeof params.data.append === 'function') {
			params.data.append('jwt', jwt);
		} else {
			params.data.jwt = jwt;
		}
	}

	// debug: add stack
	if (window.DEBUG) {
		try {
			const stack = new Error().stack;			
			// stacktrace, chop leading "Error at Object." bit
			params.data.stacktrace = (""+stack).replace(/\s+/g,' ').substr(16);
		} catch(error) {
			// oh well
		}
	}
	// Make the ajax call
	let defrd = $.ajax(params); // The AJAX request.
	// detect code-200-but-error responses
	defrd = defrd
		.then(response => {
			// check for success markers from JsonResponse or JSend
			if (response.success === false || response.status==='error' || response.status==='fail') {
				throw response;
			}
			// notify user of anything
			if ( ! params.swallow) {
				ServerIO.handleMessages(response);
			}
			return response;
		})
		// on fail (inc a code-200-but-really-failed thrown above)
		.catch(response => {
			console.error('fail',url,params,response);
			// error message
			let text = response.status===404? 
				"404: Sadly that content could not be found."
				: "Could not load "+params.url+" from the server";
			if (response.responseText && ! (response.status >= 500)) {
				// NB: dont show the nginx error page for a 500 server fail
				text = response.responseText;
			}
			let msg = {
				id: 'error from '+params.url,
				type:'error', 
				text
			};
			// HACK hide details
			if (msg.text.indexOf('\n----') !== -1) {
				let i = msg.text.indexOf('\n----');
				msg.details = msg.text.substr(i);
				msg.text = msg.text.substr(0, i);
			}
			// bleurgh - a frameworky dependency
			if ( ! params.swallow) {
				notifyUser(msg);
			}
			// carry on error handling
			throw response;
		});
	return defrd;
};

// Profiler API: see Profiler.js
