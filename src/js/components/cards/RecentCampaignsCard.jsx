import React from 'react';
import { Col, Row } from 'reactstrap';

import { space } from '../../base/utils/miscutils';
import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../base/plumbing/DataStore';
import C from '../../C';
import SearchQuery from '../../base/searchquery';
import KStatus from '../../base/data/KStatus';
import Money from '../../base/data/Money';
import NGO from '../../base/data/NGO';

import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import Counter from '../../base/components/Counter';
import Campaign from '../../base/data/Campaign';
import { getDataItem } from '../../base/plumbing/Crud';

// TODO fetch data from portal instead of hard-coding
// HACK: an ad-hoc data format {name, adid, url: relative url to campaign page, ad:first Advert, dntn: Money}
const campaignInfos = [
	{
		name: "LEVI'S",
		adid: "ko3s6fUOdq",
		url: "/campaign/?gl.vertiser=XR67PcGn",
		vertiser:"XR67PcGn",
		title: "LEVI's advert"
	},
	{
		name: "Ribena",
		adid: "B1lF97utxD",
		url: "/campaign/?gl.vertiser=FBY5QmWQ",
		vertiser:"FBY5QmWQ",
		title: "Ribena advert"
	},
	{
		name: "Mango",
		adid: "ojjiPf7kbB",
		url: "/campaign/?gl.vertiser=1JBFB6K4",
		vertiser:"1JBFB6K4",
		title: "Mango advert"
	},
	// {
	// 	name: "Cadbury",
	// 	adid: "qgbiSQ0crN",
	// 	url: "/campaign/?gl.vertiser=cadbury_bpngtolk",
	// 	vertiser:"cadbury_bpngtolk",
	// 	title: "Cadbury advert"
	// },
	{
		name: "Pantene",
		adid: "hwtjNncj",
		url: "/campaign/?gl.vertiser=zqhRrBjF",
		vertiser:"zqhRrBjF",
		title: "Pantene advert"
	}
	// Update in April 2022:
	// {
	// 	name: "MINI", 
	// 	adid: "ofPtTdAX",
	// 	url: "/campaign/?gl.vert=ofPtTdAX",
	// 	vertiser:"UFZpmeFm",
	// 	title: "MINI advert"
	// }, 
	// {
	// 	name: "Pepsi",
	// 	adid: "81RhZgys",
	// 	url: "/campaign/?gl.vert=81RhZgys",
	// 	vertiser:"rB6PkFMq",
	// 	title: "Pepsi advert"
	// },
	// {
	// 	name: "Pantene",
	// 	adid: "c22dk9HT",
	// 	url: "/campaign/?gl.vert=c22dk9HT",
	// 	vertiser:"zqhRrBjF",
	// 	title: "Pantene advert"
	// },
	// // {
	// // 	name: "Nespresso",
	// // 	adid: "IDRfNfi4",
	// // 	url: "/campaign/?gl.vert=IDRfNfi4",
	// // 	vertiser:"q44DhUNr",
	// // 	title: "Nespresso advert"
	// // },
	// {
	// 	name: "McDonald's",
	// 	adid: "zCUu18emxs",
	// 	url: "/campaign/?gl.vert=zCUu18emxs",
	// 	vertiser:"BsC3RmHz",
	// 	title: "McDonald's advert"
	// }
];


