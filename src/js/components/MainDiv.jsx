/* global navigator */
import React, { Component } from 'react';
import Login from '../base/youagain';
import { assert, assMatch } from '../base/utils/assert';
import { getUrlVars, modifyHash, stopEvent } from '../base/utils/miscutils';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here to init (but not used here)

// Templates
import LoginWidget from '../base/components/LoginWidget';

// Pages
import MyPage, { HowItWorksCard } from './pages/MyPage';
import MyCharitiesPage from './pages/MyCharitiesPage';
import MyAdCampaignsPage from './pages/MyAdCampaignsPage';
import GetInvolvedPage from './pages/GetInvolvedPage';
import CampaignPage from './campaignpage/CampaignPage';
import E404Page from '../base/components/E404Page';
// import TestPage from '../base/components/TestPage';
import AccountPage from './pages/AccountPage';
import Footer from './Footer';
import MyGLAboutPage from './MyGLAboutPage';
import SubscriptionBox from './cards/SubscriptionBox';
import { addDataCredit, addFunderCredit } from '../base/components/AboutPage';
import NewtabCharityLogin from './pages/NewtabCharityLogin';
import ServerIO from '../plumbing/ServerIO';
import { track } from '../base/plumbing/log';
import HashWatcher from './HashWatcher';
import AllowlistUs from './pages/AllowlistUs';
import MainDivBase from '../base/components/MainDivBase';
import {A, useRoutes, usePath} from 'hookrouter';
// import RedesignPage from './pages/RedesignPage';

// DataStore
C.setupDataStore();

// Person from profiler
ServerIO.USE_PROFILER = true;

/**
 * Subscribe box as a single page
 */
const SubscribePage = ({}) => {

	return (<>
		<div className="Subscribe widepage">
			<SubscriptionBox title="Subscribe to our monthly newsletter" className="bg-gl-light-red big-sub-box"/>
			<HowItWorksCard />
		</div>
	</>);
}

// Actions

const PAGES = {
	// account: BasicAccountPage,
	my: MyPage,
	blog: MyPage, // TODO
	campaign: CampaignPage,
	impact: CampaignPage,
	// test: TestPage,
	account: AccountPage,
	charities: MyCharitiesPage,
	ads: MyAdCampaignsPage,
	involve: GetInvolvedPage,
	howitworks: MyPage,
	subscribe: SubscribePage,
	about: MyGLAboutPage,
	register: NewtabCharityLogin,
	allowlist: AllowlistUs
};
// ?? switch to router??
// const ROUTES = {
// 	"/": MyPage,
// 	"/impact": CampaignPage, 
// };

// HACK <a> vs <A> for optional replacement with import { A } from "hookrouter";
C.A = A;

addFunderCredit("Scottish Enterprise");
addDataCredit({name:"The charity impact database", url:"https://sogive.org", author:"SoGive"});

Login.app = C.app.id;
Login.dataspace = C.app.dataspace;

// Switch DataStore to /page over #page
DataStore.useHashPath = false;
DataStore.usePathname = true;
DataStore.parseUrlVars(false);
// Modern Chrome insists on a user popup for this - so it doesnt work for this usecase - take control of page reload
// window.addEventListener("beforeunload", e => {
// 	console.error(e);
// 	console.log("Is this right?", document.activeElement.href);
// 	stopEvent(e);
// 	e.returnValue = false;	
// 	// window.history.pushState({}, "", "http://foo.bar");
// });

const MainDiv = () => {

	// Make sure path info is up to date
	let path = usePath(); // https://github.com/Paratron/hookrouter/blob/master/src-docs/pages/en/04_other-features.md#using-the-uri-path
	DataStore.parseUrlVars(false);

	return (<MainDivBase
		pageForPath={PAGES}
		defaultPage='my'
		navbarPages={['impact','blog']}
		// navbarLabels={getNavbarLabels}
		fullWidthPages={["impact"]}
		noRegister
	/>);
};

export default MainDiv;
