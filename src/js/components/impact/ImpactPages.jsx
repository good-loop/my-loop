import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import NavBars from './ImpactNavBars';
import ImpactFilterOptions from './ImpactFilterOptions';
import KStatus from '../../base/data/KStatus';
import ImpactSettings from '../../base/data/ImpactSettings';
import ImpactLoadingScreen from './ImpactLoadingScreen';
import Money from '../../base/data/Money';
import { fetchImpactBaseObjects, getMainItem } from '../../base/data/ImpactPageData';
import { isoDate } from '../../base/utils/date-utils';
import { ErrorDisplay } from './ImpactComponents';
import ImpactOverviewPage from './ImpactOverviewPage';
import {ImpactStoriesB2B} from './stories_components/ImpactB2B';
import ImpactStatsPage from './ImpactStatsPage';
import E404Page from '../../base/components/E404Page';
import E401Page from '../../base/components/E401Page';
import Login from '../../base/youagain';
import StyleBlock from '../../base/components/StyleBlock';


const IMPACT_PAGES = {
	view: { name: 'Impact Overview', PageComponent: ImpactOverviewPage },
	stories: { name: 'Impact Stories', PageComponent: ImpactStoriesB2B },
	stat: { name: 'Impact Statistics', PageComponent: ImpactStatsPage },
};


function ImpactPage() {
	const path = DataStore.getValue(['location', 'path']);
	if (path.length < 3) {
		return <ErrorDisplay e={{message: 'Invalid URL: Not enough details in path - expected e.g. /brand/acme'}} />;
	}
	if (!Login.isLoggedIn()) return <E401Page />;

	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
	// DEBUG
	const usePeriod = DataStore.getUrlValue('usePeriod');
	// END DEBUG
	const start = usePeriod && isoDate(DataStore.getUrlValue('start'));
	const end = usePeriod && isoDate(DataStore.getUrlValue('end'));
	const [, page, type, id] = path;

	// FIXME overlapping functions -- need to resolve on one.
	let pvBaseObjects = fetchImpactBaseObjects({type, id, status, start, end});
	if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />;

	// Get component for page & set tab title
	const { name, PageComponent } = IMPACT_PAGES[page];
	useEffect(() => { setWindowTitle(name); }, [name]);

	// shrinking / expanding navbar animation values
	let [isNavbarOpen, setIsNavbarOpen] = useState(false);
	const navToggleAnimation = useSpring({ width: isNavbarOpen ? '270px' : '90px' });

	// If not logged in, user may select GreenDash instead.
	// Set to true to avoid this choice being made on page refresh if logged in (??? - RM 2023-11)
	let [impactChosen, setImpactChosen] = useState(true);
	if (!impactChosen) return <E404Page />; // Dead code? This may have been reachable once

	// On filter changes, even if content is ready, show loading screen for feedback
	const [reload, setReload] = useState(false);
	const doReload = () => setReload(!reload);

	

	const {campaign, brand, impactDebits = []} = pvBaseObjects.value || {};

	// Use campaign specific logo if given
	const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
	// Money.total yields value NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);

	const totalString = Money.prettyStr(totalDonation);

	

	// Focus item for the page - TODO getMainItem should check the URL
	const mainItem = getMainItem(pvBaseObjects.value);
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
		<ImpactLoadingScreen pvBaseObj={pvBaseObjects} reload={reload} />
		<div className="navbars-overlay">
			<animated.div className="impact-navbar-flow-overlay" style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}} />
			<ImpactFilterOptions size="thin" {...navProps} /> {/* mobile horizontal filters topbar NB:one of thin|wide gets hidden ??Could we decide here and avoid rendering the html twice?? */}
			<NavBars active={page} {...navProps} />
			<ImpactFilterOptions size="wide" {...navProps} /> {/* widescreen vertical filters topbar NB:one of thin|wide gets hidden */}
		</div>
		<PageComponent pvBaseObjects={pvBaseObjects} navToggleAnimation={navToggleAnimation} totalString={totalString} mainLogo={mainLogo} />
	</>;
}

export default ImpactPage;
