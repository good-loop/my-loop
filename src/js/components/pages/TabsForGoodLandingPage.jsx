import React, { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { modifyPage } from '../../base/plumbing/glrouter';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { setFooterClassName } from '../Footer';
import { T4GCTA } from '../T4GSignUp';
import { WhatIsTabsForGood, HowTabsForGoodWorks, TabsForGoodSlideSection, TriCards, CurvePageCard, MyLandingSection, PageCard, PositivePlaceSection, CornerHummingbird } from './CommonComponents';


// Copywriting https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit#heading=h.5r45wnjwbf7j
// Design https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517456508960&cot=14
// https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516139446040&cot=14

const WellMakeItHappenSection = () => {
	return <PageCard className="text-center">
		<div className="w-75 mx-auto">
			<h1>You pick the charity you want to support. We'll make it happen.</h1>
			<p className="mt-5"><b>Clean the oceans from plastic, feed children in need, save endangered species, support women's education in developing countries - pick the charity you care about and we'll donate the cash you raise to help their cause.</b></p>
			<T4GCTA className="mt-5 w-100"/>
			{/* TODO add charities image */}
		</div>
	</PageCard>
};

const TabsForGoodLandingPage = () => {
	// switch to a charity page? NB: this is handy for links in sign-up emails
	if (DataStore.getUrlValue("charity")) {
		modifyPage(['charity', DataStore.getUrlValue("charity")], {charity:null});
		return <Misc.Loading />;
	}

	useEffect(() => {
		setFooterClassName('bg-gl-light-blue');
	}, []);

	return (<>
		<MyLandingSection title={<>Tabs-for-Good<br/>The browser plugin that allows you to do good just by opening a new tab</>} text=" " />
		<CornerHummingbird/>
		<WhatIsTabsForGood imgs={['/img/LandingCharity/T4GScreenshot.png']} />
		<HowTabsForGoodWorks />
		<TabsForGoodSlideSection img="/img/homepage/charities.png" showLowerCTA />
		<WellMakeItHappenSection/>
		<PositivePlaceSection className="bg-gl-pale-orange" showCTA />
		{/*<TriCards />*/}
	</>);
};

export default TabsForGoodLandingPage;
