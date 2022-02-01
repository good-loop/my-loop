import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { MyLandingSection, T4GCTAButton } from './CommonComponents';



const BlogPage = () => {
	// Is this for a charity?
	const path = DataStore.getValue(['location', 'path']);
	let cid = path[1];

return (<>
TODO Blog
	</>);
};

export default BlogPage;
