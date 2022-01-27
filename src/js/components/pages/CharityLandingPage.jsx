import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { MyLandingSection, T4GCTAButton } from './CommonComponents';

const WhatIsTabsForGood = ({ngo}) => {
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

const CharityLandingPage = () => {
	const path = DataStore.getValue(['location', 'path']);
	let cid = path[1];
	if ( ! cid) {
		return <h2>No charity?!</h2>;
	};
	let pvCharity = getDataItem({type:'NGO', id:cid, status:KStatus.PUBLISHED});
	if ( ! pvCharity.resolved) {
		return <Misc.Loading />;
	}
	const ngo = pvCharity.value;
	if (!ngo) {
		return (<>
		<h2>Invalid Charity. Please check your url.</h2>
		</>)
	}

	return (<>
		<MyLandingSection ngo={ngo}/>
		<Row>
			<Col md={8} className='d-none d-md-block'></Col>
			<Col md={4} className='d-flex justify-content-center px-2'>
				<CharityLogo charity={ngo} style={{maxWidth:100}}/>
				<img src="https://i.imgur.com/TSmMRez.png"/>
			</Col>
		</Row>
		<WhatIsTabsForGood ngo={ngo}/>
	</>);
};

export default CharityLandingPage;
