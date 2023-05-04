import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'reactstrap';
import PromiseValue from '../../../base/promise-value';

// import ChartWidget from '../../../base/components/ChartWidget';
import ErrAlert from '../../../base/components/ErrAlert';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import Misc from '../../../base/components/Misc';
import List from '../../../base/data/List';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';
import { getPeriodFromUrlParams, printPeriod } from '../../../base/utils/date-utils';

import { GreenCard } from './GreenDashUtils';
import { getBasefilters, getCampaigns, getCarbon, getSumColumn } from './emissionscalcTs';

import BreakdownCard from './BreakdownCard';
import CompareCard from './CompareCard';
import GreenDashboardFilters from './GreenDashboardFilters';
import JourneyCard from './JourneyCard';
import MapCard from './MapCard';
import TimeOfDayCard from './TimeOfDayCard';
import TimeSeriesCard from './TimeSeriesCard';

import Login from '../../../base/youagain';

import PropControl from '../../../base/components/PropControl';
import { getUrlVars } from '../../../base/utils/miscutils';

export const isPer1000 = () => {
	const emissionsMode = DataStore.getUrlValue('emode');
	return emissionsMode === 'per1000';
};

/** baseFilters.prob is string not number so have to use == */
export const isRandomSampling = (baseFilters) => {
	if (baseFilters.prob == -1 || baseFilters.prob > 1) return true;
	return false;
};

/**
 * @param {Object} obj
 * @param {Period} obj.period
 * @returns
 */
const OverviewWidget = ({ period, data, prob }) => {
	let imps;
	if (data?.length > 0) {
		const total = getSumColumn(data, 'count');
		// const [upper, lower] = [total*1.01, total*0.99]
		// imps = !prob || (prob && prob == 1) ? printer.prettyInt(total) : `${printer.prettyInt(lower)} to ${printer.prettyInt(upper)}`;
		imps = printer.prettyInt(total);
	} else if (!data) {
		imps = 'Fetching data...';
	} else {
		console.warn('OverviewWidget - Empty total-impressions table', data);
		imps = 'No data';
	}

	return (
		<Row className='greendash-overview mb-2'>
			<Col xs='12'>
				<span className='period mr-4'>{printPeriod(period)}</span>
				<span id='impressions-span' className='impressions'>
					Impressions served: <span className='impressions-count'>{imps}</span>
				</span>
				{prob && <span className='probability ml-5'>Probability: {prob}</span>}
			</Col>
		</Row>
	);
};

const CTACard = ({}) => {
	return (
		<GreenCard className='carbon-cta flex-column' downloadable={false}>
			<div className='cta-card-decoration'>
				<img className='tree-side' src='/img/green/tree-light.svg' />
				<img className='tree-centre' src='/img/green/tree-light.svg' />
				<img className='tree-side' src='/img/green/tree-light.svg' />
			</div>
			<p className='mb-2'>Interested to know more about climate positive advertising?</p>
			<a className='get-in-touch pull-right text-right' href='https://www.good-loop.com/contact' target='_blank'>
				<Button color='primary' size='md'>
					Get In Touch
				</Button>
			</a>
		</GreenCard>
	);
};

