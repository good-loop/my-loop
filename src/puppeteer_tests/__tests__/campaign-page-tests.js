const puppeteer = require('puppeteer');
const { targetServers } = require('../testConfig');
// await page.goto('https://testmy.good-loop.com/#campaign/?gl.vert=CeuNVbtW');
const config = JSON.parse(process.env.__CONFIGURATION);
const { delay } = require('../test-base/UtilityFunctions');
const baseSite = targetServers[config.site];

describe('Display tests', () => {

	it('Can open CampaignPage', async () => {
		await page.goto(baseSite+'/#campaign/?gl.vert=CeuNVbtW');

		await expect(page.title()).resolves.toMatch('My Good-Loop');
	});

	it('Displays information based on vert id', async () => {
		await page.goto(baseSite+'/#campaign/?gl.vert=CeuNVbtW');
		await page.waitForSelector('img[alt="brand logo"]');
		await delay(500); // Wait for portal/sogive data to load
		const logo = await page.$eval('img[alt="brand logo"]', e => e.src);

		const hnhLogoUrl = 'https://media.good-loop.com/uploads/standard/h.and.m.red.logo-8033650396845614820.svg';				
		await expect(logo).toMatch(hnhLogoUrl);
	});

	it('Displays charity card for each charity', async () => {
		await page.goto(baseSite+'/#campaign/?gl.vert=CeuNVbtW');
		await page.waitForSelector('.charity-card');
		const cards = await page.$$('.charity-card');

		await expect(cards.length).toBe(3);
	});
});
