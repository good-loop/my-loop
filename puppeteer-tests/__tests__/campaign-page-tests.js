const puppeteer = require('puppeteer');

// Report catastrophic "the page doesn't even load" type failures
test('Load the campaign page', async () => {
    const browser = await window.__BROWSER__;
    const page = await browser.newPage();
    
    await page.goto('https://testmy.good-loop.com/#campaign/?gl.vert=Qcnjbpae');
    await page.waitForSelector('a.charity > img');

}, 15000);
