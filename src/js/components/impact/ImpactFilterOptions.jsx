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
const ImpactFilterOptions = ({size, masterBrand, brand, campaign, setForcedReload, curPage}) => {

	assert (size == "wide" || size == "thin")

	console.log(masterBrand, brand, campaign)


	if(size == "wide") return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload} size={size} dropdown curPage={curPage}/>
			<ImpactDateFilter setForcedReload={setForcedReload} />
			<ImpactAccountButton curMaster={masterBrand} curSubBrand={brand} curCampaign={campaign} />
		</div>
	)

	if(size == "thin") return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload} size={size} dropdown curPage={curPage}/>
			<ImpactAccountButton curMaster={masterBrand} curSubBrand={brand} curCampaign={campaign} noShare/>
		</div>
	)
}

export default ImpactFilterOptions;
