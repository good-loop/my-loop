import React from "react";
import BG from '../../base/components/BG';
import {PageCard} from './CommonComponents';

const TestPage = ({spring}) => {

	return (
		<div className="MyAdCampaignsPage">
			<BG src="img/LandingBackground/Banner_Ourads.png" className="curve-banner" center> 
				<BG src="img/curves/curve-white.svg" className="curves"/>
			</BG>
			<PageCard className="pt-0" style={{marginTop:"-20%"}} color="white">
				<h1>Ad campaigns</h1>
				<p className='leader-text'>See how we've helped these brands raise over {C.DONATIONS_TOTAL} for charity. All thanks to you.</p>
			</PageCard>
		</div>
	);
};


export default TestPage;