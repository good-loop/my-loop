/* global navigator */
import React, { Component } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { modifyHash } from 'wwutils';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here (but not used here)
import BS from '../base/components/BS4';
import Profiler from '../base/Profiler';

// Templates
import MessageBar from '../base/components/MessageBar';
import LoginWidget from '../base/components/LoginWidget';
import NavBar from './MyLoopNavBar';

// Pages
import MyPage from './pages/MyPage';
import CampaignPage from './campaignpage/CampaignPage';
import {BasicAccountPage} from '../base/components/AccountPageWidgets';
import E404Page from '../base/components/E404Page';
import TestPage from '../base/components/TestPage';
import AccountPage from './pages/AccountPage';
// import RedesignPage from './pages/RedesignPage';

// DataStore
C.setupDataStore();

// Actions

const PAGES = {
	// account: BasicAccountPage,
	my: MyPage,
	campaign: CampaignPage,
	test: TestPage,
	account: AccountPage,
	// redesign: RedesignPage,
	// redesign2: Redesign2Page
};

const DEFAULT_PAGE = 'my';

const loginResponsePath = ['misc', 'login', 'response'];

Login.app = C.app.service;

/**
	TODO refactor to use MainDivBase
*/
class MainDiv extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// redraw on change
		const updateReact = (mystate) => this.setState({});
		DataStore.addListener(updateReact);

		// Set up login watcher here, at the highest level		
		Login.change(() => {
			// invalidate all lists!
			DataStore.setValue(['list'], {});
			// also remove any promises for these lists -- see fetch()		
			let ppath = ['transient', 'PromiseValue', 'list'];
			DataStore.setValue(ppath, null);

			// ?? should we store and check for "Login was attempted" to guard this??
			if (Login.isLoggedIn()) {
				// close the login dialog on success
				LoginWidget.hide();
			}

			// Update xids
			DataStore.setValue(['data', 'Person', 'xids'], Profiler.getAllXIds(), false);

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

		// Check if we're on a mobile device and place the result in state
		// COPIED FROM ADUNIT'S device.js
		const userAgent = navigator.userAgent || navigator.vendor || window.opera;
		const isMobile = !!(userAgent.match('/mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i'));
		DataStore.setValue(['env', 'isMobile'], isMobile);

		DataStore.setValue(['data', 'Person', 'xids'], Profiler.getAllXIds(), false);
	} // ./componentDidMount
	

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({error, info, errorPath: DataStore.getValue('location', 'path')});
		console.error(error, info); 
		if (window.onerror) window.onerror("Caught error", null, null, null, error);
	}

	render() {
		let path = DataStore.getValue('location', 'path');	
		let page = (path && path[0]);
		if ( ! page) {
			modifyHash([DEFAULT_PAGE]);
			return null;
		}
		assert(page);
		let Page = PAGES[page];
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

		return (
			<>
				<div id={page} /* wrap in an id in case you need high-strength css rules */>
					<Page path={path} />
				</div>
				<LoginWidget logo={<img src='/img/new-logo.svg' style={{height: '64px'}} />} title={loginWidgetTitle} services={['twitter', 'facebook']} />
			</>
		);
	} // ./render()
} // ./MainDiv

export default MainDiv;
