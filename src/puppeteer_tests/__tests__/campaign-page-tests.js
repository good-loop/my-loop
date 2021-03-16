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

	it('Loads basic info from campaign id', async () => {
		await page.goto(baseSite+'/#campaign/nature_valley');
		await page.waitForSelector('.advertiser-name');
		await delay(500); // Wait for portal/sogive data to load
		const vertiserName = await page.$eval('.advertiser-name span', e => e.innerHTML);

		const expectedVertiserName = 'Nature Valley';
		await expect(vertiserName).toMatch(expectedVertiserName);
    });
    
    it('Displays correct numbers according to campaign data', async () => {
		await page.goto(baseSite+'/#campaign/nature_valley');
		await page.waitForSelector('.advertiser-name');
		await delay(2000); // Wait for portal/sogive data to load and counters to stop counting
        
        const numPeople = (await page.$eval('span.num', e => e.innerHTML)).replace(/\,/g,"");
        const campaignNumPeople = await page.evaluate(() => {
            return DataStore.getValue(['data','Campaign','nature_valley','numPeople']);
        });
        await expect(numPeople).toMatch(campaignNumPeople.toString());

        const totalDonation = (await page.$eval('.splash-text .position-absolute.text-center', e => e.innerHTML)).replace(/(\$|\£|\€)/g,"");
        const campaignTotalDonation = await page.evaluate(() => {
            return new Intl.NumberFormat('en-GB', {maximumSignificantDigits:4}).format(Number.parseFloat(DataStore.getValue(['data','Campaign','nature_valley','dntn', 'value'])));
        });
        await expect(totalDonation).toMatch(campaignTotalDonation.toString());
	});

	it('Displays charity card for each charity', async () => {
		await page.goto(baseSite+'/#campaign/nature_valley');
		await page.waitForSelector('.charity-quote');
        const cards = await page.$$('.charity-quote');
        const charity1 = await page.$$('#charity-national-park-foundation');
        const charity2 = await page.$$('#charity-the-recycling-partnership');

        await expect(cards.length).toBe(2);
        await expect(charity1.length).toBe(1);
        await expect(charity2.length).toBe(1);
	});
});
