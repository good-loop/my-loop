import React from 'react';
import { Container } from 'reactstrap';
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
		placeName: 'Edinburgh',
		desc: 'Weirdo sanctuary in Scotland',
		img: '/img/green/edi-office.jpg',
		lat: 55.95,
		long: -3.19,
	},
	{
		placeName: 'Brazil',
		desc: 'Rainforest protection in Brazil',
		img: '/img/green/rainforest.jpg',
		lat: -7.13,
		long: -52.05,
	},
	{
		placeName: 'Indian Ocean',
		desc: 'Classified activities at INDIAN OCEAN FLOOR SITE 2',
		img: '/img/green/ocean-floor.jpg',
		lat: -15.25,
		long: 80.18,
	}
];



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

	// TODO Mobile view should have pin markers only + list of descriptions below
	const projectMarkers = mapProjects.map(project => {
		const coords = toRobinson(project.lat, project.long);
		const style = {left: `calc(${coords[0] - 1}% - 14em)`, top: `calc(${coords[1] - 4}% - 8em)`};
		
		return (
			<div className="project-marker" style={style}>
				<img className="photo" src={project.img} />
				<div className="desc">{project.desc}</div>
				<svg viewBox="0 0 10 10" className="pointer">
					<path d="M 0,0 H 10 L 5,10 Z" />
				</svg>
			</div>
		)
	});

	// "Explore Our Impact" button scrolls to the map
	const scrollToMap = () => {
		document.querySelectorAll('.projects-map')[0].scrollIntoView({block: 'start', behavior: 'smooth'});
	};

	return (
		<div className="GreenLandingPage widepage">
			<div className="landing-splash">
				<img className="hummingbird" src="/img/green/hummingbird.png" />
				<div className="splash-circle">
					<div className="branding">{branding.logo ? <img src={branding.logo} alt="brand logo" /> : JSON.stringify(branding)}</div>
					<div className="big-number tonnes">{co2}  TONNES</div>
					carbon offset
					<div className="big-number trees">{trees}</div>
					trees planted<br/>
					<div className="carbon-neutral-container">
						with <img className="carbon-neutral-logo" src="/img/green/gl-carbon-neutral.svg" />
					</div>
					<a className="btn splash-explore" onClick={scrollToMap}>EXPLORE OUR IMPACT</a>
				</div>
			</div>
			<div className="mission pb-1">
				<Container>
					<h2>CARBON NEUTRAL ADVERTISING</h2>
					<p>Text about Good-Loop's mission to make advertising carbon neutral and climate positive</p>
					<p>Mention of certified carbon offsets; global NGO projects</p>
				</Container>
			</div>

			<div className="projects-map">
				{/* TODO Transition curves should SOMEWHAT overlap the map image*/}
				<img className="map-transition" src="/img/green/map-transition-top.svg" />
				<div className="map-markers">
					<img className="map-graphic" src="/img/green/world-map.svg" />
					{projectMarkers}
				</div>
				<img className="map-transition" src="/img/green/map-transition-bottom.svg" />
			</div>
			<div className="landing-extra pb-1">
				<Container>
					<h2>OPPORTUNITY FOR FURTHER INFO</h2>
					<p>Info about the small print, link to further info...</p>
					<p>More information or stories related to impact of projects</p>
				</Container>
			</div>

			<div className="landing-behind-footer" />
		</div>
	);
};

export default GreenLanding;
