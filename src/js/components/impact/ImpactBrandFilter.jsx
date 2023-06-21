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
import { retrurnProfile } from '../pages/TabsForGoodSettings';
import { assert } from '../../base/utils/assert';
import { space, alphabetSort, isPortraitMobile } from '../../base/utils/miscutils';
import Advertiser from '../../base/data/Advertiser';
import Campaign from '../../base/data/Campaign';
import List from '../../base/data/List';

const A = C.A;

/**
 * Unlike fetchBaseObjects which looks at the data only needed for this page, this fetches all associated data
 * @param {*} masterBrand 
 * @param {*} brand 
 * @param {*} campaign 
 */
const fetchTopLevelObjects = ({masterBrand, brand, campaign, status=KStatus.PUBLISHED}) => {
	const fetchFn = async () => {
		const allImpactDebits = List.hits(await Advertiser.getImpactDebits({vertiser: masterBrand || brand, status}).promise);
		const childBrands = List.hits(await Advertiser.getChildren((masterBrand || brand).id).promise);
		const allBrands = [masterBrand, brand, ...childBrands].filter(x=>x);
		const allCampaigns = List.hits(await Campaign.fetchForAdvertisers(allBrands.map(b => b.id)).promise);

		return {allImpactDebits, allBrands, allCampaigns};
	}

	return DataStore.fetch(['misc', 'impactTopLevelObjects', status, 'all', (masterBrand || brand).id], () => {
		return fetchFn();
	});

}


/**
 * container for breadcrumb filter 
 * 
 * @param {object} masterBrand master brand object, eg "Nestle"
 * @returns {JSX} breadcrumb trail of brand/campaign filters that can open up into a modal for other filters
 */
