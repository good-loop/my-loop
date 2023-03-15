import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { Card as CardCollapse } from '../../base/components/CardAccordion';
import { Button, Col, Container, InputGroup, Row } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { getLogo, space, stopEvent, uniq } from '../../base/utils/miscutils';
import { modifyPage } from '../../base/plumbing/glrouter';
import DynImg from '../../base/components/DynImg';
import NavBars from './ImpactNavBars';
import ImpactLoginCard from './ImpactLogin';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop, markPageLoaded } from './GLCards';
import ImpactFilterOptions from './ImpactFilterOptions'
import { fetchCharity } from '../pages/MyCharitiesPage'
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import ActionMan from '../../plumbing/ActionMan';
import C from '../../C';
import NGOImage from '../../base/components/NGOImage';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import { getDataItem } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import List from '../../base/data/List';
import ListLoad from '../../base/components/ListLoad';
import Campaign from '../../base/data/Campaign';
import Advertiser from '../../base/data/Advertiser';
import ImpactLoadingScreen from './ImpactLoadingScreen'
import Money from '../../base/data/Money';
import SearchQuery from '../../base/searchquery';

import ImpactOverviewPage from './ImpactOverviewPage';
import ImpactStatsPage from './ImpactStatsPage';
import ImpactStoryPage from './ImpactStoryPage';

/**
 * DEBUG OBJECTS
 */

 import {TEST_CHARITY, TEST_CHARITY_OBJ, TEST_BRAND, TEST_BRAND_OBJ, TEST_CAMPAIGN, TEST_CAMPAIGN_OBJ} from './TestValues';
import Login from '../../base/youagain';
import AccountMenu from '../../base/components/AccountMenu';

export class ImpactFilters {
	agency;
	brand;
	brand2;
	campaign;
	cid;
	/** charity ID */
	ngo;
	impactdebit;
	start;
	end;
	status;
	q;
}

const fetchBaseObjects = async ({itemId, itemType, status}) => {

	let pvCampaign, campaign;
	let pvBrand, brand, brandId;
	let pvMasterBrand, masterBrand;
	let pvSubBrands, subBrands;
	let pvSubCampaigns, subCampaigns;
	let pvImpactDebits, impactDebits;
	let pvCharities, charities;

	// Fetch campaign object if specified
	if (itemType === "campaign") {
		pvCampaign = getDataItem({type: C.TYPES.Campaign, status, id:itemId});
		campaign = await pvCampaign.promise;
		//if (pvCampaign.error) throw pvCampaign.error;
		// If we have a campaign, use it to find the brand
		brandId = campaign?.vertiser;
	} else if (itemType === "brand") {
		// Otherwise use the URL
		brandId = itemId;
	}

	// Find the specified brand
	pvBrand = getDataItem({type: C.TYPES.Advertiser, status, id:brandId});
	brand = await pvBrand.promise;
	//if (pvBrand.error) throw pvBrand.error;
	if (brand.parentId) {
		// If this brand has a parent, get it
		pvMasterBrand = getDataItem({type: C.TYPES.Advertiser, status, id:brand.parentId});
		masterBrand = await pvMasterBrand.promise;
		//if (pvMasterBrand.error) throw pvMasterBrand.error;
	}
	// Find any subBrands of this brand (technically brands should only have a parent OR children - but might be handy to make longer brand trees in future)
	pvSubBrands = Advertiser.getChildren(brand.id);
	subBrands = List.hits(await pvSubBrands.promise);
	//if (pvSubBrands.error) throw pvSubBrands.error;
	// Don't look for subCampaigns if this is a campaign
	if (!campaign) {
		// Find all related campaigns to this brand
		pvSubCampaigns = Campaign.fetchForAdvertiser(brandId, status);
		subCampaigns = List.hits(await pvSubCampaigns.promise);

		subCampaigns = subCampaigns.filter(c => !Campaign.isMaster(c));

		// Look for vertiser wide debits
		pvImpactDebits = Advertiser.getImpactDebits({vertiser:brand, status});
		impactDebits = List.hits(await pvImpactDebits.promise);
		console.log("Got debits from brand!", impactDebits);
	} else {
		// Get only campaign debits
		pvImpactDebits = Campaign.getImpactDebits({campaign, status});
		impactDebits = List.hits(await pvImpactDebits.promise);
		console.log("Got debits from campaign!", impactDebits);
	}

	// Simplifies having to add null checks for subBrands everywhere
	if (!subBrands) subBrands = [];
	if (!subCampaigns) subCampaigns = [];
	if (!impactDebits) impactDebits = [];

	// Fetch charity objects from debits
	const charityIds = impactDebits.map(debit => debit?.impact?.charity).filter(x=>x);
	
	if (charityIds.length) {
		let charitySq = SearchQuery.setPropOr(null, "id", charityIds);
		pvCharities = ActionMan.list({type: C.TYPES.NGO, status, q:charitySq.query});
		charities = List.hits(await pvCharities.promise);
	}

	if (!charities) charities = [];

	// If we aren't looking at a campaign, but this brand only has one - just pretend we are
	if (subCampaigns.length === 1) {
		campaign = subCampaigns[0];
		subCampaigns = [];
	}

	// If we've looked for both brand and campaign and found nothing, we have a 404
	if (!campaign && !brand) {
		throw new Error("404: Not found");
	}

	return {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits, charities};
}

