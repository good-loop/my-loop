const puppeteer = require('puppeteer');
const $ = require('jquery');
const fs = require('fs');
const {AdServerSelectors, CommonSelectors, MyLoopSelectors, TwitterSelectors} = require('../test-base/utils/SelectorsMaster');
const {APIBASE, fillInForm, login} = require('../test-base/babeled-res/UtilityFunctions');
const {password, username, twitterPassword, twitterUsername} = require('../../../logins/sogive-app/puppeteer.credentials');


const timeStamp = new Date().toISOString();

test('My Loop log in', async () => {
    const browser = await window.__BROWSER__;
    const page = await browser.newPage();
	
    await page.goto("https://testmy.good-loop.com/#my");
    await page.click(MyLoopSelectors['log-in']);
    await page.click(CommonSelectors["log-in-email"]);
    await page.keyboard.type(username);
    await page.click(CommonSelectors["log-in-password"]);
    await page.keyboard.type(password);
    await page.keyboard.press('Enter');
    // After logging in, there should be a greeting "Hi $NAME".  If it exists, puppeteer can find it.  If not, then fail.
    await page.waitForSelector(MyLoopSelectors.logged_in_greeting);

}, 15000);

// NB (31/10/18): This does not test the "cookies" radio as this, for some reason, is tracked separately
test('My Loop radio buttons', async () => {
    const browser = await window.__BROWSER__;
    const page = await browser.newPage();

    // Pull in initial values of all radio buttons
    // These should be listed as an array under 'cargo.p'
    const radioDataEndpoint = 'https://testprofiler.good-loop.com/profile//thepuppetmaster%40winterwell.com%40email?app=good-loop&as=thepuppetmaster%40winterwell.com%40email&withCredentials=true';
    const initialRadioStatesPV = await fetch(radioDataEndpoint);
    let initialRadioStates = initialRadioStatesPV && initialRadioStatesPV.cargo && initialRadioStatesPV.cargo.p ? initialRadioStatesPV.cargo.p : null;
	// HACK(29/10/18): saw that there are now permissions that are listed but never used
	// Assume that only permissions that we've defined selectors for are in use
	initialRadioStates = initialRadioStates.filter( v => MyLoopSelectors[v]);

    await page.goto("https://testmy.good-loop.com/#my");
    await page.click(MyLoopSelectors['log-in']);
    await page.click(CommonSelectors["log-in-email"]);
    await page.keyboard.type(username);
    await page.click(CommonSelectors["log-in-password"]);
    await page.keyboard.type(password);
    await page.keyboard.press('Enter');
    await page.waitForSelector(MyLoopSelectors.logged_in_greeting);

    await page.waitFor(5000);
    initialRadioStates.forEach(async radioState => {
        // Button set to "No", click "Yes"
        if(radioState.slice(0,1) === "-") {
			await page.waitForSelector(MyLoopSelectors[radioState.slice(1)]);
            await page.click(MyLoopSelectors[radioState.slice(1)]);
            return;    
        }
		// Button set to "Yes", click "No"
		await page.waitForSelector(MyLoopSelectors['-' + radioState]);
        await page.click(MyLoopSelectors['-' + radioState]);
    });
    await page.waitFor(5000);

    const finalRadioStatesPV = await fetch(radioDataEndpoint);
    let finalRadioStates = finalRadioStatesPV && finalRadioStatesPV.cargo && finalRadioStatesPV.cargo.p ? finalRadioStatesPV.cargo.p : null;
	finalRadioStates = finalRadioStates.filter( v => MyLoopSelectors[v]);

    for( let i = 0; i < initialRadioStates.length; i++) {
        expect(initialRadioStates[i]).not.toEqual(finalRadioStates[i]);
    }
}, 25000);

/**Ad watching functionality copied from adserver-tests
 * Would we want to make this into a common function?
 */
