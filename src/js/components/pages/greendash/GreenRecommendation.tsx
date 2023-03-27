import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Container, Row } from 'reactstrap';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import NewChartWidget from '../../../base/components/NewChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import Login from '../../../base/youagain';
import Misc from '../../../MiscOverrides';
import { getFilterModeId } from './dashutils';
import { paramsFromUrl } from './dashUtils';
import { type BreakdownRow, type BaseFilters, getBasefilters, getCarbon, emissionsPerImpressions } from './emissionscalcTs';
import GreenDashboardFilters from './GreenDashboardFilters';

interface ByDomainValue extends Object {
	allCount: number;
	by_domain: { buckets: BreakdownRow[] };
	probability?: number;
	seed?: number;
}

interface ResolvedPromise extends ByDomainValue {
	sampling?: ByDomainValue;
}

const TICKS_NUM = 150;

const GreenRecommendation2 = (): JSX.Element | null => {
	const urlParams = paramsFromUrl(['period', 'prob', 'sigfig', 'nocache']);
	const period = urlParams.period;
	if (!period) return null; // Filter widget will set this on first render - allow it to update

	let baseFilters = getBasefilters(urlParams);

	// BaseFiltersFailed
	if ('type' in baseFilters && 'message' in baseFilters) {
		if (baseFilters.type === 'alert') {
			return <Alert color='info'>{baseFilters.message}</Alert>;
		}
		if (baseFilters.type === 'loading') {
			return <Misc.Loading text={baseFilters.message!} pv={null} inline={null} />;
		}
	}

	/**
	 * Inital load of total
	 */
	const baseFilterConfirmed = { ...baseFilters, numRows: '10000' } as unknown as BaseFilters;

	const chartData = useMemo(() => {
		const pvChartTotal = getCarbon({ ...baseFilterConfirmed, breakdown: ['domain{"countco2":"sum"}'] });
		if (!pvChartTotal.resolved) return;

		const pvChartTotalValue = baseFilterConfirmed.prob && baseFilterConfirmed.prob != 0 ? pvChartTotal.value?.sampling : pvChartTotal.value;
		const bucketsPer1000 = emissionsPerImpressions(pvChartTotalValue.by_domain.buckets);

		const co2s = bucketsPer1000.map((row) => row.co2! as number);
		const maxCo2 = Math.max(...co2s);
		const minCo2 = Math.min(...co2s);
		const steps = (maxCo2 - minCo2) / TICKS_NUM; // How large is a tick

		const scaledBuckets = bucketsPer1000.map((row) => {
			const percentage = Math.floor(((row.co2 as number) - minCo2) / steps);
			return { key: row.key, count: row.count, co2: row.co2, percentage };
		});

		if (!scaledBuckets) return;

		const percentageBuckets: typeof scaledBuckets[] = Array.from({ length: TICKS_NUM }, () => []);
		scaledBuckets.forEach((row) => {
			const percentageKey = Math.max(row.percentage, 1) - 1;
			percentageBuckets[percentageKey].push(row);
		});

		const dataLabels = percentageBuckets.map((row) =>
			row[0]?.co2 ? (row[0].co2 as number).toPrecision(2) : (percentageBuckets.indexOf(row) * steps + minCo2).toPrecision(2)
		);
		const dataValues = percentageBuckets.map((row) => row.length);

		const chartOptions = {
			responsive: true,
		};

		return {
			type: 'bar',
			data: {
				labels: dataLabels,
				datasets: [
					{
						label: 'Counts of domains',
						data: dataValues,
						backgroundColor: 'green',
					},
				],
			},
			options: chartOptions,
		};
	}, [baseFilterConfirmed]);

	const [range, setRange] = useState<[number, number]>();

	return (
		<div>
			<Row>
				<Col xs={2}>X Domains</Col>
				<Col xs={8}>
					<div className='w-100'>
						{!chartData ? (
							<Misc.Loading pv={null} inline={null} text={null} />
						) : (
							<NewChartWidget width={null} height={null} datalabels={null} maxy={null} {...chartData} />
						)}
					</div>
				</Col>
				<Col xs={2}>Y Domains</Col>
			</Row>
			<Row>Sliders</Row>
		</div>
	);
};

const GreenRecommendation = ({ baseFilters }: { baseFilters: BaseFilters }): JSX.Element => {
	const [agencyIds, setAgencyIds] = useState<any[]>();
	let agencyId = DataStore.getUrlValue('agency');
	if (!agencyId && agencyIds?.length === 1) agencyId = agencyIds[0];
	const [pseudoUser, setPseudoUser] = useState<boolean>(false);

	// All our filters etc are based user having at most access to one agency ??how so?
	// Group M users will have multiple, so start by selecting one.
	useEffect(() => {
		const userId = Login.getId(null);
		if (userId && userId.endsWith('@pseudo')) setPseudoUser(true);

		Login.getSharedWith().then((res: any) => {
			if (!res?.cargo) {
				setAgencyIds([]);
				return;
			}
			const _agencyIds = res.cargo
				.map((share: any) => {
					const matches = share.item.match(/^Agency:(\w+)$/);
					if (!matches) return null;
					return matches[1];
				})
				.filter((a: any) => a);
			setAgencyIds(_agencyIds);
		});
	}, [Login.getId(null)]);

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
								<LoginWidgetEmbed verb='login' canRegister={false} services={null} onLogin={null} onRegister={null} />
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
						<h1>Green Recommendations</h1>
						<GreenRecommendation2 />
					</>
				) : (
					<Misc.Loading text='Checking your access...' pv={null} inline={false} />
				)}
			</Container>
		</div>
	);
};

export default GreenRecommendation;
