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
import { space } from '../../base/utils/miscutils';
import Advertiser from '../../base/data/Advertiser';
import { unstable_renderSubtreeIntoContainer } from 'react-dom';
import { getCountryImpressionsByCampaign } from './impactdata';

const A = C.A;

/**
 * container for breadcrumb filter 
 * 
 * @param {object} masterBrand master brand object, eg "Nestle"
 * @returns {JSX} breadcrumb trail of brand/campaign filters that can open up into a modal  for other filters
 */
const ImpactBrandFilters = ({masterBrand, brand, campaign, setForcedReload, size, dropdown, curPage}) => {
	

	const [filtersOpen, setFiltersOpen] = useState(false)

	/**
	 * after user selects the brand / campaign they want to filter, update the breadcrumb & url slugs to reflect the choice
	 * @param {object} brand required, either master brand or subbrand we want to filter
	 * @param {object} campaign campaign we want to filter, must be passed in with its brand
	 */
	const filterChange = ({brand, campaign}) => {
		console.log("filterChange\n:", brand, campaign)
		if (campaign) {
			goto(`/impact/${curPage}/campaign/` + campaign.id)
		} else if (brand) {
			goto(`/impact/${curPage}/brand/` + brand.id)
		}
		setFiltersOpen(false)
		modalToggle()
		setForcedReload(true)
	}

	/**
	 * after user selects the brand / campaign they want to filter, update the breadcrumb & url slugs to reflect the choice
	 * @param {object} brand if 
	 * @param {object} campaign campaign we want to filter, must be passed in with its brand
	 */
	const filterClear = (onlyCampaign=false) => {
		if (onlyCampaign) {
			// if we're clearing campaign, move back to just using brand 
			goto(`/impact/${curPage}/brand/` + brand.id)
		} else {
			// if we're clearing brand, move back to just using masterbrand
			goto(`/impact/${curPage}/brand/` + masterBrand.id)
		}
		modalToggle()
		setFiltersOpen(false)
		setForcedReload(true)
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
		let isSelected = campaign && campaign.id == item.id 
		if (size == "thin") name = name.replace(/_/g, " ") // allows for linebreaks in names to save horizontal space
		return <>
			<div className='brand-campaign-set' onClick={() => filterChange({brand:parentItem, campaign:item})}>
				<div className="info campaign-item">
					<div className='display'>
						{thumbnail}
						<div className={space("name", (isSelected && "selected-filter"))}>
							{name}
						</div>
					</div>
					{button || ''}
				</div>
			</div>
		</>;
   }

	// So we can filter out anything with no donations
	const allImpactDebits = Advertiser.getImpactDebits(masterBrand || brand);

	/**
	*	ListItem of Brands for use in a ListLoad
	* 	Same as default except for: 
	*		- if item doesn't have branding (logo/thumbnail), use a placeholder thumbrail
	*		- if Brand has campaigns, nest a ListLoad of those campaigns within a dropdown inside the Brand ListItem 
	*/
	const FilterListItem = ({ item, nameFn, button, isMaster=false}) => {
		const id = getId(item);
		let name = nameFn ? nameFn(item, id) : item.name || item.text || id || '';
		if (name.length > 260) name = name.slice(0, 260);
		if(isMaster) name += " - All Brands"
		const status = item.status || "";

		// is the current brands campaign dropdown expanded or closed?
		// if a campaign is selected, start with that subbrands dropdown open
		const [isDropdownOpen, setIsDropdownOpen] = useState( (!dropdown) || (campaign && brand.id == item.id) )

		// classes of campaigns that belong to this current brand
		const campaignClasses = `filter-button campaign-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`

		let q = SearchQuery.setProp(null, "vertiser", id);
		
		// brand item with dropdowns into campaigns
		const campaignsListItem = (
		<div id={"campaigns-"+item.id} className={ + (!dropdown || isDropdownOpen) ? "open" : "closed"}>
			<ListLoad hideTotal status={status}
				type={C.TYPES.Campaign}
				q={q.query}
				unwrapped
				itemClassName={campaignClasses}
				ListItem={(itemProps) => <CampaignListItem {...itemProps} parentItem={item}/>}
				 />
		</div>)

		// get brands logo or get placeholder
		const thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='impact-link-placeholder-thumbnail' />
		
		// dropdown toggle of above campaign ListLoad
		button = <button className={space('dropdown-button', (isDropdownOpen && "open"))} onClick={(event) => {event.preventDefault(); setIsDropdownOpen(!isDropdownOpen)}} />
	
		// clicking the brands dropdown button to reveal its campaings would cause a state change, this stops that 
		const brandItemOnClick = (event) => {
			if(event.target.className.includes('dropdown-button')) return;
			filterChange({brand:item});
		}
		
		let isSelected = (brand && item.id == brand.id) || (isMaster && brand == null)

		return <>
			<div className='brand-campaign-set'>
				<div className="info brand-item" onClick={brandItemOnClick}>
					<div className="display">
						{thumbnail}
						<div className={space("name", (isSelected && "selected-filter"))}>{name}</div>
					</div>
					{dropdown && button || ''}
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
		// if mobile user clicks the filter dropdown while they're open, close the filter menu
		if(filtersOpen) {modalToggle(); setFiltersOpen(false); return null}
		setFiltersOpen(true);

		const vertiser = (masterBrand || brand).id
		const classes = `brand-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`

		let modalContent = () => (
			<div className='' id="filter-modal-container">
				{/* master brand & its campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					unwrapped
					q={SearchQuery.setProp(null, "id", vertiser).query} 
					ListItem={(itemProps) => <FilterListItem {...itemProps} isMaster/>} itemClassName={classes}/>

				{/* sub brands & their campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					unwrapped
            		q={SearchQuery.setProp(null, "parentId", vertiser).query} 
					ListItem={FilterListItem} itemClassName={classes}/>
			</div>
		)
		openAndPopulateModal({id:"left-half", content:modalContent, prioritized:true, headerClassName:"red-top-border noClose noPadding", className:"impact-brand-modal"})
	}
	
	// helper JSX elements
	const StepBackFiltersButton = ({content, clearOnlyCamapign, rightArrow, underlined}) => (
		<button className={space("filter-row", "filter-text", (underlined && "underlined"))}onClick={() => filterClear(clearOnlyCamapign)}>
			{content} {rightArrow && ">"}
		</button>
	)

	const OpenFiltersButton = ({content, rightArrow, underlined}) => (
		<button className={space("filter-row", "filter-text", (underlined && "underlined"))} onClick={() => openFilters()}>
			{content} {rightArrow && ">"}
		</button>
	)

	const DropDownIcon = () => <button className='filter-row filter-down-arrow' onClick={() => openFilters()} />

	// no filters / only master brand filtered (no master brand set = no parent for this brand)
	if(!masterBrand && !campaign){
		return (
			<div id="filters">
				<OpenFiltersButton content={brand.name} rightArrow/>
				<OpenFiltersButton content={"All Brands"} />
				<DropDownIcon />
			</div>
		)
	}

	// master brand and brand are filtered 
	if(!campaign){
		return (
			<div id="filters">
				<StepBackFiltersButton content={masterBrand.name} rightArrow/>
				<OpenFiltersButton content={(size == "thin" && brand.name.length > 25) ? (brand.name.substring(0,24)+"...") : brand.name} underlined/>
				<DropDownIcon />
			</div>
		)
	}

	// master brand, brand and campaign are filtered
	return (
		<div id="filters">
				{masterBrand && <StepBackFiltersButton content={masterBrand.name} rightArrow/>}
				<StepBackFiltersButton content={(size == "thin" && brand.name.length > 10) ? (brand.name.substring(0,9)+"...") : brand.name} clearOnlyCamapign rightArrow/>
				<OpenFiltersButton content={(size == "thin" && campaign.name.length > 10) ? (campaign.name.substring(0,9)+"...") : campaign.name} underlined/>
		</div>
	)
}


export default ImpactBrandFilters;
