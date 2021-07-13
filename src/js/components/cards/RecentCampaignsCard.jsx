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


const RecentCampaignsCard = () => {
	// TODO fetch data from portal
	// HACK: an ad-hoc data format {name, adid, url: relative url to campaign page, ad:first Advert, dntn: ??}
	const campaignInfos = [
		{
			name: "LEVI'S",
			adid: "ko3s6fUOdq",
			url: "/#campaign/?gl.vertiser=XR67PcGn"
		},
		{
			name: "Ribena",
			adid: "B1lF97utxD",
			url: "/#campaign/?gl.vertiser=FBY5QmWQ"
		},
		// {
		// 	name: "Nike",
		// 	adid: "2qQIRm9u5Q",
		// 	url: "/#campaign?gl.vertiser=TNXHvb5j"
		// },
		// {
		// 	name: "Reebok",
		// 	adid: "HtREj0pifC",
		// 	url: "/#campaign/?gl.vertiser=KpgM78Lg"
		// },
		{
			name: "Mango",
			adid: "ojjiPf7kbB",
			url: "/#campaign/?gl.vertiser=1JBFB6K4"
		},
		{
			name: "Cadbury",
			adid: "qgbiSQ0crN",
			url: "/#campaign/?gl.vertiser=cadbury_bpngtolk"
		},
		{
			name: "Pantene",
			adid: "hwtjNncj",
			url: "/#campaign/?gl.vertiser=zqhRrBjF"
		}
	];
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
		console.log(campaignInfo.ad);
		if (!campaignInfo.ad.id) console.warn("No id!");

		let campaignDonationForCharity = NGO.fetchDonationData({ads: adHits, status, totalOnly:true});
		let ttl = campaignDonationForCharity.total;
		if ( ! Money.value(ttl)) {
			console.log("DEBUG ZERO!", campaignInfo, campaignDonationForCharity);
			return;
		}
		campaignInfo.dntn = ttl;
		console.log("DEBUG", campaignInfo, campaignDonationForCharity);
	});

	return (
		<div id="campaign-cards">
			{campaignInfos.map(({dntn, adid, url, name}, i) => (<Row className="campaign mb-5" key={i}>
				<TVAdPlayer adid={adid} className="col-md-6"/>
				<Col md={6} className="flex-column align-items-center text-center justify-content-center pt-3 pt-md-0">
					<h3 className="mb-0">This ad raised {dntn ? <Counter currencySymbol="£" sigFigs={4} amount={dntn} minimumFractionDigits={2} preservePennies /> : "money"}</h3>
					<a className="btn btn-primary mt-3" href={url}>Find out more</a>
				</Col>
			</Row>))}
		</div>
	);
};

const TVAdPlayer = ({adid, className}) => {
	const size = "landscape";
	return <div className={space("position-relative", className)}>
		<img src="/img/LandingBackground/white_iphone.png" className="w-100 invisible"/>
		{/*<img src="/img/redcurve.svg" className="position-absolute tv-ad-player" style={{height: "80%"}} />*/}
		<img src="/img/LandingBackground/white_iphone.png" className="position-absolute d-none d-md-block unit-shadow" style={{left: "-5%", width:"110%", top:0, zIndex:2, pointerEvents:"none"}}/>
		<div className="position-absolute tv-ad-player">
			<GoodLoopUnit vertId={adid} size={size} />
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
