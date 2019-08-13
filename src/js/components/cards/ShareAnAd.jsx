import React, {useState, useRef} from 'react';
import ServerIO from '../../plumbing/ServerIO';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import {IntentLink} from '../MyGLSocialShare';
import {useLogsIfVisible} from '../../base/components/CustomHooks';
import Misc from '../../base/components/Misc';
import DataStore from '../../base/plumbing/DataStore';

// TODO: force ShareAnAd to use non-VAST video rather than loading Good-Loop player? Thinking about how to reduce loading times, that might be an idea.

/**
 * Shows: 
 * 1) A preview of a GoodLoop ad. This is either the last ad watched by the user or a random ad
 * 2) A Twitter intent link to share this ad
 * 3) A table showing how many times their shared ads have been viewed by others
 */
const ShareAnAd = ({adHistory = {}, className, color}) => {
	// Load in back-up vert data
	// Easiest to just always load back-up data:
	// avoids a race-condition where adHistory is provided after initial render has set off fetch
	// Could mean that backup data is always applied as promise resolves and overrides data passed via adHistory
	const [state, setState] = useState({});
	const { runVert } = state;

	let doesIfVisibleRef = useRef();
	useLogsIfVisible(doesIfVisibleRef, 'ShareAnAdVisible');

	let {vert} = adHistory;

	// No viewing history provided? Grab a random ad from the server to showcase.
	if (!vert) {
		const unitJsonPv = DataStore.fetch(['widget', 'exampleVert', 'unitJson'], () => (
			ServerIO.load(ServerIO.AS_ENDPOINT + '/unit.json', {swallow:true})
		));

		if (unitJsonPv.value) {
			if (unitJsonPv.value.vert) {
				vert = unitJsonPv.value.vert.id;
			} else {
				console.warn('??? unit.json has no member "vert"');
			}
		}
	}

	return (
		<div className={"ShareAd " + className} ref={doesIfVisibleRef}>
			{vert ? (<>
				<div className="unit">
					{ runVert ? ( // Only mount the adunit if the user has clicked to show it
						<GoodLoopUnit vertId={adHistory.vert} />
					) : (
						<div className="click-to-load" onClick={() => setState({runVert: true})}>
							Click to see Good-Loop in action and make a donation right now!
						</div>
					)}
				</div>
				<CampaignPageLinks vert={vert} color={color} />
			</>) : (
				<Misc.Loading />
			)}
		</div>
	);
};

const CampaignPageLinks = ({color, vert}) => (
	<div className='text-center'>
		<h3 className='sub-header'>Share this ad on social media</h3>
		<IntentLink
			service='twitter'
			text='I just gave to charity by watching a GoodLoop ad'
			url={`${window.location.origin}/#campaign/?gl.vert=${vert}`}
			style={{color}}
		/>
		<IntentLink
			service='facebook'
			text='I just gave to charity by watching a GoodLoop ad'
			url={`${window.location.origin}/#campaign/?gl.vert=${vert}`}
			style={{color}}
		/>
	</div>
);

export default ShareAnAd;
