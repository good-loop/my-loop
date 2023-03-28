import React, { useState, useEffect } from 'react';
import C from '../../C';
import ImpactBrandFilters from './ImpactBrandFilter';
import ImpactDateFilter from './ImpactDateFilter';
import ImpactAccountButton from './ImpactAccountButton';

/**
 * DEBUG OBJECTS
 */

import { assert } from '../../base/utils/assert';
const A = C.A;


/**
 * 
 * @param {string} size wide|thin on what page size to draw this element, thin="mobile" wide="desktop" are the only expected values
 * @returns 
 */
const ImpactFilterOptions = ({size, pvBaseObjects, status, setForcedReload, curPage}) => {

	assert (size == "wide" || size == "thin")

	const {masterBrand, brand, campaign} = pvBaseObjects.value || {};
	console.log(masterBrand, brand, campaign)


	if(size == "wide") return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters loading={!pvBaseObjects.resolved} masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload} size={size} dropdown curPage={curPage} status={status}/>
			<ImpactDateFilter setForcedReload={setForcedReload} />
			{pvBaseObjects.resolved && <ImpactAccountButton curMaster={masterBrand} curSubBrand={brand} curCampaign={campaign} />}
		</div>
	)

	if(size == "thin") return (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters loading={!pvBaseObjects.resolved} masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload} size={size} dropdown curPage={curPage} status={status}/>
			{pvBaseObjects.resolved && <ImpactAccountButton curMaster={masterBrand} curSubBrand={brand} curCampaign={campaign} noShare/>}
		</div>
	)
}

export default ImpactFilterOptions;