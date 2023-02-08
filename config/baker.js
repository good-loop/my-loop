// Configuration for portal on `gravitas` (RM dev laptop)

// Change to "local", "test" or "" to switch all endpoints together
const cluster = 
	'test';
	// 'local';
	// ''; // if you want production!

const protocol = (cluster === 'local') ? 'http' : 'https';

module.exports = {
	ServerIOOverrides: {
		GREENCALC_ENDPOINT: `https://testportal.good-loop.com/greencalc?server=production`,
        PROFILER_ENDPOINT: 'https://testprofiler.good-loop.com'
	}
};
