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

// Profiler API: see Profiler.js
