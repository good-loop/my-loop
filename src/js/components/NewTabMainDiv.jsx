/* global navigator */
import React, { Component } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { modifyHash, randomPick, encURI } from '../base/utils/miscutils';
import {Card, Form, Button, CardTitle} from 'reactstrap';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here to init (but not used here)
import Profiler from '../base/Profiler';

// Templates
import MessageBar from '../base/components/MessageBar';
import LoginWidget, { setShowLogin } from '../base/components/LoginWidget';
import NavBar from './MyLoopNavBar';

// Pages
import E404Page from '../base/components/E404Page';
import TestPage from '../base/components/TestPage';
import AccountPage from './pages/AccountPage';
import MainDivBase from '../base/components/MainDivBase';
import BG from '../base/components/BG';
import DevLink from './campaignpage/DevLink';
import PropControl from '../base/components/PropControl';
import BannerAd from './BannerAd';
// import RedesignPage from './pages/RedesignPage';

// DataStore
C.setupDataStore();

// Actions


Login.app = C.app.service;

let bg = randomPick([
	{ src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1351&q=80' },
	{ src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1440&q=80' },
	{ src: 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80' },
	{ src: 'https://images.unsplash.com/photo-1582425312148-de9955e68e45?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2134&q=80' },
	{ src: 'https://images.unsplash.com/photo-1592755137605-f53768fd7931?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80' },
]);

const WebtopPage = () => {

	let charities = ['wwf', 'save-the-children'];

	// iframe src change?
	// https://stackoverflow.com/posts/17316521/revisions

	return (
		<BG src={bg.src} fullscreen opacity={0.9}>
			<div className='container'>				

				{C.SERVER_TYPE !== 'local' ? <DevLink href='http://localmy.good-loop.com/newtab.html'>Local Version</DevLink> : null}
				{C.SERVER_TYPE !== 'test' ? <DevLink href='https://testmy.good-loop.com/newtab.html'>Test Version</DevLink> : null}
				{!C.isProduction() ? <DevLink href='https://my.good-loop.com/newtab.html'>Production Version</DevLink> : null}

				<Card id='score' body className='pull-right'>£1,000,000 raised</Card>

				<Card body>
					<Form onSubmit={google} inline className='flex-row' >
						<PropControl type='search' prop='q' path={['widget', 'search']} className='flex-grow' /><Button color='secondary' onClick={google}>Search</Button>
					</Form>
				</Card>

				<a href='https://good-loop.com' target="_parent">Good-Loop</a>

				<a href='https://doc.good-loop.com' target="_top">Docs eg privacy policy</a>

				<Card body><h3>TODO pick between a few charities</h3></Card>
				{charities.map(c => <Card key={c} body>{c}</Card>)}
				<Card body><CardTitle></CardTitle>
					<BannerAd />
				</Card>
			</div>
		</BG>);
};



const PAGES = {
	account: AccountPage,
	webtop: WebtopPage
};
const NewTabMainDiv = () => {
	return <MainDivBase pageForPath={PAGES} defaultPage='webtop' />;
};


/**
 * TODO Ecosia
 */
const google = () => {
	// NB: use window.parent to break out of the newtab iframe, otherwise ecosia objects
	(window.parent || window.parent).location = 'https://www.ecosia.org/search?q=' + encURI(DataStore.getValue('widget', 'search', 'q'));
};

// HACK!!!
Roles.isDev = () => true;


export default NewTabMainDiv;
