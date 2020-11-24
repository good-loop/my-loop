/* global navigator */
import React, { Component, useState, useRef, useEffect } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { modifyHash, randomPick, encURI, space, stopEvent, ellipsize } from '../base/utils/miscutils';
import { Card, Form, Button, CardTitle, Row, Col, Badge, CardBody, CardFooter, DropdownItem, Alert } from 'reactstrap';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here to init (but not used here)
import ServerIO, { normaliseSogiveId } from '../base/plumbing/ServerIOBase';
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

	if (!verifiedLoginOnceFlag) {
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
		<BG src={bgImg} fullscreen opacity={0.9} bottom={onboarding ? 0 : 110}>
			<div className="position-fixed p-3" style={{top: 0, left: 0, width:"100vw", zIndex:10}}>
				<div className="d-flex justify-content-between">
					<div className="logo pl-5 flex-row">
						<a href="https://my.good-loop.com">
							<img src="/img/logo-white.svg" style={{width: 50}} alt="logo"/>
						</a>
						<h4 className="pl-2">Tabs for<br/>good</h4>
					</div>
					<div className="user-controls flex-row">
						{Login.isLoggedIn() && !onboarding ? <TabsOpenedCounter/> : null}
						<AccountMenu small accountLink="/#account?tab=tabsForGood" customLogin={
							<NewtabLoginLink className="login-menu btn btn-transparent fill">Register / Log in</NewtabLoginLink>
						}/>
					</div>
				</div>
			</div>
			<div className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{top: 0, left: 0, width:"100vw", height:"100vh"}}>
				<div className="container h-100 flex-column justify-content-center unset-margins">
					{!onboarding ? <NormalTabCenter charityID={charityID}/> : <OnboardingTabCenter/>}
				</div>
			</div>
		</BG>
		<NewtabLoginWidget/>
	</>);
};

const TabsOpenedCounter = () => {
	let pvTabsOpened = getTabsOpened();
	return <span className="pr-3 text-white font-weight-bold">{pvTabsOpened.value || '-'} tabs opened</span>;
};

const NormalTabCenter = ({charityID}) => {
	return <>
		<div className="flex-row unset-margins justify-content-center align-items-end mb-3">
			<Alert>FIXME this ticker resets each time you load the page</Alert>
			<h3 className="text-center">Together we've raised <Ticker amount={new Money("$1501886.40")} rate={0.1} preservePennies unitWidth="0.6em"/></h3>
			<img src="/img/TabsForGood/sparkle.png" alt="sparkle" style={{width: 50}} className="pl-1"/>
		</div>
		<div className="w-100 pb-3">
			<div className="tab-search-container mx-auto">
				<Search onSubmit={doSearch} placeholder="Search with Ecosia"/>
			</div>
		</div>
		<small className="text-center text-white font-weight-bold">You are supporting</small>
		<NewTabCharityCard cid={charityID} />
	</>;
};

const OnboardingTabCenter = () => {
	return <>
		<div className="w-100 pb-3">
			<div className="tab-search-container mx-auto">
				<Search onSubmit={doSearch} placeholder="Search with Ecosia"/>
			</div>
		</div>
		<div className="text-center onboarding">
			<h2>Together we've raised</h2>
			<h1><Ticker amount={new Money("$1501886.40")} rate={0.1} preservePennies unitWidth="0.6em"/></h1>
			<p>Every time you open a tab you raise money for good.<br/>You decide who gets it.</p>
			<a className="extension-btn">Add tabs for good to chrome</a>
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

const NewTabFooter = () => (<Footer className="tab-footer">
	<a href="https://good-loop.com" target="_parent">Good-Loop</a>

	<a href="https://doc.good-loop.com/policy/privacy-policy.html" target="_top">Privacy policy</a>
</Footer>);

const NewTabCharityCard = ({cid}) => {
	console.log("CHARITY TO SELECT", cid);
	let user = Login.getUser();
	let profile = user && user.xid? getProfile({xid:user.xid}) : null;
	console.warn("profile", profile);

	const charity = cid ? fetchCharity(cid) : null;	

	return (<div className="d-flex justify-content-center" >
		<a href={charity ? charity.url : "/#account?tab=tabsForGood"} target={charity ? "_blank" : null}>
			<WhiteCircle className="m-3 tab-charity" circleCrop={charity ? charity.circleCrop : null}>
				{charity ?
					<CharityLogo charity={charity}/>
					: <p className="color-gl-light-red font-weight-bold text-center my-auto">Select a charity</p>}
			</WhiteCircle>
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


export { Search };
export default NewTabMainDiv;
