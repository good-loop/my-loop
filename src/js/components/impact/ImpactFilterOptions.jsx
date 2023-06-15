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
const ImpactFilterOptions = ({size, pvBaseObjects, status, doReload, curPage}) => {
	assert({wide: true, thin: true}[size]);

	// Anonymous and pseudo-users can't change filters or share
	if (!Login.getId() || Login.getId().endsWith('pseudo')) return null;

	const { masterBrand, brand, campaign } = pvBaseObjects.value || {};

	const isWide = (size === 'wide');

	return <>
		<div className="flex-row impactOverview-filters-and-account" id={`impactOverview-filters-and-account-${size}`}>
			<ImpactBrandFilters loading={!pvBaseObjects.resolved} masterBrand={masterBrand} brand={brand} campaign={campaign} doReload={doReload} size={size} dropdown curPage={curPage} status={status}/>
			{isWide && <ImpactDateFilter doReload={doReload} />}
			{pvBaseObjects.resolved && (
				<ImpactAccountButton curMaster={masterBrand} curSubBrand={brand} curCampaign={campaign} noShare={!isWide} />
			)}
		</div>
		{/* Modal content is filled in elsewhere by openAndPopulateModal({id: 'filter-display'}) */}
		<GLModalCard className="filter-display" id="filter-display" useOwnBackdrop />
	</>;
}

export default ImpactFilterOptions;
