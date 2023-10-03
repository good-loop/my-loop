import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row } from 'reactstrap';
import Misc from '../../../MiscOverrides';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import DataStore from '../../../base/plumbing/DataStore';
import Login from '../../../base/youagain';
import GreenDashboardFilters from './GreenDashboardFilters';

import '../../../../style/GreenRecommendations.less';
import GreenRecsPublisher from './GreenRecsPublisher';
import GreenRecsCreative from './GreenRecsCreative';
import { space } from '../../../base/utils/miscutils';
import { modifyPage } from '../../../base/plumbing/glrouter';


export const greenRecsPath = ['widget', 'greenRecs'];

const DEFAULT_MODE = 'publisher'; // vs 'creative'


const getOptMode = (): string|null => {
	return DataStore.getValue('location', 'path')[2];
};

const setOptMode = (mode: string) => {
	if (mode === getOptMode()) return;
	modifyPage(['greendash', 'recommendation', mode]);
};


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


type ReactChildren = (string|JSX.Element|JSX.Element[]);

type ModeLinkProps = {
	mode: string;
	children: ReactChildren;
};


/** A link which switches the recommendation mode. */
function ModeLink({mode, children}: ModeLinkProps): JSX.Element {
	return (
		<a className={space('mode-link', (getOptMode() === mode) && 'active')} role="button" onClick={() => setOptMode(mode)}>
			{children}
		</a>
	);
}


/**
 * Link bar to switch between publisher and creative optimisation mode
 * TODO remove onlyCurrent once release-ready
 * @param {boolean} [onlyCurrent] Only indicate the currently active mode, don't show switcher
 */
function ModeSelect(): JSX.Element {
	let mode = getOptMode();
	useEffect(() => {
		if (!mode) setOptMode(DEFAULT_MODE);
	}, []);

	if (Login.getUser().service === 'pseudo') return null;

	return <div className="optimisation-mode-select">
		<ModeLink mode="publisher">Publisher Optimisations</ModeLink>
		<ModeLink mode="creative">Creative Optimisations</ModeLink>
	</div>;
}


function GreenRecommendation(): JSX.Element {
	const [agencyIds, setAgencyIds] = useState<string[]>();
	let agencyId = DataStore.getUrlValue('agency');
	if (!agencyId && agencyIds?.length === 1) agencyId = agencyIds[0];
	const [pseudoUser, setPseudoUser] = useState<boolean>(false);

	// All our filters etc are based user having at most access to one agency ??how so?
	// Group M users will have multiple, so start by selecting one.
	useEffect(() => {
		const userId = Login.getId(null);
		if (userId && userId.endsWith('@pseudo')) setPseudoUser(true);

		Login.getSharedWith().then((res: any) => {
			const nextAgencyIds: string[] = [];
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
				{agencyIds ? <>
					<GreenDashboardFilters pseudoUser={pseudoUser} />
					<ModeSelect />
					{(getOptMode() === 'creative') ? <GreenRecsCreative /> : <GreenRecsPublisher />}
				</> : (
					<Misc.Loading text="Checking your access..." />
				)}
			</Container>
		</div>
	);
}


export default GreenRecommendation;
