import React from 'react';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import { Col, Row, Alert } from 'reactstrap';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import SearchQuery from '../../base/searchquery';
import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ErrAlert from '../../base/components/ErrAlert';
import Money from '../../base/data/Money';
import Counter from '../../base/components/Counter';
import ServerIO from '../../plumbing/ServerIO';
import C from '../../C';
import Campaign from '../../base/data/Campaign';
import NGO from '../../base/data/NGO';

const RecentCampaignsCard = () => {
	// TODO fetch data from portal
	const campaigns = [
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
		{
			name: "Nike",
			adid: "2qQIRm9u5Q",
			url: "/#campaign?gl.vertiser=TNXHvb5j"
		},
		{
			name: "Reebok",
            adid: "HtREj0pifC",
            url: "/#campaign/?gl.vertiser=KpgM78Lg"
		},
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

	campaigns.forEach(campaign => {
		let {
			status="PUBLISHED"
		} = DataStore.getValue(['location', 'params']) || {};

		// Which advert(s)?
		const sq = adsQuery({ adid: campaign.adid });
		let pvAds = fetchAds({ searchQuery: sq, status });
		if (!pvAds) {
			console.log("No ads fetched");
		}
		if (!pvAds.resolved) {
			return <Misc.Loading text="Loading campaign info..." />;
		}
		if (pvAds.error) {
			return <ErrAlert>Error loading advert data</ErrAlert>;
		}

		// If it's remotely possible to have an ad now, we have it. Which request succeeded, if any?
		let adHits = pvAds.value.hits;
		if (!adHits || !adHits.length) {
			return <Alert>Could not load adverts for {sq.query} {status}</Alert>; // No ads?!
		}

		campaign.ad = adHits[0];
		console.log(campaign.ad);
		if (!campaign.ad.id) console.warn("No id!");
		
		campaign.dntn = fetchDonationData({ads: adHits});
	});

	return (
		<div id="campaign-cards">
			{campaigns.map(({dntn, adid, url, name}, i) => (<Row className="campaign mb-5" key={i}>
				<TVAdPlayer adid={adid} className="col-md-6"/>
				<Col md={6} className="flex-column align-items-center text-center justify-content-center pt-3 pt-md-0">
					<h3 className="mb-0">This ad helped {name}<br/>raise {dntn ? <Counter currencySymbol="£" sigFigs={4} amount={dntn} minimumFractionDigits={2} preservePennies /> : "money"}</h3>
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
	if (!q && !isAll()) {
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

/**
 * 
 * Cut-down version of the function from NGO.js, which only looks for a total
 * 
 * @param {!Advert[]} ads
 * @returns {cid:Money} donationForCharity, with a .total property for the total
 */
const fetchDonationData = ({ads}) => {
	if ( ! ads.length) {
		console.warn("Could not fetch donation data: empty ads list!");
		return null; // paranoia
	}
	// things
	let adIds = ads.map(ad => ad.id);
	let campaignIds = ads.map(ad => ad.campaign);
	// Campaign level total info?
	let campaignPageDonations = ads.map(ad => ad.campaignPage && Campaign.dntn(ad.campaignPage)).filter(x => x);
	if (campaignPageDonations.length === ads.length) {
		return Money.total(campaignPageDonations);
	}

	// Fetch donations data	
	// ...by campaign or advert? campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
	// (old data) Loop.Me have not logged vert, only campaign. But elsewhere vert is logged and not campaign.
	let sq1 = adIds.map(id => "vert:"+id).join(" OR ");
	// NB: quoting for campaigns if they have a space (crude not 100% bulletproof) 
	let sq2 = campaignIds.map(id => "campaign:"+(id.includes(" ")? '"'+id+'"' : id)).join(" OR ");
	let sqDon = SearchQuery.or(sq1, sq2);

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget', 'CampaignPage', 'communityTotal', sqDon.query], () => {
		return ServerIO.getDonationsData({ q: sqDon.query });
	}, {}, true, 5 * 60 * 1000);	
	if (pvDonationsBreakdown.error) {
		console.error("pvDonationsBreakdown.error", pvDonationsBreakdown.error);
		return null;
	}
	if ( ! pvDonationsBreakdown.value) {
		return null; // loading
	}

	let lgCampaignTotal = pvDonationsBreakdown.value.total;
	return new Money(lgCampaignTotal);
};

export default RecentCampaignsCard;
