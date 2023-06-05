import React, { useState, useEffect } from 'react';
import C from '../../C';
import ImpactBrandFilters from './ImpactBrandFilter';
import ImpactDateFilter from './ImpactDateFilter';
import ImpactAccountButton from './ImpactAccountButton';
import { GLModalCard } from './GLCards';

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

	// psuedo users shouldn't be able to change filters or share & don't have an account, so no point showing any of this component to them
	if( ! Login.getId() || Login.getId().endsWith("pseudo")) return null;

	const {masterBrand, brand, campaign} = pvBaseObjects.value || {};
	let content = null;

	if(size == "wide") content = (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters loading={!pvBaseObjects.resolved} masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload} size={size} dropdown curPage={curPage} status={status}/>
			<ImpactDateFilter setForcedReload={setForcedReload} />
			{pvBaseObjects.resolved && <ImpactAccountButton curMaster={masterBrand} curSubBrand={brand} curCampaign={campaign} />}
		</div>
	)

	if(size == "thin") content = (		
		<div className='flex-row impactOverview-filters-and-account' id={"impactOverview-filters-and-account-"+size}>
			<ImpactBrandFilters loading={!pvBaseObjects.resolved} masterBrand={masterBrand} brand={brand} campaign={campaign} setForcedReload={setForcedReload} size={size} dropdown curPage={curPage} status={status}/>
			{pvBaseObjects.resolved && <ImpactAccountButton curMaster={masterBrand} curSubBrand={brand} curCampaign={campaign} noShare/>}
		</div>
	)

	return <>
		{content}
		<GLModalCard className='filter-display' id="filter-display" useOwnBackdrop >
		</GLModalCard>
	</>;
}

export default ImpactFilterOptions;
