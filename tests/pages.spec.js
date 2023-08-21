import { loginEmail, loginPassword, checkForErrors } from '../../wwappbase.js/test-base-new/test-base';;
import { login } from './util';
const { test, chromium } = require('@playwright/test');

let browser;
let context;
let page;

const baseUrl = process.env.TEST_URL || 'https://stagemy.good-loop.com/';

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
    'greendash?campaign=iLWiEWO6&period=all',
    'greendash?campaign=xJJNA6jZ&period=all',
    'greendash?campaign=d2JK2qan&period=all',
    'greendash?tag=Y4XafmRH&period=all',
    'greendash?campaign=Coq3BZst&period=all',
    'greendash?tag=F0GXDusO&period=all',
    'greendash/recommendation?campaign=iLWiEWO6&period=all',

    // A bug seen after Jun 23 release
    'greendash/metrics?start=2023-04-30T14%3A00%3A00.000Z&end=2023-05-31T14%3A00%3A00.000Z&emode=total&tz=Australia/Sydney&period=last-month&ft=Agency&agency=IGX8mWqY',

    // Creatives recs (TODO - click analyse)
    'greendash/recommendation/creative/qg47jOFp?',
    'greendash/recommendation/creative/ctKDBLaY?',
    'greendash/recommendation/creative/KkiISwe1?'
]

const guestPageUrls = guestPages.map(page => baseUrl + page + "?server=production");
const greenDashUrls = authPages.map(page => baseUrl + page + "&server=production");

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

        await login(page, baseUrl);
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
            // Greendash cards may finish loading at separate times. For now, let's just wait 10s per dash.
            await page.waitForTimeout(10000);
            await checkForErrors(page, baseUrl);
        });
    }
});
