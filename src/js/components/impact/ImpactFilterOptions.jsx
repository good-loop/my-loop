import React, { useState, useEffect } from 'react';
import C from '../../C';
import ImpactBrandFilters from './ImpactBrandFilter';
import ImpactDateFilter from './ImpactDateFilter';
import ImpactAccountButton from './ImpactAccountButton';

/**
 * DEBUG OBJECTS
 */

import { TEST_BRAND } from './TestValues';
import { assert } from '../../base/utils/assert';
const A = C.A;


/**
 * 
 * @param {size} string on what page size to draw this element, currently "mobile" and "desktop" are the only expected values
 * @returns 
 */
const ImpactFilterOptions = ({size}) => {

	assert (size == "wide" || size == "thin")

	const [curMaster, setCurMaster] = useState({id:TEST_BRAND, name:"Nestle"})
	const [curSubBrand, setCurSubBrand] = useState(null)
	const [curCampaign, setCurCampaign] = useState(null)
	

	if(size == "wide") return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters masterBrand={curMaster} curSubBrand={curSubBrand} setCurSubBrand={setCurSubBrand} curCampaign={curCampaign} setCurCampaign={setCurCampaign}/>
			<ImpactDateFilter />
			<ImpactAccountButton curMaster={curMaster} curSubBrand={curSubBrand} curCampaign={curCampaign} />
		</div>
	)

	if(size == "thin") return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters masterBrand={curMaster} curSubBrand={curSubBrand} setCurSubBrand={setCurSubBrand} curCampaign={curCampaign} setCurCampaign={setCurCampaign}/>
			<ImpactAccountButton curMaster={curMaster} curSubBrand={curSubBrand} curCampaign={curCampaign} />
		</div>
	)
}

export default ImpactFilterOptions;
