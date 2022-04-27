import React, { useState } from 'react';
import { Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from 'reactstrap';
import { getPeriodQuarter, printPeriod } from './dashutils';


/** Generate the list of quarter-period shortcuts */
const getQuarterButtons = () => {
	const buttons = [];
	const dateCursor = new Date();
	dateCursor.setDate(1); // avoid month-length problems
	for (let i = 0; i < 4; i++) {
		const q = getPeriodQuarter(dateCursor);
		buttons.push(
			<DropdownItem onClick={() => DataStore.setUrlValue("period", q.name)} key={q.name}>
				{printPeriod(q)}
			</DropdownItem>
		);
		dateCursor.setMonth(dateCursor.getMonth() - 3);
	}
	return buttons;
};


/** What time period, brand, and campaign are currently in focus? */
const GreenDashboardFilters = ({period, campaign, brand}) => {
	// What are the 4 most recent quarters, for the menu?
	const [quarterButtons] = useState(() => getQuarterButtons());
	// TODO Hook up a custom period picker

	// TODO brands: for internal purposes make all available?

	// TODO campaigns

	return (
		<Row className="greendash-filters mb-2">
			<Col xs="12">
				<img src="brand.png" alt="Brand Logo" />
				<UncontrolledButtonDropdown>
					<DropdownToggle caret>Timeframe</DropdownToggle>
					<DropdownMenu>
						{quarterButtons}
						<DropdownItem>Custom</DropdownItem>
					</DropdownMenu>
				</UncontrolledButtonDropdown>
				<UncontrolledButtonDropdown type="select">
					<DropdownToggle caret>All brands</DropdownToggle>
				</UncontrolledButtonDropdown>
				<UncontrolledButtonDropdown type="select">
					<DropdownToggle caret>All campaigns</DropdownToggle>
				</UncontrolledButtonDropdown>
			</Col>
		</Row>
	);
};


export default GreenDashboardFilters;