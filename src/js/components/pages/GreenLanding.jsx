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
import { Mass } from './greendash/GreenDashUtils';
import GreenMap from './greendash/GreenMap';
import Impact from '../../base/data/Impact';
import { isTester } from '../../base/Roles';
import LinkOut from '../../base/components/LinkOut';
import ServerIO from '../../plumbing/ServerIO';
import DataItemBadge from '../../base/components/DataItemBadge';
import Login from '../../base/youagain';
import printer from '../../base/utils/printer';
import { getOffsetsByType, getCampaignsOffsetsByType } from './greendash/emissionscalcTs';
import Advertiser from '../../base/data/Advertiser';
import { getCarbon } from './greendash/emissionscalcTs';
import { TONNES_THRESHOLD } from './greendash/dashUtils';
import Agency from '../../base/data/Agency';
import DevOnly from '../../base/components/DevOnly';

// TODO Design! and Content!
// Latest Layout Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516138790976&cot=14
// Visual Design: https://miro.com/app/board/o9J_lncRn5E=/ (note: some layout changes above)
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing

const GreenLanding = ({ }) => {
	// like CampaignPage, this would prefer to run by a campaign id -- which should be the Brand's master campaign
	const path = DataStore.getValue("location", "path");
	
	const status = DataStore.getUrlValue("status") || DataStore.getUrlValue("gl.status") || KStatus.PUBLISHED;
	
	const brandId = DataStore.getUrlValue('brand');
	const agencyId = DataStore.getUrlValue('agency')
	const defaultId = Campaign.TOTAL_IMPACT;

	let itemId;
	let type;
	let pvCampaigns;
	if(brandId) {
		itemId = brandId;
		type = C.TYPES.Advertiser;
		pvCampaigns = Campaign.fetchForAdvertiser(itemId, KStatus.PUBLISHED);
	}
	else if(agencyId) {
		itemId = agencyId;
		type = C.TYPES.Agency;
		pvCampaigns = Campaign.fetchForAgency(itemId, KStatus.PUBLISHED)
	} else {
		itemId = defaultId;
		type = C.TYPES.Campaign;
		pvCampaigns = Campaign.fetchForAdvertiser(itemId, KStatus.PUBLISHED);
	}
	let pvItem = getDataItem({type, id:itemId, status:KStatus.PUB_OR_DRAFT, swallow: true});

	const end = new Date();
	end.setHours(end.getHours(), 0, 0, 0); // avoid thrashing with an ever changing date
	let period = {start:new Date(2000,1,1), end};

	return <div className="GreenLandingPage widepage">
		<GreenLanding2 pvItem={pvItem} itemId={itemId} status={status} pvCampaigns={pvCampaigns} period={period} type={type}/>
	</div>;
};

