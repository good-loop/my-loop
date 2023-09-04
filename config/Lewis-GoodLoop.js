// Front-end configuration for `Lewis-GoodLoop` (LF dev laptop)

// Change index to switch all endpoints together
const cluster = ['', 'stage', 'test', 'local'][0];

// Change to "http" if you don't have SSL set up locally
const PROTOCOL_LOCAL = 'https';
const protocol = (cluster === 'local') ? PROTOCOL_LOCAL : 'https';

export const ServerIOOverrides = {
	APIBASE: `${protocol}://${cluster}portal.good-loop.com`,
	AS_ENDPOINT: `${protocol}://${cluster}as.good-loop.com`,
	PORTAL_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com`,
	DEMO_ENDPOINT: `${protocol}://${cluster}demo.good-loop.com`,
	DATALOG_ENDPOINT: `${protocol}://${cluster}lg.good-loop.com/data`,
	MEDIA_ENDPOINT: `${protocol}://${cluster}uploads.good-loop.com`,
	ANIM_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com/_anim`,
	CHAT_ENDPOINT: `${protocol}://${cluster}chat.good-loop.com/reply`,
	PROFILER_ENDPOINT: `${protocol}://${cluster}profiler.good-loop.com`,
	// DATALOG_DATASPACE: 'gl',
	ENDPOINT_NGO: 'https://app.sogive.org/charity',
	// JUICE_ENDPOINT: 'https://localjuice.good-loop.com',
	// ADRECORDER_ENDPOINT: 'http://localadrecorder.good-loop.com/record',
};
