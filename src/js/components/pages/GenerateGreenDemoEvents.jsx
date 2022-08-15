import React, { Fragment, useEffect, useState } from 'react';

import NewChartWidget from '../NewChartWidget';
import Login from '../../base/youagain';
import Roles from '../../base/Roles';
import { demoDeviceCombos, demoDomains, demoLocnsUK, demoLocnsUS } from '../../utils/generateDemoConstants';
import { Button, Col, Container, Row } from 'reactstrap';
import C from '../../C';
import KStatus from '../../base/data/KStatus';
import PropControl from '../../base/components/PropControl';
import ActionMan from '../../plumbing/ActionMan';


/**
 * Direct copy-paste from Wikipedia: https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
 * Used here to generate a nice-looking low frequency variation for the random data set
   Monotone cubic spline interpolation
   Usage example:
	var f = createInterpolant([0, 1, 2, 3, 4], [0, 1, 4, 9, 16]);
	var message = '';
	for (var x = 0; x <= 4; x += 0.5) {
		var xSquared = f(x);
		message += x + ' squared is about ' + xSquared + '\n';
	}
	alert(message);
*/
var createInterpolant = function(xs, ys) {
	var i, length = xs.length;
	
	// Deal with length issues
	if (length != ys.length) { throw 'Need an equal count of xs and ys.'; }
	if (length === 0) { return function(x) { return 0; }; }
	if (length === 1) {
		// Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
		// Impl: Unary plus properly converts values to numbers
		var result = +ys[0];
		return function(x) { return result; };
	}
	
	// Rearrange xs and ys so that xs is sorted
	var indexes = [];
	for (i = 0; i < length; i++) { indexes.push(i); }
	indexes.sort(function(a, b) { return xs[a] < xs[b] ? -1 : 1; });
	var oldXs = xs, oldYs = ys;
	// Impl: Creating new arrays also prevents problems if the input arrays are mutated later
	xs = []; ys = [];
	// Impl: Unary plus properly converts values to numbers
	for (i = 0; i < length; i++) { xs.push(+oldXs[indexes[i]]); ys.push(+oldYs[indexes[i]]); }
	
	// Get consecutive differences and slopes
	var dys = [], dxs = [], ms = [];
	for (i = 0; i < length - 1; i++) {
		var dx = xs[i + 1] - xs[i], dy = ys[i + 1] - ys[i];
		dxs.push(dx); dys.push(dy); ms.push(dy/dx);
	}
	
	// Get degree-1 coefficients
	var c1s = [ms[0]];
	for (i = 0; i < dxs.length - 1; i++) {
		var m = ms[i], mNext = ms[i + 1];
		if (m*mNext <= 0) {
			c1s.push(0);
		} else {
			var dx_ = dxs[i], dxNext = dxs[i + 1], common = dx_ + dxNext;
			c1s.push(3*common/((common + dxNext)/m + (common + dx_)/mNext));
		}
	}
	c1s.push(ms[ms.length - 1]);
	
	// Get degree-2 and degree-3 coefficients
	var c2s = [], c3s = [];
	for (i = 0; i < c1s.length - 1; i++) {
		var c1 = c1s[i], m_ = ms[i], invDx = 1/dxs[i], common_ = c1 + c1s[i + 1] - m_ - m_;
		c2s.push((m_ - c1 - common_)*invDx); c3s.push(common_*invDx*invDx);
	}
	
	// Return interpolant function
	return function(x) {
		// The rightmost point in the dataset should give an exact result
		var i = xs.length - 1;
		if (x == xs[i]) { return ys[i]; }
		
		// Search for the interval x is in, returning the corresponding y if x is one of the original xs
		var low = 0, mid, high = c3s.length - 1;
		while (low <= high) {
			mid = Math.floor(0.5*(low + high));
			var xHere = xs[mid];
			if (xHere < x) { low = mid + 1; }
			else if (xHere > x) { high = mid - 1; }
			else { return ys[mid]; }
		}
		i = Math.max(0, high);
		
		// Interpolate
		var diff = x - xs[i], diffSq = diff*diff;
		return ys[i] + c1s[i]*diff + c2s[i]*diffSq + c3s[i]*diff*diffSq;
	};
};


/** Apply a linear tapering to a curve at the start and end */
const RAMP_ZONE = 0.1;
const ramp = (cursor, start, end) => { 
	const duration = end.getTime() - start.getTime();
	const toStartEnd = Math.min(
		(cursor.getTime() - start.getTime()) / duration,
		(end.getTime() - cursor.getTime()) / duration
	);

	if (toStartEnd < RAMP_ZONE) return (toStartEnd * (1 / RAMP_ZONE));
	return 1;
}


