const puppeteer = require('puppeteer');
const { targetServers } = require('../testConfig');
// await page.goto('https://testmy.good-loop.com/#campaign/?gl.vert=CeuNVbtW');
const config = JSON.parse(process.env.__CONFIGURATION);
const baseSite = targetServers[config.site];

describe('Display tests', () => {

	it('Can open CampaignPage', async () => {
		await page.goto(baseSite+'/#campaign/?gl.vert=CeuNVbtW');

		await expect(page.title()).resolves.toMatch('My Good-Loop');
	});

	it('Displays information based on vert id', async () => {
		await page.goto(baseSite+'/#campaign/?gl.vert=CeuNVbtW');
		await page.waitForSelector('.hero-logo');
		const logo = await page.$eval('.hero-logo', e => e.src);

		const hnhLogoUrl = 'https://media.good-loop.com/uploads/standard/Untitled_design_50-16466054913389307591.png';				
		await expect(logo).toMatch(hnhLogoUrl);
	});

	it('Displays charity card for each charity', async () => {
		await page.goto(baseSite+'/#campaign/?gl.vert=CeuNVbtW');
		await page.waitForSelector('.charity-card');
		const cards = await page.$$('.charity-card');

		await expect(cards.length).toBe(3);
	});
});
