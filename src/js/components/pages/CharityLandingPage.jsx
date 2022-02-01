import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { MyLandingSection, T4GCTAButton } from './CommonComponents';



const CharityLandingPage = () => {
	// Is this for a charity?
	const path = DataStore.getValue(['location', 'path']);
	let cid = path[1];
	if ( ! cid) {
		return <h1>No charity</h1>;
	}
	let pvCharity = getDataItem({type:'NGO', id:cid, status:KStatus.PUBLISHED});
	if ( ! pvCharity.resolved) {
		return <Misc.Loading />;
	}
	const ngo = pvCharity.value;

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
