const { test, chromium } = require('@playwright/test');

let browser;
let context;
let page;

const loginEmail = process.env.PLAYWRIGHT_LOGIN_EMAIL;
const loginPassword = process.env.PLAYWRIGHT_LOGIN_PASSWORD;

// Pages to check _before_ authenticating - since behaviour can change depending on whether or not we are logged in.
const guestPages = [
    'home',
    'campaign/toms_ella_2019',
    'campaign/matt_imod_6030',
    'campaign/matt_nike_3729',
    'campaign/dent_este_3284',
    'campaign/zeni_macm_3952',
    'charity/one-percent-for-the-planet',
    'charity/changemakerxchange',
    'newtab.html',
    'impactoverview',
    'account',
    'charities',
    'subscribe',
    'about',
    'tabsforgood',
    'forbusiness',
    'forcharity',
    'ourstory',
    'safari',
    'getinvolved',
    'ourimpact',
    'welcome',
];

// Pages to check _after_ authenticating.
const authPages = [
    'newtab.html?server=production',
    'greendash?campaign=iLWiEWO6&period=all',
    'greendash?campaign=xJJNA6jZ&period=all',
    'greendash?campaign=d2JK2qan&period=all',
    'greendash?tag=Y4XafmRH&period=all',
    'greendash?campaign=Coq3BZst&period=all',
    'greendash?tag=F0GXDusO&period=all',
    'greendash/recommendation?campaign=iLWiEWO6&period=all'
]

const baseUrl = process.env.TEST_URL || 'https://stagemy.good-loop.com/';
const guestPageUrls = guestPages.map(page => baseUrl + page + "?server=production");
const greenDashUrls = authPages.map(page => baseUrl + page + "&server=production");

const checkForErrors = async (page) => {
    const errorText = await page.evaluate(() => document.querySelector('body').innerText.toLowerCase());
    if (errorText.includes('there was an error')) {
        console.log("error!");
        throw new Error('Error text found in the page');
    }

    page.on('response', response => {
        const status = response.status();
        if (status >= 400) {
            console.log("error?");
            throw new Error(`Received bad response with status code ${status} from ${response.url()}`);
        }
    });
};

const login = async () => {
    console.info('Logging in');
    await page.goto(baseUrl + 'home');
    await page.click('li.login-link');

    await page.fill('#loginByEmail-email', loginEmail);
    await page.fill('#loginByEmail-password', loginPassword);

    await page.click('#loginByEmail-submit');
};

test.describe('Guest tests', () => {
    for (const pageUrl of guestPageUrls) {
        test(`check page ${pageUrl}`, async ({ page }) => {
            await page.goto(pageUrl);
            await checkForErrors(page);
        });
    }
});

test.describe('Authenticated tests', () => {
    if (loginEmail == null || loginPassword == null) {
        throw new Error("Login credentials not found. Please set the PLAYWRIGHT_LOGIN_EMAIL and PLAYWRIGHT_LOGIN_PASSWORD environment variables.");
    }

    test.beforeAll(async () => {
        browser = await chromium.launch();
        context = await browser.newContext();
        page = await context.newPage();

        await login();
    });

    test.afterAll(async () => {
        await browser.close();
    });

    for (const pageUrl of guestPageUrls) {
        test(`check page ${pageUrl}`, async () => {
            await page.goto(pageUrl);
            await checkForErrors(page);
        });
    }

    for (const pageUrl of greenDashUrls) {
        test(`check page ${pageUrl}`, async () => {
            await page.goto(pageUrl);

            // Playwright doesn't seem to have a built-in way to wait on all AJAX requests finishing.
            // Greendash cards may finish loading at separate times. For now, let's just wait 1s per dash.
            await page.waitForTimeout(15000);

            await checkForErrors(page);
        });
    }
});
