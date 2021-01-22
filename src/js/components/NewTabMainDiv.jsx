/* global navigator */
import React from 'react';
import BG from '../base/components/BG';
import MainDivBase from '../base/components/MainDivBase';
import { nonce } from '../base/data/DataClass';
// Plumbing
import DataStore from '../base/plumbing/DataStore';
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
import NewTabOnboardingPage from './NewTabOnboarding';
import NewtabTutorialCard, { openTutorial, TutorialComponent, TutorialHighlighter } from './NewtabTutorialCard';
import { fetchCharity } from './pages/MyCharitiesPage';
import { getSelectedCharityId, getTabsOpened, Search, getSearchEngine } from './pages/TabsForGoodSettings';
import TickerTotal from './TickerTotal';





// DataStore
C.setupDataStore();

// Actions


Login.app = C.app.service;

const inIframe = () => {
	try {
		return window.self !== window.top;
	} catch (e) {
		return true;
	}
};

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
	// onboarding => send them to chrome to install the plugin
	const onboarding = !inIframe() 
		&& ! (window.location.hostname==='localmy.good-loop.com' && (""+window.location).includes("test")); // HACK to allow easy testing during development

	// Yeh - a tab is opened -- let's log that (once only)	
	if ( ! logOnceFlag && Login.isLoggedIn()) {
		// NB: include a nonce, as otherwise identical events (you open a few tabs) within a 15 minute time bucket get treated as 1
		lg("tabopen", {user:Login.getId(), nonce:nonce(6)});
		logOnceFlag = true;
	}

	if (!verifiedLoginOnceFlag && !onboarding) {
		// Popup login widget if not logged in
		// Login fail conditions from youagain.js
		Login.verify().then(res => {
			if (!res || !res.success) setShowTabLogin(true);
		}).catch(res => {
			setShowTabLogin(true);
		});
		verifiedLoginOnceFlag = true;
	}

	let charityID = getSelectedCharityId();

	// iframe src change?
	// https://stackoverflow.com/posts/17316521/revisions


	// Background images on tab plugin sourced locally
	let bgImg = onboarding ? "/img/TabsForGood/Onboarding.png" : null;

	return (<>
		<BG src={bgImg} fullscreen opacity={0.9} bottom={onboarding ? 0 : 110} style={{backgroundPosition: "center"}}>
			<TutorialHighlighter page={[4,5]} className="position-fixed p-3" style={{top: 0, left: 0, width:"100vw", zIndex:1}}>
				<div className="d-flex justify-content-between">
					<TutorialComponent page={5} className="logo pl-5 flex-row" style={{width:400}}>
						<a href="https://my.good-loop.com">
							<img src="/img/TabsForGood/TabsForGood_logo.png" style={{width: 200}} alt="logo"/>
						</a>
					</TutorialComponent>
					<TutorialComponent page={4} className="user-controls flex-row align-items-center">
						{Login.isLoggedIn() ? <TabsOpenedCounter/> : null}
						<AccountMenu small accountLink="/#account?tab=tabsForGood" customLogin={
							<NewtabLoginLink className="login-menu btn btn-transparent fill">Register / Log in</NewtabLoginLink>
						}/>
					</TutorialComponent>
				</div>
			</TutorialHighlighter>
			<div className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{top: 0, left: 0, width:"100vw", height:"100vh"}}>
				<div className="container h-100 flex-column justify-content-center unset-margins">
					<NormalTabCenter charityID={charityID}/>
				</div>
			</div>
			{/* Tutorial highlight to cover adverts */}
		</BG>
		<TutorialComponent page={3} className="position-absolute" style={{bottom:0, left:0, right:0, height:110, width:"100vw"}}/>
		<NewtabTutorialCard tutorialPages={tutorialPages}/>
		<NewtabLoginWidget onRegister={() => {if (!onboarding) openTutorial();}}/>
	</>); 
};

