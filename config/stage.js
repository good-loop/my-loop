// Configuration for portal on `gravitas` (RM dev laptop)

// Change to "local", "test" or "" to switch all endpoints together
const cluster = 
	'stage';
	// 'local';
	// ''; // if you want production!

const protocol = (cluster === 'local') ? 'http' : 'https';

module.exports = {
	ServerIOOverrides: {
		GREENCALC_ENDPOINT: `https://stageportal.good-loop.com/greencalc?server=production`,
        PROFILER_ENDPOINT: 'https://stageprofiler.good-loop.com'
	}
};
