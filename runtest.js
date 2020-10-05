'use strict';
// Run via `node runtest.js`
// Copied from wwappbase.js/template - because symlinks dont work
// Calls npm run test = jest, with config set in process
const shell = require('shelljs');
const yargv = require('yargs').argv;
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

Tests are defined in: src/puppeteer-tests/__tests__
(this is where jest-puppeteer looks)
	`);
	return 0; // done
}
shell.echo("Use `node runtest.js --support` for help and usage notes");

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

const baseURLstr = "https://" + config.site + "my.good-loop.com/" + testPath;

// Check tests are not running on production
console.log("Testing on: " + baseURLstr);

const testURL = new URL(baseURLstr);
testURL.searchParams.append("get.server.info","true");
$.ajax(
	{
		url: testURL.href,
		type: 'GET',
		success: (data) => {
			const serverInfoStr = $(data).filter('#json').innerHTML;
			if (!serverInfoStr) return;
			const serverInfo = JSON.parse(serverInfoStr);
			console.log(serverInfo);
		}
	}
);

// Execute Jest. Specific target optional.
shell.exec(`npm run test ${testPath} ${runInBand}`);
