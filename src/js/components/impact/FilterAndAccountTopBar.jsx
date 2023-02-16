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




/**
 * container for breadcrumb filter + top-right account options
 * 
 * @param {Object} p
 * @param {?string} p.active
 * @returns 
 */
const Filters = ({masterBrand, curSubBrand, setCurSubBrand, curCampaign, setCurCampaign}) => {
	
	console.log("?????? filters starting to be defined...")

	/**
	 * 
	 * @param {object} item the object filter the user has just selected
	 * @param {object} wrapperItem if item is a campaign, also pass in the brand associated with it
	 * @returns 
	 */
	// change breadcrumb trail to reflect filters selected
	const filterChange = (item, wrapperItem) => {

		// only master brands have the 'charities' prop
		if(item.charities) {
			setCurSubBrand(null)
			setCurCampaign(null)
			return
		}
		// if it's brand but not a master brand, it will have a parentId 
		else if(item.parentId){
			item.type = C.TYPES.vertiser
			setCurSubBrand(item)
			setCurCampaign(null)
			return
		}
		// if it's none of the above, it must be a campaign
		wrapperItem.type = C.TYPES.vertiser
		item.type = C.TYPES.Campaign
		setCurSubBrand(wrapperItem)
		setCurCampaign(item)
	}

	/**
	*	ListItem of Campaigns for use in ListLoad
	* 	Same as default except for: 
	*		- if item doesn't have branding (logo/thumbnail), use a placeholder thumbrail
	*/
	const CampaignListItem = ({ item, nameFn, button}) => {
		const id = getId(item);
		let name = nameFn ? nameFn(item, id) : item.name || item.text || id || '';
		if (name.length > 280) name = name.slice(0, 280);
		const status = item.status || "";
		
		let thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='impact-link-placeholder-thumbnail' />
		
		return <>
			<div className='brand-campaign-set'>
				{thumbnail}
				<div className="info">
					<div className="name">{name}</div>
					{button || ''}
				</div>
			</div>
		</>;
   }

	
	/**
	*	ListItem of Brands for use in a ListLoad
	* 	Same as default except for: 
	*		- if item doesn't have branding (logo/thumbnail), use a placeholder thumbrail
	*		- if Brand has campaigns, nest a ListLoad of those campaigns within a dropdown inside the Brand ListItem 
	*/
	const FilterListItem = ({ item, nameFn, button}) => {
		const id = getId(item);
		let name = nameFn ? nameFn(item, id) : item.name || item.text || id || '';
		if (name.length > 280) name = name.slice(0, 280);
		const status = item.status || "";
		
		const [isDropdownOpen, setIsDropdownOpen] = useState(false)

		// campaigns that belong to this current brand
		const campaignClasses = `filter-button campaign-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`
		const campaignsListItem = (<div id={"campaigns-"+item.id} className={ + isDropdownOpen ? "open" : "closed"}>
			<ListLoad hideTotal status={status}
				type={C.TYPES.Campaign}
				q={SearchQuery.setProp(null, "vertiser", id).query}
				onClickWrapper={(event, innerItem) => filterChange(innerItem, item)}
				itemClassName={campaignClasses}
				ListItem={CampaignListItem}
				 />
		</div>)

		let thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='impact-link-placeholder-thumbnail' />
		
		// dropdown toggle of above campaign ListLoad
		button = <button className={'dropdown-button'} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>X</button>

		return <>
			<div className='brand-campaign-set'>
				<div className="info">
					{thumbnail}
					<div className="name">{name}</div>
					{button || ''}
				</div>
				{campaignsListItem}
			</div>
		</>;
   }

	const openFilters = () => {
		
		const vertiser = TEST_BRAND;

		const classes = `brand-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`

		let modalContent = () => (
			<div className='' id="filter-modal-container">
				{/* master brand & its campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					q={SearchQuery.setProp(null, "id", vertiser).query} 
					onClickWrapper={(event, item) => filterChange(item)}
					ListItem={FilterListItem} itemClassName={classes}/>

				{/* sub brands & their campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
            		q={SearchQuery.setProp(null, "parentId", vertiser).query} 
					ListItem={FilterListItem} itemClassName={classes}
					onClickWrapper={(event, item) => filterChange(item)}/>
			</div>
		)
		openAndPopulateModal({id:"left-half", content:modalContent, title:"(my header should have a unique class)", prioritized:true, headerClassName:"oofowmybones"})
	}

	// helper JSX elements
	const FilterButton = ({content, id, className}) => <button className="filter-row filter-text" onClick={() => openFilters()}>{content}</button>
	const RightArrow = () => <button className='filter-row' onClick={() => openFilters()}> &#62; </button> // &#62; is the number for '>'
	const DropDownIcon = () => <button className='filter-row filter-down-arrow' onClick={() => openFilters()} />

	// no filters / only master brand filtered
	if(!curSubBrand){
		return (
			<div id="filters">
				<FilterButton content={masterBrand.name} />
				<RightArrow /> 	
				<FilterButton content={"All brands"} />
				<DropDownIcon />
			</div>
		)
	}

	// master brand and brand are filtered 
	if(!curCampaign){
		return (
			<div id="filters">
				<FilterButton content={masterBrand.name} />
				<RightArrow />
				<FilterButton content={curSubBrand.name} />
				<DropDownIcon />
			</div>
		)
	}

	// master brand, brand and campaign are filtered
	return (
		<div id="filters">
				<FilterButton content={masterBrand.name} />
				<RightArrow />
				<FilterButton content={curSubBrand.name} />
				<RightArrow />
				<FilterButton content={curCampaign.name} />
		</div>
	)

}


const DateFilter = ({}) => {
	let content = () => (<div><PropControlPeriod calendarFormat/></div>)
	let onClick = () => openAndPopulateModal({id:"hero-card-modal", content:content, title:"(still need red bar here)", prioritized:true})
	return (
	<div id="date-filters">
		<button className="filter-row filter-text" onClick={onClick}>Date</button>
		<button className='filter-row filter-down-arrow' onClick={onClick}/>
	</div>
	)
}

const Account = ({curMaster, curSubBrand, curCampaign, customLogin}) => {

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
	let accountContent = <AccountMenu/>
	
	
	// makes use of a temp href for Impact Dash as I'm currently not sure where the
	const accountModalContent = () => (
		<div id="impact-account-container" className="flex-collumn">
			<a><div className='flex-row'><div className='impact-link-placeholder-thumbnail' /><span className="active">Impact Dashboard</span></div></a>
			<a href={greenUrl}><div className='flex-row'><div className='impact-link-placeholder-thumbnail' /><span href={greenUrl} >Green Dashboard</span></div></a>
			{accountContent}
		</div>
	)
	
	const accountOnClick = () => openAndPopulateModal({id:"ads-for-good-modal", content:accountModalContent, title:"(still need red bar here)", prioritized:true})
	
	return (
		<div id="impact-overview-accounts">
			<button id='share-icon' onClick={accountOnClick} />
			<button id='account-icon' onClick={accountOnClick} />
		</div>
	)
}

/** For the given URL params, what filter mode should the user be in? */
const defaultFilterMode = ({masterBrand, brand, campaign}) => {
	if (campaign) return 'campaign';
	if (brand) return 'brand';
	if (masterBrand) return 'master';
	throw new Error("no values for any of Impact-Overview filters found")
}

/**
 * 
 * @param {size} string on what page size to draw this element, currently "mobile" and "desktop" are the only expected values
 * @returns 
 */
const FilterAndAccountTopBar = ({size}) => {

	const [curMaster, setCurMaster] = useState({id:TEST_BRAND, name:"Nestle"})	// assume master brand is passed in from page - FIX THIS LATER
	const [curSubBrand, setCurSubBrand] = useState(null)
	const [curCampaign, setCurCampaign] = useState(null)
	const [curPeriod, setCurPeriod] = useState(null)
	
	return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<Filters masterBrand={curMaster} curSubBrand={curSubBrand} setCurSubBrand={setCurSubBrand} curCampaign={curCampaign} setCurCampaign={setCurCampaign}/>
			<DateFilter />
			<Account curMaster={curMaster} curSubBrand={curSubBrand} curCampaign={curCampaign} />
		</div>
	)
}

export default FilterAndAccountTopBar;