/**
 * Pick an option out of the set with a weighted probability distribution
 * Distribution should be normalised to sum to 1
 */
const weightedPick = (options, distribution) => {
	const r = Math.random();
	let acc = 0;
	for (let i = 0; i < distribution.length; i++) {
		const nextAcc = acc + distribution[i];
		if (r > acc && r <= nextAcc) return options[i];
		acc = nextAcc;
	}
	return options[options.length - 1]; // backstop - normalisation might not sum to exactly 1
};

/** Turn an object of form {a: 10, b: 20} into a props object for a ChartJS bar chart */
const objToChart = (obj, label) => {
	let entries = Object.entries(obj)
	entries.sort(([ka], [kb]) => ka.localeCompare(kb));

	return entries.reduce((chartData, [k, v]) => {
		chartData.data.labels.push(k);
		chartData.data.datasets[0].data.push(v);
		return chartData;
	}, { data: { labels: [], datasets: [{ data: [], label }] } });
};


/** Generate a real-looking set of DataLog events for the given period. */
const generateData = (startDate, endDate, totalImps, campaign, adid, vertiser) => {
	let cursor = new Date(startDate);
	cursor.setHours(0, 0, 0, 0);
	const endStop = new Date(endDate);
	endStop.setHours(24, 0, 0, 0);

	// Generate a shaping curve with data points 2 days apart...
	const lowFreqXs = [];
	const lowFreqYs = [];
	
	while (cursor.getTime() < endDate.getTime()) {
		let hour = Math.floor(cursor.getTime() / 3600000);
		lowFreqXs.push(hour);
		lowFreqYs.push(Math.random());
		cursor.setDate(cursor.getDate() + 2);
	}
	
	// Interpolate shaping curve to data points 4 hours apart (so time-of-day chart looks OK)
	const data = [];
	const labels = [];
	
	const interpolant = createInterpolant(lowFreqXs, lowFreqYs);
	cursor = new Date(startDate);
	cursor.setHours(0, 0, 0, 0);
	
	while (cursor.getTime() < endDate.getTime()) {
		let hour = Math.floor(cursor.getTime() / 3600000);
		let val = interpolant(hour);

		labels.push(cursor.toDateString());
		// Add random perturbation, and taper at start/end to avoid sharp cutoff
		data.push((Math.random() * 0.1) + val * ramp(cursor, startDate, endDate));
		cursor.setHours(cursor.getHours() + 4);
	}

	// Normalise generated values to sum to 1
	const dataTotal = data.reduce((acc, val) => acc + val, 0);
	data.forEach((val, i) => data[i] = val / dataTotal);

	// Randomly shape location, domain, site distributions so their graphs look varied
	// ...and normalise these to sum to 1 as well
	let stateProbs = demoLocnsUS.map(() => Math.random());
	let stateProbsTotal = stateProbs.reduce((acc, val) => acc + val, 0);
	stateProbs.forEach((val, i) => stateProbs[i] = val / stateProbsTotal);
	let countyProbs = demoLocnsUK.map(() => Math.random());
	let countyProbsTotal = countyProbs.reduce((acc, val) => acc + val, 0);
	countyProbs.forEach((val, i) => countyProbs[i] = val / countyProbsTotal);
	let deviceProbs = demoDeviceCombos.map(() => Math.random());
	let deviceProbsTotal = deviceProbs.reduce((acc, val) => acc + val, 0);
	deviceProbs.forEach((val, i) => deviceProbs[i] = val / deviceProbsTotal);
	let domainProbs = demoDomains.map(() => Math.random());
	let domainProbsTotal = domainProbs.reduce((acc, val) => acc + val, 0);
	domainProbs.forEach((val, i) => domainProbs[i] = val / domainProbsTotal);

	// Divide up allocated impressions among locations
	const evts = [];
	// Visualise before committing: Impressions, OS, browser, domain, location breakdown
	let imps = { data: { labels, datasets: [{ data: [], label: 'Impressions', cubicInterpolationMode: 'monotone' }] } };
	let browsers = {};
	let oss = {};
	let domains = {};
	let locns = {};
	
	// Generate a set of impression blocks for each point in time that covers various locations, domains, devices
	data.forEach((val) => {
		const impsPerCountry = Math.round(val * totalImps / 2);
		let thisPointCount = 0;

		// keep event counts low - we don't have to hit every state/county for every data point
		const samplesPerDataPoint = 10;
		for (let i = 0; i < samplesPerDataPoint; i++) {
			// Multiply impressions: if we're sampling 10/200 counties, then we should
			// bump the allocation of impressions to each county by 200/10, ie 20x
			const ukMultiplier = demoLocnsUK.length / samplesPerDataPoint;
			const usMultiplier = demoLocnsUS.length / samplesPerDataPoint;

			// Pick a UK location and generate an event block
			let locnIndex = Math.floor(Math.random() * demoLocnsUK.length);
			let locn = demoLocnsUK[locnIndex];
			let count = Math.round(impsPerCountry * countyProbs[locnIndex] * ukMultiplier);
			thisPointCount += count;
			// Restrict number of separate events by allocating one combination of domain/OS/browser to each location
			// We don't slice the data in any way that should make this visible
			let domain = weightedPick(demoDomains, domainProbs);
			let {os, browser} = weightedPick(demoDeviceCombos, deviceProbs);
			// possibly this works out to a 0-count event - skip if so.
			if (count) evts.push({ count, domain, campaign, adid, vertiser, os, browser, ...locn });
			// Add count to all breakdowns
			if (!domains[domain]) domains[domain] = 0;
			domains[domain] += count;
			if (!browsers[browser]) browsers[browser] = 0;
			browsers[browser] += count;
			if (!oss[os]) oss[os] = 0;
			oss[os] += count;
			if (!locns[locn.locn_sub2]) locns[locn.locn_sub2] = 0; // UK county is subdivision level 2
			locns[locn.locn_sub2] += count;

			// ...and repeat for a US location
			locnIndex = Math.floor(Math.random() * demoLocnsUS.length);
			locn = demoLocnsUS[locnIndex];
			count = Math.round(impsPerCountry * stateProbs[locnIndex] * usMultiplier);
			thisPointCount += count;
			domain = weightedPick(demoDomains, domainProbs);
			({os, browser} = weightedPick(demoDeviceCombos, deviceProbs));
			if (count) evts.push({ count, domain, campaign, adid, vertiser, os, browser, ...locn });
			if (!domains[domain]) domains[domain] = 0;
			domains[domain] += count;
			if (!browsers[browser]) browsers[browser] = 0;
			browsers[browser] += count;
			if (!oss[os]) oss[os] = 0;
			oss[os] += count;
			if (!locns[locn.locn_sub1]) locns[locn.locn_sub1] = 0; // US state is subdivision level 1
			locns[locn.locn_sub1] += count;
		}
		// Add impressions for this point to preview chart data
		imps.data.datasets[0].data.push(thisPointCount);
	});

	// Convert browser/OS/domain/location objects to preview chart data
	browsers = objToChart(browsers, 'Browser');
	oss = objToChart(oss, 'Operating System');
	domains = objToChart(domains, 'Domain');
	locns = objToChart(locns, 'Location');

	return {data, labels, evts, imps, browsers, oss, domains, locns}
};


