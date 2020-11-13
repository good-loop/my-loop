import React, {useEffect, useRef, useState, useCallback} from 'react';
import Login from 'you-again';
import { Col, Row, Form } from 'reactstrap';

import DataStore from '../../base/plumbing/DataStore';

import DigitalMirrorCard from '../cards/DigitalMirrorCard';
import ConsentWidget from '../ConsentWidget';
import NewTabOptions from '../NewTabOptions';
import SignUpConnectCard from '../cards/SignUpConnectCard';
import LinkedProfilesCard from '../cards/LinkedProfilesCard';
import MyLoopNavBar from '../MyLoopNavBar';
import { LoginLink } from '../../base/components/LoginWidget';
import Footer from '../Footer';
import {getAllXIds, getConsents, getEmail, getProfilesNow, hasConsent, PURPOSES} from '../../base/Profiler';
import Misc from '../../base/components/Misc';
import { space } from '../../base/utils/miscutils';
import PropControl from '../../base/components/PropControl';
import SubscriptionBox from '../cards/SubscriptionBox';
import ShareButton from '../ShareButton';
import { addImageCredit } from '../../base/components/AboutPage';
import Roles from '../../base/Roles';
import TabsForGoodSettings from './TabsForGoodSettings';

const Account = () => {
	let xids = getAllXIds();
	return <>
		<div className="w-75 mx-auto">
			<div className="text-center">
				<h2>What to do now?</h2>
				<p>You have already made the first important step in helping us: you joined our community. But there is more you can do!</p>
			</div>
			<MoreToDo xids={xids} />
		</div>
		
		<h2 className="text-center mb-5">Your settings</h2>
		<Settings xids={xids}/>
	</>;
};

const tabs = {
	account: {
		content: <Account/>,
		name: "My Account"
	},
	tabsForGood: {
		content: <TabsForGoodSettings/>,
		name: "Tabs for Good"
	},
};

const Page = () => {
	// NB: race conditions with Login and profile fetch (for linked IDs) mean all-xids should be refreshed.
	let xids = getAllXIds(); 

	const user = Login.getUser();
	const name = Login.isLoggedIn() ? user.name || user.xid : "";

	// Get tabulated page (default to account)
	let { tab } = DataStore.getValue(['location', 'params']) || {};
	let tabContent = tabs[tab];
	if (!tabContent) {
		tabContent = tabs.account;
		tab = "account";
	}
	tabContent = tabContent.content;

	return (
		<div className="AccountPage">
			<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
			<div className="container mt-5 pt-5">
				<Row className="mb-5 user">
					<Col md={3} className="d-md-block d-flex justify-content-center">
						<img src="/img/LandingBackground/user.png" alt="user icon" />
					</Col>
					<Col md={8} className="flex-column justify-content-center align-items-start">
						{Login.isLoggedIn() ? <div>
							<h1>Hi {name},</h1>
							<p>Thanks for being a member of the Good-loop family. Together we are changing the global ad industry and making a meaningful impact on the world.</p>
						</div>:<div> <h1>You need an account to see this page.</h1>
							<LoginLink verb="register" className="btn btn-transparent fill">Register / Log in</LoginLink>
						</div>}
					</Col>
				</Row>
				
				{Login.isLoggedIn() ? tabContent : null}

			</div>
			<div className="account-sidebar flex-column justify-content-start unset-margins position-absolute pl-3" style={{top: 0, paddingTop:80 /*navbar height*/, left:0}}>
				<h5 className="p-2">My Good-Loop</h5>
				{Object.keys(tabs).map(t => <SidebarTab key={t} id={t} tab={tabs[t]} selected={tab}/>)}
			</div>
		</div>
	);
};

const SidebarTab = ({id, tab, selected}) => {
	return <a href={"/#account?tab=" + id} className={space("account-tab p-2", selected === id ? "active" : "")}>{tab.name}</a>;
};

addImageCredit({name:"add-user", author:"Icons8", url:"https://icons8.com/icons/set/add-user-male"});

