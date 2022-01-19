import React, { useEffect } from 'react';
import { Container } from 'reactstrap';
// import PV from 'promise-value';
import { useSpring } from 'react-spring';

import DataStore from '../../base/plumbing/DataStore';
import Roles from '../../base/Roles';
import LandingSection, { springPageDown } from '../LandingSection';
import SubscriptionBox from '../cards/SubscriptionBox';
import { isPortraitMobile, stopEvent } from '../../base/utils/miscutils';
import { RegisterLink, setLoginVerb, setShowLogin } from '../../base/components/LoginWidget';
import CharitySection from '../CharitySection';
import MyLandingSection from '../MyLandingSection';

window.DEBUG = false;

const HowTabsForGoodWorks = () => {

	return (<>
	<div className="how-tabs-for-good-works">
		<h1>How Tabs For Good Works</h1>
		<div className="row">
			<div className="col-md-4">
				<img src="" alt="" />
				<h3>Open a tab</h3>
				<p>When you open a new tab, we display a small unobtrusive banner ad at the bottom of your page while you're busy browsing away. </p>
			</div>
			<div className="col-md-4">
				<img src="" alt="" />
				<h3>Unlock a donation</h3>
				<p>As a thank you for letting the ad appear on your page, you'll get to make a free donaiton to charity, funded by us. 50% of the ad money to be precise. </p>
			</div>
			<div className="col-md-4">
				<img src="" alt="" />
				<h3>That's it!</h3>
				<p>We don't track your online activity and you don't even have to click on the ad to make the donation happen. It really is that simple. </p>
			</div>
		</div>
	</div>
	</>)
}

const HomePage = ({spring}) => {
	//spring the page down if asked to for how it works section
	const [, setY] = useSpring(() => ({ y: 0 }));

	if (spring) springPageDown(setY);

	// If we're currently in as.good-loop.com, and we have a glvert param defined, we should redirect to campaign page
	useEffect(() => {
		const urlParams = DataStore.getValue(['location', 'params']);
		if (Object.keys(urlParams).includes('gl.vert')) {
			window.location.href = `/#campaign/?gl.vert=${urlParams['gl.vert']}`;
		}
	});

	// <ShareAdCard /> is buggy, so removed for now

	return (<>
		<div className="MyPage widepage">
			<MyLandingSection />
			<HowTabsForGoodWorks />
			<CharitySection />
			<SubscriptionBox className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};

const showRegisterForm = e => {
	stopEvent(e);
	setLoginVerb('register');
	setShowLogin(true);
};


export default HomePage;