const TabsOpenedCounter = () => {
	let pvTabsOpened = getTabsOpened();
	return <span className="pr-3 text-white font-weight-bold">{(pvTabsOpened && pvTabsOpened.value) || '0'} tabs opened</span>;
};

const engines = {
	google: {
		title:"Google",
		logo: "/img/TabsForGood/google.png",
		size: {width: 30, height: 30},
		url: "https://google.com/search?q="
	},
	ecosia: {
		title:"Ecosia",
		logo: "/img/TabsForGood/ecosia.png",
		size: {width: 30, height: 30},
		url: "https://ecosia.com/search?q="
	},
	duckduckgo: {
		title:"DuckDuckGo",
		logo: "/img/TabsForGood/duckduckgo.png",
		size: {width: 30, height: 30},
		url: "https://duckduckgo.com?q="
	},
	bing: {
		title:"Bing",
		logo: "/img/TabsForGood/bing.png",
		size: {width: 30, height: 30},
		url: "https://bing.com/search?q="
	}
}

const NormalTabCenter = ({charityID}) => {

	const searchEngine = getSearchEngine() || 'google';
	const engineData = engines[searchEngine];

	return <>
		<div className="flex-row unset-margins justify-content-center align-items-end mb-3">
			<h3 className="text-center">
				Together we've raised&nbsp;
				<TutorialComponent page={2} className="d-inline-block">
					<TickerTotal />
				</TutorialComponent>
			</h3>
			<img src="/img/TabsForGood/sparkle.png" alt="sparkle" style={{width: 50}} className="pl-1"/>
		</div>
		<div className="w-100 pb-3">
			<div className="tab-search-container mx-auto">
				<Search onSubmit={e => doSearch(e, searchEngine)} placeholder={"Search with " + engineData.title} icon={
					<a href="/#account?tab=tabsForGood"><img src={engineData.logo} alt="search icon" style={{width:engineData.size.width, height:engineData.size.height}}/></a>
				}/>
			</div>
		</div>
		<small className="text-center text-white font-weight-bold">You are supporting</small>
		<NewTabCharityCard cid={charityID} />
	</>;
};

/**
 * @deprecated Moving the landing page to tabsforgood-landingpage.html, as a static page is better for social media shares.
 */
const OnboardingTabCenter = () => {
	return <>
		<div className="text-center onboarding">
			<div style={{marginBottom:"35vh"}}/>
			<h2 className="w-50 mx-auto">Every time you open a<br/>new tab you raise<br/>money for good causes</h2>
			{/*<a className="btn btn-primary extension-btn">Add tabs for good to chrome</a>*/}
			<img className="mt-5" src="/img/TabsForGood/white-arrow.png"/>
			{/* White fade for image */}
			<div className="position-absolute" style={{zIndex:1, top:"60vh", height:"40vh", width: "100vw", background:"linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%"}}/>
		</div>
	</>;
};

const PAGES = {
	webtop: WebtopPage,
	onboarding: NewTabOnboardingPage
};
const NewTabMainDiv = () => {
	return <MainDivBase pageForPath={PAGES} defaultPage="webtop" navbar={false} className="newtab"/>;
};

const NewTabCharityCard = ({cid}) => {

	const charity = cid ? fetchCharity(cid) : null;	

	return (<div className="d-flex justify-content-center" >
		<a href={"/#account?tab=tabsForGood&task=select-charity&link="+encURI(window.location)}>
			<TutorialComponent page={1}>
				<WhiteCircle className="m-3 tab-charity" circleCrop={charity ? charity.circleCrop : null}>
					{charity ?
						<CharityLogo charity={charity}/>
						: <p className="color-gl-light-red font-weight-bold text-center my-auto">Select a charity</p>}
				</WhiteCircle>
			</TutorialComponent>
		</a>
	</div>);
};

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
	(window.parent || window.parent).location = engines[engine].url + encURI(search);
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
