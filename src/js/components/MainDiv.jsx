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
import {setShowLogin} from '../base/components/LoginWidget';

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
// import ImpactOverviewPage from './pages/ImpactOverviewPage';
import OurStoryPage from './pages/OurStoryPage';
import ForBusinessPage from './pages/ForBusinessPage';
import ForCharityPage from './pages/ForCharityPage';
import { T4GCTA, T4GSignUpModal, T4GPluginButton } from './T4GSignUp';
import { MyLoginWidgetGuts } from './MyLoginWidgetGuts';
import BlogContent from './pages/BlogContent';
import SafariPage from './pages/SafariPage';
import { mobileNavAccountMenuItems } from './pages/AccountPage';
// import TestPage from './pages/TestPage';
// 

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
	// blogcontent: BlogContent,
	campaign: CampaignPage,
	impact: CampaignPage,
	impactoverview: MyAdCampaignsPage,
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
	safari: SafariPage,
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

const MainDiv = () => {
	const navPageLinks = {
		"ourstory":[],
		"our-impact": ['charities', 'impactoverview', 'green'],
		'tabsforgood':[],
		// "blog":[]
	};

	const navPageLabels = {
		"Our Story":[],
		"Our Impact": ['Charity Impact', 'Impact Hub', 'Green Media'],
		"Tabs for Good":[],
		// "Blog":[]
	};

	// 
	const navbarAccountMenuItems = mobileNavAccountMenuItems;

	// HACK hide whilst we finish it
	if ( ! Roles.isTester()) {
		delete navPageLinks["our-impact"].green;
		delete navPageLabels["Our Impact"]["Green Media"];

		// delete navPageLinks["blog"];
		// delete navPageLabels["Blog"];
	}

	return (<MainDivBase
		pageForPath={PAGES}
		defaultPage='home'
		navbarPages={navPageLinks}
		navbarLabels={navPageLabels}
		navbarDarkTheme={false}
		navbarChildren={() => <><T4GCTA>Get Tabs for Good on Desktop</T4GCTA><T4GSignUpModal /></>}
		navbarBackgroundColour="white"
		navbarAccountMenuItems={mobileNavAccountMenuItems}
		NavExpandSize="md"
		// navbarLabels={getNavbarLabels}
		fullWidthPages={["impact", 'home', 'charity', 'tabsforgood', 'account', 'green', 'charities', 'impactoverview', 'campaign', 'ourstory', 'ads', 'blog', 'blogcontent', 'allowlist', 'safari']}
		//undecoratedPages={["blogcontent"]}
		Footer={Footer}
		canRegister
		noLoginTitle
		loginLogo="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png"
		loginSubtitle="Sign in to see how your web browsing has transformed into charity donations"
		noSocials
		loginChildren={() => <div className='text-center'><T4GPluginButton onClick={() => setShowLogin(false)}>Not got an account? Sign up and get Tabs for Good</T4GPluginButton></div>}
		LoginGuts={MyLoginWidgetGuts}
	></MainDivBase>);
};

export default MainDiv;
