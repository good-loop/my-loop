
const runtestConfig = {
	appURL: "studio.good-loop.com",
	// Name of test server
	testHostname: "baker", 
	// The possible values for `site` are defined in testConfig.js, targetServers
	site: 'local',
	unsafe: false, // ??
	vert: '', // ??
	// Used by jest-puppeteer.config.js to launch an actual browser for debugging
	head: false, 
    chrome: false,
    gitlogPath: "/build/gitlog.txt"
};

const sitePrefixes = {
	prod:""
};

module.exports = {
	config: {...runtestConfig, sitePrefixes:sitePrefixes} // return copy of object to preserve original config
};
