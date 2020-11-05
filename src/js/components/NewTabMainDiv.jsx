/* global navigator */
import React, { Component, useState } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { modifyHash, randomPick, encURI, space, stopEvent, ellipsize } from '../base/utils/miscutils';
import {Card, Form, Button, CardTitle, Row, Col, Badge, CardBody, CardFooter} from 'reactstrap';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Crud from '../base/plumbing/Crud'; // Crud is loaded here to init (but not used here)
import Profiler, { getProfile } from '../base/Profiler';
import { normaliseSogiveId } from '../base/plumbing/ServerIOBase';

// Templates
import MessageBar from '../base/components/MessageBar';
import LoginWidget, { setShowLogin, LoginLink, LogoutLink } from '../base/components/LoginWidget';
import NavBar from './MyLoopNavBar';
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
// import RedesignPage from './pages/RedesignPage';

// Components
import { CharityLogo } from './cards/CharityCard';
import WhiteCircle from './campaignpage/WhiteCircle';

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

	let charities = ['wwf', 'the-save-the-children-fund', 'against-malaria-foundation', 'trees-for-the-future', 'cancer-research-uk'];

	// iframe src change?
	// https://stackoverflow.com/posts/17316521/revisions

	return (
		<BG src={bg.src} fullscreen opacity={0.9}>
			<div className="position-fixed p-3" style={{top: 0, left: 0, width:"100vw", zIndex:10}}>
				<div className="d-flex justify-content-end">
					<LoginAccountControl />
				</div>
			</div>
			<DonationCount className="mt-2"/>
			<div className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{top: 0, left: 0, width:"100vw", height:"100vh"}}>
				<div className="container h-100 flex-column justify-content-center unset-margins">

					<div className="w-100 pb-3">
						<div className="tab-search-container mx-auto">
							<Search/>
						</div>
					</div>

					<Row className="justify-content-center">
						{charities.map(c => <NewTabCharityCard key={c} cid={c} />)}
					</Row>

					{/*<div>
						<Card body>
							<CardTitle></CardTitle>
							<BannerAd />
						</Card>

						{C.SERVER_TYPE !== 'local' ? <DevLink href="http://localmy.good-loop.com/newtab.html">Local Version</DevLink> : <Badge>local</Badge>}
						{C.SERVER_TYPE !== 'test' ? <DevLink href="https://testmy.good-loop.com/newtab.html">Test Version</DevLink> : <Badge>test</Badge>}
						{!C.isProduction() ? <DevLink href="https://my.good-loop.com/newtab.html">Production Version</DevLink> : <Badge>live</Badge>}
					</div>*/}
				</div>
			</div>
			<NewTabFooter />
		</BG>);
};

const Search = () => {
	return (<>
		<Form onSubmit={google} inline className="flex-row tab-search-form" >
			<i className="fa fa-search tab-search mr-2" onClick={google}></i><PropControl type="search" prop="q" path={['widget', 'search']} className="flex-grow" />
		</Form>
	</>);
};

const DonationCount = ({className}) => {
	return (
		<div className={space("d-flex justify-content-center", className)}>
			<Row className="bg-white w-25 p-2 rounded">
				<Col md={4}>
					<img src="/img/gl-logo/LogoMark/logo.svg" alt="Good-Loop logo" className="w-100"/>
				</Col>
				<Col md={8} className="flex-row justify-content-center align-items-center">
					<p>
						£1,000,000 raised
					</p>
				</Col>
			</Row>
		</div>
	);
};

const LoginAccountControl = () => {
	let login = null;
	let user = Login.getUser();
	if ( ! Login.isLoggedIn()) {
		login = <LoginLink />;
	} else {
		login = <>
			<a href="http://localmy.good-loop.com/#account" style={{textDecoration:"none"}}>
				{user.name || user.id}<br/>
			</a>
			<small style={{fontSize:"0.6rem"}}>Change Tabs-for-Good settings in your account page above</small><br/>
			<small><LogoutLink /></small>
		</>;
	}
	return (
		<div className="d-inline-block">
			<div className="tab-user flex-row position-relative">
				<div className="tab-login pr-2 rounded-left">
					<div className="tab-login-content py-2 px-3 bg-white text-dark rounded-right">
						{login}
					</div>
				</div>
				<i className="fa fa-user invisible" style={{fontSize:"2rem", top:0}}></i>
				<a href="http://localmy.good-loop.com/#account">
					<i className="fa fa-user position-absolute text-white" style={{fontSize:"2rem", top:0, right:0}}></i>
				</a>
			</div>
		</div>
	);
};



const PAGES = {
	account: AccountPage,
	webtop: WebtopPage
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
 * TODO Ecosia
 */
const google = e => {
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
