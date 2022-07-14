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
import {A, initRouter, modifyPage} from '../base/plumbing/glrouter';
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
import { T4GSignUpButton, T4GSignUpModal, T4GPluginButton } from './T4GSignUp';
import { MyLoginWidgetGuts } from './MyLoginWidgetGuts';
import BlogContent from './pages/BlogContent';
import SafariPage from './pages/SafariPage';
import { DropdownItem } from 'reactstrap';
import { accountMenuItems } from './pages/CommonComponents';
import MyDataProductPage from './mydata/MyDataProductPage';
import GetInvolvedPage from './pages/GetInvolvedPage';

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
	getmydata: MyDataProductPage,
	getinvolved: GetInvolvedPage,
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

	const navPageLabels = {
		ourstory:"Our Story",
		"our-impact": "Our Impact",
		charities: 'Charity Impact',
		impactoverview: 'Impact Hub',
		green: 'Green Media',
		tabsforgood: C.T4G,
		//blog: "Blog",
		getmydata: "My.Data"
		//"home#mydata-cta": "My.Data" // HACK until we get a landing page
	};

	return (<MainDivBase
		pageForPath={PAGES}
		defaultPage='home'
		navbarPages={() => {
			return {
				// "dashboard":Login.isLoggedIn(), ??
				"ourstory":[],
				"our-impact": ['charities', 'impactoverview', Roles.isTester() && 'green'],
				'tabsforgood':[],
				'getmydata':[],
				//"home#mydata-cta": [],
				//"blog":Roles.isTester()
			};
		}}
		navbarLabels={navPageLabels}
		navbarDarkTheme={false}
		navbarChildren={() => <><T4GSignUpButton>Get Tabs for Good on Desktop</T4GSignUpButton><T4GSignUpModal /></>}
		navbarBackgroundColour="white"
		navbarAccountMenuItems={accountMenuItems}
		navbarAccountLinkText="My.Data"
		NavExpandSize="md"
		// navbarLabels={getNavbarLabels}
		// We want everything to be full width on this site
		fullWidthPages={Object.keys(PAGES)}
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
