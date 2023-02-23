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
import { modalToggle, openAndPopulateModal } from './GLCards';
import ListLoad from '../../base/components/ListLoad';

/**
 * DEBUG OBJECTS
 */

import { TEST_BRAND } from './TestValues';
import AccountMenu from '../../base/components/AccountMenu';
import { assert } from '../../base/utils/assert';
import { space } from '../../base/utils/miscutils';

const A = C.A;




const ImpactAccountButton = ({curMaster, curSubBrand, curCampaign, customLogin}) => {

	let [loggedIn, setIsLoggedIn] = useState(Login.isLoggedIn())
	let type = curCampaign ? "campaign" : "brand"
	let id = curCampaign ? curCampaign.id : (curSubBrand ? curSubBrand.id : curMaster.id)
	let greenUrl = `https://my.good-loop.com/greendash?${type}=${id}` // add period later
	
	assert (loggedIn) // this shouldn't even be loaded if you're not logged in! We should have moved to the impact sign in before this!
	

	let logoutButton = <a href='#' className="LogoutLink" onClick={() => {Login.logout(); setIsLoggedIn(false); }}>Log out</a>

	
	const accountModalContent = (
		<div id="impact-account-container" className="flex-collumn">
			<a><div className='flex-row'><div className='impact-link-placeholder-thumbnail' /><span className="active">Impact Dashboard</span></div></a>
			<a href={greenUrl}><div className='flex-row'><div className='impact-link-placeholder-thumbnail' /><span href={greenUrl} >Green Dashboard</span></div></a>
		</div>
	)
	
	const AccountMenuItem = ({itemIconClass, itemText, itemUrl, active}) => {
		if (itemText.length > 280) itemText = itemText.slice(0, 280);
		
		let thumbnail = <div className={space('impact-icon', (itemIconClass || 'placeholder-thumbnail'))} />
		
		return (
				<a href={itemUrl} className="account-menu-option">	
					{thumbnail}
					<div className={space("link-text", (active && "active"))}>{itemText}</div>
				</a>
		)
	   }
	


	let accountContent = () => {
		return (
		<div id="impact-account-container" className="flex-collumn">

			<AccountMenuItem itemText={"Impact Dashboard"} itemUrl={""} active/>
			<AccountMenuItem itemText={"Green Dashboard"} itemUrl={greenUrl} />

			<a href={'#'} className="LogoutLink" onClick={() => {modalToggle(); Login.logout()}}>Sign Out</a>
		</div>
		)
	}

	// makes use of a temp href for Impact Dash as I'm currently not sure where the

		
	const accountOnClick = () => openAndPopulateModal({id:"ads-for-good-modal", content:accountContent, title:"(still need red bar here)", prioritized:true})
	
	return (
		<div id="impact-overview-accounts">
			<button id='account-icon' onClick={accountOnClick}>placeholder butt</button>
		</div>
	)
}


export default ImpactAccountButton;
