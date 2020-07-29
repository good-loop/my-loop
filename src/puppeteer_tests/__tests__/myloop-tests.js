const puppeteer = require('puppeteer');
const { targetServers } = require('../testConfig');

const $ = require('jquery');
const { CommonSelectors, MyLoopSelectors } = require('../MasterSelectors');
const {login } = require('../test-base/UtilityFunctions');
const { password, username} = require('../Credentials');

const config = JSON.parse(process.env.__CONFIGURATION);
const baseSite = targetServers[config.site];

let url = `${baseSite}`;

describe('My-Loop tests', () => {
//	beforeAll(async () => {
//		// is this needed??
//		browser = await puppeteer.launch();
//		page = await browser.newPage();
//	});


	test('My Loop log in', async () => {
		await page.goto("https://testmy.good-loop.com/#my");
		await login({
			page,
			username: username,
			password: password,
			Selectors: Object.assign(CommonSelectors, MyLoopSelectors),
			service: 'email'
		});
		await page.waitForSelector(MyLoopSelectors.logged_in_greeting);

	}, 15000);

}); // ./describe
