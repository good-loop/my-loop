import React, { useState, useEffect } from 'react';
import C from '../../C';
import PropControlPeriod from '../../base/components/propcontrols/PropControlPeriod'
import { openAndPopulateModal } from './GLCards';

/**
 * DEBUG OBJECTS
 */

const A = C.A;


const ImpactDateFilter = ({}) => {
	let content = () => (<div><PropControlPeriod calendarFormat/></div>)
	let onClick = () => openAndPopulateModal({id:"hero-card-modal", content:content, prioritized:true, headerClassName:"red-top-border noClose"})
	return (
	<div id="date-filters">
		<button className="filter-row filter-text" onClick={onClick}>Date</button>
		<button className='filter-row filter-down-arrow' onClick={onClick}/>
	</div>
	)
}


export default ImpactDateFilter;
