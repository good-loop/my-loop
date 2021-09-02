/* global navigator */
import React, { useState } from 'react';
import BG from '../base/components/BG';
import MainDivBase from '../base/components/MainDivBase';
import { nonce } from '../base/data/DataClass';
// Plumbing
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import detectAdBlock from '../base/utils/DetectAdBlock';
import { lg } from '../base/plumbing/log';
import { encURI, stopEvent } from '../base/utils/miscutils';
import Login from '../base/youagain';
import C from '../C';
import WhiteCircle from './campaignpage/WhiteCircle';
// Components
import CharityLogo from './CharityLogo';
import { AccountMenu } from './MyLoopNavBar';
import NewtabLoginWidget, { NewtabLoginLink, setShowTabLogin } from './NewtabLoginWidget';
// import RedesignPage from './pages/RedesignPage';
import NewtabTutorialCard, { openTutorial, TutorialComponent, TutorialHighlighter, PopupWindow } from './NewtabTutorialCard';
import { fetchCharity } from './pages/MyCharitiesPage';
import { getPVSelectedCharityId, getTabsOpened, Search} from './pages/TabsForGoodSettings';
import TickerTotal from './TickerTotal';
import { getProfile, getPVClaimValue } from '../base/data/Person';


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

/**
 * The main Tabs-for-Good page
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
		lg("tabopen", {nonce: nonce(6)});
		// Wait 1.5 seconds before logging ad view - 1 second for ad view profit + .5 to load
		setTimeout(() => {
			// Avoid race condition: don't log until we know we have charity ID
			pvCharityID.promise.then(cid => lg("tabadview", {nonce: nonce(6), cid}));
		}, 1500);
		logOnceFlag = true;
	}

	const checkIfOpened = () => {
		if (!window.localStorage.getItem("t4gOpenedB4")) {
			window.localStorage.setItem("t4gOpenedB4", true);
			openTutorial();
		}
	}

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

	// Background images on tab plugin sourced locally

	return (<>
		<BG src={null} fullscreen opacity={0.9} bottom={110} style={{backgroundPosition: "center"}}>
			<TutorialHighlighter page={[4,5]} className="position-fixed p-3" style={{top: 0, left: 0, width:"100vw", zIndex:1}}>
				<div className="d-flex justify-content-between">
					<TutorialComponent page={5} className="logo pl-5 flex-row" style={{width:400}}>
						<a href="https://my.good-loop.com">
							<img src="https://my.good-loop.com/img/TabsForGood/TabsForGood_logo.png" style={{width: 200}} alt="logo"/>
						</a>
					</TutorialComponent>
					<TutorialComponent page={4} className="user-controls flex-row align-items-center">
						{Login.isLoggedIn() ? <TabsOpenedCounter/> : null}
						<AccountMenu small accountLink="/#account?tab=tabsForGood"
							customLogin={<NewtabLoginLink className="login-menu btn btn-transparent fill">Register / Log in</NewtabLoginLink>}
						/>
					</TutorialComponent>
				</div>
			</TutorialHighlighter>
			<div className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{top: 0, left: 0, width:"100vw", height:"100vh"}}>
				<div className="container h-100 flex-column justify-content-center unset-margins">
					<NormalTabCenter charityID={charityID} loadingCharity={loadingCharity}/>
				</div>
			</div>
			{/* Tutorial highlight to cover adverts */}
		</BG>
		<TutorialComponent page={3} className="position-absolute" style={{bottom:0, left:0, right:0, height:110, width:"100vw"}}/>
		<NewtabTutorialCard tutorialPages={tutorialPages} charityId={charityID} onClose={() => setShowPopup(true)}/>
		{showPopup && <PopupWindow/>}
		<NewtabLoginWidget onRegister={() => {checkIfOpened();}}/>
		<AdBlockPopup />
	</>);
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
		title:"Google",
		logo: "https://my.good-loop.com/img/TabsForGood/google.png",
		size: {width: 30, height: 30},
		url: "https://google.com/search?q="
	},
	ecosia: {
		title:"Ecosia",
		logo: "https://my.good-loop.com/img/TabsForGood/ecosia.png",
		size: {width: 30, height: 30},
		url: "https://ecosia.com/search?q="
	},
	duckduckgo: {
		title:"DuckDuckGo",
		logo: "https://my.good-loop.com/img/TabsForGood/duckduckgo.png",
		size: {width: 30, height: 30},
		url: "https://duckduckgo.com?q="
	},
	bing: {
		title:"Bing",
		logo: "https://my.good-loop.com/img/TabsForGood/bing.png",
		size: {width: 30, height: 30},
		url: "https://bing.com/search?q="
	}
}

