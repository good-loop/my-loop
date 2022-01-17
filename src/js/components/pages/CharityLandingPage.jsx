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
	return (<>
		<h1>{NGO.displayName(ngo)}</h1>		
		<CharityLogo charity={ngo} />
	</>);
};

export default CharityLandingPage;
