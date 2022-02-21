import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import LinkOut from '../../base/components/LinkOut';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';

export const ProductsOverviewPage = () => {
	return <Container>
		<h1>Products Overview</h1>
		<LinkOut href="https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516139085833&cot=14">TODO miro design</LinkOut>

	</Container>;
}

export default ProductsOverviewPage;
