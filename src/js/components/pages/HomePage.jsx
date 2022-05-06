import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardImg, CardText, CardTitle, Col, Container, Row } from 'reactstrap';
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
	MyDuoLandingSection,
	PositivePlaceSection,
	CurvePageCard,
	PageCard,
	TabsForGoodSlideSection2
} from './CommonComponents';
import { setFooterClassName } from '../Footer';
import { T4GHowItWorksButton, T4GSignUpButton } from '../T4GSignUp';
import { MyDataSignUpButton } from '../mydata/MyDataSignUp';

const HomePage = ({spring}) => {
	//spring the page down if asked to for how it works section
	const [, setY] = useSpring(() => ({ y: 0 }));

	if (spring) springPageDown(setY);

	// If we're currently in as.good-loop.com, and we have a glvert param defined, we should redirect to campaign page
	useEffect(() => {
		const urlParams = DataStore.getValue(['location', 'params']);
		if (Object.keys(urlParams).includes('gl.vert')) {
			window.location.href = `/campaign/?gl.vert=${urlParams['gl.vert']}`;
		}
		setFooterClassName("bg-white");
	}, []);

	// <ShareAdCard /> is buggy, so removed for now

	return (<>
		<div className="HomePage widepage">
			{/* <MyLandingSection shiftLeft/> */}
			<MyDuoLandingSection />
			<CharityBanner />
			<JoinOurMovement />
			<NewsAwards />
			<PositivePlaceSection className="blue-gradient"/>
			<WatchVideoSection />
			<CurvePageCard color='dark-turquoise' className='' bgClassName='bg-white' bgImg=''>
				<TestimonialSectionTitle />
			</CurvePageCard>
			<TestimonialSectionLower />
			<GetInvolvedSection />
			{/* <SubscriptionBox className="bg-gl-light-red big-sub-box"/> */}
			<TriCards titles={["See How Our Ads Work", "Tabs for Good", "Our Story", ]}
				texts={["Explore more examples of our campaigns", "Raise money for charity every time you open a new tab", "Meet the cofounders and discover the story of Good-Loop"]}
				images={["img/homepage/good-loop-for-business.png", "img/homepage/slide-1.png", "img/homepage/amyanddaniel.png"]}
				links={["impactoverview", "tabsforgood", "ourstory"]}
			/>
		</div>
	</>);
};

const JoinOurMovement = () => <>	
	<PageCard id="upper-cta" className="tabs-for-goods-slide-card" >
		<div className="upper-cta white">
			<h1 className='mb-4 white'>Join Our Movement!</h1>
			<p className='leader-text text-center'>Start transforming your web browsing into life saving vaccines, meals for children in need, habitats for endangered animals, plus many more good causes.</p>
			<img src="/img/homepage/bird-cloud.png" className='top-right'/>
			<img src="/img/signup/hand-globe-coins.png" className='top-left'/>
		</div>
		<div className="gridbox gridbox-md-2 gridbox-gap-4">
				<Card>
					<CardImg variant="top" src="/img/homepage/slide-1.png" />
					<CardBody>
						<CardTitle><h3 className='gl-dark-blue'>Tabs for Good</h3></CardTitle>
						<CardText>Turn your web browsing into charity donations. Easy and free.</CardText>
						<T4GSignUpButton className="w-100"/>
						<T4GHowItWorksButton className="w-100" />
					</CardBody>
				</Card>
				<Card>
					<a id="mydata-cta" />
					<CardImg className='bg-gl-dark-blue' variant="top" src="/img/mydata/onboarding-2.png" />
					<CardBody>
						<CardTitle><h3 className='gl-dark-blue'>My.Data</h3></CardTitle>
						<CardText>
							Don't just give it away - support charity with your data
						</CardText>
						<MyDataSignUpButton className="w-100 mt-3" /> {/* NB: assume the modal is on the page already */}
					</CardBody>
				</Card>
		</div>
	</PageCard>
</>;

export default HomePage;