const ImpactBrandFilters = ({loading, masterBrand, brand, campaign, status, doReload, size, dropdown, curPage}) => {
	const [filtersOpen, setFiltersOpen] = useState(false);

	if (loading) return null;
	const pvTopLevelObjs = fetchTopLevelObjects({masterBrand, brand, campaign, status});
	if (!pvTopLevelObjs.resolved) return null;
	if (pvTopLevelObjs.error) {
		console.error(pvTopLevelObjs.error);
		return <h1>Error??</h1>; // TODO proper handling
	}

	const {allImpactDebits, allBrands, allCampaigns} = pvTopLevelObjs.value;

	// Determine which brands/campaigns have donations to show, and which to hide
	const showAll = DataStore.getUrlValue("showAll");
	const brandsWithDebits = [];
	const campaignsWithDebits = [];

	allImpactDebits.forEach(debit => {
		if (debit.vertiser && !brandsWithDebits.includes(debit.vertiser)) brandsWithDebits.push(debit.vertiser);
		if (debit.campaign && !campaignsWithDebits.includes(debit.campaign)) campaignsWithDebits.push(debit.campaign);
	});

	const topBrand = masterBrand || brand; // convert data from context-specific to universal

	const allSubBrands = allBrands.filter(b => topBrand.id !== b.id).sort((a, b) => alphabetSort(a, b));


	// Common code for filterChange/filterClear
	const filterChangeCommon = (target) => {
		const changedPath = ('/' + DataStore.getValue('location', 'path').join('/') !== target);
		modalToggle();
		setFiltersOpen(false);
		if (!changedPath) return; // No loading screen or goto for no-op navigation
		doReload();
		goto(target);
	}


	/**
	 * after user selects the brand / campaign they want to filter, update the breadcrumb & url slugs to reflect the choice
	 * @param {object} brand required, either master brand or subbrand we want to filter
	 * @param {object} campaign campaign we want to filter, must be passed in with its brand
	 */
	const filterChange = ({brand, campaign}) => {
		assert(brand || campaign, 'filterChange called with no brand or campaign');
		filterChangeCommon(campaign ? `/impact/${curPage}/campaign/${campaign.id}` : `/impact/${curPage}/brand/${brand.id}`);
	}


	/**
	 * after user selects the brand / campaign they want to filter, update the breadcrumb & url slugs to reflect the choice
	 * @param {boolean} [onlyCampaign] True = leave campaign, return to focus brand; False = leave campaign, return to master brand
	 */
	const filterClear = (onlyCampaign = false) => {
		filterChangeCommon(`/impact/${curPage}/brand/${onlyCampaign ? brand.id : masterBrand.id}`);
	}


	/**
	*	ListItem of Brands for use in a ListLoad
	* 	Same as default except for: 
	*		- if item doesn't have branding (logo/thumbnail), use a placeholder thumbrail
	*/
	const FilterListItem = ({ item, isMaster = false}) => {
		const id = getId(item);
		let name = item.name || item.text || id || '';
		if (name.length > 260) name = name.slice(0, 260);

		if (isMaster) name += ' - All Brands';
		// Hide any brands with no money that arent master or selected
		else if (!showAll && !brandsWithDebits.includes(item.id) && (brand.id !== item.id)) return null;

		const status = item.status || '';

		// is the current brands campaign dropdown expanded or closed?
		// if a campaign is selected, start with that subbrands dropdown open
		const [isDropdownOpen, setIsDropdownOpen] = useState(!dropdown || (campaign && brand.id == item.id));

		// classes of campaigns that belong to this current brand
		const campaignClasses = `filter-button campaign-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`;

		let q = SearchQuery.setProp(null, "vertiser", id);

		let myCampaigns = allCampaigns.filter(c => c.vertiser === item.id).sort((a,b) => alphabetSort(a,b));
		// If we have only 1 campaign, dont bother hiding it as we use it for default view
		if (myCampaigns.length > 1 && !showAll) myCampaigns = myCampaigns.filter(c => campaignsWithDebits.includes(c) || campaign?.id === c.id);

		// // off - brands-only is more intuitive for the user in a "Brands" list - brand item with dropdowns into campaigns
		// const campaignsListItem = (
		// <div id={`campaigns-${item.id}`} className={(!dropdown || isDropdownOpen) ? "open" : "closed"}>
		// 	{/*
		// 	<ListLoad hideTotal status={status}
		// 		type={C.TYPES.Campaign}
		// 		q={q.query}
		// 		unwrapped
		// 		itemClassName={campaignClasses}
		// 		ListItem={(itemProps) => <CampaignListItem {...itemProps} parentItem={item}/>}
		// 	/>
		// 	*/}
		// 	{/* {myCampaigns.map(c => <CampaignListItem item={c} parentItem={item} forceShow={myCampaigns.length === 1}/>)} */}
		// </div>)

		// get brands logo or get placeholder
		const thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className="impact-link-placeholder-thumbnail" />

		// // dropdown toggle of above campaign ListLoad
		// let button = <button className={space('dropdown-button', (isDropdownOpen && 'open'))} onClick={(event) => {event.preventDefault(); setIsDropdownOpen(!isDropdownOpen)}} />

		const brandItemOnClick = (event) => {
			// // clicking the brands dropdown button to reveal its campaings would cause a state change, this stops that 
			// if(event.target.className.includes('dropdown-button')) return;
			filterChange({brand:item});
		}

		let isSelected = (brand && item.id == brand.id) || (isMaster && brand == null)

		return <>
			<div className="brand-campaign-set">
				<div className="info brand-item" onClick={brandItemOnClick}>
					<div className="display">
						{thumbnail}
						<div className={space('name', (isSelected && 'selected-filter'))}>{name}</div>
					</div>
					{/* {dropdown && myCampaigns.length > 0 && button || ''} */}
				</div>
				{/* {campaignsListItem} */}
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
		if (isPortraitMobile() && filtersOpen) {
			modalToggle();
			setFiltersOpen(false);
			return null;
		}
		setFiltersOpen(true);

		const vertiser = (masterBrand || brand).id
		const classes = `brand-button ListItem btn-default btn btn-outline-secondary ${KStatus.PUBLISHED} btn-space`

		const modalContent = (
			<div className="" id="filter-modal-container">
				{/* master brand & its campaigns
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					unwrapped
					q={SearchQuery.setProp(null, "id", vertiser).query} 
					ListItem={(itemProps) => <FilterListItem {...itemProps} isMaster/>} itemClassName={classes}/>

				{/* sub brands & their campaigns
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					unwrapped
					q={SearchQuery.setProp(null, "parentId", vertiser).query} 
					ListItem={FilterListItem} itemClassName={classes}/>
				*/}
				<FilterListItem item={topBrand} isMaster />
				{allSubBrands.map(b => <FilterListItem item={b}/>)}
			</div>
		);
		openAndPopulateModal({id: 'filter-display', Content: modalContent, prioritized: true, headerClassName: 'red-top-border noClose noPadding', storedClassName: 'impact-brand-modal'})
	};

	// helper JSX elements
	const StepBackFiltersButton = ({content, clearOnlyCamapign, rightArrow, underlined}) => (
		<button className={space('filter-row', 'filter-text', (underlined && 'underlined'))}onClick={() => filterClear(clearOnlyCamapign)}>
			{content} {rightArrow && '>'}
		</button>
	);

	const OpenFiltersButton = ({content, rightArrow, underlined}) => (
		<button className={space('filter-row', 'filter-text', (underlined && 'underlined'))} onClick={() => openFilters()}>
			{content} {rightArrow && '>'}
		</button>
	);

	const DropDownIcon = () => <button className="filter-row filter-down-arrow" onClick={() => openFilters()} />;

	// no filters / only master brand filtered (no master brand set = no parent for this brand)
	if (!masterBrand && !campaign) {
		return (
			<div id="filters">
				<OpenFiltersButton content={brand.name} rightArrow/>
				<OpenFiltersButton content={"All Brands"} />
				<DropDownIcon />
			</div>
		);
	}

	// master brand and brand are filtered 
	if (!campaign) {
		return (
			<div id="filters">
				<StepBackFiltersButton content={masterBrand.name} rightArrow/>
				<OpenFiltersButton content={(size === 'thin' && brand.name.length > 25) ? (brand.name.substring(0,24)+"...") : brand.name} underlined/>
				<DropDownIcon />
			</div>
		);
	}

	// master brand, brand and campaign are filtered
	return (
		<div id="filters">
				{masterBrand && <StepBackFiltersButton content={masterBrand.name} rightArrow/>}
				<StepBackFiltersButton content={(size === 'thin' && brand.name.length > 10) ? (brand.name.substring(0,9)+"...") : brand.name} clearOnlyCamapign rightArrow/>
				<OpenFiltersButton content={(size === 'thin' && campaign.name.length > 10) ? (campaign.name.substring(0,9)+"...") : campaign.name} underlined/>
		</div>
	);
}


export default ImpactBrandFilters;
