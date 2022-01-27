import React from 'react';
import Misc from '../../base/components/Misc';
import Campaign from '../../base/data/Campaign';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import { getDataLogData } from '../../base/plumbing/DataLog';
import DataStore, { getPath } from '../../base/plumbing/DataStore';
import C from '../../C';


const GreenLanding = ({ }) => {
	// like CampaignPage, this would prefer to run by a campaign id
	const path = DataStore.getValue("location","path");
	const cid = path[1] || Campaign.TOTAL_IMPACT;
	const isTotal = cid===Campaign.TOTAL_IMPACT;
	const status = DataStore.getUrlValue("status") || KStatus.PUBLISHED;
	const pvCampaign = getDataItem({type:C.TYPES.Campaign, id:cid, status});

	// Green Ad Tags carry t=pixel d=green campaign=X adid=Y
	// Pixel etc views
	// Where are these??
	// Originally: https://lg.good-loop.com/data?q=&start=2021-10-01&end=now&dataspace=trk&evt=pxl_green
	// and https://lg.good-loop.com/data?q=&start=2021-10-01&end=now&dataspace=gl&evt=pxl_green
	// New activity (2022+) will go into its own d=green dataspace with evt=pixel|redirect|?
	let q = cid && cid !== "TOTAL_IMPACT"? "campaign:"+cid : ""; // everything?
	let pvData = getDataLogData({q,dataspace:"green",start:"2021-10-01",breakdowns:[]});

	// TODO Fetch dntnblock info

	if ( ! pvCampaign.value) {
		return <Misc.Loading />
	}
	const campaign = pvCampaign.value;
	// TODO only fetch eco charities
	let dntn4charity = Campaign.dntn4charity(campaign);
	console.log(dntn4charity);

	return <div id="green-landing">
		<div className="green-landing-splash">
			BRAND LOGO HERE<br />
			<div className="splash-tonnes">XXXX TONNES</div>
			carbon offset
			<div className="splash-trees">XXXX</div>
			trees planted<br />
			with
			<div className="splash-carbon-neutral">
				CARBON NEUTRAL ADS<br />
				BY GOOD-LOOP
			</div>
			<a className="splash-explore">EXPLORE OUR IMPACT</a>
		</div>
	</div>;
};

export default GreenLanding;
