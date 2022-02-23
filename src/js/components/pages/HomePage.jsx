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
	NewsAwards,
	WatchVideoSection,
	TriCards,
	TestimonialSectionTitle,
	TestimonialSectionLower,
	GetInvolvedSection,
	CharityBanner,
	MyLandingSection,
	PositivePlaceSection,
	CurvePageCard
} from './CommonComponents';
import { setFooterClassName } from '../Footer';

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
		setFooterClassName("bg-white");
	}, []);

	// <ShareAdCard /> is buggy, so removed for now

	return (<>
		<div className="HomePage widepage">
			<MyLandingSection shiftLeft/>

			{/*
			<br/>

			<h1>Test H1</h1>
			<h2>Test H2</h2>
			<h3>Test H3</h3>
			<p className='splash-text'>Splash screen paragraph</p>
			<p className='leader-text'>Leader paragraph</p>
			<p>Body copy</p>

			<br/>
			*/}

			<CharityBanner />
			<HowTabsForGoodWorks />
			<TabsForGoodSlideSection img="/img/homepage/charities.png" showUpperCTA />
			<NewsAwards />
			<PositivePlaceSection className="blue-gradient"/>
			<WatchVideoSection />
			<CurvePageCard color='dark-turquoise' className='' bgClassName='bg-white' bgImg=''>
				<TestimonialSectionTitle />
			</CurvePageCard>
			<TestimonialSectionLower />
			<GetInvolvedSection />
			{/* <SubscriptionBox className="bg-gl-light-red big-sub-box"/> */}
			<TriCards className=""
				firstTitle="See How Our Ads Work" firstText="Discover... a sentence about this page/article" firstIMG="/img/homepage/good-loop-for-business.png"
				secondTitle="Charity Directory" secondText="Discover... a sentence about this page/article" secondIMG="/img/homepage/tree-planting.png"
				thirdTitle="How It All Began" thirdText="Discover... a sentence about this page/article" thirdIMG="/img/homepage/amyanddaniel.png"
			/>
		</div>
	</>);
};

const showRegisterForm = e => {
	stopEvent(e);
	setLoginVerb('register');
	setShowLogin(true);
};


export default HomePage;