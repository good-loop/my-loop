/* global Login */
import React from 'react';
import Login from 'you-again';

import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';

import Misc from '../base/components/Misc';
import MyReport from './MyReport';
import { LoginWidgetEmbed, LoginLink, LoginButton } from '../base/components/LoginWidget';

const trkIdPath = ['misc', 'trkids'];

const FIELDS = {
	trackIds: 'gl.trkids',
	consent: 'gl.consent',
};

const profileFields = [FIELDS.trackIds, FIELDS.consent];

const MyPage = () => {
	const trkIdMatches = document.cookie.match('trkid=([^;]+)');
	const currentTrkId = trkIdMatches && trkIdMatches[1];

	let {xid: uid, name: uname} = Login.getUser() || {};

	let trkIds = DataStore.getValue(trkIdPath);

	if ( ! trkIds) {
		// User is logged in but we haven't retrieved tracking IDs from shares yet
		// TODO wrap getProfile in DataStore.fetch to avoid react making repeated server calls
		ServerIO.getProfile({id: uid, fields: profileFields}).then(({cargo}) => {
			trkIds = cargo[FIELDS.trackIds] || [];

			// do we need to add the current tracking id to the list?
			if (currentTrkId && !trkIds.includes(currentTrkId)) {
				ServerIO.putProfile({id: uid, [FIELDS.trackIds]: trkIds.concat(currentTrkId)});
			}
			// put them in datastore whether we've updated profile or not
			DataStore.setValue(trkIdPath, trkIds);
		});
		// use the current one?
		if (currentTrkId) trkIds=[currentTrkId];
	}

	// display...
	return (
		<div className="page MyPage">
			<h2></h2>
			<Misc.Card>
				<WelcomeCard currentTrkId={currentTrkId} trkIds={trkIds} />
			</Misc.Card>
			<MyReport uid={uid} trkIds={trkIds} />
		</div>
	);
}; // ./DashboardPage
``

const WelcomeCard = ({trkIds}) => {
	return (<div>
		
		<p className="header">
			<p>TAKE CONTROL OF YOUR DATA</p>
			<p className="subtitle">You choose what data you give us<br/> and what we do with it.</p>
		
			{Login.isLoggedIn()? 
				<p>You are logged in as { Login.getUser().name || Login.getUser().xid }.</p> :
				<div>				
					<LoginButton />
				</div>
			}
		</p>
	</div>);
};

export default MyPage;
