// Front-end configuration for `stage` (staging server)

const cluster = 'stage';
const protocol = 'https';

export const ServerIOOverrides = {
	GREENCALC_ENDPOINT: `${protocol}://${cluster}portal.good-loop.com/greencalc?server=production`,
	PROFILER_ENDPOINT: `${protocol}://${cluster}profiler.good-loop.com`
};
