import React, { useState } from 'react';
import _ from 'lodash';
import { Alert, Badge, Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import { setNavProps } from '../../base/components/NavBar';
import Campaign from '../../base/data/Campaign';
import { getId, getType } from '../../base/data/DataClass';
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import { getDataItem } from '../../base/plumbing/Crud';
import { getDataLogData } from '../../base/plumbing/DataLog';
import DataStore, { getPath } from '../../base/plumbing/DataStore';
import { encURI, space, uniq, yessy } from '../../base/utils/miscutils';
import C from '../../C';
import { Mass } from './greendash/dashutils';
import GreenMap from './greendash/GreenMap';
import Impact from '../../base/data/Impact';
import { isTester } from '../../base/Roles';
import LinkOut from '../../base/components/LinkOut';
import ServerIO from '../../plumbing/ServerIO';
import DataItemBadge from '../../base/components/DataItemBadge';
import Login from '../../base/youagain';
import printer from '../../base/utils/printer';
import { getOffsetsByTypeEmissions } from './greendash/emissionscalc';


// TODO Design! and Content!
// Latest Layout Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516138790976&cot=14
// Visual Design: https://miro.com/app/board/o9J_lncRn5E=/ (note: some layout changes above)
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing

const GreenLanding = ({ }) => {
	// like CampaignPage, this would prefer to run by a campaign id -- which should be the Brand's master campaign
	const path = DataStore.getValue("location", "path");
	const status = DataStore.getUrlValue("status") || DataStore.getUrlValue("gl.status") || KStatus.PUBLISHED;
	let cid = path[1];
	if (!cid) {
		// fetch the master campaign for ...?
		let pvItem = null;
		let brandId = DataStore.getUrlValue('brand');
		if (brandId) {
			pvItem = getDataItem({ type: C.TYPES.Advertiser, id: brandId, status, swallow: true });
		} else if (DataStore.getUrlValue('agency')) {
			pvItem = getDataItem({ type: C.TYPES.Agency, id: DataStore.getUrlValue('agency'), status, swallow: true });
		}
		if (pvItem?.value) {
			cid = pvItem.value.campaign;
			if (!cid) {
				return (<div className="GreenLandingPage widepage">
					<div className="landing-splash bg-greenmedia-seagreen">
						<img className="hummingbird" src="/img/green/hummingbird.png" />
						<div className="splash-circle">
							<Alert color="info">This brand does not have its overview page setup yet.
								Please contact support@good-loop.com with the code: <code>{pvItem.value.id}</code></Alert>
						</div>
					</div>
				</div>
				);
			}
			// assert(cid, "No campaign for "+getType(pvItem.value)+" "+pvItem.value.id, pvItem.value);
		}
		if (!cid && !pvItem) {
			cid = Campaign.TOTAL_IMPACT; // TODO not whilst loading; oh well
		}
	}

	return <div className="GreenLandingPage widepage">
		{cid? <GreenLanding2 cid={cid} status={status} /> : "TODO"}
	</div>;
};


const GreenLanding2 = ({cid, status}) => {
	const end = new Date();
	end.setHours(end.getHours(), 0, 0, 0); // avoid thrashing with an ever changing date
	let period = {start:new Date(2022,1,1), end};
	const pvCampaign = getDataItem({ type: C.TYPES.Campaign, id: cid, status });
	const isTotal = cid === Campaign.TOTAL_IMPACT;

	// Green Ad Tags carry t=pixel d=green campaign=X adid=Y
	// Pixel etc views
	// Where are these??
	// Originally: https://lg.good-loop.com/data?q=&start=2021-10-01&end=now&dataspace=trk&evt=pxl_green
	// and https://lg.good-loop.com/data?q=&start=2021-10-01&end=now&dataspace=gl&evt=pxl_green
	// New activity (2022+) will go into its own d=green dataspace with evt=pixel|redirect|?
	// let q = cid && cid !== "TOTAL_IMPACT"? "campaign:"+cid : ""; // everything?
	// let pvData = getDataLogData({q,dataspace:"green",start:"2021-10-01",breakdowns:[]});

	// TODO Fetch dntnblock info

	if (!pvCampaign.value) {
		return <Misc.Loading />
	}
	const campaign = pvCampaign.value;	

	let offsets4type = getOffsetsByTypeEmissions({ campaign, status, period});
	let isLoading = offsets4type.isLoading;
	let pvAllCampaigns = offsets4type.pvAllCampaigns;
	// load the charities
	const carbonOffsets = offsets4type.carbon || [];
	let co2 = offsets4type.carbonTotal;
	const carbonCharityIds = uniq(carbonOffsets.map(offset => offset?.charity));
	let carbonCharities = carbonCharityIds.map(cid => getDataItem({ type: "NGO", id: cid, status: KStatus.PUBLISHED }).value).filter(x => x);

	let trees = offsets4type.treesTotal;

	// Branding
	// NB: copy pasta + edits from CampaignPage.jsx
	let { type, id } = Campaign.masterFor(campaign);
	const pvBrandItem = (type && id) ? getDataItem({ type, id, status: KStatus.PUB_OR_DRAFT }) : {};
	let brandItem = pvBrandItem.value;
	let branding = Object.assign({}, campaign.branding, brandItem ? brandItem.branding : {});
	let name = brandItem ? brandItem.name : campaign.name;
	// set NavBar brand
	if (brandItem) {
		setNavProps(brandItem);
	}

	// "Explore Our Impact" button scrolls to the next section
	const scrollToMap = () => {
		// Can't just use element.scrollTo() because the navbar will cover the top...
		const targetEl = document.querySelector('.GreenLandingPage .mission');
		const navbar = document.querySelector('nav.navbar');
		const targetY = targetEl.getBoundingClientRect().top + navbar.offsetHeight + window.scrollY;
		window.scrollTo({ top: targetY, behavior: 'smooth' });
	};

	let pvShare = DataStore.fetch(['misc', 'share', campaign.id], () => Login.checkShare("Campaign:" + campaign.id));
	let pvShare2 = DataStore.fetch(['misc', 'share', campaign.id], () => Login.checkShare("Advertiser:" + campaign.vertiser));
	let isShared = (pvShare.value && pvShare.value.read) || (pvShare2.value && pvShare2.value.read)
	console.warn("share", pvShare, pvShare2);

	return (<>
		<div className="landing-splash bg-greenmedia-seagreen">
			<img className="hummingbird" src="/img/green/hummingbird.png" />
			<div className="splash-circle">
				<div className="branding">{branding.logo ? <img src={branding.logo} alt="brand logo" /> : name}</div>
				{!!co2 && <><div className="big-number tonnes"><Mass kg={co2} /></div> carbon offset</>}
				{!!trees && <><div className="big-number trees">{printer.prettyInt(trees)}</div> trees</>}
				{isLoading && <Misc.Loading />}
				<div className="carbon-neutral-container">
					with <img className="carbon-neutral-logo" src="/img/green/gl-carbon-neutral.svg" />
				</div>
				<a className="btn splash-explore" onClick={scrollToMap}>EXPLORE OUR IMPACT</a>
				{(isShared || isTester()) &&
					<a href={"/greendash/metrics?period=all&campaign=" + encURI(campaign.id)} className="btn splash-explore mt-2">📊 REPORT DASHBOARD</a>}
				{isTester() && pvAllCampaigns.value && // handy links for GL staff
					<div>{List.hits(pvAllCampaigns.value).map(campaign =>
						<LinkOut key={campaign.id} href={ServerIO.PORTAL_ENDPOINT + '/#campaign/' + encURI(campaign.id)}>
							<Badge className='mr-2'>{campaign.name || campaign.id}</Badge>
						</LinkOut>
					)}</div>
				}
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
			<h2>CLIMATE POSITIVE PARTNERSHIPS</h2>
			<Container>
				<Row className="logos py-4">
					<Col xs="12" sm="6">
						<img className="logo ecologi-logo" src="/img/green/gold-standard-logo.png" />
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
						<p>We help brands measure their digital campaign's carbon costs
							and see how they can reduce their footprint with our exciting new Green Ad Tag.</p>
						{yessy(carbonOffsets) && <div>Offsets provided by:
							{carbonCharities.map((ngo, i) => <DataItemBadge className="mr-2" item={ngo} key={getId(ngo)} />)}
						</div>}
					</Col>
				</Row>
				<Row className="partnership no-gutters">
					<Col className="partner-text p-4" xs="12" sm="6">
						<h2>PLANTING TREES</h2>
						<p>Our Green Media products plant trees via Eden Reforestation projects
							where reforestation has a positive and long-lasting environmental and socio-economic impact.</p>
					</Col>
					<Col className="partner-image" xs="12" sm="6">
						<img src="/img/green/eden-planting-mozambique.jpg" />
					</Col>
				</Row>
			</Container>
		</div>
	</>
	);
};

export default GreenLanding;
