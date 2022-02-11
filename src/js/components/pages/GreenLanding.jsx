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




// TODO Design! and Content!
// Latest Layout Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516138790976&cot=14
// Visual Design: https://miro.com/app/board/o9J_lncRn5E=/ (note: some layout changes above)
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing

// Coefficients for Robinson projection (premultiplied to output percentages for positioning our map markers)
const robinsonX = [100, 99.86, 99.53999999999999, 99, 98.22, 97.3, 96, 94.27, 92.16, 89.62, 86.79, 83.5, 79.86, 75.97, 71.86, 67.32000000000001, 62.129999999999995, 57.220000000000006, 53.22];
const robinsonY = [-0, -3.1, -6.2, -9.3, -12.4, -15.5, -18.6, -21.7, -24.79, -27.855, -30.880000000000003, -33.845, -36.730000000000004, -39.515, -42.175000000000004, -44.68, -46.97, -48.805, -50];

/**
 * Turn lat/long in degrees into [x, y] in percent from international date line and north pole
 * Following https://en.wikipedia.org/wiki/Robinson_projection (but with linear interpolation because lazy)
 */
const toRobinson = (lat, long) => {
	const latIndex = Math.abs(lat) / 5;
	const beforeIndex = Math.floor(latIndex);
	const afterIndex = Math.ceil(latIndex);
	const interpFactor = latIndex - beforeIndex;
	const X1 = robinsonX[beforeIndex];
	const X2 = robinsonX[afterIndex];
	const X = X1 + ((X2 - X1) * interpFactor);
	const Y1 = robinsonY[beforeIndex];
	const Y2 = robinsonY[afterIndex];
	const Y = Math.sign(lat) * (Y1 + ((Y2 - Y1) * interpFactor));

	return [
		(X * long / 360) + 50,
		Y + 50
	]
};

window.toRobinson = toRobinson;


const mapProjects = [
	{
		placeName: 'Kenya',
		desc: 'Reforestation projects in Kenya',
		img: '/img/green/edi-office.jpg',
		marker: '/img/green/marker-tree.svg',
		arrow: 'bottom-right',
		lat: 0.45,
		long: 38.14,
	},
	{
		placeName: 'Mozambique',
		desc: 'Reforestation projects in Mozambique',
		img: '/img/green/rainforest.jpg',
		marker: '/img/green/marker-tree.svg',
		arrow: 'right',
		lat: -17.58,
		long: 35.54,
	},
	{
		placeName: 'Madagascar',
		desc: 'Reforestation projects in Madagascar',
		img: '/img/green/ocean-floor.jpg',
		marker: '/img/green/marker-tree.svg',
		arrow: 'top-right',
		lat: -19.43,
		long: 46.57,
	}
];

const ProjectMarker = ({project, active, setActive, index}) => {
	const coords = toRobinson(project.lat, project.long);
	const style = {left: `${coords[0]}%`, top: `${coords[1]}%`};
	
	return <>
		<a className={space('project-marker', `arrow-${project.arrow}`, active && 'active')} style={style} onClick={() => setActive(index)}>
			<img className="photo" src={project.img} />
			<div className="desc">{project.desc}</div>
			<svg viewBox="0 0 10 10" className="pointer pointer-top-left">
				<path d="M 0,10 H 10 L 5,0 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-top-right">
				<path d="M 0,10 H 10 L 5,0 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-right">
				<path d="M 0,0 V 10 L 10,5 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-bottom-right">
				<path d="M 0,0 H 10 L 5,10 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-bottom-left">
				<path d="M 0,0 H 10 L 5,10 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-left">
				<path d="M 10,0 V 10 L 0,5 Z" />
			</svg>
		</a>
		<a className={space('project-marker-mobile', active && 'active')} style={style} onClick={() => setActive(index)}>
			<img src="/img/green/tree.svg" />
		</a>
	</>;
};



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
			// const prop = type.toLowerCase();
			// let nprops = { // advertiser link and logo			
			// 	brandLink:'/impact/'+prop+'='+encURI(getId(brandItem))+".html",
			// 	brandLogo: brandItem.branding && (brandItem.branding.logo_white || brandItem.branding.logo),
			// 	brandName: brandItem.name || getId(brandItem)
			// };
			setNavProps(brandItem);
		}
	}

	// Projects map (mobile) - clicking a map dot should highlight it and the description 
	const [activeProject, setActiveProject] = useState(0);

	// TODO Mobile view should have pin markers only + list of descriptions below
	const projectMarkers = mapProjects.map((project, index) => (
		<ProjectMarker project={project} active={activeProject === index} index={index} setActive={setActiveProject} />
	));

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
			<div className="mission pb-1">
				<Container>
					<h2>HELPING BRANDS GO GREEN WITH GOOD-LOOP</h2>
					<p className='leader-text'>The internet has a larger carbon footprint than the entire airline industry, and digital media is fuelling this. But we’re here to help.</p>
					<p className='leader-text'>Thanks to our green media products that help measure, offset and improve the carbon footprint of digital advertising, we’re helping the industry make changes to become carbon negative.</p>
				</Container>
			</div>

			<div className="projects-map">
				{/* TODO Transition curves should SOMEWHAT overlap the map image*/}
				<svg className="map-transition map-transition-top" viewBox="0 0 2560 400" version="1.1" xmlns="http://www.w3.org/2000/svg">
  				<path d="M 0,0 V 324 C 1010.1193,660.09803 1815.6015,-393.13264 2560,192 V 0 Z" />
				</svg>
				<div className="map-markers">
					<img className="map-graphic" src="/img/green/world-map.svg" />
					{projectMarkers}
				</div>
				<svg className="map-transition map-transition-bottom" viewBox="0 0 2560 310" version="1.1" xmlns="http://www.w3.org/2000/svg">
  				<path d="M 0,0 V 310 H 2560 V 34 C 1938.7303,249.1461 1390.9943,536.0566 0,0 Z" />
				</svg>
			</div>
			<div className="project-descriptions-mobile bg-greenmedia-darkcyan">
				{projectMarkers}
			</div>
			<div className="landing-extra pb-1">
				<Container>
					<Row>
						<Col xs="12" sm="6">
							<img src="" />
						</Col>
						<Col xs="12" sm="6">
							<h2>OFFSETTING CARBON</h2>
							<p>We help brands measure their digital campaign’s carbon costs in real time and see how they can reduce their footprint with our exciting new Green Ad Tag.</p>
						</Col>
					</Row>
				</Container>
				<Container>
					<Row>
						<Col xs="12" sm="6">
							<h2>PLANTING TREES</h2>
							<p>Our Green Media products plant trees via Eden Reforestation Projects where reforestation has a positive and long-lasting environmental and socio-economic impact.</p>
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
};

export default GreenLanding;
