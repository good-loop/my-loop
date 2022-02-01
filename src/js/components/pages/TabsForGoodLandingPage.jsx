import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { MyLandingSection, T4GCTAButton } from './CommonComponents';

export const WhatIsTabsForGood = ({ngo}) => {
	const causesText = (
		ngo && `Tabs for Good is your browser plugin that transforms web browsing into charity donations for free. Helping turn your browsing into money for ${ngo.name}.`
	) || "Tabs for Good is your browser plugin that transforms web browsing into charity donations for free. Helping turn your browsing into life saving vaccines, meals for children in need, preservation of habitats for endangered animals, plus many more good causes. ";
	
	return <Container className="how-tabs-for-good-works text-center pt-3">
		<h1>How Tabs For Good Works</h1>
		<p className='pt-3'>{causesText}</p>
		<Row className="pt-5">
			<Col md={4}>
				<img className='w-100' src={(ngo && ngo.images) || "/img/homepage/globe.png"} alt="" />
			</Col>
			<Col md={4}>
				<img className='w-100' src={(ngo && ngo.images) || "/img/homepage/heart.png"} alt="" />
			</Col>
			<Col md={4}>
				<img className='w-100' src={(ngo && ngo.images) || "/img/homepage/world.png"} alt="" />
			</Col>
		</Row>
		<br/>
		<T4GCTAButton className="mx-auto"/>
	</Container>;
}

const TabsForGoodLandingPage = () => {
	return (<>
		<MyLandingSection />
		<WhatIsTabsForGood />
	</>);
};

export default TabsForGoodLandingPage;
