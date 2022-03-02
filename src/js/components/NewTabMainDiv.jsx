/* global navigator */
import React, { useState, useEffect } from 'react';
import {Container, Row, Col} from 'reactstrap';
import BG from '../base/components/BG';
import MainDivBase from '../base/components/MainDivBase';
import { nonce } from '../base/data/DataClass';
// Plumbing
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import detectAdBlock from '../base/utils/DetectAdBlock';
import { lg } from '../base/plumbing/log';
import { encURI, stopEvent, getBrowserVendor } from '../base/utils/miscutils';
import Login from '../base/youagain';
import C from '../C';
import WhiteCircle from './campaignpage/WhiteCircle';
// Components
import CharityLogo from './CharityLogo';
import AccountMenu from '../base/components/AccountMenu';
import NewtabLoginWidget, { NewtabLoginLink, setShowTabLogin } from './NewtabLoginWidget';
// import RedesignPage from './pages/RedesignPage';
import NewtabTutorialCard, { openTutorial, TutorialComponent, TutorialHighlighter, PopupWindow } from './NewtabTutorialCard';
import { fetchCharity } from './pages/MyCharitiesPage';
import { getPVSelectedCharityId, getTabsOpened, getTabsOpened2, Search } from './pages/TabsForGoodSettings';
import TickerTotal from './TickerTotal';
import Person, { getProfile, getPVClaimValue } from '../base/data/Person';
import Misc from '../base/components/Misc';
import Money from '../base/data/Money';
import NGO from '../base/data/NGO';
import Roles, { isTester } from '../base/Roles';


// DataStore
C.setupDataStore();

ServerIO.USE_PROFILER = true;

// Actions

Login.dataspace = C.app.dataspace;

/**
 * NB: useEffect was triggering twice (perhaps cos of the login dance)
 */
let logOnceFlag;

/**
 * Same for trying to verify user once ^^
 */
let verifiedLoginOnceFlag;


const LoremIpsum = () => {
	return <p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sit amet ornare neque. Cras egestas pretium risus, ac maximus justo tempus ac. Etiam vitae aliquam nulla, ut lobortis nibh. Ut et massa sit amet nulla eleifend bibendum. Proin elementum maximus lorem, ut tempor ante pharetra id. Integer et sem eget turpis fermentum consequat. Pellentesque vulputate laoreet metus. Donec hendrerit risus mauris, non ultrices ex venenatis non. Donec congue sem vitae diam molestie ornare. Pellentesque sit amet efficitur risus, ornare dictum magna. Donec a purus eu erat luctus dapibus eu et metus. Etiam at pulvinar ex. In convallis tempor consequat.

		Nam enim leo, maximus id lacus sed, varius cursus sapien. Praesent at mi sit amet augue sollicitudin ultrices. Nam tincidunt metus sit amet massa dapibus maximus. Morbi id mollis diam. Maecenas odio lectus, vehicula a massa a, mollis finibus sem. Sed ante nibh, molestie vitae urna eget, congue tincidunt lorem. Etiam et sollicitudin leo. Phasellus luctus interdum leo et consequat. Etiam ornare, arcu eu rhoncus venenatis, nisl ipsum laoreet dui, nec ultrices augue purus id felis. Duis feugiat erat diam, quis placerat ipsum ultrices quis. Morbi diam urna, interdum aliquam placerat non, elementum a urna. Vivamus consequat lacus nunc, nec elementum felis lobortis sit amet.

		Praesent arcu tellus, vulputate sit amet felis nec, convallis porta mi. Cras eu dolor nisi. Ut convallis vulputate sapien sit amet lacinia. Pellentesque quam metus, cursus vitae leo non, congue rutrum erat. Mauris non pretium odio. Curabitur dapibus pretium massa, vel vulputate mauris mollis ac. Proin et ipsum dignissim nunc mollis eleifend. Curabitur varius ipsum sed odio pulvinar, non suscipit augue tincidunt. Nulla quis diam quis ante elementum semper. In at libero diam. Mauris semper hendrerit sem at vehicula. Praesent blandit sapien sem, eu luctus ligula facilisis eu. Sed posuere erat ultrices nisl feugiat, eget pulvinar felis convallis. Nunc sollicitudin arcu tellus, a lacinia ligula dictum non.

		Morbi sed lacus ante. Duis sed tortor sollicitudin, fermentum urna nec, cursus mi. In euismod in sem sit amet feugiat. Quisque tincidunt nisl vitae mauris facilisis, eget tristique tortor dignissim. Phasellus feugiat, nulla sed ultricies pulvinar, justo urna mattis felis, nec maximus nisi elit ut ex. In iaculis neque a tortor dignissim cursus. Ut tristique nisi et ligula mollis, non tristique nulla pretium. Sed elementum pulvinar nisl, at posuere magna maximus non. Pellentesque odio turpis, luctus vel sollicitudin sit amet, placerat consequat odio. Fusce pretium elit metus, sit amet scelerisque turpis fermentum in. Phasellus mattis, quam consequat mollis auctor, dolor eros aliquam orci, sit amet interdum augue tortor ut ipsum. Curabitur bibendum pharetra eros. Donec nec euismod massa, ut pulvinar ex. Sed a urna vel odio volutpat rutrum semper in urna.

		Aenean feugiat dui at scelerisque convallis. Donec consequat ac velit ac feugiat. Ut in libero enim. Integer et est odio. Sed in ex felis. Proin id tempor mauris. Nulla eu purus ut metus imperdiet interdum. In vitae enim et nunc faucibus cursus non vel dolor. Donec vitae neque finibus, tincidunt purus eu, iaculis mauris. Nam id pharetra odio. Nullam eget pharetra ex. Aliquam efficitur sapien turpis, sit amet sodales justo feugiat nec. Curabitur in nibh nisl.
	</p>;
}

