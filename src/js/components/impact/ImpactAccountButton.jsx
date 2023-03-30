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
import { shareThingId } from '../../base/Shares';
import { getDataItem } from '../../base/plumbing/Crud';
import ShareWidget from '../../base/components/ShareWidget';
/**
 * DEBUG OBJECTS
 */

import AccountMenu from '../../base/components/AccountMenu';
import { assert } from '../../base/utils/assert';
import { space } from '../../base/utils/miscutils';
import html2canvas from 'html2canvas';

const A = C.A;

// ONLY SHOWS EMAIL LIST WITH "listemails" FLAG SET
// ONLY APPEARS WITH "shareables" OR DEBUG FLAG SET
const ImpactShareLine =  ({style, className, brand, campaign}) => {
	// not-logged in cant share and pseudo users can't reshare
	if ( ! Login.getId() || Login.getId().endsWith("pseudo")) {
		return null;
	}
	
	let [filterMode, filterId, type] = campaign ? ["Campaign", campaign.id, C.TYPES.Campaign] : brand ? ["Brand", brand.id, C.TYPES.Advertiser] : null;
	if ( ! filterMode || ! filterId) {
		return null;
	}

	console.log("filter: ", filterMode, filterId, type)

	let shareId = shareThingId(type, filterId);
	let pvItem = getDataItem({type, id:filterId, status:KStatus.PUBLISHED});
	let shareName = filterMode+" "+((pvItem.value && pvItem.value.name) || filterId);
	const showEmails = DataStore.getUrlValue("listemails");
	console.log("... we haven't crashed yet?")
	return <ShareWidget className={className} style={style} hasButton name={"Dashboard for "+shareName} shareId={shareId} hasLink noEmails={!showEmails} />;
}




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
				<ImpactShareLine brand={curSubBrand} campaign={curCampaign}/>
			{/* Investigating not using html2canvas due to tainted canvas errors & lacking various styling features, currently disabled this button until decision is made
			<PNGDownloadButton
				querySelector={'.iview-container'}
				fileName={"title"}
				onClick={() => modalToggle()}
				title="Click to download this card as a .PNG"
				opts={{scale: 1.25}}
				onCloneFn={(document) => {
					// remove the navbar flow to give content full width
					document.querySelector('.impact-navbar-flow').style.display = "none";

					// html2canvas doesn't support box-shadow, add a border to still show card edges
					document.querySelectorAll('.glcard').forEach((el) => el.style.border = "solid 1px #770f00");

				}}
			/>*/}
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
