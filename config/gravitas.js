// Front-end configuration for `gravitas` (RM dev desktop)

// Change index to switch all endpoints together
const cluster = ['', 'stage', 'test', 'local'][2];
const protocol = 'https';

export const ServerIOOverrides = {
	APIBASE: `${protocol}://${cluster}portal.good-loop.com`,
	AS_ENDPOINT: `${protocol}://${cluster}as.good-loop.com`,
	PORTAL_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com`,
	DEMO_ENDPOINT: `${protocol}://${cluster}demo.good-loop.com`,
	DATALOG_ENDPOINT: `${protocol}://${cluster}lg.good-loop.com/data`,
	MEDIA_ENDPOINT: `${protocol}://${cluster}uploads.good-loop.com`,
	ANIM_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com/_anim`,
	CHAT_ENDPOINT: `${protocol}://${cluster}chat.good-loop.com/reply`,
	MEASURE_ENDPOINT: `${protocol}://localmeasure.good-loop.com/measure`,
	// DATALOG_DATASPACE: 'gl',
	// ENDPOINT_NGO: 'https://test.sogive.org/charity',
	// JUICE_ENDPOINT: 'https://localjuice.good-loop.com',
	// ADRECORDER_ENDPOINT: 'http://localadrecorder.good-loop.com/record',
};
