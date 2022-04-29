import React, { useEffect } from 'react';

import { Col, Container, Row } from 'reactstrap';
// import ChartWidget from '../../../base/components/ChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';
import { getPeriodQuarter, GreenCard, periodFromUrl, periodKey, printPeriod } from './dashutils';
import GreenDashboardFilters from './GreenDashboardFilters';
import CO2Card from './CO2Card';
import Misc from '../../../base/components/Misc';
import { getDataLogData } from '../../../base/plumbing/DataLog';
import { getDataList } from '../../../base/plumbing/Crud';


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
	const campaign = DataStore.getUrlValue('campaign');
	const brand = DataStore.getUrlValue('brand');
	const tag = DataStore.getUrlValue('tag');
	
	useEffect(() => {
		// Remove dashboard-specific URL params on unmount (ie navigating away)
		return () => {
			DataStore.setUrlValue('period', null);
			DataStore.setUrlValue('start', null);
			DataStore.setUrlValue('end', null);
			DataStore.setUrlValue('campaign', null);
			DataStore.setUrlValue('brand', null);
			DataStore.setUrlValue('tag', null);
		};
	}, []);

	let content;

	if (!brand && !campaign && !tag) {
		// TODO better
		content = 'Apply a filter to see data.';
	}

	// What are we going to filter on?
	const filterMode = campaign ? 'campaign' : brand ? 'brand' : tag ? 'adid' : null;
	// Get the ID for the object we're filtering for
	const filterId = {campaign, brand, adid: tag}[filterMode];

	// Get the relevant tags, for bytes-per-impression purposes
	const pvTags = DataStore.fetch(['widget', 'greendash', 'tags', `by-${filterMode}`, filterId], () => {
		const params = { type: C.TYPES.GreenTag, status: C.KStatus.PUBLISHED };
		if (filterMode === 'campaign') params.q = `campaign:${campaign}`;
		if (filterMode === 'adid') params.ids = [tag];
		return getDataList(params);
	});

	// Get impression counts
	const pvData = DataStore.fetch(['widget', 'greendash', 'timeseries', `by-${filterMode}`, filterId, periodKey(period)], () => (
		getDataLogData({
			dataspace: 'green',
			q: `evt:pixel AND ${filterMode}:${filterId}`,
			breakdowns: ['time/adid'],
			start: period.start.toISOString(),
			end: period.end.toISOString(),
		})
	));

	if (pvData.resolved) {
		content = <>
			<OverviewWidget period={period} />
			<Row>
				<Col md="8">
					<CO2Card period={period} data={pvData.value} tags={pvTags.value && pvTags.value.hits} />
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