const NormalTabCenter = ({charityID, loadingCharity}) => {
	let pvSE = getPVClaimValue({xid:Login.getId(), key:"searchEngine"});
	let searchEngine = (pvSE && pvSE.value) || "google";
	const engineData = ENGINES[searchEngine];

	// Show the total raised across all charities, if the user hasn't selected one.
	let totalRaised = null;
	if (!loadingCharity && !charityID) {
		totalRaised = <>
			<h3 className="text-center">
				Together we've raised&nbsp;
				<TutorialComponent page={2} className="d-inline-block">
					<TickerTotal />
				</TutorialComponent>
			</h3>
			<img src="https://my.good-loop.com/img/TabsForGood/sparkle.png" alt="sparkle" style={{width: 50}} className="pl-1"/>
		</>;
	}

	return <>
		<div className="flex-row unset-margins justify-content-center align-items-end mb-3">
			{ totalRaised }
		</div>
		<div className="w-100 pb-3">
			<div className="tab-search-container mx-auto">
				<Search onSubmit={e => doSearch(e, searchEngine)} placeholder={"Search with " + engineData.title} icon={
					<a href="/#account?tab=tabsForGood"><img src={engineData.logo} alt="search icon" style={{width:engineData.size.width, height:engineData.size.height}}/></a>
				}/>
			</div>
		</div>
		<small className="text-center text-white font-weight-bold">You are supporting</small>
		<NewTabCharityCard cid={charityID} loading={loadingCharity} />
	</>;
};

const PAGES = {
	webtop: WebtopPage
};
const NewTabMainDiv = () => {
	return <MainDivBase pageForPath={PAGES} defaultPage="webtop" navbar={false} className="newtab"/>;
};

const NewTabCharityCard = ({cid, loading}) => {

	const charity = cid ? fetchCharity(cid) : null;
	const isInTutorialHighlight = DataStore.getValue(['widget', 'TutorialCard', 'open']) && DataStore.getValue(['widget', 'TutorialCard', 'page']) === 1;
	const returnLink = encURI("/newtab.html#webtop?tutOpen=true&tutPage=2");
	const params = isInTutorialHighlight ? "&task=return&link=" + returnLink : "";

	return (<div className="d-flex justify-content-center" >
		<a href={"/#account?tab=tabsForGood" + params}>
			<TutorialComponent page={1}>
				<WhiteCircle className="m-3 tab-charity" circleCrop={charity ? charity.circleCrop : null}>
					{loading ? (
						<p className="color-gl-light-red font-weight-bold text-center my-auto">Loading...</p>
					) : (
						<>{charity ?
							<CharityLogo charity={charity}/>
							: <p className="color-gl-light-red font-weight-bold text-center my-auto">Select a charity</p>}
						</>
					)}
				</WhiteCircle>
			</TutorialComponent>
		</a>
	</div>);
};

const AdBlockPopup = () => {

	let [adblockPopup, setAdblockPopup] = useState(true);

	const pvHasAdBlock = detectAdBlock();
	const hasAdBlock = pvHasAdBlock.value;

	return hasAdBlock && adblockPopup ? (
		<div style={{background:"white", borderRadius:10, left:"50%", top:"50%", transform:"translate(-50%, -50%)", width:500, zIndex:99999}}
			className="shadow position-absolute text-center p-3"
			>
			<h3 className="text-dark">It looks like you have AdBlock enabled</h3>
			<p>We can't raise money for charity without displaying ads. Please disable your adblocker so Tabs for Good can work!</p>
			<b style={{position:"absolute", top:10, right:20, cursor:"pointer"}} onClick={() => setAdblockPopup(false)}>X</b>
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
			Thanks for signing up to Tabs for Good!<br/>
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