const GreenMetrics2 = () => {
	const urlParams = getUrlVars();
	const period = getPeriodFromUrlParams(urlParams);
	if (!period) {
		return null; // Filter widget will set this on first render - allow it to update
	}
	urlParams.period = period;
	const baseFilters = getBasefilters(urlParams);

	// BaseFiltersFailed
	if (baseFilters.type && baseFilters.message) {
		if (baseFilters.type === 'alert') {
			return <Alert color='info'>{baseFilters.message}</Alert>;
		}
		if (baseFilters.type === 'loading') {
			return <Misc.Loading text={baseFilters.message} />;
		}
	}

	/**
	 * Inital load of total
	 */
	const pvChartTotal = getCarbon({ ...baseFilters, breakdown: ['total{"count":"sum"}'] });

	const pvChartTotalValue = isRandomSampling(baseFilters) ? pvChartTotal.value?.sampling : pvChartTotal.value;

	const samplingProb = pvChartTotalValue?.probability;

	let noData = pvChartTotalValue && !pvChartTotalValue?.allCount;
	// TODO Fall back to filterMode methods to get campaigns when table is empty

	if (!pvChartTotal.resolved) {
		return <Misc.Loading text='Fetching campaign lifetime data...' />;
	}
	if (!pvChartTotal.value) {
		return <ErrAlert error={pvChartTotal.error} color='danger' />;
	}

	// HACK: Tell JourneyCard we had an empty table & so couldn't get campaigns (but nothing is "loading")
	// TODO We CAN get campaigns but it'd take more of a rewrite than we want to do just now.
	// not working?? How does this compare to noData
	const emptyTable = pvChartTotal.resolved && (!pvChartTotalValue?.allCount || pvChartTotalValue?.by_total.buckets.length === 0);

	const commonProps = { period, baseFilters, per1000: isPer1000() };
	// Removed (temp?): brands, campaigns, tags

	const pvChartData = getCarbon({
		...baseFilters,
		breakdown: [
			// 'total',
			'time{"countco2":"sum"}',
			'adid{"count":"sum"}',
			// 'os{"emissions":"sum"}',
			// 'domain{"emissions":"sum"}',
			// 'campaign{"emissions":"sum"}', do campaign breakdowns later with more security logic
		],
		name: 'lotsa-chartdata',
	});

	const pvChartDatalValue = isRandomSampling(baseFilters) ? pvChartData.value?.sampling : pvChartData.value;

	let pvCampaigns = getCampaigns(pvChartDatalValue?.by_adid.buckets);
	if (pvCampaigns && PromiseValue.isa(pvCampaigns.value)) {
		// HACK unwrap nested PV
		pvCampaigns = pvCampaigns.value;
	}

	return (
		<>
			<OverviewWidget period={period} data={pvChartTotalValue?.by_total.buckets} prob={samplingProb} />
			<PropControl
				inline
				type='toggle'
				prop='emode'
				dflt='total'
				label='Show emissions:'
				left={{ label: 'Total', value: 'total', colour: 'primary' }}
				right={{ label: 'Per 1000 impressions', value: 'per1000', colour: 'primary' }}
			/>
			<Row className='card-row'>
				<Col xs='12' sm='12' className='flex-column'>
					<TimeSeriesCard {...commonProps} data={pvChartDatalValue?.by_time.buckets} noData={noData} />
				</Col>
				{/* <Col xs='12' sm='4' className='flex-column'>
					<JourneyCard campaigns={List.hits(pvCampaigns?.value)} {...commonProps} emptyTable={emptyTable || noData} />
				</Col> */}
			</Row>
			<Row className='card-row'>
				<Col xs='12' sm='4' className='flex-column'>
					<CompareCard {...commonProps} />
				</Col>
				<Col xs='12' sm='4' className='flex-column'>
					<BreakdownCard {...commonProps} />
				</Col>
				<Col xs='12' sm='4' className='flex-column'>
					{false && <TimeOfDayCard {...commonProps} />}
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
	const [pseudoUser, setPseudoUser] = useState(false);

	// All our filters etc are based user having at most access to one agency ??how so?
	// Group M users will have multiple, so start by selecting one.
	useEffect(() => {
		const userId = Login.getId();
		if (userId && userId.endsWith('@pseudo')) setPseudoUser(true);

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

		// Make sure emode is not messed up
		if (!(DataStore.getUrlValue('emode') === 'total' || DataStore.getUrlValue('emode') === 'per1000')) {
			DataStore.setUrlValue('emode', 'total');
		}
	}, [Login.getId()]);

	// Only for logged-in users!
	if (!Login.isLoggedIn())
		return (
			<Container>
				<Card body id='green-login-card' className='m-4'>
					<Container>
						<Row>
							<Col className='decoration flex-center' xs='12' sm='4'>
								<img className='stamp' src='/img/green/gl-carbon-neutral.svg' />
							</Col>
							<Col className='form' xs='12' sm='8'>
								<img className='gl-logo my-4' src='/img/gl-logo/rectangle/logo-name.svg' />
								<p className='text-center my-4'>
									Understand the carbon footprint of your advertising and
									<br />
									discover your offsetting and climate-positive successes
								</p>
								<LoginWidgetEmbed verb='login' canRegister={false} />
							</Col>
						</Row>
					</Container>
				</Card>
			</Container>
		);

	return (
		<div className='green-subpage green-metrics'>
			<Container fluid>
				{agencyIds ? (
					<>
						<GreenDashboardFilters pseudoUser={pseudoUser} />
						<GreenMetrics2 />
					</>
				) : (
					<Misc.Loading text='Checking your access...' />
				)}
			</Container>
		</div>
	);
};

export default GreenMetrics;
