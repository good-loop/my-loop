import React, { useEffect, useState } from 'react';

import { Alert, Button, Col, Container, Row } from 'reactstrap';
// import ChartWidget from '../../../base/components/ChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';
import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import Misc from '../../../base/components/Misc';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import { getDataLogData } from '../../../base/plumbing/DataLog';
import { getDataList } from '../../../base/plumbing/Crud';

import { getPeriodQuarter, GreenCard, periodFromUrl, printPeriod } from './dashutils';
import { getCarbon } from './carboncalc';

import GreenDashboardFilters from './GreenDashboardFilters';
import BreakdownCard from './BreakdownCard';
import JourneyCard from './JourneyCard';
import TimeSeriesCard from './TimeSeriesCard';
import CompareCard from './CompareCard';
import TimeOfDayCard from './TimeOfDayCard';
import { modifyPage } from '../../../base/plumbing/glrouter';
import ErrAlert from '../../../base/components/ErrAlert';


const OverviewWidget = ({period, data}) => {
	return (
		<Row className="greendash-overview mb-2">
			<Col xs="12">
				<span className="period mr-4">{printPeriod(period)}</span>
				<span className="impressions">Impressions served: 
					{/* <span className="impressions-count">{printer.prettyInt(data.total.imps[0])}</span> */}
				</span>
			</Col>
		</Row>
	);
};


const CTACard = ({}) => {
	return <GreenCard className="carbon-cta flex-column">
		<div className="cta-card-decoration">
			<img className="tree-side" src="/img/green/tree-light.svg" />
			<img className="tree-centre" src="/img/green/tree-light.svg" />
			<img className="tree-side" src="/img/green/tree-light.svg" />
		</div>
		<p className="mb-2">
			Interested to know more about climate positive advertising?
		</p>
		<a className="get-in-touch pull-right text-right" href="https://www.good-loop.com/contact" target="_blank">
			<Button color="primary" size="md">
				Get In Touch
			</Button>
		</a>
	</GreenCard>;
};

const GreenMetrics2 = ({}) => {
	// Only for logged-in users!
	if ( ! Login.isLoggedIn()) {
		return <div>
			<h3 className="text-center">Log in to access the Green Dashboard</h3>
			<Container>
				<Row>
					<Col xs="12" sm="6" className="mx-auto">
						<LoginWidgetEmbed verb="login" />
					</Col>
				</Row>
			</Container>
		</div>;
	}

	// Default to current quarter, all brands, all campaigns
	const period = {name:"this month", start:new Date("2022-06-01"), end:new Date("2022-06-30")}; // FIXME initPeriod();
	const brandId = DataStore.getUrlValue('brand');
	const campaignId = DataStore.getUrlValue('campaign');
	const tagId = DataStore.getUrlValue('tag');

	// const { pvBrands, pvCampaigns, pvTags } = getGreenDashObjects(brandId, campaignId, tagId);

	// What are we going to filter on? ("adid" rather than "tag" because that's what we'll search for in DataLog)
	const filterMode = campaignId ? 'campaign' : brandId ? 'brand' : tagId ? 'adid' : null;
	// Get the ID for the object we're filtering for
	const filterId = {campaign: campaignId, brand: brandId, adid: tagId}[filterMode];

	if ( ! filterMode) {
		return <Alert color="info">Select a brand, campaign, or tag to see data.</Alert>;
	} 
	
	// Fetch common data for CO2Card and BreakdownCard.
	// JourneyCard takes all-time data, CompareCard sets its own time periods, TimeOfDayCard overrides time-series interval
	// ...but give them the basic filter spec so they stay in sync otherwise
	const baseFilters = {
		q: `${filterMode}:${filterId}`,
		start: period.start.toISOString(),
		end: period.end.toISOString(),
	};

	const pvChartData = getCarbon({
		...baseFilters,
		// breakdowns: ['time', 'os'],
		// tags,
	});

	if ( ! pvChartData.resolved) {
		return <Misc.Loading text="Fetching campaign lifetime data..." />;
	}	
	if ( ! pvChartData.value) {
		return <ErrAlert error={pvChartData.error} color="danger" />;
	}

	const commonProps = { period, 
			// brands, campaigns, tags, 
			baseFilters };

	return (<>
		<OverviewWidget period={period} data={pvChartData.value} />
		<Row className="card-row">
			<Col xs="12" sm="8" className="flex-column">
				TODO TimeSeriesCard
				{/* <TimeSeriesCard {...commonProps} data={pvChartData.value} /> */}
			</Col>
			<Col xs="12" sm="4" className="flex-column">
				<JourneyCard {...commonProps} />
			</Col>
		</Row>
		<Row className="card-row">
			<Col xs="12" sm="4" className="flex-column">
				TODO CompareCard
				{/* <CompareCard {...commonProps} /> */}
			</Col>
			<Col xs="12" sm="4" className="flex-column">
				TODO BreakdownCard
				{/* <BreakdownCard {...commonProps} data={pvChartData.value} /> */}
			</Col>
			<Col xs="12" sm="4" className="flex-column">
				TODO TODCard
				{/* <TimeOfDayCard {...commonProps} /> */}
				<CTACard />
			</Col>
		</Row>
		</>
	);
};


const GreenMetrics = ({}) => {
	return <div className="green-subpage green-metrics">
			<Container fluid>
				<GreenDashboardFilters />
				<GreenMetrics2 />
			</Container>
		</div>;
};

export default GreenMetrics;