/** Fill out the datalog event for publishing via JournalServlet */
const commitEvent = evt => {
	let je = {
		makeEvent: true,
		makeBid: false,
		modifyBudget: false,
		e: {
			dataspace: 'green',
			tag: 'pixel',
			...evt, // All the stuff that varies between events: time, count, adid, browser, domain, etc...
		}
	};
	/* TODO SEND TO JOURNALSERVLET AND RETURN PV - I can't test this locally because I can't build/run AdServer - RM */
}


/** Take the generated events and send them to JournalServlet for insertion in DataLog */
const commitEvents = (evts, setGeneratedData) => {
	if (!confirm(`Are you sure you want to commit ${evts.length} entries to DataLog?`)) return;
	alert('This code is "safe" by default: remove the return statement below here to enable actually committing.');
	return;

	// Limit number of concurrent requests to JournalServlet
	const slots = 3;
	let openConns = 0;

	const todoEvts = [...evts];
	const doneEvts = [];
	const failedEvts = [];
	
	// Check for free slots every 100ms and try to publish another event
	window.setInterval(() => {
		if (openConns >= slots) return;
		if (todoEvts.length === 0) {
			// We're done - if any events failed to commit, put them back in the queue for a manual retry.
			setGeneratedData(prev => ({...prev, evts: failedEvts, inProgress: false, done: true}));
		}
		openConns++; // Claim a slot
		const evt = todoEvts.pop();
		// Send the event to JournalServlet & on return, mark as done or failed for retry
		commitEvent(evt).promise
		.then(() => {
			doneEvts.push(evt);
		})
		.catch(() => {
			failedEvts.push(evt);
		})
		.finally(() => {
			openConns--; // Release the slot
		});
		setGeneratedData(prev => ({...prev, inProgress: true, evtsProcessed: (doneEvts.length + failedEvts.length)}))
	}, 100);
};


