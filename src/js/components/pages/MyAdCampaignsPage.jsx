import React from 'react';
import { Container } from 'reactstrap';
import {CurvePageCard} from './CommonComponents';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import DynImg from '../../base/components/DynImg';
import C from '../../C';

const MyAdCampaignsPage = () => {
	return (
		<div className="MyAdCampaignsPage">
			<img src="/img/LandingBackground/Banner_Ourads.png" className="w-100"/>
			<CurvePageCard className="py-5" style={{marginTop:"-20%"}} color="white">
				<h1>Ad campaigns</h1>
				<p className='leader-text'>See how we've helped these brands raise over {C.DONATIONS_TOTAL} for charity. All thanks to you.</p>
				<RecentCampaignsCard/>
			</CurvePageCard>
		</div>
	);
};

export default MyAdCampaignsPage;
