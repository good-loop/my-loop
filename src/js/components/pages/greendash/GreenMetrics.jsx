import React, { useEffect, useState } from 'react';
import PromiseValue from '../../../base/promise-value';
import { Alert, Button, Col, Container, Row, Card } from 'reactstrap';

// import ChartWidget from '../../../base/components/ChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';
import List from '../../../base/data/List';
import Misc from '../../../base/components/Misc';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import ErrAlert from '../../../base/components/ErrAlert';

import { GreenCard, periodFromUrl, printPeriod, probFromUrl, noCacheFromUrl, getFilterModeId } from './dashutils';

import ShareWidget, { shareThingId } from '../../../base/components/ShareWidget';
import { getCampaigns, getCarbon, getSumColumn } from './emissionscalc';

import GreenDashboardFilters from './GreenDashboardFilters';
import TimeSeriesCard from './TimeSeriesCard';
import JourneyCard from './JourneyCard';
import CompareCard from './CompareCard';
import BreakdownCard from './BreakdownCard';
import TimeOfDayCard from './TimeOfDayCard';
import MapCard from './MapCard';

import { getDataItem, getDataList } from '../../../base/plumbing/Crud';
import C from '../../../C';

import KStatus from '../../../base/data/KStatus';
import SearchQuery from '../../../base/searchquery';
import Campaign from '../../../base/data/Campaign';
import Login from '../../../base/youagain';

import { isDebug, toTitleCase, yessy } from '../../../base/utils/miscutils';
import PropControl from '../../../base/components/PropControl';
import Roles from '../../../base/Roles';


export const isPer1000 = () => {
	const emissionsMode = DataStore.getUrlValue('emode');
	return emissionsMode === 'per1000';
};


const OverviewWidget = ({ period, data, prob }) => {
	let imps;
	if (data?.length > 0) {
		const total = getSumColumn(data, 'count');
		const [upper, lower] = [total*1.01, total*0.99]
		imps = !prob || (prob && prob == 1) ? printer.prettyInt(total) : `${printer.prettyInt(lower)} to ${printer.prettyInt(upper)}`;
	} else if (!data) {
		imps = 'Fetching data...';
	} else {
		console.warn('OverviewWidget - Empty total-impressions table', data);
		imps = 'No data';
	}

	return (
		<Row className="greendash-overview mb-2">
			<Col xs="12">
				<span className="period mr-4">{printPeriod(period)}</span>
				<span id='impressions-span' className="impressions">
					Impressions served: <span className="impressions-count">{imps}</span>
				</span>
				{prob && <span className='probability ml-5'>
					Probability: {prob}
				</span>}
			</Col>
		</Row>
	);
};

const CTACard = ({}) => {
	return (
		<GreenCard className="carbon-cta flex-column" downloadable={false}>
			<div className="cta-card-decoration">
				<img className="tree-side" src="/img/green/tree-light.svg" />
				<img className="tree-centre" src="/img/green/tree-light.svg" />
				<img className="tree-side" src="/img/green/tree-light.svg" />
			</div>
			<p className="mb-2">Interested to know more about climate positive advertising?</p>
			<a className="get-in-touch pull-right text-right" href="https://www.good-loop.com/contact" target="_blank">
				<Button color="primary" size="md">
					Get In Touch
				</Button>
			</a>
		</GreenCard>
	);
};

// ONLY SHOWS EMAIL LIST WITH "listemails" FLAG SET
// ONLY APPEARS WITH "shareables" OR DEBUG FLAG SET
const ShareDash = () => {
	// not-logged in cant share and pseudo users can't reshare
	if ( ! Login.getId() || Login.getId().endsWith("pseudo")) {
		return null;
	}
	// if ( ! Roles.isDev() && ! DataStore.getUrlValue("shareables") && ! DataStore.getUrlValue("debug") && ! DataStore.getUrlValue("gl.debug")) {
	// 	return null; // dev only for now TODO for all
	// }
	let {filterMode, filterId} = getFilterModeId();
	if ( ! filterMode || ! filterId) {
		return null;
	}
	let type = {brand:"Advertiser",adid:"GreenTag"}[filterMode] || toTitleCase(filterMode);
	let shareId = shareThingId(type, filterId);
	let pvItem = getDataItem({type, id:filterId, status:KStatus.PUBLISHED});
	let shareName = filterMode+" "+((pvItem.value && pvItem.value.name) || filterId);
	const showEmails = DataStore.getUrlValue("listemails");
	return <ShareWidget className="dev-link" hasButton name={"Dashboard for "+shareName} shareId={shareId} hasLink noEmails={!showEmails} />;
}

