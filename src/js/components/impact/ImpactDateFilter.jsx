import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import C from '../../C';
import PropControlPeriod from '../../base/components/propcontrols/PropControlPeriod'
import { openAndPopulateModal } from './GLCards';
import DateRangeWidget from '../DateRangeWidget';
import { getPeriodFromUrlParams, getPeriodQuarter, periodToParams } from '../../base/utils/date-utils';
import { modifyPage } from '../../base/plumbing/glrouter';
import { nonce } from '../../base/data/DataClass';
import DataStore from '../../base/plumbing/DataStore';
import { modalToggle } from './GLCards';

/** Extract the time period filter from URL params if present - if not, apply "current quarter" by default */
const initPeriod = () => {
	let period = null || getPeriodFromUrlParams(); // TODO fix this, recent date-utils changes broke this!
	if (!period) {
		period = getPeriodQuarter(new Date());
		modifyPage(null, { period: period.name }, false, false, {replaceState:true});
	}
	return period;
};

/** All the URL parameters that pertain to the dashboard filters */
const allFilterParams = ['period', 'start', 'end'];

const ImpactDateFilter = ({setForcedReload}) => {

	let [period, setPeriod] = useState(initPeriod());

	// Update this to signal that the new filter values should be applied
	const [dummy, setDummy] = useState(false);
	const doCommit = () => setDummy(nonce());

	// On signal - Write updated filter spec back to URL parameters
	useEffect(() => {
		if (!dummy) return;
		// Remove all URL params pertaining to green dashboard, and re-add the ones we want.
		const { params } = DataStore.getValue('location');
		allFilterParams.forEach((p) => {
			delete params[p];
		});
		modifyPage(
			null,
			periodToParams(period),
			false,
			true,
			{replaceState:true} // dont break the back button
		);
		setForcedReload(true);
		modalToggle();
	}, [dummy]);

	let content = () => (<div>
		<DateRangeWidget dflt={period} onChange={setPeriod} />
		<Button color='primary' onClick={doCommit}>
			Apply
		</Button>
	</div>)
	let onClick = () => openAndPopulateModal({id:"filter-display", content, prioritized:true, headerClassName:"red-top-border noClose", className:"date-modal"})
	return (
	<div id="date-filters">
		<button className="filter-row filter-text" onClick={onClick}>Date</button>
		<button className='filter-row filter-down-arrow' onClick={onClick}/>
	</div>
	)
}


export default ImpactDateFilter;
