import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import NavBars from './ImpactNavBars';
import ImpactLoginCard from './ImpactLogin';
import ImpactFilterOptions from './ImpactFilterOptions'
import KStatus from '../../base/data/KStatus';
import ImpactSettings from '../../base/data/ImpactSettings';
import ImpactLoadingScreen from './ImpactLoadingScreen'
import Money from '../../base/data/Money';
import { fetchImpactBaseObjects } from '../../base/data/ImpactPageData';
import { isoDate } from '../../base/utils/date-utils';
import { ErrorDisplay } from './ImpactComponents';
import ImpactOverviewPage from './ImpactOverviewPage';
import {ImpactStoriesB2B} from './stories_components/ImpactB2B';
import ImpactStatsPage from './ImpactStatsPage';


/**
 * DEBUG OBJECTS
 */

import Login from '../../base/youagain';
import StyleBlock from '../../base/components/StyleBlock';
import DataClass from '../../base/data/DataClass';


const IMPACT_PAGES = {
	view: ImpactOverviewPage,
	stories: ImpactStoriesB2B,
	stat: ImpactStatsPage,
}

/**
 * HACK what is the main item this page is about?
 * @param {} baseObjects {campaign, brand, masterBrand}
 * @returns {?DataClass}
 */
export function getMainItem(baseObjects) {
	// TODO look at the url!
	if ( ! baseObjects) return null;
	let {campaign, brand, masterBrand} = baseObjects;
	return campaign || brand || masterBrand;
};

const ImpactPage = () => {
	const path = DataStore.getValue(['location', 'path']);

	if (path.length < 3) {
		return <ErrorDisplay e={{message: 'Invalid URL: Not enough details in path - expected e.g. /brand/acme'}} />
	}
	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
	// DEBUG
	const usePeriod = DataStore.getUrlValue('usePeriod');
	// END DEBUG
	const start = usePeriod && isoDate(DataStore.getUrlValue('start'));
	const end = usePeriod && isoDate(DataStore.getUrlValue('end'));
	const page = path[1]
	const itemType = path[2]
	const itemId = path[3]

	// FIXME overlapping functions -- need to resolve on one.
	let pvBaseObjects = fetchImpactBaseObjects({itemId, itemType, status, start, end});

	let [pageName, PageContent] = ({
		view: ['Overview', IMPACT_PAGES.view],
		stories: ['Stories', IMPACT_PAGES.stories],
		stat: ['Statistics', IMPACT_PAGES.stat]
	})[page]

	useEffect (() => {
		//setNavProps(focusItem)
		let windowTitle = `Impact ${pageName}`;
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

	const {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits=[], unparsedCharities=[], ads=[]} = pvBaseObjects.value || {};

	// main item
	let mainItem = getMainItem(pvBaseObjects.value); // TODO what is the url pointing at??
	// Use campaign specific logo if given
	const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
	// Returns NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);

	const totalString = Money.prettyStr(totalDonation);

	// if not logged in OR impact hasn't been chosen yet...
	if (!Login.isLoggedIn() || !impactChosen) {
		return <ImpactLoginCard choice={impactChosen} setChoice={setImpactChosen} masterBrand={masterBrand || brand}/>
	}

	const impactSettings = ImpactSettings.get(mainItem);

	return <>
		{impactSettings?.customCss && <StyleBlock>{impactSettings.customCss}</StyleBlock>}		
		{impactSettings?.customHtml && <HTML>{impactSettings.customHtml}</HTML>}		
		<div className="navbars-overlay">
			<animated.div className='impact-navbar-flow-overlay' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}} />
			<ImpactLoadingScreen baseObj={pvBaseObjects} forcedReload={forcedReload} setForcedReload={setForcedReload} />
			<ImpactFilterOptions size="thin" setIsNavbarOpen={setIsNavbarOpen} pvBaseObjects={pvBaseObjects} setForcedReload={setForcedReload} curPage={page} status={status}/> {/*mobile horizontal filters topbar*/}
			<NavBars active={pageName} isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} setForcedReload={setForcedReload} />
			<ImpactFilterOptions size="wide" setIsNavbarOpen={setIsNavbarOpen} pvBaseObjects={pvBaseObjects} setForcedReload={setForcedReload}  curPage={page} status={status}/> {/*widescreen vertical filters topbar*/}
		</div>
		<PageContent pvBaseObjects={pvBaseObjects} navToggleAnimation={navToggleAnimation} totalString={totalString} mainLogo={mainLogo} />
	</>;
}

export default ImpactPage;
