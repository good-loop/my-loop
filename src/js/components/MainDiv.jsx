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
import ServerIO from '../plumbing/ServerIO';
import AllowlistUs from './pages/AllowlistUs';
import MainDivBase from '../base/components/MainDivBase';
import {A, initRouter} from '../base/plumbing/glrouter';
import HomePage from './pages/HomePage';
// import RedesignPage from './pages/RedesignPage';
import GreenDashboard from './pages/GreenDashboard';
import GreenLanding from './pages/GreenLanding';
import TabsForGoodLandingPage from './pages/TabsForGoodLandingPage';
import CharityLandingPage from './pages/CharityLandingPage';
import ProductsOverviewPage from './pages/ProductsOverviewPage';
import BlogPage from './pages/BlogPage';
import ImpactOverviewPage from './pages/ImpactOverviewPage';
import OurStoryPage from './pages/OurStoryPage';
import ForBusinessPage from './pages/ForBusinessPage';
import ForCharityPage from './pages/ForCharityPage';
import { T4GSignUpButton, T4GSignUpModal } from './T4GSignUp';
import { nonce } from '../base/data/DataClass';

// DataStore
C.setupDataStore();

// Person from profiler
ServerIO.USE_PROFILER = true;

/**
 * Subscribe box as a single page??
 */
const SubscribePage = ({}) => {
	return (<>
		<div className="Subscribe widepage">
			<SubscriptionBox title="Subscribe to our monthly newsletter" className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
}

// Actions

const PAGES = {
	blog: BlogPage, // TODO
	campaign: CampaignPage,
	impact: CampaignPage,
	impactoverview: ImpactOverviewPage,
	// test: TestPage,
	account: AccountPage,
	charities: MyCharitiesPage,
	charity: CharityLandingPage,
	ads: MyAdCampaignsPage,
	involve: GetInvolvedPage,
	subscribe: SubscribePage,
	about: MyGLAboutPage,
	productsoverview: ProductsOverviewPage,
	tabsforgood: TabsForGoodLandingPage,
	allowlist: AllowlistUs,

	home: HomePage,
	greendash: GreenDashboard,
	green: GreenLanding,
	ourstory: OurStoryPage,
	forbusiness: ForBusinessPage,
	forcharity: ForCharityPage,
};
// ?? switch to router??
// const ROUTES = {
// 	"/": MyPage,
// 	"/impact": CampaignPage, 
// };

addFunderCredit("Scottish Enterprise");
addDataCredit({name:"The charity impact database", url:"https://sogive.org", author:"SoGive"});


Login.app = C.app.id;
Login.dataspace = C.app.dataspace;

const TabsForGoodCTA = () => {
	let path = DataStore.getValue("location","path");
	return path[0]==="tabsforgood"? <T4GSignUpButton />
		: <C.A className="btn btn-info mb-1 mr-2" href="/tabsforgood">GET TABS FOR GOOD</C.A>;
}

const MainDiv = () => {

	const navPageLinks = {
		"about-us": ['ourstory', 'forbusiness', 'forcharity'],
		"our-impact": ['charities', 'impactoverview', 'green'],
		"our-products": ['productsoverview', 'tabsforgood'],
		"blog":[]
	};

	const navPageLabels = {
		"About Us": ['Our Story', 'Good-Loop for Business', 'Good-Loop for Charity'],
		"Our Impact": ['Charity Impact', 'Impact Hub', 'Green Media'],
		"Our Products": ['Products Overview', 'Tabs for Good'],
		"Blog":[]
	};

	// HACK hide whilst we finish it
	if ( ! Roles.isTester()) {
		delete navPageLinks["about-us"];
		delete navPageLabels["About Us"];

		delete navPageLinks["our-impact"].green;
		delete navPageLabels["Our Impact"]["Green Media"];
	}

	return (<MainDivBase
		pageForPath={PAGES}
		defaultPage='home'
		navbarPages={navPageLinks}
		navbarLabels={navPageLabels}
		navbarDarkTheme={false}
		navbarChildren={() => <><TabsForGoodCTA/><T4GSignUpModal /></>}	
		navbarBackgroundColour="white"
		NavExpandSize="xl"
		// navbarLabels={getNavbarLabels}
		fullWidthPages={["impact", 'home', 'charity', 'tabsforgood', 'account', 'green']}
		Footer={Footer}
		noRegister
	></MainDivBase>);
};

export default MainDiv;
