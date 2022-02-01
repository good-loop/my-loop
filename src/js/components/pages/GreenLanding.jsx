import React from 'react';
import Misc from '../../base/components/Misc';
import { setNavProps } from '../../base/components/NavBar';
import Campaign from '../../base/data/Campaign';
import { getId } from '../../base/data/DataClass';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import { getDataLogData } from '../../base/plumbing/DataLog';
import DataStore, { getPath } from '../../base/plumbing/DataStore';
import { encURI } from '../../base/utils/miscutils';
import C from '../../C';




// TODO Design! and Content!
// Latest Layout Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516138790976&cot=14
// Visual Design: https://miro.com/app/board/o9J_lncRn5E=/ (note: some layout changes above)
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing




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
	let co2 = campaign.co2 || 'XXXX';
	let trees = campaign.offsets && campaign.offsets[0] && campaign.offsets[0].n || 'XXXX';

	// Branding
	let branding = campaign.branding || {name:"TODO branding"};	
	// set NavBar brand (copy pasta from CampaignPage.jsx)
	let {type, id} = Campaign.masterFor(campaign);
	if (type && id) {
		let pvBrandItem = getDataItem({type, id, status});
		let brandItem = pvBrandItem.value;
		if (brandItem) {
			const prop = type.toLowerCase();
			let nprops = { // advertiser link and logo			
				brandLink:'/impact/'+prop+'='+encURI(getId(brandItem))+".html",
				brandLogo: brandItem.branding && (brandItem.branding.logo_white || brandItem.branding.logo),
				brandName: brandItem.name || getId(brandItem)
			};
			setNavProps(nprops);
		}
	}

	return (
		<div id="green-landing">
			<div className="landing-splash full-width">
				<img className="hummingbird" src="/img/green/hummingbird.png" />
				<div className="splash-circle">
					<div className="branding">{branding.logo ? <img src={branding.logo} alt="brand logo" /> : JSON.stringify(branding)}</div>
					<div className="big-number tonnes">{co2}  TONNES</div>
						carbon offset
						<div className="big-number trees">{trees}</div>
						trees planted<br/>
						with
						<div className="carbon-neutral-logo">
							<img className="left" src="/img/new-logo-white.svg" />
							<div className="right">
								<div>CARBON NEUTRAL ADS</div>
								<div>BY GOOD-LOOP</div>
							</div>
						</div>
						<a className="btn splash-explore">EXPLORE OUR IMPACT</a>
					</div>
			</div>
			<div className="landing-map transition-top full-width" />
			<div className="landing-map full-width">
				Map stuff goes here
			</div>
			<div className="landing-extra full-width">
				More info
			</div>
		</div>
	);
};

export default GreenLanding;
