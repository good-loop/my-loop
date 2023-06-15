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


/** Set the URL params for time period. Overwrite last history entry so the back button doesn't get clogged with spam */
const setURLPeriod = (period, clearParams) => {
	modifyPage(null, period, false, clearParams, {replaceState: true});
};

/** Extract the time period filter from URL params if present - if not, apply "current quarter" by default */
const initPeriod = () => {
	let period = null || getPeriodFromUrlParams(); // TODO fix this, recent date-utils changes broke this!
	if (!period) {
		period = getPeriodQuarter(new Date());
		setURLPeriod({ period: period.name }, false);
	}
	return period;
};


/** All the URL parameters that pertain to the dashboard filters */
const allFilterParams = ['period', 'start', 'end'];


const ImpactDateFilter = ({doReload}) => {
	const [period, setPeriod] = useState(initPeriod());

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
		setURLPeriod(periodToParams(period), true);
		doReload();
		modalToggle();
	}, [dummy]);

	const Content = <div>
		<DateRangeWidget dflt={period} onChange={setPeriod} />
		<Button color='primary' onClick={doCommit}>
			Apply
		</Button>
	</div>;

	const onClick = () => openAndPopulateModal({
		id: 'filter-display',
		Content,
		prioritized:true,
		className: 'date-modal',
		headerClassName: 'red-top-border noClose'
	});

	return (
	<div id="date-filters">
		<button className="filter-row filter-text" onClick={onClick}>Date</button>
		<button className='filter-row filter-down-arrow' onClick={onClick} />
	</div>
	)
}


export default ImpactDateFilter;
