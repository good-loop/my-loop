import React, { useState, useEffect } from 'react';
import BasicAccountPage from '../../base/components/AccountPageWidgets';
import KStatus from '../../base/data/KStatus';
import SearchQuery from '../../base/searchquery';
import { getId } from '../../base/data/DataClass';
import Misc from '../../base/components/Misc';
import Login from '../../base/youagain';
import {LoginLink, RegisterLink, LogoutLink} from '../../base/components/LoginWidget';
import C from '../../C';
import { modalToggle, openAndPopulateModal } from './GLCards';
import ListLoad from '../../base/components/ListLoad';
import  { PNGDownloadButton } from '../../base/components/PNGDownloadButton'
/**
 * DEBUG OBJECTS
 */

import { TEST_BRAND } from './TestValues';
import AccountMenu from '../../base/components/AccountMenu';
import { assert } from '../../base/utils/assert';
import { space } from '../../base/utils/miscutils';
import html2canvas from 'html2canvas';

const A = C.A;




const ImpactAccountButton = ({curMaster, curSubBrand, curCampaign, noShare}) => {
	let [loggedIn, setIsLoggedIn] = useState(Login.isLoggedIn())
	let type = curCampaign ? "campaign" : "brand"
	let id = curCampaign ? curCampaign.id : (curSubBrand ? curSubBrand.id : curMaster.id)
	let greenUrl = `https://my.good-loop.com/greendash?${type}=${id}` // add period later
	
	assert (loggedIn) // this shouldn't even be loaded if you're not logged in! We should have moved to the sign in before this!
	
	const AccountMenuItem = ({itemIconClass, itemText, itemUrl, active}) => {
		if (itemText.length > 280) itemText = itemText.slice(0, 280);
		let thumbnail = <div className={space('impact-icon', (itemIconClass || 'placeholder-thumbnail'))} />
		return (<a href={itemUrl} className="account-menu-option">	
					{thumbnail}
					<div className={space("link-text", (active && "active"))}>{itemText}</div>
				</a>
	)}
	
	let accountContent = () => {
		return (
		<div id="impact-account-container" className="flex-collumn">
			<AccountMenuItem itemText={"Impact Dashboard"} itemUrl={""} active/>
			<AccountMenuItem itemText={"Green Dashboard"} itemUrl={greenUrl} />
			<a href={'#'} className="LogoutLink" onClick={() => {modalToggle(); Login.logout()}}>Sign Out</a>
		</div>
		)
	}

	let shareContent = () => {
		return (
			<>
				<p> do it </p>
				<button onClick={ () => {
					modalToggle()
					window.scrollTo(0, 0);
					html2canvas(document.getElementById("overview-first-card"), {
						allowTaint: true,
					  }).then((canvas) => {
						console.log(canvas.toDataURL("image/jpeg", 0.9));
					})

				}
				}>CLICK ME</button>

			<PNGDownloadButton
			querySelector={`#overview-first-card`}
			title="Click to download this card as a .PNG"
			opts={{scale: 1.25, allowTaint: true}}
			
		/>
			</>
		)
	}		
	const accountOnClick = () => openAndPopulateModal({id:"ads-for-good-modal", content:accountContent, prioritized:true, headerClassName:"red-top-border noClose"})
	const shareOnClick = () => openAndPopulateModal({id:"ads-for-good-modal", content:shareContent, prioritized:true, headerClassName:"red-top-border noClose"})

	return (
		<div id="impact-overview-accounts">
			{!noShare && <button id="share-icon" onClick={shareOnClick}>Share</button>}
			<button id='account-icon' onClick={accountOnClick}>{Login.user.name}</button>
		</div>
	)
}


export default ImpactAccountButton;