/**
 * The main Tabs for Good page
 * 
 */
const WebtopPage = () => {
	Login.app = "t4g.good-loop.com"; // Not My.GL!
	const pvCharityID = getPVSelectedCharityId();
	const loadingCharity = !pvCharityID || !pvCharityID.resolved;
	const charityID = pvCharityID && pvCharityID.value;
	let [showPopup, setShowPopup] = useState(false);

	// Yeh - a tab is opened -- let's log that (once only)
	if (!logOnceFlag && Login.isLoggedIn()) {
		let pvPerson = getProfile();
		pvPerson.promise.then(person => { // Hurrah - T4G is definitely installed
			if (!person) console.warn("no person?!");
			else Person.setHasApp(person, Login.app);
		});
		// NB: include a nonce, as otherwise identical events (you open a few tabs) within a 15 minute time bucket get treated as 1
		lg("tabopen", { nonce: nonce(6) });
		// Wait 1.5 seconds before logging ad view - 1 second for ad view profit + .5 to load
		setTimeout(() => {
			// Avoid race condition: don't log until we know we have charity ID
			pvCharityID.promise.then(cid => lg("tabadview", { nonce: nonce(6), cid }));
		}, 1500);
		logOnceFlag = true;
	}

	const checkIfOpened = () => {
		if (!window.localStorage.getItem("t4gOpenedB4")) {
			window.localStorage.setItem("t4gOpenedB4", true);
			openTutorial();
		}
	};

	if (!verifiedLoginOnceFlag) {
		// Popup login widget if not logged in
		// Login fail conditions from youagain.js
		Login.verify().then(res => {
			if (!res || !res.success) {
				setShowTabLogin(true);
			} else {
				checkIfOpened();
			}
		}).catch(res => {
			setShowTabLogin(true);
		});
		verifiedLoginOnceFlag = true;
	}

	// iframe src change?
	// https://stackoverflow.com/posts/17316521/revisions

	// Background images on tab plugin sourced locally, but not on safari and local dev mode
	const browser = getBrowserVendor();
	let backgroundColor = browser == 'SAFARI' || window.location.hostname.startsWith('local') || window.location.hostname.startsWith('test') ? 'lightgrey' : '';

	return (<>
		{ ! Roles.isDev() && <style>
			{ '.MessageBar .alert {display: none;}' }
		</style>}
		<BG src={null} fullscreen opacity={0.9} bottom={110} style={{ backgroundPosition: "center" }} color={backgroundColor}>
			<TutorialHighlighter page={[4, 5]} className="position-fixed p-3" style={{ top: 0, left: 0, width: "100vw", zIndex: 1 }}>
				<div className="d-flex justify-content-between">
					<TutorialComponent page={5} className="logo pl-5 flex-row" style={{ width: 400 }}>
						<a href="https://my.good-loop.com">
							<img src="https://my.good-loop.com/img/TabsForGood/TabsForGood_logo.png" style={{ width: 200 }} alt="logo" />
						</a>
					</TutorialComponent>
					<TutorialComponent page={4} className="user-controls flex-row align-items-center">
						{Login.isLoggedIn() ? <TabsOpenedCounter /> : null}
						<AccountMenu small accountLink="/account?tab=tabsForGood"
							customLogin={<NewtabLoginLink className="login-menu btn btn-transparent fill">Register / Log in</NewtabLoginLink>}
						/>
					</TutorialComponent>
				</div>
			</TutorialHighlighter>
			<Container fluid className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{ top: 0, left: 0, width: "100vw", height: "100vh" }}>
				<Row className="h-100 w-100" noGutters>
					<Col sm={3} md={4} />
					<Col sm={6} md={4} className="h-100 flex-column justify-content-center unset-margins">
						<NormalTabCenter charityID={charityID} loadingCharity={loadingCharity} />
					</Col>
					{/* <Col sm={3} md={4} className="flex-column justify-content-center align-items-center p-2">
						<CharityCustomContent content={<LoremIpsum/>}/>
					</Col> */}
				</Row>
			</Container>
			{/* Tutorial highlight to cover adverts */}
		</BG>
		<TutorialComponent page={3} className="position-absolute" style={{ bottom: 0, left: 0, right: 0, height: 110, width: "100vw" }} />
		<NewtabTutorialCard tutorialPages={tutorialPages} charityId={charityID} onClose={() => setShowPopup(true)} />
		{showPopup && <PopupWindow />}
		<NewtabLoginWidget onRegister={() => { checkIfOpened(); }} />
		<ConnectionStatusPopup />
	</>);
}; // ./WebTopPage


