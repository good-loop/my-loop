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
import Advert from '../../base/data/Advert';
import ImpactLoadingScreen from './ImpactLoadingScreen'
import Money from '../../base/data/Money';
import SearchQuery from '../../base/searchquery';

// FIXME overlap
import { fetchBaseObjects } from './impactdata';
import { fetchImpactBaseObjects } from '../../base/data/ImpactPageData';

import { ErrorDisplay } from './ImpactComponents';
import ImpactOverviewPage, {ImpactFilters} from './ImpactOverviewPage';
import ImpactStatsPage from './ImpactStatsPage';


/**
 * DEBUG OBJECTS
 */

import Login from '../../base/youagain';
import { ImpactStoriesPage } from './ImpactStoriesPage';


const IMPACT_PAGES= {
	view: ImpactOverviewPage,
	story: ImpactStoriesPage,
	stat: ImpactOverviewPage,
}

const ImpactPage = () => {

	const path = DataStore.getValue(['location', 'path']);

	if (path.length < 3) return <ErrorDisplay e={{error:"Invalid URL"}} />
	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
	const page = path[1]
	const itemType = path[2]
	const itemId = path[3]

	// FIXME overlapping functions -- need to resolve on one.
	let pvBaseObjects1 = DataStore.fetch(['misc','impactBaseObjects',itemType,status,'all',itemId], () => {
		return fetchBaseObjects({itemId, itemType, status});
	});
	let pvBaseObjects = fetchImpactBaseObjects({itemId, itemType, status});

	let [pageName, PageContent] = ({
		view: ["Overview", IMPACT_PAGES.view], 
		stories: ["Stories", IMPACT_PAGES.story], 
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

	const {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits=[], charities=[], ads=[]} = pvBaseObjects.value || {};

	// Use campaign specific logo if given
	const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
	// Returns NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);

	const totalString = Money.prettyStr(totalDonation);

	// if not logged in OR impact hasn't been chosen yet...
	if(!Login.isLoggedIn() || !impactChosen) {
		return <ImpactLoginCard choice={impactChosen} setChoice={setImpactChosen} masterBrand={masterBrand || brand}/>
	}

	return (
		<>
		<div className="navbars-overlay">
			<animated.div className='impact-navbar-flow-overlay' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}}></animated.div>
			<ImpactLoadingScreen baseObj={pvBaseObjects} forcedReload={forcedReload} setForcedReload={setForcedReload}/>
			<ImpactFilterOptions size="thin" setIsNavbarOpen={setIsNavbarOpen} pvBaseObjects={pvBaseObjects} setForcedReload={setForcedReload} curPage={page} status={status}/>  {/*mobile horizontal filters topbar*/}
			<NavBars active={"overview"} isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen}/>
			<ImpactFilterOptions size="wide" setIsNavbarOpen={setIsNavbarOpen} pvBaseObjects={pvBaseObjects} setForcedReload={setForcedReload}  curPage={page} status={status}/>  {/*widescreen vertical filters topbar*/}
		</div>
		<PageContent pvBaseObjects={pvBaseObjects} navToggleAnimation={navToggleAnimation} totalString={totalString} mainLogo={mainLogo} {...pvBaseObjects?.value}/>
		</>
	)
}

export default ImpactPage;
