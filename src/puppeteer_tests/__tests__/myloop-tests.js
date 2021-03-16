const puppeteer = require('puppeteer');
const { targetServers } = require('../testConfig');

const $ = require('jquery');
const { CommonSelectors, MyLoopSelectors } = require('../MasterSelectors');
const {login } = require('../test-base/UtilityFunctions');
const { password, username} = require('../Credentials.js');

const config = JSON.parse(process.env.__CONFIGURATION);
const baseSite = targetServers[config.site];

let url = `${baseSite}`;

describe('My-Loop tests', () => {

	test('My Loop log in', async () => {
		await page.goto(url);
		const width = await page.evaluate(() => window.innerWidth);
		if (width < 1200) {
			await page.click('.navbar-toggler');
            await page.waitFor(200);
		}
		await login({
			page,
			username: username,
			password: password,
			Selectors: Object.assign(CommonSelectors, MyLoopSelectors),
			service: 'email'
		});
		//await page.waitFor(10000);
		//await page.waitForSelector(MyLoopSelectors.logged_in_greeting);

	}, 15000);

}); // ./describe