const PAGES = {
	newtab: WebtopPage
};
const NewTabMainDiv = () => {
	return <MainDivBase pageForPath={PAGES} defaultPage="newtab" navbar={false} className="newtab" />;
};


const TabsOpenedCounter = () => {
	let pvTabsOpened = getTabsOpened();
	if (pvTabsOpened && pvTabsOpened.value) {
		return <span className="pr-3 text-white font-weight-bold">{pvTabsOpened.value} tabs opened</span>;
	}
	return null;
};

const ENGINES = {
	google: {
		title: "Google",
		logo: "https://my.good-loop.com/img/TabsForGood/google.png",
		size: { width: 30, height: 30 },
		url: "https://google.com/search?q="
	},
	ecosia: {
		title: "Ecosia",
		logo: "https://my.good-loop.com/img/TabsForGood/ecosia.png",
		size: { width: 30, height: 30 },
		url: "https://ecosia.com/search?q="
	},
	duckduckgo: {
		title: "DuckDuckGo",
		logo: "https://my.good-loop.com/img/TabsForGood/duckduckgo.png",
		size: { width: 30, height: 30 },
		url: "https://duckduckgo.com?q="
	},
	bing: {
		title: "Bing",
		logo: "https://my.good-loop.com/img/TabsForGood/bing.png",
		size: { width: 30, height: 30 },
		url: "https://bing.com/search?q="
	}
};


/**
 * Shows search + the charity + amount raised
 * @param {Object} p
 * @returns 
 */
const NormalTabCenter = ({ charityID, loadingCharity }) => {
	let pvSE = getPVClaimValue({ xid: Login.getId(), key: "searchEngine" });
	let searchEngine = (pvSE && pvSE.value) || "google";
	const engineData = ENGINES[searchEngine];

	return <>
		<div className="flex-row unset-margins justify-content-center align-items-end mb-3 tab-center">
			{ true && //! loadingCharity && ! charityID &&
				// Show the total raised across all charities, if the user hasn't selected one.
				<><h3 className="text-center">
					Together we've raised&nbsp;
					<TutorialComponent page={2} className="d-inline-block">
						<TickerTotal />
					</TutorialComponent>
				</h3>
				<img src="https://my.good-loop.com/img/TabsForGood/sparkle.png" alt="sparkle" style={{ width: 50 }} className="pl-1 sparkle" />
			</>}
		</div>
		<div className="w-100 pb-3">
			<div className="tab-search-container mx-auto">
				<Search onSubmit={e => doSearch(e, searchEngine)} placeholder={"Search with " + engineData.title} icon={
					<a href="/?tab=tabsForGood" title="click here to change the search engine"><img src={engineData.logo} alt="search icon" style={{ width: engineData.size.width, height: engineData.size.height }} /></a>
				} />
			</div>
		</div>
		<NewTabCharityCard cid={charityID} loading={loadingCharity} />
	</>;
};


