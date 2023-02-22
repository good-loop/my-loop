import React, { useState, useEffect } from 'react';
import KStatus from '../../base/data/KStatus';
import SearchQuery from '../../base/searchquery';
import { getId } from '../../base/data/DataClass';
import Misc from '../../base/components/Misc';
import C from '../../C';
import { openAndPopulateModal, modalToggle } from './GLCards';
import ListLoad from '../../base/components/ListLoad';
import DataStore from '../../base/plumbing/DataStore';
import { goto } from '../../base/plumbing/glrouter';

/**
 * DEBUG OBJECTS
 */

import { TEST_BRAND } from './TestValues';
import { retrurnProfile } from '../pages/TabsForGoodSettings';
import { assert } from '../../base/utils/assert';

const A = C.A;

/**
 * container for breadcrumb filter 
 * 
 * @param {object} masterBrand master brand object, eg "Nestle"
 * @param {object} curSubBrand currently filtered child brand of masterBrand, eg "Nespresso"
 * @param {Function} setCurSubBrand setter function for curSubBrand
 * @param {object} curCampaign currently filtered child campaign of masterBrand OR brand, eg "nespresso_master_campaign"
 * @param {Function} setCurCampaign setter function for curCampaign
 * @returns {JSX} breadcrumb trail of brand/campaign filters that can open up into a modal  for other filters
 */
const ImpactBrandFilters = ({masterBrand, curSubBrand, setCurSubBrand, curCampaign, setCurCampaign}) => {
	
	/**
	 * after user selects the brand / campaign they want to filter, update the breadcrumb & url slugs to reflect the choice
	 * @param {object} brand required, either master brand or subbrand we want to filter
	 * @param {object} campaign campaign we want to filter, must be passed in with its brand
	 */
	const filterChange = ({brand, campaign}) => {
		console.log("filterChange\n:", brand, campaign)
		if (campaign) {
			goto("/iview/campaign/" + campaign.id)
			setCurCampaign(campaign)
			setCurSubBrand(brand)
		} else if (brand) {
			goto("/iview/brand/" + brand.id)

			setCurCampaign(null)
			// only set subBrand if it's not a masterbrand (masterBrands won't have parentIds)
			brand.parentId ? setCurSubBrand(brand) : setCurSubBrand(null)
		}

		modalToggle()
	}

	/**
	 * after user selects the brand / campaign they want to filter, update the breadcrumb & url slugs to reflect the choice
	 * @param {object} brand if 
	 * @param {object} campaign campaign we want to filter, must be passed in with its brand
	 */
	const filterClear = (onlyCampaign=false) => {
		if (onlyCampaign) {
			// if we're clearing campaign, move back to just using brand 
			goto("/iview/brand/" + curSubBrand.id)
			setCurCampaign(null)
		} else {
			// if we're clearing brand, move back to just using masterbrand
			goto("/iview/brand/" + masterBrand.id)
			setCurCampaign(null)
			setCurSubBrand(null)
		}
	}

	/**
	*	ListItem of Campaigns for use in ListLoad
	* 	Same as default except for: 
	*		- if item doesn't have branding (logo/thumbnail), use a placeholder thumbrail
	*		- parentItem is expected (will be parent master/brand of campaign)
	*/
	const CampaignListItem = ({ item, nameFn, button, parentItem}) => {
		const id = getId(item);
		let name = nameFn ? nameFn(item, id) : item.name || item.text || id || '';
		if (name.length > 280) name = name.slice(0, 280);
		
		let thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='impact-link-placeholder-thumbnail' />
		
		return <>
			<div className='brand-campaign-set campaign-item' onClick={() => filterChange({brand:parentItem, campaign:item})}>
				<div className="info">
					{thumbnail}
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
		
		// is the current brands campaign dropdown expanded or closed?
		const [isDropdownOpen, setIsDropdownOpen] = useState(false)

		// classes of campaigns that belong to this current brand
		const campaignClasses = `filter-button campaign-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`
		
		// brand item with dropdowns into campaigns
		const campaignsListItem = (
		<div id={"campaigns-"+item.id} className={ + isDropdownOpen ? "open" : "closed"}>
			<ListLoad hideTotal status={status}
				type={C.TYPES.Campaign}
				q={SearchQuery.setProp(null, "vertiser", id).query}
				unwrapped
				itemClassName={campaignClasses}
				ListItem={(itemProps) => <CampaignListItem {...itemProps} parentItem={item}/>}
				 />
		</div>)

		// get brands logo or get placeholder
		const thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='impact-link-placeholder-thumbnail' />
		
		// dropdown toggle of above campaign ListLoad
		button = <button className={'dropdown-button'} onClick={(event) => {event.preventDefault(); setIsDropdownOpen(!isDropdownOpen)}} />
	
		// clicking the brands dropdown button to reveal its campaings would cause a state change, this stops that 
		const brandItemOnClick = (event) => {
			if(event.target.className == 'dropdown-button') return;
			filterChange({brand:item});
		}
		
		return <>
			<div className='brand-campaign-set'>
				<div className="info brand-item" onClick={brandItemOnClick}>
					{thumbnail}
					<div className="name">{name}</div>
					{button || ''}
				</div>
				{campaignsListItem}
			</div>
		</>;
   }

   /**
	* opens the modal containing master brand + brands, and both their respective campaigns
	* uses individual ListLoads for master and its subbrands
	* inside each ListLoad, if a brand is found to have campaigns we then run another ListLoad over them 
	*/
	const openFilters = () => {
		
		const vertiser = masterBrand.id

		const classes = `brand-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`

		let modalContent = () => (
			<div className='' id="filter-modal-container">
				{/* master brand & its campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					unwrapped
					q={SearchQuery.setProp(null, "id", vertiser).query} 
					ListItem={FilterListItem} itemClassName={classes}/>

				{/* sub brands & their campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					unwrapped
            		q={SearchQuery.setProp(null, "parentId", vertiser).query} 
					ListItem={FilterListItem} itemClassName={classes}/>
			</div>
		)
		openAndPopulateModal({id:"left-half", content:modalContent, prioritized:true, headerClassName:"red-top-border noClose"})
	}
	
	// helper JSX elements
	const StepBackFiltersButton = ({content, clearOnlyCamapign, rightArrow}) => <button className="filter-row filter-text" onClick={() => filterClear(clearOnlyCamapign)}>{content} {rightArrow && ">"}</button>
	const OpenFiltersButton = ({content, rightArrow}) => <button className="filter-row filter-text" onClick={() => openFilters()}>{content} {rightArrow && ">"}</button>
	const DropDownIcon = () => <button className='filter-row filter-down-arrow' onClick={() => openFilters()} />

	// no filters / only master brand filtered
	if(!curSubBrand){
		return (
			<div id="filters">
				<OpenFiltersButton content={masterBrand.name} rightArrow/>
				<OpenFiltersButton content={"All Brands"} />
				<DropDownIcon />
			</div>
		)
	}

	// master brand and brand are filtered 
	if(!curCampaign){
		return (
			<div id="filters">
				<StepBackFiltersButton content={masterBrand.name} rightArrow/>
				<OpenFiltersButton content={curSubBrand.name} />
				<DropDownIcon />
			</div>
		)
	}

	// master brand, brand and campaign are filtered
	return (
		<div id="filters">
				<StepBackFiltersButton content={masterBrand.name} rightArrow/>
				<StepBackFiltersButton content={curSubBrand.name} clearOnlyCamapign rightArrow/>
				<OpenFiltersButton content={curCampaign.name} />
		</div>
	)
}


export default ImpactBrandFilters;
