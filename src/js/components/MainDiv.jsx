/* global navigator */
import React, { Component } from 'react';
import Login from '../base/youagain';
import { assert, assMatch } from '../base/utils/assert';

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
import AccountPage from './pages/AccountPage';
import Footer from './Footer';
import MyGLAboutPage from './MyGLAboutPage';
import SubscriptionBox from './cards/SubscriptionBox';
import { addDataCredit, addFunderCredit } from '../base/components/AboutPage';
import NewtabCharityLogin from './pages/NewtabCharityLogin';
import ServerIO from '../plumbing/ServerIO';
import AllowlistUs from './pages/AllowlistUs';
import MainDivBase from '../base/components/MainDivBase';
import {A} from '../base/plumbing/glrouter';
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
DataStore.parseUrlVars(false); // update the parsing since we've changed the method
// NB: Catch beforeunload? No - Modern Chrome insists on a user popup for this

const MainDiv = () => {

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
