import React, { useEffect, useState } from 'react';
import Login from 'you-again';
import _ from 'lodash';
import { Container } from 'reactstrap';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import Footer from '../Footer';
import MyLoopNavBar from '../MyLoopNavBar';
import BS from '../../base/components/BS';

import SplashCard from '../campaign_page/SplashCard';
import CharitiesSection from '../campaign_page/CharitiesSection';
import AdvertCard from '../campaign_page/AdvertCard';

// Campaign page setup and utility functions.
// TODO This page might be short enough to bring these functions back in, especially if they're optimised
import { loadCampaignData, loadViewData, loadCampaignDonationData } from '../../utils/campaignPagePlumbing';

/**
 * Most campaigns show a large percentage of donations as 'unset
 * This function distributes this value among the charities in the campaign
 * based on the amount currently assigned to each one as % of total.
 */
const charitiesWithNoUnsetDonations = (donationsByCharity) => {
	const cids = Object.keys(donationsByCharity).filter(cid => cid !== 'unset');
	const charitiesSetSum = cids.reduce((acc, cid) => acc + parseInt(donationsByCharity[cid].value), 0);
	const unsetValue = donationsByCharity.unset ? donationsByCharity.unset.value : 0;

	return cids.map(charity => {
		const setDonation = charity.value;
		// We return the sum of the value already set for the charity,
		// and the percentage of unset that corresponds to it.
		const proportionThisCharity = setDonation / charitiesSetSum;
		const totalPlusUnassigned = setDonation + (proportionThisCharity * unsetValue);
		return {...charity, value: totalPlusUnassigned };
	});
};

const CampaignPage2 = () => {
	let { // Get params from url!
		'gl.vert': adId,
		'gl.vertiser': vertiserId,
		status = C.KStatus.PUB_OR_ARC
	} = DataStore.getValue(['location', 'params']) || {};

	// Get the advert or adverts specified for this campaign page
	const pvAdverts = loadCampaignData({adId, vertiserId, status});
	if (!pvAdverts.value) return <Misc.Loading text="Loading campaign data..." />;
	const ads = pvAdverts.value;
	// TODO Grab only advert, pick one representative, or show all in list?

	// TODO: Get all donations for ad ID or for (set of ad IDs OR vertiser ID if possible)
	// TODO This might be pvDonationData and pvViewData & you'll need to pull out donationData = pvDonationData.value
	const donationData = loadCampaignDonationData();
	const viewData = loadViewData();

	// TODO Assuming 1 advert for now - fix this later
	const { branding, id, name = '', campaign = null } = ads[0];
	const totalDonated = donationData ? parseInt(donationData.total.value) : 0;
	const donationsByCharity = donationData ? donationData.by_cid : {};

	// Data bundle passed down to the SplashCard component
	const splashCardData = { branding, totalDonated, totalViews, id, name };
 
	DataStore.fetch(pathToStoreAt, () => {
		
		// This should return a promise which resolves to the value which will be stored at pathToStoreAt
		// Which means you can do...

		return ServerIO.load(url, blah, blah)
		.then((cargoFromTheAboveLoad) => {
			const processedCargo = doSomeProcessingOn(cargoFromTheAboveLoad);
			return processedCargo // and the PROCESSED data is what will be stored & cached
		})
	}

	// const charitiesData = charitiesWithNoUnsetDonations(campaignData);
	if (donationData) {
		// TODO charitiesWithNoUnsetEtc is now short enough to put in this file
		// TODO You'll use DataStore.fetch() to get the donations - you can do some processing on the server result before you put it in the store
		const updatedDonationsByCid = charitiesWithNoUnsetDonations(donationsByCharity, totalDonated);
	}

	return (
		<>
			<MyLoopNavBar brandLogo={branding.logo} logo="/img/new-logo-with-text-white.svg" />
			<div className="widepage CampaignPage text-center">
				<SplashCard data={splashCardData} />
				<CharitiesSection charities={campaignData.charities.list} donationsByCharity={donationsByCharity} />
				<Container fluid className="advert-bg">
					<br></br>
					<Container className="pt-4 pb-5">
						<h4 className="sub-header-font pb-4">The campaign</h4>
						<AdvertCard totalDonated={totalDonated} totalViews={totalViews} id={id} />
					</Container>
				</Container>
				{ JSON.stringify(donationData) || '' }
				<Footer />
			</div>
		</>
	);
};

export default CampaignPage2;
