import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';

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
		<h1 className='mb-5'>{NGO.displayName(ngo)}</h1>		
		{/* <CharityLogo className="w-100" charity={ngo} /> */}
		<Row>
			<Col>
				<h2>Every time you open a new tab in your browser you raise money for {ngo.name}</h2>
				<p>Download the free Tabs for Good Chrome plugin and start raising money for {ngo.name} now. </p>
				<a className='btn btn-primary' href='#'>Sign Up & Download</a>
			</Col>
			<Col></Col>
		</Row>
		<Row>
			<Col>
			<img className='w-100' src={ngo.images}/>
			</Col>
			<Col>
			<h2>WHAT WE DO</h2>
			<p>{ngo.summaryDescription}</p>
			</Col>
		</Row>
	</>);
};

export default CharityLandingPage;
