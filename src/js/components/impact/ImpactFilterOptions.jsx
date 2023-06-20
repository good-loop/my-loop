import React, { useState, useEffect } from 'react';
import C from '../../C';
import ImpactBrandFilters from './ImpactBrandFilter';
import ImpactDateFilter from './ImpactDateFilter';
import { GLModalCard } from './GLCards';

/**
 * DEBUG OBJECTS
 */

import { assert } from '../../base/utils/assert';
import AccountMenu from '../../base/components/AccountMenu';
import { ShareDash } from '../pages/greendash/GreenNavBar';
import DevOnly from '../../base/components/DevOnly';
const A = C.A;


/**
 * This is the top navbar
 * 
 * ??How does it fit with ImpactNavBars.jsx??
 * 
 * @param {string} size wide|thin on what page size to draw this element, thin="mobile" wide="desktop" are the only expected values
 * @returns 
 */
const ImpactFilterOptions = ({size, pvBaseObjects, status, doReload, curPage}) => {
	assert({wide: true, thin: true}[size]);

	// Anonymous and pseudo-users can't change filters or share
	if ( !Login.getId()) return null;
	const pseudoUser = userId && userId.endsWith('@pseudo');
	if (pseudoUser) {
		return <LogoutLink className="nav-link">Logout</LogoutLink>;
	}

	const { masterBrand, brand, campaign } = pvBaseObjects.value || {};

	const isWide = (size === 'wide');

	// NB: see GreenNavBar.jsx
	const userId = Login.getId();


	return <>
		<div className="flex-row impactOverview-filters-and-account" id={`impactOverview-filters-and-account-${size}`}>
			<ImpactBrandFilters loading={!pvBaseObjects.resolved} masterBrand={masterBrand} brand={brand} campaign={campaign} doReload={doReload} size={size} dropdown curPage={curPage} status={status}/>
			{/* Remove for demo
			<DevOnly>
				<ImpactDateFilter doReload={doReload} />
			</DevOnly>*/}
			<AccountMenu className="float-left" noNav shareWidget={<ShareDash className='m-auto' />}/>
		</div>
		{/* Modal content is filled in elsewhere by openAndPopulateModal({id: 'filter-display'}) */}
		<GLModalCard className="filter-display" id="filter-display" useOwnBackdrop />
	</>;
}

export default ImpactFilterOptions;
