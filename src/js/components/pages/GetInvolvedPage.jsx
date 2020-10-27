import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import MyLoopNavBar from '../MyLoopNavBar';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';

const GetInvolvedPage = () => {
    return (<>
	<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
	<div className="GetInvolvedPage">
			<img src="/img/LandingBackground/Charities_banner.png" className="w-100 mt-5"/>
			<Container className="py-5">
				<h1>Get involved and be part<br/>of the ad revolution</h1>
				<PageDivider className="mt-5"
					left={<div className="w-100 h-100 flex-column unset-margins justify-content-center">
                        <h2 className="mr-auto">What is our mission?</h2><br/>
                        <p>Our mission is not less than to change the global ad industry. Brands are spending $450M on ads every year and in theory we are capable of turning half of that money into charitable donations.</p>
                    </div>}
					right={
	                    <video className="w-100" src="/img/LandingBackground/Yinyang.mp4" autoPlay loop muted/>
                    }/>
			</Container>
		</div>
</>);
};

const PageDivider = ({left, right, className}) => {
    return <Row className={className}>
        <Col md={6}>
            {left}
        </Col>
        <Col md={6}>
            {right}
        </Col>
    </Row>;
};

export default GetInvolvedPage;
