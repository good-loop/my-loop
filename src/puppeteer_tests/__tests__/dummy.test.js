
const config = JSON.parse(process.env.__CONFIGURATION);
const { ourServers} = require('../testConfig');

const baseSite = ourServers[config.site];

describe('My GL - smoke test', () => {
	it('should load a page', async () => {
		await page.goto(baseSite);
		await expect(page).toMatch('Good');
	});

	it("My GL - should list campaigns, and click through to a campaign page", async () => {
		// await page.goto(baseSite);
		// await page.waitForSelector('.campaign-card');
		// let ccards = await page.$$();
		// await expect(ccards.length > 0).toBe(true);
		// await page.click('.campaign-card');
	});
});
