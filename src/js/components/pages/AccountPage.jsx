import React, { useState } from 'react';
import { Col, Row, Container, Button } from 'reactstrap';
import { addImageCredit } from '../../base/components/AboutPage';
import Editor3ColLayout, { LeftSidebar, MainPane } from '../../base/components/Editor3ColLayout';
import { LoginLink } from '../../base/components/LoginWidget';
import Person, { getAllXIds, getEmail, getProfile, hasConsent, PURPOSES } from '../../base/data/Person';
import DataStore from '../../base/plumbing/DataStore';
import { lg } from '../../base/plumbing/log';
import { getScreenSize, isMobile, space } from '../../base/utils/miscutils';
import Login from '../../base/youagain';
import SubscriptionBox from '../cards/SubscriptionBox';
import ShareButton from '../ShareButton';
import AccountSettings from './AccountSettings';
import TabsForGoodSettings from './TabsForGoodSettings';
import C from '../../C';


const Page = () => {
	// handle the not-logged-in case
	if ( ! Login.isLoggedIn()) {
		return (
			<div className="AccountPage">				
				<div className="container mt-5 pt-5">
					<h1>You need an account to see this page.</h1>
					<LoginLink verb="register" className="btn btn-transparent fill">Register / Log in</LoginLink>
				</div>
			</div>
		);
	}
	// // NB: race conditions with Login and profile fetch (for linked IDs) mean all-xids should be refreshed.
	// let xids = getAllXIds();

	const user = Login.getUser();
	const name = user.name || user.xid;

	// Which tab? (default to dashboard)
	const tab = DataStore.getUrlValue('tab') || 'dashboard';

	return (<>
		<div className="AccountPage">
			<Container className="pt-3">
				{tab === 'dashboard' && <Account />}
				{tab === 'settings' && <AccountSettings />}
				{tab === 'tabsForGood' && <TabsForGoodSettings />}
			</Container>
		</div>
	</>);
};

addImageCredit({ name: "add-user", author: "Icons8", url: "https://icons8.com/icons/set/add-user-male" });

// See also GetInvoledPage
export const MoreToDo = ({ xids }) => {
	// Count the user as subscribed if we have a linked email + a consent
	const props = { xids, purpose: PURPOSES.email_mailing_list };
	let hc = xids && hasConsent(props);
	let email = xids && getEmail({ xids });
	let subbed = hc && email;

	return (
		<div className="more-to-do TubeLine">
			<DoSection title="Sign up" tqTitle="Thanks for signing up"
				img="/img/icons8-add-user-male.png" done={Login.isLoggedIn()} lineTop={10}
			>
				<p>Creating an account unlocks more features, which help us do more good and gives you more control.</p>
				{!Login.isLoggedIn() && <LoginLink><div className="btn btn-transparent fill">Sign up</div></LoginLink>}
			</DoSection>
			<DoSection title="Recognise Good-Loop ads" img="/img/LandingBackground/Group30.png" done>
				<p>Remember our logo, so when you see one of our ads,
					you can recognise it. The Good-Loop logo guarantees that a full 50% of the money is going to charity.</p>
				<img className="w-50" src="/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png" alt="logo" />
			</DoSection>
			<DoSection title="Newsletter" tqTitle="Thanks for subscribing to our newsletter" img="/img/LandingBackground/Group33.png" done={subbed}>
				<p>Support the causes you care about, and see the lives you're helping to improve and the difference you're making to the world - a monthly email.</p>
				<SubscriptionBox title="" />
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
						console.error("TODO log onShare - which channel", e);
						lg("shareclick", { user: Login.getId() });
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
const DoSection = ({ title, tqTitle, done = false, img, last = false, children, circleClassName, circleStyle, lineTop }) => {
	return (
		<Row className={space("position-relative", done ? "done" : "")}>
			{!last ? <div className="TubeLine-line" style={lineTop ? { top: lineTop + "%" } : null} /> : null}
			<Col md={2} className="mb-5 text-center position-relative">
				<img src={done ? "/img/LandingBackground/Group30.png" : img} className={space("w-100 TubeLine-img", circleClassName)} style={circleStyle} />
			</Col>
			<Col className="offset-md-1 flex-column unset-margins justify-content-center mb-5">
				<div> {/* NB: div needed to avoid centering children */}
					<h4>{done && tqTitle ? tqTitle : title}</h4>
					{children}
				</div>
			</Col>
		</Row>
	);
};

export default Page;
