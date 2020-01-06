/** 
 * Wrapper for server calls.
 *
 */
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import {XId, encURI} from 'wwutils';
import C from '../C.js';

import Login from 'you-again';
import NGO from '../base/data/NGO';

// Try to avoid using this for modularity!
import DataStore from '../base/plumbing/DataStore';
import Messaging, {notifyUser} from '../base/plumbing/Messaging';

import ServerIO from '../base/plumbing/ServerIOBase';
export default ServerIO;

/** dataspace = data-controller = (usually) app
 * This is the dataspace used in unit.js for reporting events */
ServerIO.dataspace = 'gl';

ServerIO.NO_API_AT_THIS_HOST = true;

ServerIO.PORTAL_DOMAIN = `${C.HTTPS}://${C.SERVER_TYPE}portal.good-loop.com`;
// Comment out the lines below when deploying!
// ServerIO.PORTAL_DOMAIN = 'https://testportal.good-loop.com'; // uncomment to let local use the test server's backend
ServerIO.PORTAL_DOMAIN = 'https://portal.good-loop.com'; // use in testing to access live data

/** The initial part of an API call. Allows for local to point at live for debugging */
ServerIO.APIBASE = ServerIO.PORTAL_DOMAIN; // My-Loop has no backend of its own - just use portal domain matching local/test/prod

ServerIO.DATALOG_ENDPOINT = `${C.HTTPS}://${C.SERVER_TYPE}lg.good-loop.com/data`;
// ServerIO.DATALOG_ENDPOINT = 'https://testlg.good-loop.com/data';
ServerIO.DATALOG_ENDPOINT = 'https://lg.good-loop.com/data';

ServerIO.PROFILER_ENDPOINT = `${C.HTTPS}://${C.SERVER_TYPE}profiler.good-loop.com`;
// ServerIO.PROFILER_ENDPOINT = 'https://testprofiler.good-loop.com';
ServerIO.PROFILER_ENDPOINT = 'https://profiler.good-loop.com';

ServerIO.AS_ENDPOINT = `${C.HTTPS}://${C.SERVER_TYPE}as.good-loop.com`;
// ServerIO.AS_ENDPOINT = `https://testas.good-loop.com`;
ServerIO.AS_ENDPOINT = `https://as.good-loop.com`;

// Useful where relative links can not be used (think inline-CSS 'url' image links)
ServerIO.MYLOOP_ENDPONT = `${C.HTTPS}://${C.SERVER_TYPE}my.good-loop.com`;
// ServerIO.MYLOOP_ENDPONT = `https://testmy.good-loop.com`;
// ServerIO.MYLOOP_ENDPONT = `https://my.good-loop.com`;

/**
 * My Loop has no backend, so use profiler
 */
ServerIO.LOGENDPOINT = ServerIO.PROFILER_ENDPOINT + '/log';

ServerIO.checkBase();


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

/** Returns information on the last ad watched by the given user
 *  Ok if xid is blank. Watch-history will use current session cookie instead
 * @returns {Promise<Advert>} Advert json ajax result from as.good-loop.com/watch-history
 */
ServerIO.getLastAd = (xid) => ServerIO.load(ServerIO.AS_ENDPOINT + '/watch-history/' + (xid ? escape(xid) : '' ));

// Queries for number of times that an ad shared by a user has been watched
// socialShareId should always be an array of strings
ServerIO.getViewCount = (socialShareId) => {
	if( typeof socialShareId === 'string' ) {
		socialShareId = [socialShareId];
	} 

	assMatch(socialShareId, 'String[]');

	return ServerIO.load(ServerIO.AS_ENDPOINT + '/social-share/', { data: {socialShareIds: JSON.stringify(socialShareId)}});
};

ServerIO.getVertData = (vertId) => ServerIO.load(ServerIO.PORTAL_DOMAIN + '/vert/' + vertId);

ServerIO.searchCharities = ({q, prefix, from, size, status, recommended, impact}) => {
	// assMatch( q || prefix, String);
	return ServerIO.load('https://app.sogive.org/search.json', {data: {q, prefix, from, size, status, recommended, impact}} );
};

ServerIO.getCharity = ({id}) => ServerIO.load(`https://app.sogive.org/charity/${id}.json`);