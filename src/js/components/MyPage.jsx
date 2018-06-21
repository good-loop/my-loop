/* global Login */
import React from 'react';
import Login from 'you-again';

import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';

import Misc from '../base/components/Misc';
import MyReport from './MyReport';
import { LoginLink } from '../base/components/LoginWidget';

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

	let pageContent = '';

	if (!uid) {
		// User is NOT logged in, just show records for current tracking ID
		pageContent = (
			<div>
				<Misc.Card>
					<h3>You're in control</h3>
					<p>Find out and manage all the data we hold on you</p>
					<p>Your current Good-Loop tracking ID is {currentTrkId}.</p>
					<p>Log in or sign up to see the donations you've made across all your devices!</p>
					<LoginLink isButton />
				</Misc.Card>

				<MyReport trkIds={[currentTrkId]} />
			</div>
		);
	} else if (!trkIds) {
		// User is logged in but we haven't retrieved tracking IDs from shares yet
		ServerIO.getProfile({id: uid, fields: profileFields}).then(({cargo}) => {
			trkIds = cargo[FIELDS.trackIds] || [];

			// do we need to add the current tracking id to the list?
			if (currentTrkId && !trkIds.includes(currentTrkId)) {
				ServerIO.putProfile({id: uid, [FIELDS.trackIds]: trkIds.concat(currentTrkId)});
			}
			// put them in datastore whether we've updated profile or not
			DataStore.setValue(trkIdPath, trkIds);
		});

		pageContent = (
			<div>
				<p>You are logged in as { uname || uid }.</p>
				<p>Now fetching your donations from the server...</p>
				<p><Misc.Loading /></p>
			</div>
		);
	} else {
		pageContent = (
			<div>
				<p>You are logged in as { uname || uid }.</p>
				<p>
					Your known tracking IDs are: { trkIds ? (
						trkIds.map(id => id).join(', ')
					) : 'none'}
				</p>
				{<MyReport uid={uid} trkids={[currentTrkId]} />}
			</div>
		);
	}


	// display...
	return (
		<div className="page MyPage">
			<h2>My Good-Loop</h2>
			{ pageContent }
		</div>
	);
}; // ./DashboardPage

export default MyPage;
