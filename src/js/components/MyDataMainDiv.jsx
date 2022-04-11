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
import E404Page from '../base/components/E404Page';
import Footer from './Footer';
import SubscriptionBox from './cards/SubscriptionBox';
import { addDataCredit, addFunderCredit } from '../base/components/AboutPage';
import ServerIO from '../plumbing/ServerIO';
import MainDivBase from '../base/components/MainDivBase';
import {A, initRouter} from '../base/plumbing/glrouter';
import HomePage from './pages/HomePage';
import MyDataSignUpPage from './pages/MyDataSignUpPage';
import { T4GCTA, T4GSignUpModal, T4GPluginButton } from './T4GSignUp';
import { MyLoginWidgetGuts } from './MyLoginWidgetGuts';
// import TestPage from './pages/TestPage';

// DataStore
C.setupDataStore();

// Person from profiler
ServerIO.USE_PROFILER = true;

// Actions

const PAGES = {
	home: HomePage,
	signup: MyDataSignUpPage,
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
	};

	const navPageLabels = {
	};

	// HACK hide whilst we finish it
	// if ( ! Roles.isTester()) {

	// 	delete navPageLinks["our-impact"].green;
	// 	delete navPageLabels["Our Impact"]["Green Media"];
		
	// }

	return (<MainDivBase
		pageForPath={PAGES}
		defaultPage='signup'
		navbarPages={navPageLinks}
		navbarLabels={navPageLabels}
		navbarDarkTheme={false}
		navbarChildren={() => <><T4GCTA>Get Tabs for Good on Desktop</T4GCTA><T4GSignUpModal /></>}
		navbarBackgroundColour="white"
		NavExpandSize="md"
		// navbarLabels={getNavbarLabels}
		fullWidthPages={["home"]}
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
