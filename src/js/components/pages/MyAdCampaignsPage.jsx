import React from 'react';
import { Container } from 'reactstrap';
import {PageCard} from './CommonComponents';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import DynImg from '../../base/components/DynImg';
import C from '../../C';
import BG from '../../base/components/BG';
import TickerTotal from '../TickerTotal';

/**
 * Showcase of impact pages / campaigns
 */
const MyAdCampaignsPage = () => {
	return (
		<div className="MyAdCampaignsPage">
			<BG src="img/LandingBackground/Banner_Ourads.png" className="curve-banner" center> 
				<BG src="img/curves/curve-white.svg" className="curves"/>
			</BG>
			<PageCard className="pt-0 content" color="white">
				<h1 className="text-uppercase">Ad campaigns</h1>
				<p className="leader-text text-center mb-5">See how we've helped these brands raise over <TickerTotal /> for charity. 
				All thanks to you.</p>
				<RecentCampaignsCard/>
			</PageCard>
		</div>
	);
};

export default MyAdCampaignsPage;