const GreenMetrics2 = ({}) => {
	// Default to current quarter, all brands, all campaigns
	const period = periodFromUrl();
	if (!period) return; // Filter widget will set this on first render - allow it to update

	let {filterMode, filterId} = getFilterModeId();

	if (!filterMode) {
		return <Alert color="info">Select a brand, campaign, or tag to see data.</Alert>;
	}

	// Fetch common data for CO2Card and BreakdownCard.
	// CompareCard sets its own time periods & TimeOfDayCard sets the timeofday flag, so both need to fetch their own data
	// ...but give them the basic filter spec so they stay in sync otherwise

	// Query filter e.g. which brand, campaign, or tag?
	let q = `${filterMode}:${filterId}`;

	// HACK: filterMode=brand is twice wrong: the data uses vertiser, and some tags dont carry brand info :(
	// So do it by an OR over campaign-ids instead.
	if (filterMode === 'brand') {
		// get the campaigns
		let sq = SearchQuery.setProp(null, 'vertiser', filterId);
		const pvAllCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, q: sq.query });
		if (!pvAllCampaigns.resolved) {
			return <Misc.Loading text="Fetching brand campaigns..." />;
		}
		const campaignIds = List.hits(pvAllCampaigns.value).map((c) => c.id);
		if (!yessy(campaignIds)) {
			return <Alert color="info">No campaigns for brand id: {filterId}</Alert>;
		}
		q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
	}
	if (filterMode === 'agency') {
		// copy pasta of brand above
		// get the campaigns
		let sq = SearchQuery.setProp(null, 'agencyId', filterId);
		const pvAllCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, q: sq.query });
		if (!pvAllCampaigns.resolved) {
			return <Misc.Loading text="Fetching agency campaigns..." />;
		}
		const campaignIds = List.hits(pvAllCampaigns.value).map((c) => c.id);
		if (!yessy(campaignIds)) {
			return <Alert color="info">No campaigns for agency id: {filterId}</Alert>;
		}
		q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
	}

	// HACK: Is this a master campaign? Do we need to cover sub-campaigns?
	if (filterMode === 'campaign') {
		const pvCampaign = getDataItem({ type: C.TYPES.Campaign, id: filterId, status: KStatus.PUB_OR_DRAFT });
		if (!pvCampaign.value) {
			return <Misc.Loading text="Fetching campaign..." />;
		}
		const campaign = pvCampaign.value;
		if (Campaign.isMaster(campaign)) {
			const pvAllCampaigns = Campaign.pvSubCampaigns({ campaign });
			if (!pvAllCampaigns.resolved) {
				return <Misc.Loading text="Fetching campaigns..." />;
			}
			const campaignIds = List.hits(pvAllCampaigns.value).map((c) => c.id);
			if (!yessy(campaignIds)) {
				return <Alert color="info">No campaigns for master campaign id: {filterId}</Alert>;
			}
			q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
		}
	}

	const probNum = probFromUrl();
	const nocache = noCacheFromUrl();

	const baseFilters = {
		q,
		start: period.start.toISOString(),
		end: period.end.toISOString(),
		prob: probNum ? probNum.toString() : null, 
		nocache: nocache ? true : null,
	};


	/**
	 * Inital load of total
	 */
	const pvChartTotal = getCarbon({...baseFilters, breakdown: ['total{"count":"sum"}']})
	
	const pvChartTotalValue = baseFilters.prob ? pvChartTotal.value?.sampling : pvChartTotal.value;

	const samplingProb = pvChartTotalValue?.probability;

	let noData = pvChartTotalValue && !pvChartTotalValue?.allCount;
	// TODO Fall back to filterMode methods to get campaigns when table is empty
	
	if (!pvChartTotal.resolved) {
		return <Misc.Loading text="Fetching campaign lifetime data..." />;
	}
	if (!pvChartTotal.value) {
		return <ErrAlert error={pvChartTotal.error} color="danger" />;
	}
	
	// HACK: Tell JourneyCard we had an empty table & so couldn't get campaigns (but nothing is "loading")
	// TODO We CAN get campaigns but it'd take more of a rewrite than we want to do just now.
	// not working?? How does this compare to noData
	const emptyTable = pvChartTotal.resolved && (!pvChartTotalValue?.allCount || pvChartTotalValue.by_total.buckets.length === 0);
	
	const commonProps = { period, baseFilters, per1000: isPer1000() };
	// Removed (temp?): brands, campaigns, tags
	
	const pvChartData = getCarbon({
		...baseFilters,
		breakdown: [
			// 'total',
			'time{"co2":"sum"}',
			'adid{"count":"sum"}',
			// 'os{"emissions":"sum"}',
			// 'domain{"emissions":"sum"}',
			// 'campaign{"emissions":"sum"}', do campaign breakdowns later with more security logic
		],
		name: 'lotsa-chartdata',
	});

	const pvChartDatalValue = baseFilters.prob ? pvChartData.value?.sampling : pvChartData.value;

	let pvCampaigns = getCampaigns(pvChartDatalValue?.by_adid.buckets);
	if (pvCampaigns && PromiseValue.isa(pvCampaigns.value)) {
		// HACK unwrap nested PV
		pvCampaigns = pvCampaigns.value;
	}

	return (
		<>
			<OverviewWidget period={period} data={pvChartTotalValue?.by_total.buckets} prob={samplingProb} />
			{<PropControl inline
				type="toggle" prop="emode" dflt="total" label="Show emissions:"
				left={{label: 'Total', value: 'total', colour: 'primary'}}
				right={{label: 'Per 1000 impressions', value: 'per1000', colour: 'primary'}}
			/>}
			<Row className="card-row">
				<Col xs="12" sm="8" className="flex-column">
					<TimeSeriesCard {...commonProps} data={pvChartDatalValue?.by_time.buckets} noData={noData} />
				</Col>
				<Col xs="12" sm="4" className="flex-column">
					<JourneyCard
						campaigns={List.hits(pvCampaigns?.value)}
						{...commonProps}
						emptyTable={emptyTable || noData}
					/>
				</Col>
			</Row>
			<Row className="card-row">
				<Col xs="12" sm="4" className="flex-column">
					<CompareCard {...commonProps} />
				</Col>
				<Col xs="12" sm="4" className="flex-column">
					<BreakdownCard {...commonProps} />
				</Col>
				<Col xs="12" sm="4" className="flex-column">
					{!isPer1000() && <TimeOfDayCard {...commonProps} />}
					<MapCard {...commonProps} />
					{/* <CTACard /> "interested to know more" */}
				</Col>
			</Row>
		</>
	);
};