const IMPACT_PAGES= {
	view: ImpactOverviewPage,
	story: ImpactOverviewPage,
	stat: ImpactOverviewPage,
}

const ImpactPage = () => {

	const path = DataStore.getValue(['location', 'path']);

	if (path.length < 3) return <ErrorDisplay e={{error:"Invalid URL"}} />
	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
	const page = path[1]
	const itemType = path[2]
	const itemId = path[3]
	let pvBaseObjects = DataStore.fetch(['misc','impactBaseObjects',itemType,status,'all',itemId], () => {
		return fetchBaseObjects({itemId, itemType, status});
	});

	const [pageName, PageContent] = ({
		view: ["Overview", IMPACT_PAGES.view], 
		story: ["Stories", IMPACT_PAGES.story], 
		stats: ["Statistics", IMPACT_PAGES.stat]
	})[page]

	useEffect (() => {
		//setNavProps(focusItem)
		let windowTitle = space("Impact " + pageName);
		setWindowTitle(windowTitle);
	}, []);

	// shrinking / expanding navbar animation values
	let [isNavbarOpen, setIsNavbarOpen] = useState(false)
	const navToggleAnimation = useSpring({
		width : isNavbarOpen ? "270px" : "90px",
	})

	// if not logged in, use may select GreenDash instead.
	// set to true to avoid this choice being made on page refresh if logged in 
	let [impactChosen, setImpactChosen] = useState(true)

	// on filter changes, even if content is loaded, force a load for feedback
	// kept as a state outside so components can easily access it, set it to true to force a 'reload'
	const [forcedReload, setForcedReload] = useState(false)

	if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />

	const {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits=[], charities=[]} = pvBaseObjects.value || {};

	// Use campaign specific logo if given
	const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
	// Returns NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);

	const totalString = Money.prettyStr(totalDonation);

	// if not logged in OR impact hasn't been chosen yet...
	if(!Login.isLoggedIn() || !impactChosen) {
		return <ImpactLoginCard choice={impactChosen} setChoice={setImpactChosen} masterBrand={TEST_BRAND_OBJ}/>
	}

	return (
		<>
		<div className="navbars-overlay">
			<animated.div className='impact-navbar-flow-overlay' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}}></animated.div>
			<ImpactLoadingScreen baseObj={pvBaseObjects} forcedReload={forcedReload} setForcedReload={setForcedReload}/>
			{pvBaseObjects.resolved && <ImpactFilterOptions size="thin" setIsNavbarOpen={setIsNavbarOpen} masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload} curPage={page}/>}  {/*mobile horizontal filters topbar*/}
			<NavBars active={"overview"} isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen}/>
			{pvBaseObjects.resolved && <ImpactFilterOptions size="wide" setIsNavbarOpen={setIsNavbarOpen} masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload}  curPage={page}/>}  {/*widescreen vertical filters topbar*/}
		</div>
		<PageContent pvBaseObjects={pvBaseObjects} navToggleAnimation={navToggleAnimation} totalString={totalString} mainLogo={mainLogo} {...pvBaseObjects?.value}/>
		</>
	)
}

const ErrorDisplay = ({e}) => {

	const [showError, setShowError] = useState(false);

	let errorTitle = "Sorry, something went wrong :(";

	if (e.message.includes("404: Not found")) errorTitle = "404: We couldn't find that!"
	if (e.message.includes("Invalid URL")) errorTitle = "Sorry, that's not a valid page!"

	return <Container className='mt-5'>
		<h1>{errorTitle}</h1>
		<p>
			Check you have the correct URL. If you think this is a bug, please report it to support@good-loop.com
		</p>
		<CardCollapse title="Error" collapse={!showError} onHeaderClick={() => setShowError(!showError)}>
			<code>
				{e.message}
			</code>
		</CardCollapse>
	</Container>;
}

export default ImpactPage;
