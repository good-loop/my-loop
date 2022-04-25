import React, { useEffect, useState } from 'react';
import { Card, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Input, Row, UncontrolledButtonDropdown } from 'reactstrap';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';

const quarterRegex = /^(\d\d?\d?\d?)-Q(\d)$/;
const monthRegex = /^(\d\d?\d?\d?)-(\d\d?)$/;
const yearRegex = /^(\d\d?\d?\d?)/;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


/**
 * Returns a period object for the quarter enclosing the given date
 * @param {?Date} date Default "now"
 * @returns 
 */
 const getPeriodQuarter = (date = new Date()) => {
	const qIndex = Math.floor(date.getMonth() / 4);
	const start = new Date(date);
	start.setMonth(qIndex * 4, 1);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 3);
	return {start, end, name: `${start.getFullYear()}-Q${qIndex + 1}`};
};


/**
 * Returns a period object for the month enclosing the given date
 * @param {?Date} date 
 * @returns 
 */
const getPeriodMonth = (date = new Date()) => {
	const start = new Date(date)
	start.setDate(1);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	return {start, end, name: `${start.getFullYear()}-${end.getMonth()}`};
};


const getPeriodYear = (date = new Date()) => {
	const start = new Date(date);
	start.setMonth(0, 1);
	start.setHours(0, 0, 0, 0);
	const end = new Date(date)
	end.setMonth(12);
	return {start, end, name: `${start.getFullYear()}`};
};


const periodFromUrl = () => {
	// User has set a named period (year, quarter, month)
	const periodName = DataStore.getUrlValue('period')
	if (periodName) {
		let refDate = new Date();
		
		const quarterMatches = periodName.match(quarterRegex);
		if (quarterMatches) {
			refDate.setFullYear(quarterMatches[1]);
			refDate.setMonth(4 * (quarterMatches[2] - 1));
			return getPeriodQuarter(refDate);
		}
		const monthMatches = periodName.match(monthRegex);
		if (monthMatches) {
			refDate.setFullYear(monthMatches[1]);
			refDate.setMonth(monthMatches[2]);
			return getPeriodMonth(refDate);
		}
		const yearMatches = periodName.match(yearRegex);
		if (yearMatches) {
			refDate.setFullYear(yearMatches[1]);
			return getPeriodYear(refDate)
		}
	}

	// User has set start/end datetime
	const start = DataStore.getUrlValue('start');
	const end = DataStore.getUrlValue('end');
	if (start || end) {
		const period = {};
		if (start) period.start = new Date(start);
		if (end) period.end = new Date(end);
		return period;
	}

	// Nothing set, default to "current quarter"
	return getPeriodQuarter();
};


/** Locale-independent date to string, formatted like "25 Apr 2022" */
const printDate = (date) => `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;


/** Turn period object into clear human-readable text */
const printPeriod = ({start, end, name = ''}) => {
	const quarterMatches = name.match(quarterRegex);
	if (quarterMatches) return `Q${quarterMatches[2]} ${quarterMatches[1]}`;

	const monthMatches = name.match(monthRegex);
	if (monthMatches) return `${monthNames[monthMatches[2]]} ${monthMatches[1]}`;

	const yearMatches = name.match(yearRegex);
	if (yearMatches) return `Year ${yearMatches[1]}`;

	return `${start ? printDate(start) : ``} to ${end ? printDate(end) : `now`}`;
}


/** Boilerplate styling for a subsection of the green dashboard */
const GreenCard = ({ title, children }) => {
	return <div className="green-card mb-2">
		<div className="gc-title">{title}</div>
		<Card body className="gc-body">{children}</Card>
	</div>
};


/** What time period, brand, and campaign are currently in focus? */
const FilterWidget = ({period}) => {
	const timeframe = DataStore.getUrlValue('timeframe');
	const campaign = DataStore.getUrlValue('campaign');
	const brand = DataStore.getUrlValue('brand');

	// Default to current quarter, all brands, all campaigns
	useEffect(() => {
		if (!timeframe) DataStore.setUrlValue('timeframe', getPeriodQuarter());
		if (!campaign) DataStore.setUrlValue('campaign', 'all');
		if (!brand) DataStore.setUrlValue('brand', 'all');

		// Remove dashboard-specific URL params on navigating away
		return () => {
			DataStore.setUrlValue('timeframe', null);
			DataStore.setUrlValue('campaign', null);
			DataStore.setUrlValue('brand', null);
		};
	}, []);

	// What are the 4 most recent quarters, for the menu?
	const last4Quarters = [];
	const dateCursor = new Date();
	dateCursor.setDate(1); // avoid month-length problems
	for (let i = 0; i < 4; i++) {
		last4Quarters.push(getPeriodQuarter(dateCursor));
		dateCursor.setMonth(dateCursor.getMonth() - 3);
	}

	// TODO brands: for internal purposes make all available?

	// TODO campaigns

	return (
		<Row className="greendash-filters mb-2">
			<Col xs="12">
				<img src="brand.png" alt="Brand Logo" />
				<UncontrolledButtonDropdown>
					<DropdownToggle caret>Timeframe</DropdownToggle>
					<DropdownMenu>
						{[last4Quarters].map(q => (
							<DropdownItem onClick={() => DataStore.setUrlValue("timeframe", q)}>{printPeriod(q)}</DropdownItem>
						))}
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


const OverviewWidget = ({period}) => {
	const imps = 255000;

	return (
		<Row className="greendash-overview mb-2">
			<Col xs="12">
				<span className="period mr-4">{printPeriod(period)}</span>
				<span className="impressions">Impressions served: <span className="impressions-count">{printer.prettyNumber(imps)}</span></span>
			</Col>
		</Row>
	);
};


const CO2Card = ({}) => {
	return <GreenCard title="How much carbon is your digital advertising emitting?">

	</GreenCard>;
};


const JourneyCard = ({}) => {
	return <GreenCard title="Your journey so far">

	</GreenCard>;
};


const CompareCard = ({}) => {
	return <GreenCard title="How do your ad emissions compare?">

	</GreenCard>;
};


const BreakdownCard = ({}) => {
	return <GreenCard title="What is the breakdown of your emissions?">

	</GreenCard>;
};


const TimeOfDayCard = ({}) => {
	return <GreenCard title="When are your ad carbon emissions highest?">

	</GreenCard>;
};


const CTACard = ({}) => {
	return <GreenCard title="Interested to know more about climate positive advertising?">

	</GreenCard>;
};


const GreenMetrics = ({}) => {
	const [period, setPeriod] = useState(() => periodFromUrl());
	const [campaign, setCampaign] = useState();
	const [brand, setBrand] = useState();

	const filterProps = { period, setPeriod, campaign, setCampaign, brand, setBrand };

	return (
		<div className="green-subpage green-metrics">

			<Container fluid>
				<FilterWidget {...filterProps} />
				<OverviewWidget period={period} />
				<Row>
					<Col md="8">
						<CO2Card {...filterProps} />
					</Col>
					<Col md="4">
						<JourneyCard />
					</Col>
				</Row>
				<Row>
					<Col md="4">
						<CompareCard />
					</Col>
					<Col md="4">
						<BreakdownCard />
					</Col>
					<Col md="4">
						<TimeOfDayCard />
						<CTACard />
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default GreenMetrics;
