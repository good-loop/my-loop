/** 
 * Wrapper for server calls.
 *
 */
import C from '../C.js';


// Try to avoid using this for modularity!
import DataStore from '../base/plumbing/DataStore';

import ServerIO from '../base/plumbing/ServerIOBase';
import { assMatch } from '../base/utils/assert.js';
import Login from '../base/youagain.js';

export default ServerIO;

/** dataspace = data-controller = (usually) app
 * This is the dataspace used in unit.js for reporting events */
ServerIO.dataspace = 'gl';

/**
 * ??
 */
ServerIO.NO_API_AT_THIS_HOST = true;

// Usually use the live adserver, since our showcase ad selection is hard-coded to live ads.
ServerIO.AS_ENDPOINT = 'https://as.good-loop.com';
ServerIO.PORTAL_ENDPOINT = 
	'https://portal.good-loop.com';
	// 'https://localportal.good-loop.com';

ServerIO.MEDIA_ENDPOINT = 'https://uploads.good-loop.com';

// Useful where relative links can not be used (eg inline-CSS 'url' image links, in the plugin)
ServerIO.MYLOOP_ENDPOINT = 'my.good-loop.com'; // default to production, replace with your own config.js

// HACK localportal but production GreenTags
// NB: can call `as` or `portal` -- they run the same GreenCalcServlet 
// `as` is best for production because: backed by a cluster
ServerIO.GREENCALC_ENDPOINT = 
	// ServerIO.AS_ENDPOINT+"/greencalc";
	// ServerIO.PORTAL_ENDPOINT+"/greencalc?server=production";
ServerIO.PORTAL_ENDPOINT+"/greencalc";

// NB: We are rarely editing profiler code, so we mostly want to just use the live one
ServerIO.PROFILER_ENDPOINT = 'https://profiler.good-loop.com';

// /**
//  * My Loop has no backend, so use profiler
//  * TODO use my-loop now??
//  */
// ServerIO.LOGENDPOINT = ServerIO.PROFILER_ENDPOINT + '/log';

ServerIO.DATALOG_ENDPOINT = "https://lg.good-loop.com/data";

ServerIO.checkBase();

// Impact hub needs to connect to the production sogive server
ServerIO.ENDPOINT_NGO = `https://app.sogive.org/charity`;

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

ServerIO.getVertData = (vertId) => ServerIO.load(ServerIO.PORTAL_ENDPOINT + '/vert/' + vertId);

ServerIO.searchCharities = ({q, prefix, from, size, status, recommended, impact}) => {
	// assMatch( q || prefix, String);
	return ServerIO.load('https://app.sogive.org/search.json', {data: {q, prefix, from, size, status, recommended, impact}} );
};

ServerIO.getCharity = ({id}) => ServerIO.load(`https://app.sogive.org/charity/${id}.json`);

// TODO the following method was removed from `base`
// it's reinstated here to avoid breakage of the site, but we might just purge all calls to it.
/**
* Function will only log the same data once per session
* @param tag String used to identify data
* @param data optional: any additional data you wish to send along with the request
*/
ServerIO.mixPanelTrack = ({mixPanelTag, data = {}}) => {
	// Record request if this has not already been done this session
	const {mixpanel} = window;
	const path = C.TRACKPATH.concat(mixPanelTag);
	const alreadyTracked = DataStore.getValue(path);
	const userId = Login.getId();
	
	if( userId ) {
		data.user = userId;
	}
	
	if(mixpanel && !alreadyTracked) {
		try {
			mixpanel.track(mixPanelTag, data);
			DataStore.setValue(path, true, false);
		} catch(e) {
			console.warn(e);
		}
	}
};

// override for (ad)vert
let super_geft = ServerIO.getEndpointForType;
ServerIO.getEndpointForType = (type) => {
	if (C.TYPES.isBlogPost(type)) return `${C.HTTPS}://${C.SERVER_TYPE}portal.good-loop.com/blogpost`;
	return super_geft(type);
};

