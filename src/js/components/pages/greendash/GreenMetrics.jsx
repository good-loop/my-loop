import React, { useEffect, useState } from 'react';

import { Alert, Button, Col, Container, Row } from 'reactstrap';
// import ChartWidget from '../../../base/components/ChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';
import { getPeriodQuarter, GreenCard, periodFromUrl, periodKey, printPeriod } from './dashutils';
import GreenDashboardFilters from './GreenDashboardFilters';
import CO2Card from './CO2Card';
import Misc from '../../../base/components/Misc';
import { getDataLogData } from '../../../base/plumbing/DataLog';
import { getDataList } from '../../../base/plumbing/Crud';
import BreakdownCard from './BreakdownCard';
import JourneyCard from './JourneyCard';
import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import ActionMan from '../../../plumbing/ActionMan';
import CompareCard from './CompareCard';
import TimeOfDayCard from './TimeOfDayCard';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import { getCarbon } from './carboncalc';


const OverviewWidget = ({period, data}) => {
	return (
		<Row className="greendash-overview mb-2">
			<Col xs="12">
				<span className="period mr-4">{printPeriod(period)}</span>
				<span className="impressions">Impressions served: <span className="impressions-count">{printer.prettyInt(data.allCount)}</span></span>
			</Col>
		</Row>
	);
};


const CTACard = ({}) => {
	return <GreenCard className="half-height">
		Interested to know more about<br/>
		climate positive advertising?
		<div className="cta-card-decoration">
			<img className="tree-side" src="/img/green/tree-light.svg" />
			<img className="tree-centre" src="/img/green/tree-light.svg" />
			<img className="tree-side" src="/img/green/tree-light.svg" />
		</div>
		<a className="pull-right text-right" href="https://www.good-loop.com/contact" target="_blank">
			<Button color="primary" size="lg">
				Get In Touch
			</Button>
		</a>
	</GreenCard>;
};

const initPeriod = () => {
	let period = periodFromUrl();
	if (!period) {
		period = getPeriodQuarter();
		DataStore.setUrlValue('period', period.name);
	}
	return period;
};


/**
 * Get a list of parent objects to each item in a PV which may or may not have resolved
 * @param {*} parentType Thing type to retrieve
 * @param {*} pvChildren The 
 * @returns 
 */
const getParentThings = (parentType, pvChildren) => {
	if (!pvChildren || !pvChildren.value) return {};
	const children = pvChildren.value.hits;

	const typeKey = parentType.toLowerCase(); // eg 'Advertiser' to 'advertiser'

	// eg IDs = [child1.advertiser, child2.advertiser] - go through reduce->object->keys to dedupe
	const ids = Object.keys(children.reduce((acc, child) => {
		acc[child[typeKey]] = true;
		return acc;
	}, {}));
	return getDataList({ type: parentType, status: KStatus.PUBLISHED, ids});
};

/**
 * 
 * @param {*} childType 
 * @param {*} pvParents
 */
const getChildThings = (childType, parentType, pvParents) => {
	if (!pvParents || !pvParents.value) return {};
	const parents = pvParents.value.hits;

	const typeKey = parentType.toLowerCase(); // eg 'Advertiser' to 'advertiser'

	// eg 'advertiser:J0ZxYQK OR advertiser:kWyJ1Bo'
	const q = parents.map(thing => `${typeKey}:${thing.id}`).join(' OR ');
	return getDataList({ type: childType, status: KStatus.PUBLISHED, q});
}


/**
 * 
 * @param {*} brandId 
 * @param {*} campaignId 
 * @param {*} tagId 
 */
const getGreenDashObjects = (brandId, campaignId, tagId) => {
	let pvBrands, pvCampaigns, pvTags;

	if (campaignId) {
		pvCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, ids: [campaignId] });
		pvTags = getDataList({ type: C.TYPES.GreenTag, status: KStatus.PUBLISHED, q: `campaign:${campaignId}` });
		pvBrands = getParentThings(C.TYPES.Advertiser, pvCampaigns);
	} else if (brandId) {
		pvBrands = getDataList({ type: C.TYPES.Advertiser, status: KStatus.PUBLISHED, ids: [brandId] });
		pvCampaigns = getChildThings(C.TYPES.Campaign, pvBrands);
		pvTags = getChildThings(C.TYPES.GreenTag, C.TYPES.Campaign, pvCampaigns);
	} else if (tagId) {
		pvTags = getDataList({ type: C.TYPES.GreenTag, status: KStatus.PUBLISHED, ids: [tagId] });
		pvCampaigns = getParentThings(C.TYPES.Campaign, pvTags);
		pvBrands = getParentThings(C.TYPES.Advertiser, pvCampaigns);
	} else {
		return {};
	}

	return { pvBrands, pvCampaigns, pvTags };
}


