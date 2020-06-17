const puppeteer = require('puppeteer');
const $ = require('jquery');
const { CommonSelectors, MyLoopSelectors, TwitterSelectors} = require('../utils/MasterSelectors');
const {fillInForm, login, watchAdvertAndDonate} = require('../res/UtilityFunctions');
const {password, username, twitterPassword, twitterUsername} = require('../../../logins/sogive-app/puppeteer.credentials');


const timeStamp = new Date().toISOString();

test('My Loop log in', async () => {
    const browser = await window.__BROWSER__;
    const page = await browser.newPage();
	
    await page.goto("https://testmy.good-loop.com/#my");
    await login({
		page, 
		username: username, 
		password: password,
		Selectors: Object.assign(CommonSelectors, MyLoopSelectors),
		service: 'email'
	});
    await page.waitForSelector(MyLoopSelectors.logged_in_greeting);

}, 15000);

// NB (31/10/18): This does not test the "cookies" radio as this, for some reason, is tracked separately
test('My Loop radio buttons', async () => {
    const browser = await window.__BROWSER__;
    const page = await browser.newPage();

	const radioDataEndpoint = 'https://testprofiler.good-loop.com/profile//thepuppetmaster%40winterwell.com%40email?app=good-loop&as=thepuppetmaster%40winterwell.com%40email&withCredentials=true';
	// Pull in initial values of all radio buttons
	// These should be listed as an array under 'cargo.c'
	let initialRadioStates = await fetch({url: radioDataEndpoint, path: ['cargo', 'c']}) || [];
	// Only want values representing cookies that are currently being used. Using MyLoopSelectors (keys reference currently used cookie names) is more DRY, but also more cryptic
	initialRadioStates = initialRadioStates.filter( v => MyLoopSelectors[v]);

    await page.goto("https://testmy.good-loop.com/#my");
    await login({
		page, 
		username: username, 
		password: password,
		Selectors: Object.assign(CommonSelectors, MyLoopSelectors),
		service: 'email'
	});
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

	// Pull in final recorded values
	// Fail if these haven't changed after clicking on the radio buttons
	let finalRadioStates = await fetch({url: radioDataEndpoint, path: ['cargo', 'c']}) || [];
	finalRadioStates = finalRadioStates.filter( v => MyLoopSelectors[v]);

    for( let i = 0; i < initialRadioStates.length; i++) {
        expect(initialRadioStates[i]).not.toEqual(finalRadioStates[i]);
    }
}, 25000);

/**Ad watching functionality copied from adserver-tests
 * Would we want to make this into a common function?
 */
// test('Does the amount donated by the user increment after watching an advert?', async () => {
//     const browser = await window.__BROWSER__;
//     const page = await browser.newPage();

//     await page.goto('https://test.good-loop.com/landscape?gl.vert=URFFCVRT');
//     await page.waitFor(1000);//Allow 'visible' event to register. Doesn't get counted if you start working right away
    
//     const cookie = await page.cookies();
//     const trkID = cookie[0].value; // Should only ever have the good-loop cookie
//     const donationTotalEndpoint = `https://testas.good-loop.com/datafn/donations?q=user%3A${trkID}&app=good-loop&as=fake4%40winterwell.com%40email&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzZXJ2ZXIiOiJiZXN0ZXIiLCJzdWIiOiJmYWtlNEB3aW50ZXJ3ZWxsLmNvbUBlbWFpbCIsImlzcyI6Imdvb2QtbG9vcCIsImlhdCI6MTUzOTI3NDA0NiwianRpIjoibHNpdGJoMTY2NjNlMWZiMmEifQ.Z1jiyx0XjMLRz9Y8ai1vYd8-creN8vSZb1GIEiMrOJf3AOl9mUN6QYHeROpo4OR4AvDdQWpQMgyjeH4yqZ_Jp8sZDh-9kJ2xYlDgLWp9iu8C_3VetjoAf0oiqFDJY9GNw3QL5UBsNDnXPNSAT-vM-I6aSeK1k6HzgBu-6-7ZYNA4eVt4Fe_uwFBdQnHaPckdwRUf3gnNWDl8NjPjzrTHenUNBEDM64RCM4JCSNg7gz4_JpDHby5wjbaeVKH_c9gU_OlQtcMreD4qzD0SdrodJ6HWj3J11zxw7Tlj5QdTOYVhnfLQEZjj0lbWxOt_GB4Tjpt-JMeCPdcuOEXu_6A2tw&withCredentials=true`;

//     const initialDonationTotal = await fetch({url:donationTotalEndpoint, path: ['data', 'total', 'value']}) || 0;

// 	await watchAdvertAndDonate({page});
//     await page.waitFor(5000);//Generally needs a second to register that donation has been made

// 	let finalDonationTotal = await fetch({url:donationTotalEndpoint, path: ['data', 'total', 'value']});
//     finalDonationTotal = parseFloat(finalDonationTotal);

//     expect(finalDonationTotal).toBeGreaterThan(initialDonationTotal);
// }, 60000);

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

	// Go to the account page
	await page.goto(window.location.href + '/#account/');

	await page.waitForSelector(MyLoopSelectors.edit);
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

	let finalClaims = await fetch({url: 'https://testprofiler.good-loop.com/profile/gl/' + twitterUsername + '@twitter', path:['cargo', 'claims']}) || [];
	// Remove Claims not generated by the user
	finalClaims.forEach( ({v, k, f}) => {
		// Skip Claims not generated by the user
		// Also skip drop-down menu values
		if( !f.includes('myloop@app') ) return;
		expect(v).toEqual(fieldValues[k]);
	});
}, 45000);

/**
 * 
 * @param {*} Optional path String[] same as DataStore path. Specify where the data you want will be kept 
 * Returns entire blob of data if no path is specified
 */
const fetch = async ({url, path}) => {
	const rawData = await $.ajax({url});

	// Want to keep drilling down until we run out of keys or encounter a null value
	return !path ? rawData : path.reduce( (innerObj, key, i) => i === 0 ? rawData[key] : (innerObj && innerObj[key]) );
};
