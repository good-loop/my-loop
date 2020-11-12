/* global navigator */
import React, { Component, useState, useRef, useEffect } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { modifyHash, randomPick, encURI, space, stopEvent, ellipsize } from '../base/utils/miscutils';
import { Card, Form, Button, CardTitle, Row, Col, Badge, CardBody, CardFooter, DropdownItem } from 'reactstrap';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here to init (but not used here)
import Profiler, { getProfile } from '../base/Profiler';
import ServerIO, { normaliseSogiveId } from '../base/plumbing/ServerIOBase';
import Money from '../base/data/Money';
import {lg} from '../base/plumbing/log';

// Templates
import MessageBar from '../base/components/MessageBar';
import LoginWidget, { setShowLogin, LoginLink, LogoutLink } from '../base/components/LoginWidget';
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

/**
 * NB: useEffect was triggering twice (perhaps cos of the login dance)
 */
let logOnceFlag;

/**
 * The main Tabs-for-Good page
 */
const WebtopPage = () => {	

	// Are we logged in??	
	if (!Login.isLoggedIn()) {
		window.location.href = "/newtab.html#onboarding";
		return <div/>;
	}
	// Yeh - a tab is opened -- let's log that (once only)	
	if ( ! logOnceFlag) {
		// NB: include a nonce, as otherwise identical events (you open a few tabs) within a 15 minute time bucket get treated as 1
		lg("tabopen", {user:Login.getId(), nonce:nonce(6)});
		logOnceFlag = true;
	}

	let charities = ['wwf', 'the-save-the-children-fund', 'against-malaria-foundation', 'trees-for-the-future', 'cancer-research-uk'];

	// iframe src change?
	// https://stackoverflow.com/posts/17316521/revisions

	return (
		<BG src={bg.src} fullscreen opacity={0.9}>
			<div className="position-fixed p-3" style={{top: 0, left: 0, width:"100vw", zIndex:10}}>
				<div className="d-flex justify-content-end">
					<AccountMenu/>
				</div>
			</div>
			<DonationCount className="mt-2"/>
			<div className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{top: 0, left: 0, width:"100vw", height:"100vh"}}>
				<div className="container h-100 flex-column justify-content-center unset-margins">

					<div className="w-100 pb-3">
						<div className="tab-search-container mx-auto">
							<Search />
						</div>
					</div>

					<Row className="justify-content-center">
						{charities.map(c => <NewTabCharityCard key={c} cid={c} />)}
					</Row>

					<BannerAd />
				</div>
			</div>
			<NewTabFooter />
		</BG>);
};

const Search = () => {
	return (<>
		<Form onSubmit={doSearch} inline className="flex-row tab-search-form" >
			<i className="fa fa-search tab-search mr-2" onClick={doSearch}></i><PropControl type="search" prop="q" path={['widget', 'search']} className="flex-grow w-100" />
		</Form>
	</>);
};

const DonationCount = ({className}) => {
	const total = new Money("£1,000,000");
	return (
		<div className={space("d-flex justify-content-center", className)}>
			<Row className="bg-white w-25 p-2 rounded">
				<Col md={4}>
					<img src="/img/gl-logo/LogoMark/logo.svg" alt="Good-Loop logo" className="w-100"/>
				</Col>
				<Col md={8} className="flex-row justify-content-center align-items-center">
					<p>
						<Ticker amount={total} rate={0.1} preservePennies unitWidth="0.5em"/> raised
					</p>
				</Col>
			</Row>
		</div>
	);
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
	let user = Login.getUser();
	let profile = user && user.xid? getProfile({xid:user.xid}) : null;
	console.warn("profile", profile);

	let pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:normaliseSogiveId(cid), status:C.KStatus.PUBLISHED});
	if ( ! pvCharity.value) {
		return <Col sm={3} xs={1} xl={4} ><Card body>{cid}</Card></Col>;
	}
	if (pvCharity.error) return null; // offline maybe
	const charity = pvCharity.value;
	// Prefer full descriptions here. If unavailable switch to summary desc.
	let desc = charity.description || charity.summaryDescription || '';
	// But do cut descriptions down to 1 paragraph.
	let firstParagraph = (/^.+\n *\n/g).exec(desc);
	if (firstParagraph) {
		desc = firstParagraph[0];
	}
	desc = ellipsize(desc, 240);

	console.log("CHARITY: " + charity.id + " LOGO: " + charity.logo);

	let img = charity.images;
	let selected = false; // TODO user preferences

	return (<Col sm={12} md={4} className="d-flex justify-content-center" >
		<WhiteCircle className="m-3 tab-charity" circleCrop={charity.circleCrop}>
			<CharityLogo charity={charity} link/>
		</WhiteCircle>
	</Col>);
};


const toggleCharitySelect = e => {
	// TODO
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

// HACK!!!
Roles.isDev = () => true;


export default NewTabMainDiv;
