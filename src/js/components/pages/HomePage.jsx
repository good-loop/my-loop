import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
// import PV from 'promise-value';
import { useSpring } from 'react-spring';

import DataStore from '../../base/plumbing/DataStore';
import Roles from '../../base/Roles';
import LandingSection, { springPageDown } from '../LandingSection';
import SubscriptionBox from '../cards/SubscriptionBox';
import { isPortraitMobile, stopEvent } from '../../base/utils/miscutils';
import CharitySection from '../CharitySection';
import {
	TabsForGoodSlideSection,
	HowTabsForGoodWorks,
	NewsSection,
	WatchVideoSection,
	TriCards,
	TestimonialSection,
	GetInvolvedSection,
	CharityBanner,
	MyLandingSection
} from './CommonComponents';

window.DEBUG = false;

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
		<div className="HomePage widepage">
			<MyLandingSection />
			<CharityBanner />
			<HowTabsForGoodWorks />
			<TabsForGoodSlideSection img="/img/homepage/charities.png" showUpperCTA />
			<WatchVideoSection />
			<NewsSection />
			<TestimonialSection />
			<GetInvolvedSection />
			<SubscriptionBox className="bg-gl-light-red big-sub-box"/>
			<TriCards />
		</div>
	</>);
};

const showRegisterForm = e => {
	stopEvent(e);
	setLoginVerb('register');
	setShowLogin(true);
};


export default HomePage;