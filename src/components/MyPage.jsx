/* global Login */
import React from 'react';
import Login from 'you-again';

import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';

import Misc from '../base/components/Misc';
import MyReport from './MyReport';

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
				<p>Your current Good-Loop tracking ID is {currentTrkId}.</p>
				<p>Log in or sign up to see the donations you've made across all your devices!</p>
				<p>(put login form here)</p>
				<MyReport trkIds={[currentTrkId]} />
			</div>
		);
	} else if (!trkIds) {
		// User is logged in but we haven't retrieved tracking IDs from shares yet

		ServerIO.getProfile({id: uid, fields: profileFields}).then(response => {
			console.log('profiler response for ' + uid + ':', response);

			trkIds = []; // Pull these from response

			// do we need to add the current tracking id to the list?
			if (!currentTrkId || trkIds.includes(currentTrkId)) {
				console.log('tracking id already recorded');
			} else {
				// yes we do~
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
