// Front-end configuration for `baker` (test server)

// Change index to switch all endpoints together
const cluster = 'test';
const protocol = 'https';

export const ServerIOOverrides = {
	GREENCALC_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com/greencalc?server=production`,
	PROFILER_ENDPOINT: `${protocol}://${cluster}profiler.good-loop.com`
};
