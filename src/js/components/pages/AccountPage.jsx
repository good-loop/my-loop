import React, {useEffect, useRef, useState, useCallback} from 'react';
import Login from '../base/you-again';
import { Col, Row, Form } from 'reactstrap';

import DataStore from '../../base/plumbing/DataStore';

import NewTabOptions from '../NewTabOptions';
import LinkedProfilesCard from '../cards/LinkedProfilesCard';
import MyLoopNavBar from '../MyLoopNavBar';
import { LoginLink } from '../../base/components/LoginWidget';
import Footer from '../Footer';
import {getAllXIds, getEmail, getProfilesNow, hasConsent, PURPOSES} from '../../base/data/Person';
import Misc from '../../base/components/Misc';
import { space, isPortraitMobile } from '../../base/utils/miscutils';
import PropControl from '../../base/components/PropControl';
import SubscriptionBox from '../cards/SubscriptionBox';
import ShareButton from '../ShareButton';
import { addImageCredit } from '../../base/components/AboutPage';
import TabsForGoodSettings from './TabsForGoodSettings';
import AccountSettings from './AccountSettings';
import { lg } from '../../base/plumbing/log';

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
	</>;
};

const label4tab = {
	account: "My Account",
	settings: "Settings",
	tabsForGood: "Tabs for Good"
};

const Page = () => {
	// handle the not-logged-in case
	if ( ! Login.isLoggedIn()) {
		return (
			<div className="AccountPage">
				<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
				<div className="container mt-5 pt-5">
					<h1>You need an account to see this page.</h1>
					<LoginLink verb="register" className="btn btn-transparent fill">Register / Log in</LoginLink>							
				</div>
			</div>
		);
	}
	// NB: race conditions with Login and profile fetch (for linked IDs) mean all-xids should be refreshed.
	let xids = getAllXIds(); 

	const user = Login.getUser();
	const name = user.name || user.xid;

	// Which tab? (default to account)
	const tab = DataStore.getUrlValue('tab') || 'account';	

	return (
		<div className="AccountPage">
			<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
			<div className="container mt-5 pt-5">
				<Row className="mb-5 user">
					<Col md={3} className="d-md-block d-flex justify-content-center">
						<img src="/img/LandingBackground/user.png" alt="user icon" />
					</Col>
					<Col md={8} className="flex-column justify-content-center align-items-start">
						<h1>Hi {name},</h1>
						<p>Thanks for being a member of the Good-loop family. Together we are changing the global ad industry and making a meaningful impact on the world.</p>
					</Col>
				</Row>
				{tab==='account' && <Account/>}
				{tab==='settings' && <AccountSettings xids={xids}/>}
				{tab==='tabsForGood' && <TabsForGoodSettings/>}
			</div>
			<div className="account-sidebar flex-column justify-content-start unset-margins position-absolute pl-3 bg-white" style={{top: 0, paddingTop:80 /*navbar height*/, left:0}}>
				<h5 className="p-2">My Good-Loop</h5>
				{Object.keys(label4tab).map(t => <SidebarTabLink key={t} tab={t} label={label4tab[t]} selected={t===tab}/>)}
			</div>
		</div>
	);
};

/**
 * 
 * @param {!string} tab The tab name
 * @param {boolean} selected
 */
const SidebarTabLink = ({tab, label, selected}) => {
	return <a href={"/#account?tab="+escape(tab)} className={space("account-tab p-2", selected && "active")}>{label || tab}</a>;
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
					url="https://my.good-loop.com" // TODO add via=user so we can track and attribute visits
					onShare={e => {
						console.error("TODO log onShare - which channel",e);
						lg("shareclick", {user:Login.getId()});
					}}
				>
					Share
				</ShareButton>
			</DoSection>
		</div>
	);
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