const GreenMetrics = ({}) => {
	// Only for logged-in users!
	if (!Login.isLoggedIn()) {
		return <div className="green-subpage green-metrics">
			<h3 className="text-center">Log in to access the Green Dashboard</h3>
			<Container>
				<Row fluid>
					<Col xs="12" sm="6" className="mx-auto">
						<LoginWidgetEmbed verb="login" />
					</Col>
				</Row>
			</Container>
		</div>;
	}

	// Default to current quarter, all brands, all campaigns
	const period = initPeriod();
	const brandId = DataStore.getUrlValue('brand');
	const campaignId = DataStore.getUrlValue('campaign');
	const tagId = DataStore.getUrlValue('tag');

	const { pvBrands, pvCampaigns, pvTags } = getGreenDashObjects(brandId, campaignId, tagId);

	useEffect(() => {
		// Remove dashboard-specific URL params on unmount (ie navigating away)
		// TODO Reinstate (currently scrubs state on error)
		// return () => {
		// 	DataStore.setUrlValue('period', null);
		// 	DataStore.setUrlValue('start', null);
		// 	DataStore.setUrlValue('end', null);
		// 	DataStore.setUrlValue('campaign', null);
		// 	DataStore.setUrlValue('brand', null);
		// 	DataStore.setUrlValue('tag', null);
		// };
	}, []);



	// What are we going to filter on? ("adid" rather than "tag" because that's what we'll search for in DataLog)
	const filterMode = campaignId ? 'campaign' : brandId ? 'brand' : tagId ? 'adid' : null;
	// Get the ID for the object we're filtering for
	const filterId = {campaign: campaignId, brand: brandId, adid: tagId}[filterMode];

	// What are we going to populate the page with?
	let content;

	if (!filterMode) {
		content = <div><Alert color="info">Select a brand, campaign, or tag to see data.</Alert></div>;
	} else if (!pvTags.resolved) {
		content = <Misc.Loading text="Fetching Green Ad Tags" />;
	} else if (!pvTags.value.hits.length) {
		content = <div><Alert color="danger">Couldn't find Green Ad Tags for {filterMode}: {filterId}</Alert></div>;
	} else if (!pvBrands.resolved) {
		content = <Misc.Loading text="Fetching Brand Data" />;
	} else if (!pvBrands.value.hits.length) {
		content = <div><Alert color="danger">Couldn't retrieve brand data for {filterMode}: {filterId}</Alert></div>;
	} else if (!pvCampaigns.resolved) {
		content = <Misc.Loading text="Fetching Campaign Data" />
	} else if (!pvCampaigns.value.hits.length) {
		content = <div><Alert color="danger">Couldn't retrieve campaign data for {filterMode}: {filterId}</Alert></div>;
	}
	
	// No content = all objects loaded! Time to fetch data and start calculating carbon.
	if (!content) {
		const brands = pvBrands.value.hits;
		const campaigns = pvCampaigns.value.hits;
		const tags = pvTags.value.hits;

		// Fetch common data for CO2Card and BreakdownCard.
		// JourneyCard takes all-time data, CompareCard sets its own time periods, TimeOfDayCard overrides time-series interval
		const baseFilters = {
			dataspace: 'green',
			q: `evt:pixel AND ${filterMode}:${filterId}`,
			breakdowns: ['time/adid', 'os/adid', 'adid'],
			start: period.start.toISOString(),
			end: period.end.toISOString(),
		};

		// Get impression counts
		const pvData = getDataLogData(baseFilters);

		// TODO Remove the above getDataLogData, pass this to the cards & rewrite them to accept this pre-transformed data
		// TODO Rewrite slightly so we can still pass equivalent to baseFilters to TimeOfDayCard, as it still needs to fetch its own data
		const pvChartData = getCarbon({
			q: `${filterMode}:${filterId}`,
			breakdowns: ['time', 'os'],
			start: period.start.toISOString(),
			end: period.end.toISOString(),
			tags,
		});

		const commonProps = { period, campaigns, tags, baseFilters };
	
		if (pvData.resolved) {
			content = <>
				<OverviewWidget period={period} data={pvData.value} />
				<Row>
					<Col xs="12" sm="7">
						<CO2Card {...commonProps} data={pvData.value} />
					</Col>
					<Col xs="12" sm="5">
						<JourneyCard {...commonProps} />
					</Col>
				</Row>
				<Row>
					<Col xs="12" sm="4">
						<CompareCard {...commonProps} />
					</Col>
					<Col xs="12" sm="4">
						<BreakdownCard {...commonProps} data={pvData.value} />
					</Col>
					<Col xs="12" sm="4">
						<TimeOfDayCard {...commonProps} />
						<CTACard />
					</Col>
				</Row>
			</>;
		} else {
			content = <Misc.Loading text="Fetching data..." />;
		}
	}

	return (
		<div className="green-subpage green-metrics">
			<Container>
				<GreenDashboardFilters />
				{content}
			</Container>
		</div>
	);
};

export default GreenMetrics;