const GreenMetrics = ({}) => {
	const [agencyIds, setAgencyIds] = useState();
	let agencyId = DataStore.getUrlValue('agency');
	if (!agencyId && agencyIds?.length === 1) agencyId = agencyIds[0];

	// All our filters etc are based user having at most access to one agency ??how so?
	// Group M users will have multiple, so start by selecting one.
	useEffect(() => {
		Login.getSharedWith().then((res) => {
			if (!res?.cargo) {
				setAgencyIds([]);
				return;
			}
			const _agencyIds = res.cargo
				.map((share) => {
					const matches = share.item.match(/^Agency:(\w+)$/);
					if (!matches) return null;
					return matches[1];
				})
				.filter((a) => a);
			setAgencyIds(_agencyIds);
		});
	}, [Login.getId()]);

	// Only for logged-in users!
	if (!Login.isLoggedIn()) return (
		<Container>
			<Card body id="green-login-card" className="m-4">
				<Container>
					<Row>
						<Col className="decoration flex-center" xs="12" sm="4">
							<img className="stamp" src="/img/green/gl-carbon-neutral.svg" />
						</Col>
						<Col className="form" xs="12" sm="8">
							<img className="gl-logo my-4" src="/img/gl-logo/rectangle/logo-name.svg" />
							<p className="text-center my-4">
								Understand the carbon footprint of your advertising and
								<br />
								discover your offsetting and climate-positive successes
							</p>
							<LoginWidgetEmbed verb="login" canRegister={false} />
						</Col>
					</Row>
				</Container>
			</Card>
		</Container>
	);

	return (
		<div className="green-subpage green-metrics">			
			<Container fluid>
				{agencyIds ? <>
					<GreenDashboardFilters />
					<ShareDash/>
					<GreenMetrics2 />
				</> : <Misc.Loading text="Checking your access..." />}
			</Container>
		</div>
	);
};

export default GreenMetrics;
