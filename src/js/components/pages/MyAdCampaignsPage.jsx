import React, { useState } from 'react';
import { Container } from 'reactstrap';
import MyLoopNavBar from '../MyLoopNavBar';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';

const MyAdCampaignsPage = () => {
    return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
		<div className="MyAdCampaignsPage">
			<img src="/img/LandingBackground/ads_banner.png" className="w-100 mt-5"/>
			<Container className="py-5">
				<h1>Ad campaigns</h1>
                <RecentCampaignsCard/>
			</Container>
		</div>
	</>);
};

export default MyAdCampaignsPage;