test('Does the amount donated by the user increment after watching an advert?', async () => {
    const browser = await window.__BROWSER__;
    const page = await browser.newPage();
    const adLength = 15000;

    await page.goto('https://test.good-loop.com/rectangle?gl.vert=URFFCVRT');
    await page.waitFor(1000);//Allow 'visible' event to register. Doesn't get counted if you start working right away
    
    const cookie = await page.cookies();
    const trkID = cookie[0].value; // Should only ever have the good-loop cookie

    const donationTotalEndpoint = `https://testas.good-loop.com/datafn/donations?q=user%3A${trkID}&app=good-loop&as=fake4%40winterwell.com%40email&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzZXJ2ZXIiOiJiZXN0ZXIiLCJzdWIiOiJmYWtlNEB3aW50ZXJ3ZWxsLmNvbUBlbWFpbCIsImlzcyI6Imdvb2QtbG9vcCIsImlhdCI6MTUzOTI3NDA0NiwianRpIjoibHNpdGJoMTY2NjNlMWZiMmEifQ.Z1jiyx0XjMLRz9Y8ai1vYd8-creN8vSZb1GIEiMrOJf3AOl9mUN6QYHeROpo4OR4AvDdQWpQMgyjeH4yqZ_Jp8sZDh-9kJ2xYlDgLWp9iu8C_3VetjoAf0oiqFDJY9GNw3QL5UBsNDnXPNSAT-vM-I6aSeK1k6HzgBu-6-7ZYNA4eVt4Fe_uwFBdQnHaPckdwRUf3gnNWDl8NjPjzrTHenUNBEDM64RCM4JCSNg7gz4_JpDHby5wjbaeVKH_c9gU_OlQtcMreD4qzD0SdrodJ6HWj3J11zxw7Tlj5QdTOYVhnfLQEZjj0lbWxOt_GB4Tjpt-JMeCPdcuOEXu_6A2tw&withCredentials=true`;
    const initialDonationTotalPV = await fetch(donationTotalEndpoint);
    const initialDonationTotal = (initialDonationTotalPV && initialDonationTotalPV.data && initialDonationTotalPV.data.total && initialDonationTotalPV.data.total.value) || 0;

    // vpaid test pages do not have a banner to wait for/click on
    await page.waitForSelector(AdServerSelectors.TestAs.Banner);
    await page.click(AdServerSelectors.TestAs.Banner);

    await page.waitFor(adLength + 3000);//Length of ad + a bit extra for loading/whatever
    await page.click(AdServerSelectors.TestAs.FirstCharityIcon);
    await page.waitFor(5000);//Generally needs a second to register that donation has been made

    const finalDonationTotalPV = await fetch(donationTotalEndpoint);
    let finalDonationTotal = finalDonationTotalPV && finalDonationTotalPV.data && finalDonationTotalPV.data.total && finalDonationTotalPV.data.total.value;
    finalDonationTotal = parseFloat(finalDonationTotal);

    expect(finalDonationTotal).toBeGreaterThan(initialDonationTotal);
}, 60000);

test('Edit Twitter data after logging in', async () => {
	const browser = await window.__BROWSER__;
	const page = await browser.newPage();
	
	await page.goto("https://testmy.good-loop.com/#my");
	await login({
		page, 
		username: twitterUsername, 
		password: twitterPassword,
		Selectors: Object.assign(CommonSelectors, MyLoopSelectors, TwitterSelectors),
		service: 'twitter'
	});
	// After logging in, there should be a greeting "Hi $NAME".  If it exists, puppeteer can find it.  If not, then fail.
	await page.waitForSelector(MyLoopSelectors.logged_in_greeting);

	await page.click(MyLoopSelectors.edit);
	// Enter details
	await page.waitForSelector(MyLoopSelectors.name);
	await page.click(MyLoopSelectors.name);
	await page.keyboard.type(timeStamp);

	// Values that form will be updated with
	// Saved in an object for comparison with back-end later
	const fieldValues = {
		gender: 'Male',
		name: timeStamp,
		location: timeStamp,
		job: timeStamp,
		relationship: 'Single'
	};

	// Doesn't really matter if this always has the same value
	// Will take other fields as test of whether or not values update
	// This one will just show that the drop-down menus can be used
	// await page.select(MyLoopSelectors.gender, 'Male');

	await fillInForm({
		page,
		Selectors: MyLoopSelectors,
		data: fieldValues
	});

	// Give ES time to update
	await page.waitFor(5000);

	let finalClaims = await fetch('https://testprofiler.good-loop.com/profile/gl/' + twitterUsername + '@twitter');
	finalClaims = finalClaims.cargo.claims;
	// Remove Claims not generated by the user
	finalClaims.forEach( ({v, k, f}) => {
		// Skip Claims not generated by the user
		// Also skip drop-down menu values
		if( !f.includes('myloop@app') ) return;
		expect(v).toEqual(fieldValues[k]);
	});
}, 30000);

const fetch = async (url) => $.ajax({url});
