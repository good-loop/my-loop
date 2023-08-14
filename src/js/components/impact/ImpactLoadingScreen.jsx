import React, { useEffect, useState } from 'react';
import Circle from '../../base/components/Circle';
import Misc from '../../base/components/Misc';


/**
 * DEBUG OBJECTS
 */
import Login from '../../base/youagain';
import AccountMenu from '../../base/components/AccountMenu';
import { nonce } from '../../base/data/DataClass';


/**
 * @param {Object} p
 * @param {PromiseValue} baseObj Set of brands we're loading for this page - "loaded" is when it resolves.
 * @param {boolean} reload Toggles when another component wants to provoke a reload (eg filters changed) - when it changes, show loading screen
 * @returns 
 */
const ImpactLoadingScreen = ({pvBaseObj, reload}) => {
	const [hideTimer, setHideTimer] = useState(false);

	// Show the loading screen; hide after 2350ms (sum of animation durations in ImpactLoadingScreen.less)
	const show = () => {
		if (hideTimer) return;
		const htTimeout = setTimeout(() => setHideTimer(false), 1350)
		setHideTimer(htTimeout);
	};

	// Every time a new pvBaseObj resolves, show loading screen.
	useEffect(() => {
		if (pvBaseObj?.resolved) show();
	}, [pvBaseObj?.resolved]);

	// Every time the "reload" value flips, show loading screen.
	useEffect(() => {
		show();
	}, [reload]);

	//if (!hideTimer) return null;

	// Pull some info in the focus objects out of pvBaseObj to customise the loading screen
	const baseObj = pvBaseObj?.resolved && pvBaseObj.value;
	const { brand, campaign } = (baseObj || {});

	return <div id="impact-loading-screen">
		{brand?.branding && <Misc.Thumbnail item={brand} className="loading-dashboard-logo" />}
		<Circle className="earth-circle true-center">
			<img src="/img/Impact/map-loading-screen.svg" className="earth-map true-center" />
			<img src="/img/Impact/waves.svg" className="waves" />
		</Circle>
		{baseObj && <p className="loading-dashboard-name">
			{campaign?.name || brand?.name}
		</p>}
	</div>;
};

export default ImpactLoadingScreen;
