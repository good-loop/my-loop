import React, { useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import { setNavProps } from '../../base/components/NavBar';
import Campaign from '../../base/data/Campaign';
import { getId } from '../../base/data/DataClass';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import { getDataLogData } from '../../base/plumbing/DataLog';
import DataStore, { getPath } from '../../base/plumbing/DataStore';
import { encURI, space } from '../../base/utils/miscutils';
import C from '../../C';
import GreenMap from './greendash/GreenMap';




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
	// let q = cid && cid !== "TOTAL_IMPACT"? "campaign:"+cid : ""; // everything?
	// let pvData = getDataLogData({q,dataspace:"green",start:"2021-10-01",breakdowns:[]});

	// TODO Fetch dntnblock info

	if ( ! pvCampaign.value) {
		return <Misc.Loading />
	}
	const campaign = pvCampaign.value;
	// TODO only fetch eco charities
	let dntn4charity = {} || Campaign.dntn4charity(campaign);
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
			// const prop = type.toLowerCase();
			// let nprops = { // advertiser link and logo			
			// 	brandLink:'/impact/'+prop+'='+encURI(getId(brandItem))+".html",
			// 	brandLogo: brandItem.branding && (brandItem.branding.logo_white || brandItem.branding.logo),
			// 	brandName: brandItem.name || getId(brandItem)
			// };
			setNavProps(brandItem);
		}
	}

	// "Explore Our Impact" button scrolls to the next section
	const scrollToMap = () => {
		// Can't just use element.scrollTo() because the navbar will cover the top...
		const targetEl = document.querySelector('.GreenLandingPage .mission');
		const navbar = document.querySelector('nav.navbar');
		const targetY = targetEl.getBoundingClientRect().top + navbar.offsetHeight + window.scrollY;
		window.scrollTo({top: targetY, behavior: 'smooth'});
	};

	return (
		<div className="GreenLandingPage widepage">
			<div className="landing-splash bg-greenmedia-seagreen">
				<img className="hummingbird" src="/img/green/hummingbird.png" />
				<div className="splash-circle">
					<div className="branding">{branding.logo ? <img src={branding.logo} alt="brand logo" /> : JSON.stringify(branding)}</div>
					<div className="big-number tonnes">{co2} TONNES</div>
					carbon offset
					<div className="big-number trees">{trees}</div>
					trees<br/>
					<div className="carbon-neutral-container">
						with <img className="carbon-neutral-logo" src="/img/green/gl-carbon-neutral.svg" />
					</div>
					<a className="btn splash-explore" onClick={scrollToMap}>EXPLORE OUR IMPACT</a>
				</div>
			</div>
			<div className="mission py-4">
				<Container>
					<h2 className="mb-4">HELPING BRANDS GO GREEN WITH GOOD-LOOP</h2>
					<p className="leader-text mb-4">The internet has a larger carbon footprint than the entire airline industry, and digital media is fuelling this. But we’re here to help.</p>
					<p className="leader-text">Thanks to our green media products that help measure, offset and improve the carbon footprint of digital advertising, we’re helping the industry make changes to become carbon negative.</p>
				</Container>
			</div>

			<GreenMap />
			
			<div className="partnerships py-4">
				<h2>CLIMATE POSITITIVE PARTNERSHIPS</h2>
				<Container>
					<Row className="logos py-4">
					<Col xs="12" sm="6">
							<img className="logo ecologi-logo" src="/img/green/ecologi-logo.svg" />
						</Col>
						<Col xs="12" sm="6">
							<img className="logo eden-logo" src="/img/green/eden-projects-logo.svg" />
						</Col>
					</Row>
					<Row className="partnership carbon no-gutters mb-4">
						<Col className="partner-image" xs="12" sm="6">
							<img src="/img/green/ecologi-wind-farm-thailand.jpg" />
						</Col>
						<Col className="partner-text p-4" xs="12" sm="6">
							<h2>OFFSETTING CARBON</h2>
							<p>We help brands measure their digital campaign’s carbon costs in real time and see how they can reduce their footprint with our exciting new Green Ad Tag.</p>
						</Col>
					</Row>
					<Row className="partnership trees no-gutters">
						<Col className="partner-text p-4" xs="12" sm="6">
							<h2>PLANTING TREES</h2>
							<p>Our Green Media products plant trees via Eden Reforestation Projects where reforestation has a positive and long-lasting environmental and socio-economic impact.</p>
						</Col>
						<Col className="partner-image" xs="12" sm="6">
							<img src="/img/green/eden-planting-mozambique.jpg" />
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
};

export default GreenLanding;
