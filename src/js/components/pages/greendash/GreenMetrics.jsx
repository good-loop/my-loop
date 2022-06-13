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


const OverviewWidget = ({period, data}) => {
	return (
		<Row className="greendash-overview mb-2">
			<Col xs="12">
				<span className="period mr-4">{printPeriod(period)}</span>
				<span className="impressions">Impressions served: <span className="impressions-count">{printer.prettyInt(data.total.imps[0])}</span></span>
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
			Interested to know more about<br/>
			climate positive advertising?
		</p>
		<a className="get-in-touch pull-right text-right" href="https://www.good-loop.com/contact" target="_blank">
			<Button color="primary" size="md">
				Get In Touch
			</Button>
		</a>
	</GreenCard>;
};


/** Extract the time period filter from URL params if present - if not, apply "current quarter" by default */
const initPeriod = () => {
	let period = periodFromUrl();
	if (!period) {
		period = getPeriodQuarter();
		modifyPage(null, {period: period.name});
	}
	return period;
};


/**
 * Get a list of parent objects to each item in a PV which may or may not have resolved
 * @param {*} parentType Type of parent to retrieve - expects to find parent ID under this key in each child
 * @param {*} pvChildren PV which should resolve to the items to get parents of
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
 * Get a list of child objects to each item in a PV which may or may not have resolved
 * @param {*} childType Type of child to retrieve
 * @param {*} parentType Type of parents - will query for children with parent ID under this key
 * @param {*} pvParents PV which should resolve to the items to get children of
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
 * Get all Advertiser, Campaign and Tag objects which pertain to the current filters.
 * Only expects one argument to be non-falsy.
 * @param {String?} brandId ID of the Advertiser to filter on
 * @param {String?} campaignId ID of the Campaign to filter on
 * @param {String?} tagId ID of the GreenTag to filter on
 */
const getGreenDashObjects = (brandId, campaignId, tagId) => {
	let pvBrands, pvCampaigns, pvTags;

	if (campaignId) {
		// Get the campaign, the brand it belongs to, and any green tags under it.
		pvCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, ids: [campaignId] });
		pvTags = getDataList({ type: C.TYPES.GreenTag, status: KStatus.PUBLISHED, q: `campaign:${campaignId}` });
		pvBrands = getParentThings(C.TYPES.Advertiser, pvCampaigns);
	} else if (brandId) {
		// Get the brand, any campaigns under it, and any green tags under those.
		pvBrands = getDataList({ type: C.TYPES.Advertiser, status: KStatus.PUBLISHED, ids: [brandId] });
		pvCampaigns = getChildThings(C.TYPES.Campaign, pvBrands);
		pvTags = getChildThings(C.TYPES.GreenTag, C.TYPES.Campaign, pvCampaigns);
	} else if (tagId) {
		// Get the green tag, the campaign it belongs to, and the brand that belongs to.
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
				<Row>
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
	} else if (!pvTags.resolved || !pvBrands.resolved || !pvCampaigns.resolved) {
		content = <Misc.Loading text="Fetching your tag data..." />;
	} else if (!pvTags.value.hits.length) {
		content = <div><Alert color="danger">Couldn't find Green Ad Tags for {filterMode}: {filterId}</Alert></div>;
	} else if (!pvBrands.value.hits.length) {
		content = <div><Alert color="danger">Couldn't find brand data for {filterMode}: {filterId}</Alert></div>;
	} else if (!pvCampaigns.value.hits.length) {
		content = <div><Alert color="danger">Couldn't find campaign data for {filterMode}: {filterId}</Alert></div>;
	}
	
	// No content yet = all objects loaded! Time to fetch data and start calculating carbon.
	if (!content) {
		const brands = pvBrands.value.hits;
		const campaigns = pvCampaigns.value.hits;
		const tags = pvTags.value.hits;

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
			breakdowns: ['time', 'os'],
			tags,
		});

		const commonProps = { period, brands, campaigns, tags, baseFilters };
	
		if (pvChartData.resolved) {
			content = <>
				<OverviewWidget period={period} data={pvChartData.value} />
				<Row className="card-row">
					<Col xs="12" sm="8" className="flex-column">
						<TimeSeriesCard {...commonProps} data={pvChartData.value} />
					</Col>
					<Col xs="12" sm="4" className="flex-column">
						<JourneyCard {...commonProps} />
					</Col>
				</Row>
				<Row className="card-row">
					<Col xs="12" sm="4" className="flex-column">
						<CompareCard {...commonProps} />
					</Col>
					<Col xs="12" sm="4" className="flex-column">
						<BreakdownCard {...commonProps} data={pvChartData.value} />
					</Col>
					<Col xs="12" sm="4" className="flex-column">
						<TimeOfDayCard {...commonProps} />
						<CTACard />
					</Col>
				</Row>
			</>;
		} else {
			content = <Misc.Loading text="Fetching campaign lifetime data..." />;
		}
	}

	return (
		<div className="green-subpage green-metrics">
			<Container fluid>
				<GreenDashboardFilters />
				{content}
			</Container>
		</div>
	);
};

export default GreenMetrics;
