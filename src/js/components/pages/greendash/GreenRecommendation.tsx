import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Container, Row } from 'reactstrap';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import DataStore from '../../../base/plumbing/DataStore';
import Login from '../../../base/youagain';
import Misc from '../../../MiscOverrides';
import { getFilterModeId } from './dashutils';
import { paramsFromUrl } from './dashUtils';
import { type BreakdownRow, type BaseFilters, type BaseFiltersFailed, getBasefilters, getCarbon } from './emissionscalcTs';
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

const GreenRecommendation2 = (): JSX.Element | null => {
	const urlParams = paramsFromUrl(['period', 'prob', 'sigfig', 'nocache']);
	const period = urlParams.period;
	if (!period) return null; // Filter widget will set this on first render - allow it to update

	const baseFilters = getBasefilters(urlParams);

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
	// const pvChartTotal = getCarbon({ ...baseFilters, breakdown: ['total{"count":"sum"}'] });

	return (
		<>
			<Row className='card-row'>

			</Row>
		</>
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