// See also GetInvoledPage
export const MoreToDo = ({xids}) => {
	// Count the user as subscribed if we have a linked email + a consent
	const props = {xids, purpose: PURPOSES.email_mailing_list};
	let hc = xids && hasConsent(props);
	let email = xids && getEmail({xids});
	let subbed = hc && email;
	
	return (
		<div className="more-to-do TubeLine">
			<DoSection title="Sign up" tqTitle="Thanks for signing up" 
				img="/img/icons8-add-user-male.png" done={Login.isLoggedIn()} lineTop={10}
			>
				<p>Creating an account unlocks more features, which help us do more good and gives you more control.</p>
				{ ! Login.isLoggedIn() && <LoginLink><div className="btn btn-transparent fill">Sign up</div></LoginLink>}
			</DoSection>
			<DoSection title="Recognise Good-Loop ads" img="/img/LandingBackground/Group30.png" done>
				<p>Remember our logo, so when you see one of our ads, 
					you can recognise it. The Good-Loop logo guarantees that a full 50% of the money is going to charity.</p>
				<img className="w-50" src="/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png" alt="logo" />
			</DoSection>
			<DoSection title="Newsletter" tqTitle="Thanks for subscribing to our newsletter" img="/img/LandingBackground/Group33.png" done={subbed}>
				<p>Sign up to our monthly newsletter to read about the ad world and our achievements within it.</p>
				<SubscriptionBox />
				{email && <div><small>Email: {email}</small></div>}
			</DoSection>
			<DoSection title="Share the good news" img="/img/LandingBackground/share.png" last>
				<p>Spread the word about our mission by sharing this website on one of your social media channels.</p>
				<ShareButton className="btn-transparent fill"
					title="My-Loop"
					image="/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png"
					description="Using ads for good"
					url="https://my.good-loop.com"
					onShare={() => {
						console.error("TODO onShare");
					}}
				>
					Share
				</ShareButton>
			</DoSection>
		</div>
	);
};

const Settings = ({xids}) => {
	// debug
	let profiles = getProfilesNow(xids);
	let consents = getConsents({profiles});

	return (<div className="settings">
		<ConsentWidget xids={xids}/>
		<div className="pt-3"/>
		{false && <YourDataSettings/>}
		{Roles.isDev() && <div className="dev-text"><small>IDs: {xids.join(", ")}</small></div>}
		{Roles.isDev() && <div className="dev-text"><small>Consents: {JSON.stringify(consents)}</small></div>}
	</div>);
};

/**
 * TODO collect and maintain data about the user - eg common demographics
 */
const YourDataSettings = () => {
	const path = ['widget', 'YourDataWidget', 'details'];
	return (<div className="your-data-form">
		<h4>Your data:</h4>
		<Row>
			<Col md={4}>Name:</Col>
			<Col md={8} xs={6}>
				<PropControl 
					path={path} 
					prop="name"
					type="text" 
					saveFn={null} 
				/>
			</Col>
		</Row>
		<Row>
			<Col md={4}>Email:</Col>
			<Col md={8} xs={6}>
				<PropControl 
					path={path} 
					prop="email"
					type="text" 
					saveFn={null} 
				/>
			</Col>
		</Row>
		<Row>
			If you want to change your password, please go through password reset.
		</Row>
	</div>);
};

/**
 * 
 * @param {!string} img url for an icon in a yellow circle. Minor TODO this would be nicer as a text icon (unicode or an icont font like FA) instead of an image
 * @param {?boolean} last If false, use .TubeLine-line to draw in a line down to the next item
 * @param {?string} circleClassName custom classes for the circle icon
 * @param {?Object} circleStyle custom styling for the circle icon
 * @param {?Number} lineTop manually set the top of the connecting line as a percentage
 */
const DoSection = ({title, tqTitle, done=false, img, last=false, children, circleClassName, circleStyle, lineTop}) => {	
	return (
		<Row className={space("position-relative", done ? "done" : "")}>
			{!last ? <div className="TubeLine-line" style={lineTop?{top: lineTop + "%"} : null}/> : null}
			<Col md={2} className="mb-5 text-center position-relative">
				<img src={done ? "/img/LandingBackground/Group30.png" : img} className={space("w-100 TubeLine-img", circleClassName)} style={circleStyle}/>
			</Col>
			<Col className="offset-md-1 flex-column unset-margins justify-content-center mb-5">
				<div> {/* NB: div needed to avoid centering children */}
					<h4>{done && tqTitle? tqTitle : title}</h4>
					{children}
				</div>
			</Col>
		</Row>
	);
};

export default Page;