const NewTabCharityCard = ({ cid, loading }) => {
	const charity = cid ? fetchCharity(cid) : null;
	const isInTutorialHighlight = DataStore.getValue(['widget', 'TutorialCard', 'open']) && DataStore.getValue(['widget', 'TutorialCard', 'page']) === 1;
	const returnLink = encURI("/newtab.html#webtop?tutOpen=true&tutPage=2");
	const params = isInTutorialHighlight ? "&task=return&link=" + returnLink : "";

	let pvTotalForCharity = cid? DataStore.fetch(['misc','donations', cid], () => ServerIO.getDonationsData({q:"cid:"+cid})) : {};
	// HACK we want to show the total going up as tabs are opened. But we only reconcile on a quarterly basis.
	// SO: take 1 month of data, which will usually be an under-estimate, and combine it with an underestimate of CPM
	// to give a counter that ticks up about right.
	let pvNumTabsOpenedEveryone = getTabsOpened2({cid}); // 1 month's data -- which is alsmost certainly not included in the total
	let totalMoney;
	if (isTester() && pvTotalForCharity.value && pvNumTabsOpenedEveryone.value) {
		// TODO other currencies e.g. USD
		const tabEst = new Money(pvNumTabsOpenedEveryone.value* 2/1000); // $/£2 CPM as a low estimate
		totalMoney = Money.add(pvTotalForCharity.value.total, tabEst);
	}

	return (<div className="mx-auto rounded-lg text-center NewTabCharityCard" >
		<small className="">You are supporting</small>
		<a href={"/account?tab=tabsForGood" + params}>
			<TutorialComponent page={1}>
				<WhiteCircle className="mx-auto m-3 tab-charity color-gl-light-red font-weight-bold text-center" circleCrop={charity ? charity.circleCrop : null}>
					{loading? 
						<p className="my-auto">Loading...</p>
					: <>{charity ?
							<CharityLogo charity={charity} />
							: <p className="my-auto">Select a charity</p>}
						</>
					}
				</WhiteCircle>
			</TutorialComponent>
		</a>
		{totalMoney && charity && 
			<p>Together we've raised<br/><b><Misc.Money amount={totalMoney} /></b><br/>
			for {NGO.displayName(charity)}</p>}
	</div>);
};

const CharityCustomContent = ({content, className}) => {
	return <div className="charity-custom-content">
		{content}
	</div>;
}

// Checks for internet connection and any adblock interference
const ConnectionStatusPopup = () => {

	let [popup, setPopup] = useState(true);
	let [timedout, setTimedout] = useState(false);

	useEffect (() => {
		setTimeout(() => {
			setTimedout(true);
		}, 10000);
	}, []);

	const pvHasAdBlock = detectAdBlock();
	const hasAdBlock = pvHasAdBlock.value;
	const isOffline = ! navigator.onLine; // pvHasAdBlock.error;
	const determining = !(pvHasAdBlock.resolved || pvHasAdBlock.error) && timedout;
	const showPopup = (hasAdBlock || isOffline || determining) && popup;

	return showPopup ? (
		<div style={{ background: "white", borderRadius: 10, left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 500, zIndex: 99999 }}
			className="shadow position-absolute text-center p-3 pt-4"
		>
			{hasAdBlock && !isOffline && !determining && <>
				<h3 className="text-dark">It looks like you have AdBlock enabled</h3>
				<p>We can't raise money for charity without displaying ads. Please <a href="https://my.good-loop.com/#allowlist">disable your adblocker</a> so Tabs for Good can work!</p>
			</>}
			{isOffline && !determining && <>
				<h3 className="text-dark">We can't find the internet :(</h3>
				<p>We couldn't load your Tabs for Good page. Check your connection.</p>
				<small>If your internet is working, contact help@good-loop.com!</small>
			</>}
			{determining && <>
				<h3 className="text-dark">We're having trouble connecting</h3>
				<p>One moment...</p>
			</>}
			<b style={{ position: "absolute", top: 10, right: 20, cursor: "pointer" }} onClick={() => setPopup(false)} role="button">X</b>
		</div>
	) : null;
}

/**
 * redirect to Ecosia
 */
const doSearch = (e, engine) => {
	stopEvent(e);
	// NB: use window.parent to break out of the newtab iframe, otherwise ecosia objects
	const search = DataStore.getValue('widget', 'search', 'q');
	// Cancel search if empty
	// DONT use !search - if user searches a string that can evaluate falsy, like '0', it will cause a false positive
	if (search == null || search === '') {
		return;
	}
	(window.parent || window.parent).location = ENGINES[engine].url + encURI(search);
};

const tutorialPages = [
	<>
		<h2>Success!</h2>
		<p>
			Thanks for signing up to Tabs for Good!<br />
			You are now raising money for your favourite charity every time you open a new tab.
		</p>
	</>,
	<>
		<h2>It's your choice</h2>
		<p>
			Choose the charity you want to support. We will send them 50% of the money that brands pay for their ads on Tabs for Good.
		</p>
	</>,
	<>
		<h2>Check our progress</h2>
		<p>
			See how much money we've raised so far! &#128578;
		</p>
	</>,
	<>
		<h2>Where the money comes from</h2>
		<p>
			We generate money by displaying ads at the bottom of each Tabs for Good window. You don't need to click on them for it to work.
		</p>
	</>,
	<>
		<h2>Your account</h2>
		<p>
			Access settings including your <b>choice of charity</b>, <b>details</b> and <b>ad targeting preferences</b>.
		</p>
	</>,
	<>
		<h2>Explore the Loop</h2>
		<p>
			Find out more about Good-Loop and what more you can do for good at My-Loop.
		</p>
	</>
];

export default NewTabMainDiv;
