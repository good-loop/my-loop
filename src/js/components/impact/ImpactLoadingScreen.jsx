import React, { useState } from 'react';
import Circle from '../../base/components/Circle';
import Misc from '../../base/components/Misc';


/**
 * DEBUG OBJECTS
 */
import Login from '../../base/youagain';
import AccountMenu from '../../base/components/AccountMenu';
import { nonce } from '../../base/data/DataClass';


/**
 * 
 * @param {baseObj} PromiseValue set of brands we're trying to load from the server, mostly just used to check if loading has finsihed or not
 * @param {forcedReload} boolean true if we're trying to force a reload, false if not. Reset to false within this function. 
 * @param {setForcedReload} function setter for above state, used within ImpactBrandFilter after changing filters
 * @returns 
 */
const ImpactLoadingScreen = ({baseObj, forcedReload = false, setForcedReload}) => {
	const [isPageReady, setIsPageReady] = useState(false);
	const [isTimerOn, setIsTimerOn] = useState(false);

	if (forcedReload && isPageReady) setIsPageReady(false)

	// if we've loaded (just after initial page start) or forcing a reload (on all filter changes)...
	if (baseObj.resolved || forcedReload) {
		if (!isTimerOn && !isPageReady){ //... and we're not either already inside this timeout or already finished it ...
			setForcedReload(false);
			setIsTimerOn(true);

			setTimeout(() => { // ... wait until animation will have finished and then hide the loading screen
				setIsPageReady(true);
				setIsTimerOn(false);
			}, 2350) // timeout value taken from ImpactLoadingScreen.less
		}
	} else {
		// we're now loading something new
		if (isPageReady) setIsPageReady(false);
	}

	if (isPageReady) return <></>;

	return <div id='impact-loading-screen'>
		{baseObj.resolved && baseObj.value.brand.branding && <Misc.Thumbnail item={baseObj.value.brand} className="loading-dashboard-logo"/>}
		<Circle className = "earth-circle true-center">
			<img src="/img/Impact/map-loading-screen.svg" className='earth-map true-center'/>
			<img src="/img/Impact/waves.svg" className='waves'/>
		</Circle>
		{baseObj.resolved && <p className='loading-dashboard-name'>{(baseObj.value.campaign && baseObj.value.campaign.name) || baseObj.value.brand.name}</p>}
	</div>;
};

export default ImpactLoadingScreen;
