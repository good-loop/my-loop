/* global navigator */
import React, { Component } from 'react';
import Login from '../base/youagain';
import { assert, assMatch } from '../base/utils/assert';
import { modifyHash } from '../base/utils/miscutils';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here to init (but not used here)

// Templates
import MessageBar from '../base/components/MessageBar';
import LoginWidget, {LoginLink, setShowLogin} from '../base/components/LoginWidget';
import NavBar from './MyLoopNavBar';
import Misc from '../base/components/Misc';

// Pages
import MyPage from './pages/MyPage';
import MyCharitiesPage from './pages/MyCharitiesPage';
import MyAdCampaignsPage from './pages/MyAdCampaignsPage';
import GetInvolvedPage from './pages/GetInvolvedPage';
import CampaignPage from './campaignpage/CampaignPage';
import {BasicAccountPage} from '../base/components/AccountPageWidgets';
import E404Page from '../base/components/E404Page';
// import TestPage from '../base/components/TestPage';
import AccountPage from './pages/AccountPage';
import Footer from './Footer';
import MyGLAboutPage from './MyGLAboutPage';
import { addDataCredit, addFunderCredit } from '../base/components/AboutPage';
import TabsForGoodOnboard from './pages/TabsForGoodOnboard';
import { getAllXIds } from '../base/data/Person';
import NewtabCharityLogin from './pages/NewtabCharityLogin';
import ServerIO from '../plumbing/ServerIO';
import { track } from '../base/plumbing/log';
import HashWatcher from './HashWatcher';
// import RedesignPage from './pages/RedesignPage';

// DataStore
C.setupDataStore();

// Person from profiler
ServerIO.USE_PROFILER = true;

// Actions

const PAGES = {
	// account: BasicAccountPage,
	my: MyPage,
	campaign: CampaignPage,
	// test: TestPage,
	account: AccountPage,
	charities: MyCharitiesPage,
	ads: MyAdCampaignsPage,
	involve: GetInvolvedPage,
	howitworks: MyPage,
	about: MyGLAboutPage,
	tabsForGood: TabsForGoodOnboard,
	register: NewtabCharityLogin
};

addFunderCredit("Scottish Enterprise");
addDataCredit({name:"The charity impact database", url:"https://sogive.org", author:"SoGive"});

const DEFAULT_PAGE = 'my';

const loginResponsePath = ['misc', 'login', 'response'];

Login.app = C.app.id;

/**
	TODO refactor to use MainDivBase
*/
class MainDiv extends Component {
	constructor(props) {
		super(props);
	}

	scrollToTop () {
		// Scroll to top on hash change - except for page How it Works, which scrolls down the homepage
		if (window.location.hash !== "howitworks") {
			console.log("HASH CHANGE");
			// Allow page to load before scrolling
			window.scrollTo(0,0);
		}
	}

	componentDidMount() {
		// redraw on change
		const updateReact = (mystate) => this.setState({});
		DataStore.addListener(updateReact);

		window.addEventListener("hashchange", this.scrollToTop);

		// Set up login watcher here, at the highest level		
		Login.change(() => {
			// invalidate all lists!
			DataStore.setValue(['list'], {});
			// also remove any promises for these lists -- see fetch()		
			let ppath = ['transient', 'PromiseValue', 'list'];
			DataStore.setValue(ppath, null);

			// Showing thank you message and allowing user to close instead
			/*
			// ?? should we store and check for "Login was attempted" to guard this??
			if (Login.isLoggedIn()) {
				// close the login dialog on success
				setShowLogin(false);
			}*/

			// Update xids
			DataStore.setValue(['data', 'Person', 'xids'], getAllXIds(), false);

			// Link profiles? No - done by the YA server
			// poke React via DataStore (e.g. for Login.error)
			DataStore.update({});
			// is this needed??
			this.setState({});
		});

		// Are we logged in?
		//Login.verify();
		Login.verify().then((response) => {
			let success = response.success;
			DataStore.setValue(loginResponsePath, success, true);
			// Store response.cargo.success somewhere in datastore so other components can check (a) if it's finished and (b) if it was successful before trying to talk to lg.good-loop.com
		});

		DataStore.setValue(['data', 'Person', 'xids'], getAllXIds(), false);
	} // ./componentDidMount

	componentWillUnmount () {
		window.removeEventListener("hashchange", this.scrollToTop);
	}
	

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({error, info, errorPath: DataStore.getValue('location', 'path')});
		console.error(error, info); 
		if (window.onerror) window.onerror("Caught error", null, null, null, error);
	}

	render() {
		let path = DataStore.getValue('location', 'path');	
		let page = (path && path[0]);
		if (!page) {
			modifyHash([DEFAULT_PAGE]);
			return null;
		}
		assert(page);
		let Page = PAGES[page];
		// HowItWorks page is just the homepage but sprung down
		let spring = false;
		if (page === "howitworks") spring = true;
		if ( ! Page) {
			Page = E404Page;
		}

		if (this.state && this.state.error && this.state.errorPath === path) {
			Page = () => (<div><h3>There was an Error :'(</h3>
				<p>Try navigating to a different tab, or reloading the page. If this problem persists, please contact support.</p>
				<p>{this.state.error.message}<br /><small>{this.state.error.stack}</small></p>
			</div>);
		}
	
		// Fleshed out title for My-Loop custom login modal design.
		const loginWidgetTitle = (
			<div className="text-center">
				<span className="modal-main-title">My GOOD-LOOP</span><br />
				<span className="modal-subtitle">Raising money for charity with adverts</span>
			</div>
		);

		// track pages visited
		track();

		return (
			<>
				<div id={page} /* wrap in an id in case you need high-strength css rules */>
					<HashWatcher />
					<Page path={path} spring={spring}/>
					<Footer />
				</div>
				<LoginWidget logo={<img src='/img/new-logo.svg' style={{height: '64px'}} />} title={loginWidgetTitle} services={['twitter']} />
			</>
		);
	} // ./render()
} // ./MainDiv

export default MainDiv;
