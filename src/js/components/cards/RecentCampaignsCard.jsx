import React from 'react';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import { Col, Row } from 'reactstrap';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import SearchQuery from '../../base/searchquery';
import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../base/plumbing/DataStore';

const RecentCampaignsCard = () => {
	// TODO fetch data from portal
	const campaigns = [
		{
			name: "KitKat",
			adid: "xsINEuJV"
		},
		{
			name: "H&M",
			adid: "CeuNVbtW"
		},
		{
			name: "Linda McCartney",
			adid: "qprjFW1H"
		},
		{
			name: "WWF",
			adid: "I6g1Ot1b"
		},
		{
			name: "Doom Bar",
			adid: "ma9LU5chyU"
		},
		{
			name: "British Gas",
			adid: "tEfu6NjSY5"
		}
	];

	campaigns.forEach(campaign => {
		let {
			'gl.vert': adid,
			'gl.vertiser': vertiserid,
			'gl.status': glStatus,
			status,
			via,
			q = '',
			landing,
		} = DataStore.getValue(['location', 'params']) || {};

		// Which advert(s)?
		const sq = adsQuery({ adid: campaign.adid });
		let pvAds = fetchAds({ searchQuery: sq, status });
		if (!pvAds) {
			// No query -- show a list
			// TODO better graphic design before we make this list widget public
			if (!Login.isLoggedIn()) {
				return <div>Missing: campaign or advertiser ID. Please check the link you used to get here.</div>;
			}
			//return <ListLoad type={C.TYPES.Advert} servlet="campaign" />;
		}
		if (!pvAds.resolved) {
			//return <Misc.Loading text="Loading campaign info..." />;
		}
		if (pvAds.error) {
			//return <ErrorAlert>Error loading advert data</ErrorAlert>;
		}

		// If it's remotely possible to have an ad now, we have it. Which request succeeded, if any?
		let adHits = pvAds.value.hits;
		if (!adHits || !adHits.length) {
			//return <Alert>Could not load adverts for {sq.query} {status}</Alert>; // No ads?!
		}

		campaign.ad = adHits[0];
	});

	// Get the advertiser's name (TODO append to advert as vertiserName)
	const pvVertiser = ActionMan.getDataItem({ type: C.TYPES.Advertiser, id: ads[0].vertiser, status: C.KStatus.PUBLISHED });
	const nvertiser = pvVertiser.value;

	return (
		<div id="campaign-cards">
			{campaigns.map(({adid, name}, i) => (<Row className="campaign" key={i}>
				<TVAdPlayer adid={adid} className="col-6"/>
				<Col md={6} className="d-flex align-items-center text-center">
					<h3>{name} raised  for charity</h3>
				</Col>
			</Row>))}
		</div>
	);
};

const TVAdPlayer = ({adid, className}) => {
	const size = "landscape";
	return <div className={space("position-relative", className)}>
		<img src="/img/LandingBackground/TV_frame.png" className="w-100 invisible"/>
		<img src="/img/LandingBackground/TV_frame.png" className="w-100 position-absolute" style={{right:"0", top:"0", zIndex:2, pointerEvents:"none"}}/>
		<div className="position-absolute tv-ad-player">
			<GoodLoopUnit vertId={adid} size={size} />
		</div>
	</div>;
};

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

export default RecentCampaignsCard;
