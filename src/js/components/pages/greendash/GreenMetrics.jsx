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
	return <GreenCard>
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
}


const GreenMetrics = ({}) => {
	// Default to current quarter, all brands, all campaigns
	const period = initPeriod();
	const campaignId = DataStore.getUrlValue('campaign');
	const brandId = DataStore.getUrlValue('brand');
	const tagId = DataStore.getUrlValue('tag');

	let pvCampaigns, pvTags;

	// What are we going to filter on? ("adid" rather than "tag" because that's what we'll search for in DataLog)
	const filterMode = campaignId ? 'campaign' : brandId ? 'brand' : tagId ? 'adid' : null;
	// Get the ID for the object we're filtering for
	const filterId = {campaign: campaignId, brand: brandId, adid: tagId}[filterMode];

	// Construct filter params to retrieve green tags
	const tagsFilter = {
		campaign: { q: `campaign:${campaignId}` },
		adid: { ids: [tagId]},
		brand: {}, // TODO
	}[filterMode] || {};

	// Get the relevant tags, for bytes-per-impression purposes
	pvTags = ActionMan.list({ type: C.TYPES.GreenTag, status: KStatus.PUBLISHED, ...tagsFilter});
	const tags = pvTags.resolved && pvTags.value && pvTags.value.hits;

	// Retrieve campaign: do we have a campaign ID, or do we have to extract it from the retrieved tags?
	let campaignIds;
	if (tagId && tags) {
		campaignIds = [pvTags.value.hits.find(tag => tag.campaign).campaign];
	} else if (campaignId) {
		campaignIds = [campaignId];
	}
	if (campaignIds) {
		pvCampaigns = ActionMan.list({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, ids: campaignIds });
	}
	const campaigns = pvCampaigns && pvCampaigns.resolved && pvCampaigns.value && pvCampaigns.value.hits;

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

	// What are we going to populate the page with?
	let content;

	if (!brandId && !campaignId && !tagId) {
		// TODO better
		content = 'Apply a filter to see data.';
	}

	if (!tags) return <Misc.Loading text="Fetching Green Ad Tags" />;

	if (!tags.length) {
		return <div><Alert color="danger">Couldn't find tag for {filterMode}: {filterId}</Alert></div>;
	}

	// Fetch common data for CO2Card and BreakdownCard.
	// JourneyCard takes all-time data, CompareCard sets its own time periods, TimeOfDayCard overrides time-series interval
	const baseFilters = {
		dataspace: 'green',
		q: `evt:pixel AND ${filterMode}:${filterId}`,
		breakdowns: ['time/adid', 'os', 'adid'],
		start: period.start.toISOString(),
		end: period.end.toISOString(),
	};

	// Get impression counts
	const pvData = getDataLogData(baseFilters);

	const commonProps = { period, campaigns, tags, baseFilters };

	if (pvData.resolved) {
		content = <>
			<OverviewWidget period={period} data={pvData.value} />
			<Row>
				<Col md="8">
					<CO2Card {...commonProps} data={pvData.value} />
				</Col>
				<Col md="4">
					<JourneyCard {...commonProps} />
				</Col>
			</Row>
			<Row>
				<Col md="4">
					<CompareCard {...commonProps} />
				</Col>
				<Col md="4">
					<BreakdownCard {...commonProps} data={pvData.value} />
				</Col>
				<Col md="4">
					<TimeOfDayCard {...commonProps} />
					<CTACard />
				</Col>
			</Row>
		</>;
	} else {
		content = <Misc.Loading text="Fetching data..." />;
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