const GreenLanding2 = ({pvItem, itemId, status, period, pvCampaigns, type}) => {

	if (!pvCampaigns.value || !pvItem.value) return <Misc.Loading text="Fetching campaigns..."/>
	
	const campaigns = List.hits(pvCampaigns.value);
	// getCarbon over all campaigns returns a different value from getOffsetsByType, while this is the case just use getCarbon since it's far
	// faster + is what greendash uses normally.
	const pvChartData = getCarbon({
		start: "1970-01-01T00:00:00.000Z",
		end: "3000-01-01T00:00:00.000Z",
		// campaigns to 'campaign:id#1 OR campaign: id#2 OR ...'
		q:campaigns.reduce((query, curCamp, index) => {
			query += curCamp.id;;
			if(index !== campaigns.length - 1) query += " OR campaign:";
			return query;
		}, "campaign:"),
		breakdown: [
			// 'total',
			'adid{"countco2":"sum"}',
			// 'os{"emissions":"sum"}',
			// 'domain{"emissions":"sum"}',
			// 'campaign{"emissions":"sum"}', do campaign breakdowns later with more security logic
		],
		name: 'lotsa-chartdata',
	});
	if(!pvChartData.value) return <Misc.Loading text="Fetching carbon data..."/>
	let co2ChartData = pvChartData.value.by_adid.buckets 
	let totalCo2 = co2ChartData.reduce((sum, cur) => {
		return sum + cur.co2
	}, 0)

	// agencies are currently unfeasible to get the offsets for. The 1-N relationships of Agency -> Brand -> Campaign -> Impacts quickly explodes and takes far too long to return.
	// HACK: the logic is all there for this to work when the offsets can be found, so until then if it's an agency we just hide the values
	let offsets4type = (type === C.TYPES.Agency) ? getCampaignsOffsetsByType({campaigns: [campaigns[0]], status, period}) : getCampaignsOffsetsByType({ campaigns, status, period});

	// Green Ad Tags carry t=pixel d=green campaign=X adid=Y
	// Pixel etc views
	// Where are these??
	// Originally: https://lg.good-loop.com/data?q=&start=2021-10-01&end=now&dataspace=trk&evt=pxl_green
	// and https://lg.good-loop.com/data?q=&start=2021-10-01&end=now&dataspace=gl&evt=pxl_green
	// New activity (2022+) will go into its own d=green dataspace with evt=pixel|redirect|?
	// let q = cid && cid !== "TOTAL_IMPACT"? "campaign:"+cid : ""; // everything?
	// let pvData = getDataLogData({q,dataspace:"green",start:"2021-10-01",breakdowns:[]});

	// TODO Fetch dntnblock info
	let isLoading = offsets4type.isLoading;
	let pvAllCampaigns = offsets4type.pvAllCampaigns;
	// load the charities
	const carbonOffsets = offsets4type.carbon || [];
	let co2 = totalCo2 || offsets4type.carbonTotal;
	const carbonCharityIds = uniq(carbonOffsets.map(offset => offset?.charity));
	let carbonCharities = carbonCharityIds.map(cid => getDataItem({ type: "NGO", id: cid, status: KStatus.PUBLISHED }).value).filter(x => x);
	let trees = offsets4type.treesTotal;

	// Branding
	// NB: copy pasta + edits from CampaignPage.jsx
	const pvBrandItem = (type && itemId) ? getDataItem({ type, id:itemId, status: KStatus.PUB_OR_DRAFT }) : {};
	if(!pvBrandItem.resolved) return <Misc.Loading text="Fetching brand information..."/>
	let brandItem = pvBrandItem.value;
	let branding = brandItem.branding;
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

	
	let pvShare = DataStore.fetch(['misc', 'share', itemId], () => Login.checkShare((type === C.TYPES.Advertiser ? "Advertiser:" : "Agency:")+ itemId));
	let isShared = (pvShare.value && pvShare.value.read) 
	console.warn("share", pvShare);
	
	return (<>
		<div className="landing-splash bg-greenmedia-seagreen">
			<img className="hummingbird" src="/img/green/hummingbird.png" />
			<div className="splash-circle">
				<div className="branding">{branding?.logo ? <img src={branding.logo} alt="brand logo" /> : name}</div>
				{!!co2 && <><div className="big-number tonnes"><Mass kg={co2} /></div> carbon offset</>}
				{type !== C.TYPES.Agency && <DevOnly>{!!co2 && <><div className="big-number tonnes"><Mass kg={offsets4type.carbonTotal} /></div> offsets4type carbon</>}</DevOnly>}
				{!!trees && <DevOnly><><div className="big-number trees">{printer.prettyInt(trees)}</div> trees</></DevOnly>}
				{isLoading && <Misc.Loading text="Fetching data..."/>}
				<div className="carbon-neutral-container">
					with <img className="carbon-neutral-logo" src="/img/green/gl-carbon-neutral.svg" />
				</div>
				<a className="btn splash-explore" onClick={scrollToMap}>EXPLORE OUR IMPACT</a>
				{(isShared || isTester()) && <a href={`/greendash/metrics/${type.toLowerCase()}/?period=all&${type.toLowerCase()}=` + encURI(itemId)} className="btn splash-explore mt-2">📊 REPORT DASHBOARD</a>}
			</div>
		</div>
		{isTester() && pvAllCampaigns.value && // handy links for GL staff
			<div>{campaigns.map(campaign =>
				<LinkOut key={campaign.id} href={ServerIO.PORTAL_ENDPOINT + '/#campaign/' + encURI(campaign.id)}>
					<Badge className="mr-2">{campaign.name || campaign.id}</Badge>
				</LinkOut>
			)}</div>
		}
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
