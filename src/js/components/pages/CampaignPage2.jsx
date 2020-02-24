import React, { useEffect, useState } from 'react';
import Login from 'you-again';
import _ from 'lodash';
import { Container } from 'reactstrap';

import Misc from '../../base/components/Misc';
import Footer from '../Footer';
import MyLoopNavBar from '../MyLoopNavBar';
import BS from '../../base/components/BS';

import SplashCard from '../campaign_page/SplashCard';
import CharitiesSection from '../campaign_page/CharitiesSection';
import AdvertCard from '../campaign_page/AdvertCard';
import { fetchCampaignData, fetchCommunityTotal, fetchViewData, charitiesWithNoUnsetDonations } from '../../utils/campaignPageUtils';

const CampaignPage2 = () => {
	const [campaignData, setCampaignData] = useState(null);

	// When component mounts get data from backend based on search query,
	// and save it to state to force re-render. Clean.
	useEffect(() => {
		fetchCampaignData()
			.then(res => setCampaignData(res.cargo));
	}, []);

	// Once campaign data is ready get community total and include it in the object,
	// as long as it has not been done before.
	if (campaignData) {
		const { communityTotal, viewData } = campaignData;
		if (!communityTotal) {
			fetchCommunityTotal(campaignData)
				.then(res => setCampaignData({...campaignData, communityTotal: res.data}));
		}
		if (!viewData) {
			fetchViewData(campaignData)
				.then(res => setCampaignData({...campaignData, viewData: res.cargo}));
		}
	}
	
	// If data is not ready, return
	if (!campaignData) return <Misc.Loading text='Loading campaign data...' />;

	const charitiesData = charitiesWithNoUnsetDonations(campaignData);
	console.log(campaignData);

	return (
		<>
			<MyLoopNavBar brandLogo={campaignData.branding.logo} logo="/img/new-logo-with-text-white.svg" />
			<div className="widepage CampaignPage text-center">
				<SplashCard data={campaignData} />
				<CharitiesSection charities={charitiesData} />
				<Container fluid className="advert-bg">
					<br></br>
					<Container className="pt-4 pb-5">
						<h4 className="sub-header-font pb-4">The campaign</h4>
						<AdvertCard campaignData={campaignData} viewCountProp={campaignData} />
					</Container>
				</Container>
				<Footer />
			</div>
		</>
	);
};

export default CampaignPage2;
