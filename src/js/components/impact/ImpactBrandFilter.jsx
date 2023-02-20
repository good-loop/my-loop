import React, { useState, useEffect } from 'react';
import KStatus from '../../base/data/KStatus';
import SearchQuery from '../../base/searchquery';
import { getId } from '../../base/data/DataClass';
import Misc from '../../base/components/Misc';
import C from '../../C';
import { openAndPopulateModal } from './GLCards';
import ListLoad from '../../base/components/ListLoad';
import DataStore from '../../base/plumbing/DataStore';
import { goto } from '../../base/plumbing/glrouter';

/**
 * DEBUG OBJECTS
 */

import { TEST_BRAND } from './TestValues';

const A = C.A;

/**
 * container for breadcrumb filter 
 * 
 * @param {Object} p
 * @param {?string} p.active
 * @returns 
 */
const ImpactBrandFilters = ({masterBrand, curSubBrand, setCurSubBrand, curCampaign, setCurCampaign}) => {
	
	/**
	 * 
	 * @param {object} item the object filter the user has just selected
	 * @param {object} wrapperItem if item is a campaign, also pass in the brand associated with it
	 * @returns 
	 */
	// change breadcrumb trail to reflect filters selected
	const filterChange = ({brand, campaign}) => {

		if (campaign) {
			goto("/iview/campaign/" + campaign.id);
		} else if (brand) {
			goto("/iview/brand/" + brand.id)
		}
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
		
		let thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='impact-link-placeholder-thumbnail' />
		
		return <>
			<div className='brand-campaign-set' onClick={() => filterChange({campaign:item})}>
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
				ListItem={CampaignListItem}
				 />
		</div>)

		// get brands logo or get placeholder
		let thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='impact-link-placeholder-thumbnail' />
		
		// dropdown toggle of above campaign ListLoad
		button = <button className={'dropdown-button'} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>X</button>

		return <>
			<div className='brand-campaign-set'>
				<div className="info" onClick={() => filterChange({brand:item})}>
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
				<FilterButton content={"All Brands"} />
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


export default ImpactBrandFilters;
