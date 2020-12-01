/* global navigator */
import React, { Component, useState, useRef, useEffect } from 'react';
import Login from 'you-again';
import { modifyHash, randomPick, encURI, space, stopEvent, ellipsize } from '../base/utils/miscutils';
import { Card, Form, Button, CardTitle, Row, Col, Badge, CardBody, CardFooter, DropdownItem, Alert } from 'reactstrap';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here to init (but not used here)
import Money from '../base/data/Money';
import {lg} from '../base/plumbing/log';
import TabsForGoodSettings, { getTabsOpened, Search, getSelectedCharityId } from './pages/TabsForGoodSettings';
import {fetchCharity } from './pages/MyCharitiesPage';

// Templates
import MessageBar from '../base/components/MessageBar';
import NavBar, { AccountMenu } from './MyLoopNavBar';
import DynImg from '../base/components/DynImg';

// Pages
import E404Page from '../base/components/E404Page';
import TestPage from '../base/components/TestPage';
import AccountPage from './pages/AccountPage';
import MainDivBase from '../base/components/MainDivBase';
import BG from '../base/components/BG';
import DevLink from './campaignpage/DevLink';
import PropControl from '../base/components/PropControl';
import BannerAd from './BannerAd';
import Footer from './Footer';
import ActionMan from '../base/plumbing/ActionManBase';
import MDText from '../base/components/MDText';
import Ticker from './Ticker';
// import RedesignPage from './pages/RedesignPage';

import NewTabOnboardingPage from './NewTabOnboarding';

// Components
import { CharityLogo } from './cards/CharityCard';
import WhiteCircle from './campaignpage/WhiteCircle';
import { nonce } from '../base/data/DataClass';
import NewtabLoginWidget, { NewtabLoginLink, setShowTabLogin } from './NewtabLoginWidget';
import NewtabTutorialCard, { openTutorial, TutorialComponent } from './NewtabTutorialCard';
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

	// Are we logged in??	
	/*if (!Login.isLoggedIn()) {
		window.location.href = "/newtab.html#onboarding";
		return <div/>;
	}*/
	const onboarding = !inIframe();

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
			<TutorialComponent page={[5, 6]} className="position-fixed p-3" style={{top: 0, left: 0, width:"100vw", zIndex:1}}>
				<div className="d-flex justify-content-between">
					<div className="logo pl-5 flex-row">
						<a href="https://my.good-loop.com">
							<img src="/img/logo-white.svg" style={{width: 50}} alt="logo"/>
						</a>
						<h4 className="pl-2">Tabs for<br/>good</h4>
					</div>
					<div className="user-controls flex-row">
						{!onboarding && <>
							{Login.isLoggedIn() ? <TabsOpenedCounter/> : null}
							<AccountMenu small accountLink="/#account?tab=tabsForGood" customLogin={
								<NewtabLoginLink className="login-menu btn btn-transparent fill">Register / Log in</NewtabLoginLink>
							}/>
						</>}
					</div>
				</div>
			</TutorialComponent>
			<div className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{top: 0, left: 0, width:"100vw", height:"100vh"}}>
				<div className="container h-100 flex-column justify-content-center unset-margins">
					{!onboarding ? <NormalTabCenter charityID={charityID}/> : <OnboardingTabCenter/>}
				</div>
			</div>
			{/* Tutorial highlight to cover adverts */}
		</BG>
		<TutorialComponent page={4} className="position-absolute" style={{bottom:0, left:0, right:0, height:110, width:"100vw"}}/>
		<NewtabTutorialCard/>
		<NewtabLoginWidget onRegister={() => {if (!onboarding) openTutorial();}}/>
	</>); 
};

const TabsOpenedCounter = () => {
	let pvTabsOpened = getTabsOpened();
	return <span className="pr-3 text-white font-weight-bold">{(pvTabsOpened && pvTabsOpened.value) || '0'} tabs opened</span>;
};


const NormalTabCenter = ({charityID}) => {
	return <>
		<div className="flex-row unset-margins justify-content-center align-items-end mb-3">
			<h3 className="text-center">
				Together we've raised&nbsp;
				<TutorialComponent page={3} className="d-inline-block">
					<TickerTotal />
				</TutorialComponent>
			</h3>
			<img src="/img/TabsForGood/sparkle.png" alt="sparkle" style={{width: 50}} className="pl-1"/>
		</div>
		<div className="w-100 pb-3">
			<div className="tab-search-container mx-auto">
				<Search onSubmit={doSearch} placeholder="Search with Ecosia" icon={
					<TutorialComponent page={1}>
						<img src="/img/TabsForGood/ecosia.png" alt="search icon"/>
					</TutorialComponent>
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
	console.log("CHARITY TO SELECT", cid);
	//let user = Login.getUser();
	//let profile = user && user.xid? getProfile({xid:user.xid}) : null;
	//console.warn("profile", profile);

	const charity = cid ? fetchCharity(cid) : null;	

	return (<div className="d-flex justify-content-center" >
		<a href="/#account?tab=tabsForGood" rel="noreferrer" target="_blank">
			<TutorialComponent page={2}>
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
const doSearch = e => {
	stopEvent(e);
	// NB: use window.parent to break out of the newtab iframe, otherwise ecosia objects
	const search = DataStore.getValue('widget', 'search', 'q');
	// Cancel search if empty
	// DONT use !search - if user searches a string that can evaluate falsy, like '0', it will cause a false positive
	if (search == null || search === '') {
		return;
	}
	(window.parent || window.parent).location = 'https://www.ecosia.org/search?q=' + encURI(search);
};

export default NewTabMainDiv;
