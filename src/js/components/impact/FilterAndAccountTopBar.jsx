import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import { useTransition, animated, useSpring } from 'react-spring';
import AccountMenu from '../../base/components/AccountMenu';
import Icon from '../../base/components/Icon';
import LinkOut from '../../base/components/LinkOut';
import Logo from '../../base/components/Logo';
import Campaign from '../../base/data/Campaign';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import Roles from '../../base/Roles';
import SearchQuery from '../../base/searchquery';
import { getId } from '../../base/data/DataClass';
import AThing from '../../base/data/AThing';

import Misc from '../../base/components/Misc';

import { encURI, is, isMobile, space } from '../../base/utils/miscutils';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import { isPer1000 } from '../pages/greendash/GreenMetrics';

import DataStore from '../../base/plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import { assert } from '../../base/utils/assert';
import { openAndPopulateModal } from './GLCards';
import Tree from '../../base/data/Tree';
import ListLoad from '../../base/components/ListLoad';

/**
 * DEBUG OBJECTS
 */

import { TEST_BRAND } from './TestValues';

const A = C.A;




/**
 * Left hand nav bar + top-right account menu
 * 
 * @param {Object} p
 * @param {?string} p.active
 * @returns 
 */
const Filters = ({masterBrand, curSubBrand, setCurSubBrand, curCampaign, setCurCampaign, brandTree, toggleLeftModal, filters}) => {
	
	const FilterOptionRow = ({name, url}) => {
		if(url == "") {
			return <><div className="filter-image filter-blank-image" /><span>{name}</span></>
		}
		else {
			return <><img className="filter-image" src={url}></img><span>{name}</span></>
		}
	}

	const filterChange = (node) => {
		console.log("changing to node: ", node)
		if(node.type == "brand"){
			setCurSubBrand(null)
			setCurCampaign(null)
		}
		else if(node.type == "subbrand") {
			setCurSubBrand(node)
			setCurCampaign(null)
		}
		else if(node.type == "campaign") {
			setCurSubBrand(node.parent)
			setCurCampaign(node)
		}
		else {
			throw new Error ("no valid type found for filter selection")
		}

		// as far as I understand it, this should change let users set filters???
		filters.brand2 = curSubBrand
		filters.campaign = curCampaign
		DataStore.setValue(['location','params'], filters);
		
	}
	
	const TreeToListJSX = ({tree, listClass=""}) => {
		if(tree.children.length == 0){
			return
		}

		return(
			<ul className={"filter-set"+(listClass)}>
				{tree.children.map(node => {
					let campaigns = TreeToListJSX({tree:node, listClass:"-nestedRow"})
					return (
						<>
							<a onClick={(event) => filterChange(node)}><li> <FilterOptionRow name={node.name} url={node.img} /> </li></a>
							{campaigns}
						</>
					)
				})}
			</ul>
		)
	}


		/**
	* These can be clicked or control-clicked
	*
	* @param servlet
	* @param navpage -- How/why/when does this differ from servlet??
	* @param nameFn {Function} Is there a non-standard way to extract the item's display name?
	* 	TODO If it's of a data type which has getName(), default to that
	* @param extraDetail {Element} e.g. used on AdvertPage to add a marker to active ads
	*/
	const CampaignListItem = ({ type, item, checkboxes, canDelete, nameFn, extraDetail, button}) => {
		const id = getId(item);
		// let checkedPath = ['widget', 'ListLoad', type, 'checked'];
		let name = nameFn ? nameFn(item, id) : item.name || item.text || id || '';
		if (name.length > 280) name = name.slice(0, 280);
		const status = item.status || "";
		
		let thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='placeholder-thumbnail' />
		
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
	* These can be clicked or control-clicked
	*
	* @param servlet
	* @param navpage -- How/why/when does this differ from servlet??
	* @param nameFn {Function} Is there a non-standard way to extract the item's display name?
	* 	TODO If it's of a data type which has getName(), default to that
	* @param extraDetail {Element} e.g. used on AdvertPage to add a marker to active ads
	*/
	const FilterListItem = ({ type, item, checkboxes, canDelete, nameFn, extraDetail, button}) => {
		const id = getId(item);
		// let checkedPath = ['widget', 'ListLoad', type, 'checked'];
		let name = nameFn ? nameFn(item, id) : item.name || item.text || id || '';
		if (name.length > 280) name = name.slice(0, 280);
		const status = item.status || "";
		
		const [isDropdownOpen, setIsDropdownOpen] = useState(false)

		const campaignClasses = space("filter-button campaign-button ListItem btn-default btn btn-outline-secondary", KStatus.PUBLISHED, 'btn-space')
		const campaignsListItem = (<div id={"campaigns-"+item.id} className={ + isDropdownOpen ? "open" : "closed"}>
			<ListLoad hideTotal status={status}
				type={C.TYPES.Campaign}
				q={SearchQuery.setProp(null, "vertiser", id).query}
				onClickItem={(item) => console.log("clicked...", item)}
				itemClassName={campaignClasses}
				ListItem={CampaignListItem}/>
		</div>)

		let thumbnail = (item.branding) ? <Misc.Thumbnail item={item} /> : <div className='placeholder-thumbnail' />
		
		
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

		const classes = space("brand-button ListItem btn-default btn btn-outline-secondary", KStatus.PUBLISHED, 'btn-space')

		let modalContent = () => (
			<div className='' id="filter-modal-container">
				{/* master brand & its campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
					q={SearchQuery.setProp(null, "id", vertiser).query} 
					ListItem={FilterListItem} itemClassName={classes}/>

				{/* sub brands & their campaigns */}
				<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
            		q={SearchQuery.setProp(null, "parentId", vertiser).query} 
					ListItem={FilterListItem} itemClassName={classes}/>
			</div>
		)
		openAndPopulateModal({id:"left-half", content:modalContent, title:"(still need red bar here)", prioritized:true})
	}


	// CHECK THIS IS TRUE, ITS ASSUMED AS THATS WHAT NESTLE IS LIKE BUT THIS MIGHT NOT BE UNIVERSAL
	//if(curCampaign) assert(curSubBrand)	// as campaigns are ran by subbrands, ensure there's not a break in the relation 
	//assert(masterBrand.name)

	// helper JSX elements
	const FilterButton = ({content, id, className}) => <button className="filter-row filter-text" onClick={() => openFilters()}>{content}</button>
	const RightArrow = () => <button className='filter-row' onClick={() => openFilters()}> &#62; </button> // &#62; is the number for '>'
	const DropDownIcon = () => <button className='filter-row filter-down-arrow' onClick={() => openFilters()} />

	// only vertiser is selected
	console.log("-----", masterBrand, curSubBrand, curCampaign)
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

	// only veriser and brand are selected 
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

	// all are selected
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

const Account = () => {
	return (
		<div id="impact-overview-accounts">
			<div className="impact-topbar-icon account-icon" />
			<div className="impact-topbar-icon account-icon" />
		</div>
	)
}


/**
 * 
 * @param {size} string on what page size to draw this element, currently "mobile" and "desktop" are the only expected values
 * @returns 
 */
const FilterAndAccountTopBar = ({size}) => {

	const [isOpen, setIsOpen] = useState(true)
	let filters = DataStore.getValue('location','params');

	// rough structure of brands, figure out how to find root
	// TODO: delete this later, this is just a very rough assumed data structure 
	const brandTree = {
		name: "Nestle",
		img: "img/icons/Heart.svg",
		children : 
			[
				{
					name: "Sub brand 1",
					img: "",
					children : [],
					type: "subbrand"
				},
				{
					name: "Sub brand 2",
					img: "/img/icons/HEART ICON.png",
					children : [],
					type: "subbrand"
				},
				{
					name: "Sub brand 3",
					img: "",
					children : 
						[
							{
								name: "camp 3.1",
								img: "img/blog/header.png",
								children : [],
								type: "campaign",
								parent: {name: "Sub brand 3"}
							},
							{
								name: "camp 3.1",
								img: "",
								children : [],
								type: "campaign",
								parent: {name: "Sub brand 3"}
							}
						],
						type: "subbrand"
				},
				{
					name: "Sub brand 4",
					img: "/img/icons/HEART ICON.png",
					children : 
					[						
						{
							name: "camp 4.1",
							img: "img/ourstory/part-of-earth.png",
							children : [],
							type: "campaign",
							parent: {name: "Sub brand 4"}
						},
						{
							name: "camp 4.2",
							img: "",
							children : [],
							type: "campaign",
							parent: {name: "Sub brand 4"}
						},
						{
							name: "camp 4.3",
							img: "/img/icons/HEART ICON.png",
							children : [],
							type: "campaign",
							parent: {name: "Sub brand 4"}
						}
					],
					type: "subbrand"
				},
				{
					name: "Sub brand 5",
					img: "",
					children : [],
					type: "subbrand"
				}
			],
		type: "brand"
	}

	// is this the correct naming scheme? eg "Nestle" -> "Nespreso UK" -> "Nespresso Connoisseurship..."
	const masterBrand = {name:"Nestle", subBrands:brandTree.children}	// get this manually later? Unsure of how much I should add in plumbing
	const [curSubBrand, setCurSubBrand] = useState(filters.brand2)
	const [curCampaign, setCurCampaign] = useState(filters.campaign) 
	
	return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<Filters masterBrand={masterBrand} curSubBrand={curSubBrand} setCurSubBrand={setCurSubBrand} curCampaign={curCampaign} setCurCampaign={setCurCampaign} brandTree={brandTree} filters={filters}/>
			<Account />
		</div>
	)
}

export default FilterAndAccountTopBar;
