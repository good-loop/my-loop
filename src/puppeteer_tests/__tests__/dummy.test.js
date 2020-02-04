
const config = JSON.parse(process.env.__CONFIGURATION);
const { ourServers} = require('../utils/testConfig');

const baseSite = ourServers[config.site];

// What's with this stuff above?
// In order to bypass Jest's restriction on non pre-defined argvs we'll execute our tests through a node runner,
// allowing us to parse any argv, check it against our own pre-defined flags, and pass them on inside process.env.
// targetServer and customVertId are just enums defined in the utils dir to be used along with the custom argvs
// present in the config object. More details on implementationa and use available on the wiki.
// https://wiki.good-loop.com/index.php?title=Front-end_Testing

// The tests below are quite simple and illustrate how to use Puppeteer alogng with Jest.
// And here's a happy clown: o<| : o ) --|--<

describe('My GL - smoke test', () => {
	it('should load a page', async () => {
		await page.goto(baseSite);
		await expect(page).toMatch('Good');
	});
});
