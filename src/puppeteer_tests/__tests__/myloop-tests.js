const puppeteer = require('puppeteer');
const $ = require('jquery');
const { CommonSelectors, MyLoopSelectors } = require('../MasterSelectors');
const {login } = require('../test-base/UtilityFunctions');
const { password, username} = require('../Credentials');

const timeStamp = new Date().toISOString();

let browser, page, dataStore;

describe('My-Loop tests', () => {
	beforeAll(async () => {
		browser = await puppeteer.launch();
		page = await browser.newPage();
	});

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
