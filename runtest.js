'use strict';
// Run via `node runtest.js`
// Copied from wwappbase.js/template - because symlinks dont work
// Calls npm run test = jest, with config set in process
const shell = require('shelljs');
const yargv = require('yargs').argv;
const fetch = require('node-fetch');
const $ = require('jquery');

// NB: we can't catch --help or help, as node gets them first
if (yargv.support) {
	shell.echo(`
	runtest.js by Good-Loop

Uses jest-puppeteer Doc: https://github.com/smooth-code/jest-puppeteer/blob/master/README.md

Options

	--site What server to test? Default is local. Other values are usually "test" and "prod". See testConfig.js
		E.g. to run against the test site, use \`node runtest.js --site test\`
	--head If true (i.e. not headless), launch a browser window for debugging.
	--test <keyword> Use to filter by test. This matches on top-level "describe" names.
	--skipProdTest !!UNSAFE!! Don't test the target site for being production. Only use if you need to test on production site.

Tests are defined in: src/puppeteer-tests/__tests__
(this is where jest-puppeteer looks)
	`);
	return 0; // done
}
shell.echo("Use `node runtest.js --support` for help and usage notes\n");

let config = {
	// The possible values for `site` are defined in testConfig.js, targetServers
	site: 'local',
	unsafe: false,
	vert: '',
	// Used by jest-puppeteer.config.js to launch an actual browser for debugging
	head: false,
	chrome: false,
};
// Parse arguments...
let argv = process.argv.slice(0, 2);

/**
 * Keyword filter for which tests to run. e.g.
 * `node runtest.js --test advert`
 */
let testPath = '';
/**
 * If true, switch to single-threaded mode
 */
let runInBand = '';

Object.entries(yargv).forEach(([key, value]) => {
	if (key === 'test') { testPath = value; }
	if (key === 'runInBand') { runInBand = '--runInBand'; }

	// Overwrite config properties with command-line arguments? e.g. --site or --head
	if (Object.keys(config).includes(key)) {
		if (typeof config[key] === "boolean") {
			const bool = config[key];
			config[key] = !bool;
		} else config[key] = value;
	}
});

// Store configuration on env
process.env.__CONFIGURATION = JSON.stringify(config);

// Setting real ARGV
process.argv = argv;

const isLocal = config.site === "local";
const infoURL = (isLocal ? "http://" : "https://") + config.site + "my.good-loop.com:3000";

if (!yargv.skipProdTest) {
	// Check tests are not running on production
	console.log("Getting info from " + infoURL + "...");
	fetch(infoURL, { method: 'GET', timeout:10000 })
		.then(res => res.json())
		.then(serverInfo => {
			if (!serverInfo.isProduction) {
			// Execute Jest. Specific target optional.
				console.log("Server has " + serverInfo.type + " APIBASE, safe to test");
				shell.exec(`npm run test ${testPath} ${runInBand}`);
			} else {
				console.log("Server is running on production, aborting test!");
			}
		})
		.catch(err => console.log(err));
} else {
	console.log("Skipping test for production - unsafe!!");
	shell.exec(`npm run test ${testPath} ${runInBand}`);
}
