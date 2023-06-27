import { loginEmail, loginPassword } from "../../wwappbase.js/test-base-new/test-base";

export const login = async (page, baseUrl) => {
    console.info('Logging in');

    // For some reason, Playwright would log in fine using the modal on the home page locally,
    // but not running headlessly on the server. It works fine using the static greendash login page though.
    await page.goto(baseUrl + 'greendash');

    await page.waitForSelector('#loginByEmail-email');
    await page.type('#loginByEmail-email', loginEmail);
    await page.type('#loginByEmail-password', loginPassword);

    await Promise.all([
        page.waitForNavigation(),
        page.click('#loginByEmail-submit')
    ]);
};