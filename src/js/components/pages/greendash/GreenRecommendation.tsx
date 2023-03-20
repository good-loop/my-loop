import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Row } from 'reactstrap';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import NewChartWidget from '../../../base/components/NewChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import PromiseValue from '../../../base/promise-value';
import Login from '../../../base/youagain';
import Misc from '../../../MiscOverrides';
import { type BreakdownRow, type GreenBuckets, emissionsPerImpressions, getCarbon } from './emissionscalcTs';
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

type BaseFilters = {
	q: string;
	start: string;
	end: string;
	prob?: string;
	sigfig?: string;
	nocache?: boolean;
	fixseed?: boolean;
	numRows?: string;
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

		// Make sure emode is not messed up
		// if (!(DataStore.getUrlValue('emode') === 'total' || DataStore.getUrlValue('emode') === 'per1000')) {
		// 	DataStore.setUrlValue('emode', 'total')
		// }
		
	}, [Login.getId(null)]);

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
							<LoginWidgetEmbed verb="login" canRegister={false} services={null} onLogin={null} onRegister={null} />
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
					<GreenDashboardFilters pseudoUser={pseudoUser} />
						<h1>Green Recommendations</h1>
				</> : <Misc.Loading pv ={null} text="Checking your access..." />}
			</Container>
		</div>
	);
};

export default GreenRecommendation;
