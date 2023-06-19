import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import NavBars from './ImpactNavBars';
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
import E404Page, {E401Page} from '../../base/components/E404Page';
import Login from '../../base/youagain';
import StyleBlock from '../../base/components/StyleBlock';
import DataClass from '../../base/data/DataClass';


const IMPACT_PAGES = {
	view: { name: 'Overview', PageComponent: ImpactOverviewPage },
	stories: { name: 'Stories', PageComponent: ImpactStoriesB2B },
	stat: { name: 'Statistics', PageComponent: ImpactStatsPage },
};


/**
 * HACK what is the main item this page is about?
 * @param {} baseObjects {campaign, brand, masterBrand}
 * @returns {?DataClass}
 */
export function getMainItem(baseObjects) {
	// TODO look at the url!
	if (!baseObjects) return null;
	let { campaign, brand, masterBrand } = baseObjects;
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

	const { name, PageComponent } = IMPACT_PAGES[page];

	useEffect (() => {
		//setNavProps(focusItem)
		let windowTitle = `Impact ${name}`;
		setWindowTitle(windowTitle);
	}, []);

	// shrinking / expanding navbar animation values
	let [isNavbarOpen, setIsNavbarOpen] = useState(false)
	const navToggleAnimation = useSpring({
		width : isNavbarOpen ? "270px" : "90px",
	});

	// if not logged in, use may select GreenDash instead.
	// set to true to avoid this choice being made on page refresh if logged in 
	let [impactChosen, setImpactChosen] = useState(true)

	// On filter changes, even if content is loaded, force a "reload" (ie show loading screen) for feedback
	const [reload, setReload] = useState(false)
	const doReload = () => setReload(prev => !prev);

	if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />

	const {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits=[], charities=[], ads=[]} = pvBaseObjects.value || {};

	// main item
	let mainItem = getMainItem(pvBaseObjects.value); // TODO what is the url pointing at??
	// Use campaign specific logo if given
	const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
	// Returns NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);

	const totalString = Money.prettyStr(totalDonation);

	// No impact??
	if ( ! impactChosen) {
		return <E404Page />;
	}
	if ( ! Login.isLoggedIn()) {
		return <E401Page />;
	}

	const impactSettings = ImpactSettings.get(mainItem);

	const navProps = {
		isNavbarOpen,
		setIsNavbarOpen,
		pvBaseObjects,
		doReload,
		curPage: page,
		status
	};

	return <>
		{impactSettings?.customCss && <StyleBlock>{impactSettings.customCss}</StyleBlock>}
		{impactSettings?.customHtml && <HTML>{impactSettings.customHtml}</HTML>}
		<div className="navbars-overlay">
			<animated.div className="impact-navbar-flow-overlay" style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}} />
			<ImpactLoadingScreen pvBaseObj={pvBaseObjects} reload={reload} />
			<ImpactFilterOptions size="thin" {...navProps} /> {/*mobile horizontal filters topbar NB:one of thin|wide gets hidden ??Could we decide here and avoid rendering the html twice?? */}
			<NavBars active={page} {...navProps} />
			<ImpactFilterOptions size="wide" {...navProps} /> {/*widescreen vertical filters topbar NB:one of thin|wide gets hidden*/}
		</div>
		<PageComponent pvBaseObjects={pvBaseObjects} navToggleAnimation={navToggleAnimation} totalString={totalString} mainLogo={mainLogo} />
	</>;
}

export default ImpactPage;
