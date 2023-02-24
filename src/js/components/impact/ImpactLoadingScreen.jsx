import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { getLogo, is, space, stopEvent, uniq } from '../../base/utils/miscutils';
import { modifyPage } from '../../base/plumbing/glrouter';
import DynImg from '../../base/components/DynImg';
import NavBars from './ImpactNavBars';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop } from './GLCards';
import FilterAndAccountTopBar from './ImpactFilterOptions'
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
import { Button, Col, Container, InputGroup, Row, Card, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { LoginWidgetEmbed } from '../../base/components/LoginWidget';
import XId from '../../base/data/XId';

/**
 * DEBUG OBJECTS
 */

 import {TEST_CHARITY, TEST_CHARITY_OBJ, TEST_BRAND, TEST_BRAND_OBJ, TEST_CAMPAIGN, TEST_CAMPAIGN_OBJ} from './TestValues';
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
const ImpactLoadingScreen = ({baseObj, forcedReload, setForcedReload}) => {
	
	const [isPageReady, setIsPageReady] = useState(false)
	const [isTimerOn, setIsTimerOn] = useState(false)

	if(forcedReload && isPageReady) setIsPageReady(false)

	// if we've loaded (just after initial page start) or forcing a reload (on all filter changes)...
	if(baseObj.resolved || forcedReload) {
		if(!isTimerOn && !isPageReady){	//... and we're not either already inside this timeout or already finished it ...
			setForcedReload(false)
			setIsTimerOn(true)

			setTimeout(() => {	// ... wait until animation will have finished and then hide the loading screen
				setIsPageReady(true)
				setIsTimerOn(false)
			}, 2350) // timeout value taken from ImpactLoadingScreen.less
		}
	} else {
		// we're now loading something new
		if (isPageReady) setIsPageReady(false)
	}

	if(isPageReady) {
		return (<></>)
	} else {	
		return (
		<div id='impact-loading-screen'>
			{baseObj.resolved && baseObj.value.brand.branding && <Misc.Thumbnail item={baseObj.value.brand} className="loading-dashboard-logo"/>}
			<Circle className = "earth-circle true-center">
				<img src="/img/Impact/map-loading-screen.svg" className='earth-map true-center'/>
				<img src="/img/Impact/waves.svg" className='waves'/>
			</Circle>
			{baseObj.resolved && <p className='loading-dashboard-name'>{(baseObj.value.campaign && baseObj.value.campaign.name) || baseObj.value.brand.name}</p>}
		</div>
		)
	}
	
};

export default ImpactLoadingScreen;
