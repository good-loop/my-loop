import React from 'react';
import { Container } from 'reactstrap';
import {PageCard} from './CommonComponents';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import DynImg from '../../base/components/DynImg';
import C from '../../C';
import BG from '../../base/components/BG';

const MyAdCampaignsPage = () => {
	return (
		<div className="MyAdCampaignsPage">
			{/* <img src="/img/LandingBackground/Banner_Ourads.png" className="w-100"/> */}
			<BG src="img/LandingBackground/Banner_Ourads.png" className="curve-banner" center> 
				<BG src="img/curves/curve-white.svg" className="curves"/>
			</BG>
			<PageCard className="pt-0" style={{marginTop:"-20%"}} color="white">
				<h1>Ad campaigns</h1>
				<p className='leader-text'>See how we've helped these brands raise over {C.DONATIONS_TOTAL} for charity. All thanks to you.</p>
				<RecentCampaignsCard/>
			</PageCard>
		</div>
	);
};

export default MyAdCampaignsPage;
