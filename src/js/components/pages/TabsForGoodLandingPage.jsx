import React, { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { modifyPage } from '../../base/plumbing/glrouter';
import C from '../../C';
import { space } from '../../base/utils/miscutils';
import CharityLogo from '../CharityLogo';
import { setFooterClassName } from '../Footer';
import { T4GSignUpButton } from '../T4GSignUp';
import { WhatIsTabsForGood, HowTabsForGoodWorks, TabsForGoodSlideSection, CurvePageCard, MyLandingSection, PageCard, PositivePlaceSection, CornerHummingbird } from './CommonComponents';


// Copywriting https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit#heading=h.5r45wnjwbf7j
// Design https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517456508960&cot=14
// https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516139446040&cot=14

const WellMakeItHappenSection = () => {
	return <>
		<PageCard className="text-center">
			<div className="w-75 mx-auto">
				<h1>You pick the charity you want to support. We'll make it happen.</h1>
				<p className="mt-5"><b>Clean the oceans from plastic, feed children in need, save endangered species, support women's education in developing countries - pick the charity you care about and we'll donate the cash you raise to help their cause.</b></p>
				<T4GSignUpButton className="mt-5 w-100"/>
			</div>
		</PageCard>
		<div className='make-it-happen-charities mb-5'>
			<img src="/img/TabsForGood/charities2.png"/>
		</div>
	</>
};

const PositivePlace123Section = ({className, showCTA}) => {
	return <PageCard className={space("positive-place-section text-center", className)}>
		<h1 className='pt-5'>Let's make the internet a more positive place. Together.</h1>
		<Row className="pt-5 d-flex justify-content-around">
			<Col md={3} className="video-points">
				<img className='w-50' src="img/icons/one.png" alt="" />
				<h3 className='pt-4 sm'>Sign up for Tabs for Good</h3>
			</Col>
			<Col md={3} className="video-points">
				<img className='w-50' src="img/icons/two.png" alt="" />
				<h3 className='pt-4 sm'>Pick the charity you want to support</h3>
			</Col>
			<Col md={3} className="video-points">
				<img className='w-50' src="img/icons/three.png" alt="" />
				<h3 className='pt-4 sm'>Start browsing and raise money for charity. For free.</h3>
			</Col>
		</Row>
		{showCTA && <T4GSignUpButton className="mt-5" />}
	</PageCard>
}

const TabsForGoodLandingPage = () => {
	// switch to a charity page? NB: this is handy for links in sign-up emails
	if (DataStore.getUrlValue("charity")) {
		modifyPage(['charity', DataStore.getUrlValue("charity")], {charity:null});
		return <Misc.Loading />;
	}

	useEffect(() => {
		setFooterClassName('bg-gl-pale-orange');
	}, []);

	return (<>
		<MyLandingSection shiftLeft title={<>Tabs for Good<br/>The browser plugin that lets you do good just by opening a new tab</>} 
			text=" " bgImg="/img/TabsForGood/photo-by-larm-rmah-unsplash.jpg" mydata={false} />
		<CornerHummingbird/>
		<WhatIsTabsForGood/>
		<HowTabsForGoodWorks className="bg-gl-pale-orange" shortTitle />
		<TabsForGoodSlideSection img="/img/homepage/charities.png" showLowerCTA bgClassName="bg-gl-light-blue" />
		<WellMakeItHappenSection/>
		<PositivePlace123Section className="bg-gl-pale-orange" showCTA />
		{/*<TriCards />*/}
	</>);
};

export default TabsForGoodLandingPage;