const GenerateGreenDemoEvents = ({}) => {
	if (false && (!Login.isLoggedIn() || !Roles.isDev())) {
		return 'Only for devs';
	}
	
	const [{evts, imps, browsers, oss, domains, locns, done, inProgress, evtsProcessed}, setGeneratedData] = useState({});
	const [campaignId, setCampaignId] = useState();
	const [vertiserId, setVertiserId] = useState();

	const path = ['widget', 'ggde'];

	const evtCount = DataStore.getValue([...path, 'evtCount']);
	const start = DataStore.getValue([...path, 'start']);
	const end = DataStore.getValue([...path, 'end']);
	const tagId = DataStore.getValue([...path, 'tagid']);

	// Generate data when 
	useEffect(() => {
		// don't try to generate a block of events without all props specified!
		if (!start || !end) return;
		const startDate = new Date(start);
		const endDate = new Date(end);
		if (!startDate || !endDate) return;
		if (!tagId || !campaignId || !vertiserId) return;
		const start2022 = new Date('2022-01-01');
		// Sanity check, as new Date() will accept some extremely silly inputs eg "2" --> "1 Feb 2001"
		if (startDate.getTime() < start2022.getTime() || endDate.getTime() < start2022.getTime()) return;
		
		// OK, we have reasonable props: generate the events
		const gd = generateData(startDate, endDate, evtCount, tagId, campaignId, vertiserId);

		setGeneratedData(gd);
	}, [start, end, tagId, evtCount, campaignId, vertiserId]);

	useEffect(() => {
		if (!tagId) return;
		const pvTag = ActionMan.getDataItem({type: C.TYPES.GreenTag, id: tagId, status: KStatus.PUBLISHED, swallow: true});
		pvTag.promise.then((tag) => {
			setCampaignId(tag.campaign);
			const pvCampaign = ActionMan.getDataItem({type: C.TYPES.Campaign, id: tag.campaign, status: KStatus.PUBLISHED});
			pvCampaign.promise.then((campaign) => {
				setVertiserId(campaign.vertiser);
			});
		});
	}, [tagId]);


	let preview = null;

	// Preview the time-series graph of the generated data set
	if (evts) {
		let statusLine;
		if (done) {
			statusLine = <p>Processed {evts.evtsProcessed} DataLog event objects - {evts.failedEvts.length} failed, click "Commit" again to redo.</p>;
		} else if (inProgress) {
			statusLine = <p>Currently committing event blocks to DataLog... {evts.evtsProcessed}/{evts.length} done.</p>
		} else {
			statusLine = <p>Generated {evts.length} DataLog event objects, containing {evts.reduce((acc, evt) => acc + evt.count, 0)} synthetic impressions.</p>;
		}
		preview = <>
			{statusLine}
			<p>Impression count over time</p>
			<NewChartWidget {...imps} height={null} width={null} style={{width: '100%', height: '75vh'}} />
			<p>Browser distribution</p>
			<NewChartWidget {...browsers} type="bar" height={null} width={null} style={{width: '100%', height: '75vh'}} />
			<p>OS distribution</p>
			<NewChartWidget {...oss} type="bar" height={null} width={null} style={{width: '100%', height: '75vh'}} />
			<p>Domain distribution</p>
			<NewChartWidget {...domains} type="bar" height={null} width={null} style={{width: '100%', height: '75vh'}} />
			<p>Location distribution</p>
			<NewChartWidget {...locns} type="bar" height={null} width={null} style={{width: '100%', height: '75vh'}} />
		</>
	}

	return <Container>
		<Row>
			<Col xs="12">
				<h2>Green Dashboard Demo Data Generator</h2>
				<p>Enter an event count, start and end date for the "campaign", and the green tag to attribute impressions to.</p>
				<p>Nothing will be committed to DataLog until instructed.</p>
				{evts ? <>
					<Button onClick={() => commitEvents(evts, setGeneratedData)}>Commit</Button>
				</> : null}
			</Col>
		</Row>
		<Row>
			<Col xs="12">
				<PropControl type="number" path={path} prop="evtCount" dflt={100000} label="Event Count" />
				<PropControl path={path} prop="start" dflt="2022-01-01" label="Start Date" />
				<PropControl path={path} prop="end" dflt="2022-01-14" label="End Date" />
				<PropControl type="DataItem" itemType={C.TYPES.GreenTag} path={path} prop="tagid" label="Green Tag" />
			</Col>
		</Row>
		<Row>
			<Col xs="12">
				{preview}
			</Col>
		</Row>
		
	</Container>;
};

export default GenerateGreenDemoEvents;
