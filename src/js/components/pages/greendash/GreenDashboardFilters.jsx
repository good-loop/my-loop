import React, { useState } from 'react';
import { Button, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, UncontrolledDropdown } from 'reactstrap';
import DataStore from '../../../base/plumbing/DataStore';
import { stopEvent } from '../../../base/utils/miscutils';
import DateRangeWidget from '../../DateRangeWidget';
import { getPeriodQuarter, periodFromUrl, periodToUrl, printPeriod } from './dashutils';


/** Generate the list of quarter-period shortcuts */
const QuarterButtons = ({ period, setNamedPeriod }) => {
	const buttons = [];
	const dateCursor = new Date();
	dateCursor.setDate(1); // avoid month-length problems
	for (let i = 0; i < 4; i++) {
		const q = getPeriodQuarter(dateCursor);

		buttons.push(
			<DropdownItem onClick={() => setNamedPeriod(q.name)} key={q.name}>
				{printPeriod(q)}{period.name === q.name ? <span className="selected-marker" /> : null}
			</DropdownItem>
		);
		dateCursor.setMonth(dateCursor.getMonth() - 3);
	}
	return buttons;
};


const defaultFilterMode = (brand, campaign, tag) => {
	if (brand && brand !== 'all') return 'brand';
	if (campaign && campaign !== 'all') return 'campaign';
	if (tag && tag !== 'all') return 'tag';
}


/** What time period, brand, and campaign are currently in focus? */
const GreenDashboardFilters = ({}) => {
	const [period, setPeriod] = useState(periodFromUrl());
	const [brand, setBrand] = useState(() => DataStore.getUrlValue('brand'));
	const [campaign, setCampaign] = useState(() => DataStore.getUrlValue('campaign'));
	const [tag, setTag] = useState(() => DataStore.getUrlValue('tag'));

	const [filterMode, setFilterMode] = useState(defaultFilterMode(brand, campaign, tag));
	const [showCustomRange, setShowCustomRange] = useState(!period.name);

	// Update whichever ID we're currently filtering by
	const setCurrentTemp = filterMode === 'campaign' ? setCampaign : setTag;

	// Write updated filter spec back to URL parameters
	const commitFilters = () => {
		// Put currently-selected filter in URL...
		const filterVals = { brand, campaign, tag };
		DataStore.setUrlValue(filterMode, filterVals[filterMode], false);
		// ...and remove the others. (Don't provoke redraw yet!)
		delete filterVals[filterMode];
		Object.keys(filterVals).forEach((modeName) => DataStore.setUrlValue(modeName, null, false));
		
		// Apply date filter and trigger redraw
		periodToUrl(period);
	};

	// Shorthand for a click on one of the "Xth Quarter" buttons
	const setNamedPeriod = name => {
		setPeriod({name});
		commitFilters();
	};

	// TODO "Normal" access control:
	// - Advertisers & Campaigns will be shared with contacts
	// - Admin users get an email entry control to "act as" contacts
	// - When acting as non-admin, their available brands & campaigns populate dropdowns

	return (
		<Row className="greendash-filters mb-2">
			<Col xs="12">
				{ brand ? <img src="brand.png" alt="Brand Logo" /> : null }
				<Form inline>
					<UncontrolledDropdown className="filter-dropdown">
						<DropdownToggle caret>Timeframe</DropdownToggle>
						<DropdownMenu>
							<QuarterButtons period={period} setNamedPeriod={setNamedPeriod} />
							<DropdownItem toggle={false} onClick={() => setShowCustomRange(true)}>
								Custom
								{period.name ? null : <span className="selected-marker" />}
							</DropdownItem>
							{showCustomRange ? <>
								<DropdownItem divider />
								<DateRangeWidget dflt={period} onChange={setPeriod} />
								<DropdownItem className="btn btn-primary pull-right d-inline-block w-unset" onClick={commitFilters}>Apply custom timeframe</DropdownItem>
							</> : null}
						</DropdownMenu>
					</UncontrolledDropdown>
					<UncontrolledDropdown className="filter-dropdown ml-2">
						<DropdownToggle caret>Filter by {filterMode || '...'}</DropdownToggle>
						<DropdownMenu>
							<DropdownItem onClick={() => setFilterMode('campaign')}>
								{filterMode === 'campaign' ? <span className="selected-marker" /> : null}
								Campaign
							</DropdownItem>
							<DropdownItem onClick={() => setFilterMode('tag')}>
								{filterMode === 'tag' ? <span className="selected-marker" /> : null}
								Tag
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
					{filterMode ? <Input type="text" className="ml-2"
						placeholder={`Enter ${filterMode} ID here`}
						onChange={(e) => setCurrentTemp(e.target.value)}
						value={{ campaign, brand, tag }[filterMode]}
					/> : null}
					<Button className="ml-2" onClick={commitFilters} size="sm">Apply</Button>
{/*
					// TODO Reinstate when we're doing "normal" access control
					<UncontrolledButtonDropdown type="select">
						<DropdownToggle caret>All brands</DropdownToggle>
					</UncontrolledButtonDropdown>
					<UncontrolledButtonDropdown type="select">
						<DropdownToggle caret>All campaigns</DropdownToggle>
					</UncontrolledButtonDropdown>
*/}
				</Form>
			</Col>
		</Row>
	);
};


export default GreenDashboardFilters;