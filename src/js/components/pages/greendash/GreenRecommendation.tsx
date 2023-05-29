import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row } from 'reactstrap';
import Misc from '../../../MiscOverrides';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import DataStore from '../../../base/plumbing/DataStore';
import Login from '../../../base/youagain';
import { GLCard } from '../../impact/GLCards';
import GreenDashboardFilters from './GreenDashboardFilters';
import { type BaseFilters } from './emissionscalcTs';

import '../../../../style/GreenRecommendations.less';
import GreenRecsPublisher from './GreenRecsPublisher';
import GreenRecsCreative from './GreenRecsCreative';
import { space } from '../../../base/utils/miscutils';
import { modifyPage } from '../../../base/plumbing/glrouter';


export const greenRecsPath = ['widget', 'greenRecs'];
const modePath = [...greenRecsPath, 'mode'];
const DEFAULT_MODE = 'creative'; // vs 'publisher'
const getOptMode = () => DataStore.getValue('location', 'path')[2];
const setOptMode = mode => {
	const newPath = [...DataStore.getValue(['location', 'path'])];
	newPath[2] = mode;
	modifyPage(newPath);
}


function NotLoggedIn({}) {
	return (
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
}


function ModeLink({mode, children}) {
	return (
		<a className={space('mode-link', (getOptMode() === mode) && 'active')} role="button" onClick={() => setOptMode(mode)}>
			{children}
		</a>
	);
}


function ModeSelect() {
	let mode = getOptMode();
	useEffect(() => {
		if (!mode) setOptMode(DEFAULT_MODE);
	}, []);
	if (!mode) mode = DEFAULT_MODE;

	return <div className="optimisation-mode-select">
		<ModeLink mode="publisher">Publisher Optimisations</ModeLink>
		<ModeLink mode="creative">Creative Optimisations</ModeLink>
	</div>;
}


const GreenRecommendation = ({ baseFilters, ...props }: { baseFilters: BaseFilters }): JSX.Element => {
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
			const nextAgencyIds = [];
			res?.cargo.forEach((share: any) => {
				const matches = share.item.match(/^Agency:(\w+)$/);
				if (matches) nextAgencyIds.push(matches[1]);
			});
			setAgencyIds(nextAgencyIds);
		});
	}, [Login.getId(null)]);

	// Only for logged-in users!
	if (!Login.isLoggedIn()) return <NotLoggedIn />;

	return (
		<div className="green-subpage green-metrics">
			<Container fluid>
				{agencyIds ? (
					<>
						<GreenDashboardFilters pseudoUser={pseudoUser} />
						<ModeSelect />
						{(getOptMode() === 'publisher') ? <GreenRecsPublisher /> : <GreenRecsCreative />}
					</>
				) : (
					<Misc.Loading text="Checking your access..." pv={null} inline={false} />
				)}
			</Container>
		</div>
	);
};


export default GreenRecommendation;