const RecentCampaignsCard = () => {
	const status = DataStore.getUrlValue("status") || KStatus.PUBLISHED;

	// add dntn info
	campaignInfos.forEach(campaignInfo => {
		// Which advert(s)?
		const sq = adsQuery({ adid: campaignInfo.adid });
		let pvAds = fetchAds({ searchQuery: sq, status });
		if ( ! pvAds) {
			return;
		}
		if ( ! pvAds.resolved) {
			return;
		}
		if (pvAds.error) {
			return;
		}
		// If it's remotely possible to have an ad now, we have it. Which request succeeded, if any?
		let adHits = pvAds.value.hits;
		if ( ! adHits || ! adHits.length) {
			return;
		}
		campaignInfo.ad = adHits[0];
		// fetch campaign dntn
		if ( ! campaignInfo.campaign) {
			let pvAdvertiser = getDataItem({type:"Advertiser",id:campaignInfo.vertiser,status});
			if (pvAdvertiser.value) {
				campaignInfo.campaign = pvAdvertiser.value.campaign;
			}
		}
		if (campaignInfo.campaign) {
			let pvCampaign = getDataItem({type:"Campaign",id:campaignInfo.campaign,status});
			if (pvCampaign.value) {
				let ttl = Campaign.dntn(pvCampaign.value);
				campaignInfo.dntn = ttl;
			}
		}
	});

	return (
		<div id="campaign-cards">
			{campaignInfos.map(({dntn, adid, url, name, title}, i) => (<Row className="campaign mb-5" key={i}>
				<TVAdPlayer adid={adid} className="col-md-6" title={title}/>
				<Col md={6} className="flex-column align-items-center text-center justify-content-center pt-3 pt-md-0">
					<h3 className="mb-0">This ad raised {dntn ? <Counter currencySymbol="£" sigFigs={4} amount={dntn} minimumFractionDigits={2} preservePennies /> : "money"}</h3>
					<C.A className="btn btn-primary mt-3 mx-3" href={url}>Discover How</C.A>
				</Col>
			</Row>))}
		</div>
	);
};

const TVAdPlayer = ({adid, className, title}) => {
	const size = "landscape";	
	return <div className={space("position-relative", className)}>
		{/* why the two img tags?? Couldn't a background image and padding be used? */}
		<img src="/img/LandingBackground/iphone-mockup-landscape.svg" className="w-100 invisible"/>
		<img src="/img/LandingBackground/iphone-mockup-landscape.svg" className="position-absolute d-none d-md-block unit-shadow" style={{ left: "49.7%", width: "91.5%", top: "55%", zIndex: 2, pointerEvents: "none", transform: "translate(-50%, -50%)" }}/>
		<div className="position-absolute tv-ad-player">
			<GoodLoopUnit vertId={adid} size={size} title={title} useScreenshot="landscape" />
		</div>
	</div>;
};


///////////////////////////////////////////////////////////////////////////////
// The following is ripped code from CampaignPage.jsx trimmed for purpose
// TODO: collect all this into a shared data utils js file
///////////////////////////////////////////////////////////////////////////////

/**
 * @returns {!SearchQuery}
 */
const adsQuery = ({ q, adid, vertiserid, via }) => {
	let sq = new SearchQuery(q);
	// NB: convert url parameters into a backend ES query against the Advert.java object
	if (adid) sq = SearchQuery.setProp(sq, 'id', adid);
	if (vertiserid) sq = SearchQuery.setProp(sq, 'vertiser', vertiserid);
	if (via) sq = SearchQuery.setProp(sq, 'via', via);
	return sq;
};

const isAll = () => {
	const slug = DataStore.getValue('location', 'path', 1);
	return slug === 'all';
};

/**
 * 
 * @returns { ? PV<Advert[]>} null if no query
 */
const fetchAds = ({ searchQuery, status }) => {
	let q = searchQuery.query;
	if ( ! q && ! isAll()) {
		return null;
	}
	// TODO server side support to do this cleaner "give me published if possible, failing that archived, failing that draft"
	// Try to get ads based on spec given in URL params
	let pvAds = ActionMan.list({ type: C.TYPES.Advert, status, q });
	// HACK No published ads? fall back to ALL_BAR_TRASH if requested ad is draft-only
	if (pvAds.resolved && (!pvAds.value || !pvAds.value.hits || !pvAds.value.hits.length)) {
		let pvAdsDraft = ActionMan.list({ type: C.TYPES.Advert, status: C.KStatus.ALL_BAR_TRASH, q });
		console.warn(`Unable to find ad ${q} with status ${status}, falling back to ALL_BAR_TRASH`);
		return pvAdsDraft;
	}
	return pvAds;
};


export default RecentCampaignsCard;
