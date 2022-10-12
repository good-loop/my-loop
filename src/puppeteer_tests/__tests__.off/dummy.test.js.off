
const config = JSON.parse(process.env.__CONFIGURATION);
const { targetServers } = require('../testConfig');

const baseSite = targetServers[config.site];

describe('My GL - smoke test', () => {
	it('should load a page', async () => {
		await page.goto(baseSite);
		await expect(page).toMatch('Good');
	});
});
