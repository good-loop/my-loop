import React, {useState, useRef} from 'react';
import ServerIO from '../../plumbing/ServerIO';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import {IntentLink} from '../MyGLSocialShare';
import Misc from '../../base/components/Misc';
import DataStore from '../../base/plumbing/DataStore';

// TODO: force ShareAnAd to use non-VAST video rather than loading Good-Loop player? Thinking about how to reduce loading times, that might be an idea.

/**
 * TODO show preview image for advert, with a play button
 * 
 * @param {?String} adid - the advert to show. If unset, fetch any ad from the adserver.
 * 
 * Shows: 
 * 1) A preview of a GoodLoop ad. This is either the last ad watched by the user or a random ad
 * 2) A Twitter intent link to share this ad
 * 3) A table showing how many times their shared ads have been viewed by others
 */
const ShareAnAd = ({adid, className, color}) => {
	// Load in back-up vert data
	// Easiest to just always load back-up data:
	// avoids a race-condition where adHistory is provided after initial render has set off fetch
	// Could mean that backup data is always applied as promise resolves and overrides data passed via adHistory
	const [state, setState] = useState({});
	const { runVert } = state;

	// No viewing history provided? Grab a random ad from the server to showcase.
	if ( ! adid) {
		const unitJsonPv = DataStore.fetch(['widget', 'exampleVert', 'unitJson'], () => (
			ServerIO.load(ServerIO.AS_ENDPOINT + '/unit.json?gl.status=PUBLISHED', {swallow:true})
		));
		console.log(`Promise from server load here: `, unitJsonPv);

		if (unitJsonPv.value) {
			if (unitJsonPv.value.vert) {
				adid = unitJsonPv.value.vert.id;
			} else {
				console.warn('??? unit.json has no member "vert"');
			}
		}
	}

	return (
		<div className={"ShareAd mt-5 mb-3 " + className}>
			{adid ? (<>
				<div className="unit">
					{ runVert ? ( // Only mount the adunit if the user has clicked to show it
						<>
							<GoodLoopUnit vertId={adid} />
							<CampaignPageLinks vert={adid} color={color} />
						</>
					) : (
						<div className="click-to-load" onClick={() => setState({runVert: true})}>
							<Misc.Icon fa='play-circle' className='pull-left' size='3x' />
							Click to see Good-Loop in action<br />
							and make a donation right now!
						</div>
					)}
				</div>
			</>) : (
				<Misc.Loading />
			)}
		</div>
	);
};

const CampaignPageLinks = ({color, vert}) => {
	const url = window.location.origin+'/#campaign/?gl.vert='+escape(vert);
	return (
		<div className='text-center mt-3'>
			<h3 className='sub-header'>Share this ad on social media</h3>
			<IntentLink
				service='twitter'
				text='I just gave to charity by watching a GoodLoop ad'
				url={url}
				style={{color, margin: '0 1em'}}
			/>
			<IntentLink
				service='facebook'
				text='I just gave to charity by watching a GoodLoop ad'
				url={url}
				style={{color, margin: '0 1em'}}
			/>
		</div>);
};

export default ShareAnAd;
