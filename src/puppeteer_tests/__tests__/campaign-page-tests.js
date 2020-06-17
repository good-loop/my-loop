const puppeteer = require('puppeteer');
const { CommonSelectors, MyLoopSelectors, TwitterSelectors} = require('../utils/MasterSelectors');
const {fillInForm, login, watchAdvertAndDonate} = require('../res/UtilityFunctions');
const {password, username, twitterPassword, twitterUsername} = require('../../../logins/sogive-app/puppeteer.credentials');

// await page.goto('https://testmy.good-loop.com/#campaign/?gl.vert=CeuNVbtW');

let browser, page, dataStore;

describe('Display tests', () => {
    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    })

    afterAll(async () => {
        browser.close();
    })

    it('Can open CampaignPage', async () => {
        await page.goto('https://testmy.good-loop.com/#campaign/?gl.vert=CeuNVbtW');

        await expect(page.title()).resolves.toMatch('My Good-Loop');
    })

    it('Displays information based on vert id', async () => {
        const hnhLogoUrl = 'https://media.good-loop.com/uploads/standard/Untitled_design_50-16466054913389307591.png';

        await page.waitForSelector('.hero-logo');
        const logo = await page.$eval('.hero-logo', e => e.src);

        await expect(logo).toMatch(hnhLogoUrl);
    })

    it('Displays charity card for each charity', async () => {
        await page.waitForSelector('.charity-card');
        const cards = await page.$$('.charity-card');

        await expect(cards.length).toBe(3);
    })
})