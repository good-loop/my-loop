import React, { useState, useEffect } from 'react';
import BasicAccountPage from '../../base/components/AccountPageWidgets';
import KStatus from '../../base/data/KStatus';
import SearchQuery from '../../base/searchquery';
import { getId } from '../../base/data/DataClass';
import Misc from '../../base/components/Misc';
import Login from '../../base/youagain';
import {LoginLink, RegisterLink, LogoutLink} from '../../base/components/LoginWidget';
import C from '../../C';
import PropControlPeriod from '../../base/components/PropControls/PropControlPeriod'
import { openAndPopulateModal } from './GLCards';
import ListLoad from '../../base/components/ListLoad';

/**
 * DEBUG OBJECTS
 */

import { TEST_BRAND } from './TestValues';
import AccountMenu from '../../base/components/AccountMenu';
import { assert } from '../../base/utils/assert';

const A = C.A;

const ImpactAccountButton = ({curMaster, curSubBrand, curCampaign, customLogin}) => {

	let [loggedIn, setIsLoggedIn] = useState(Login.isLoggedIn())
	console.log("oh shit 1. ", loggedIn)
	let type = curCampaign ? "campaign" : "brand"
	let id = curCampaign ? curCampaign.id : (curSubBrand ? curSubBrand.id : curMaster.id)
	let greenUrl = `https://my.good-loop.com/greendash?${type}=${id}` // add period later
	

	// was having issues with this modal updating until 
	useEffect(() => {
		setIsLoggedIn(Login.isLoggedIn());
	}, [Login.isLoggedIn()])

	let logoutButton = <a href='#' className="LogoutLink" onClick={() => {Login.logout(); setIsLoggedIn(false); }}>Log out</a>
	let c = <p>now i am become accountMenu child</p>


	const accountModalContent = (
		<div id="impact-account-container" className="flex-collumn">
			<a><div className='flex-row'><div className='impact-link-placeholder-thumbnail' /><span className="active">Impact Dashboard</span></div></a>
			<a href={greenUrl}><div className='flex-row'><div className='impact-link-placeholder-thumbnail' /><span href={greenUrl} >Green Dashboard</span></div></a>
			{accountContent}
		</div>
	)
	let accountContent = <AccountMenu children={accountModalContent}/>
	
	
	// makes use of a temp href for Impact Dash as I'm currently not sure where the

	
	const accountOnClick = () => openAndPopulateModal({id:"ads-for-good-modal", content:accountModalContent, title:"(still need red bar here)", prioritized:true})
	
	return (
		<div id="impact-overview-accounts">
			<button id='account-icon' onClick={accountOnClick} />
		</div>
	)
}


export default ImpactAccountButton;
