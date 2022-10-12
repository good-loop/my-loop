const puppeteer = require('puppeteer');
const { targetServers } = require('../testConfig');

const $ = require('jquery');
const { CommonSelectors, MyLoopSelectors } = require('../MasterSelectors');
const {login } = require('../test-base/UtilityFunctions');
const { password, username} = require('../Credentials');

const config = JSON.parse(process.env.__CONFIGURATION);
const baseSite = targetServers[config.site];

let url = `${baseSite}`;

describe('My-Loop email signup tests', () => {

	test('Email sign up - smoke test', async () => {
		await page.goto(url);
		await page.waitForSelector("input[name=email]");
		// Put in an email
		await page.type("input[name=email]", "spoon.mcguffin@gmail.com");
		// submit
		await page.click('button'); // TODO add a submit marker to the button

	}, 15000);

}); // ./describe
