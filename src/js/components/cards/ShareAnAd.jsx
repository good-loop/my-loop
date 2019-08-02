import React, {useEffect, useState, useRef} from 'react';
import ServerIO from '../../plumbing/ServerIO';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import {IntentLink} from '../SocialShare';
import {useLogsIfVisible} from '../../base/components/CustomHooks';

// TODO: force ShareAnAd to use non-VAST video rather than loading Good-Loop player? Thinking about how to reduce loading times, that might be an idea.

/**
 * Shows: 
 * 1) A preview of a GoodLoop ad. This is either the last ad watched by the user or a random ad
 * 2) A Twitter intent link to share this ad
 * 3) A table showing how many times their shared ads have been viewed by others
 */
const ShareAnAd = ({adHistory, className, color}) => {
	// Load in back-up vert data
	// Easiest to just always load back-up data:
	// avoids a race-condition where adHistory is provided after initial render has set off fetch
	// Could mean that backup data is always applied as promise resolves and overrides data passed via adHistory
	const [backUpVertData, setBackUpVertData] = useState({});
	// ??Hm: useEffect() is not best here, and DataStore.fetch() is a better idea.
	useEffect( () => {
		ServerIO.load(ServerIO.AS_ENDPOINT + '/unit.json', {swallow:true})
			.then( res => {
				if (!res.vert) {
					console.warn("Unit.json not returning any advert data?");
					return;
				}

				setBackUpVertData({
					vert: res.vert.id,
					...(res.vert.videos && res.vert.videos[0] || {}),
				});
			});
	}, []);
	let {vert, format, url} = adHistory || backUpVertData || {};

	let doesIfVisibleRef = useRef();
	useLogsIfVisible(doesIfVisibleRef, 'ShareAnAdVisible');

	/*
		// Does it make sense in this context to just run a video?
		format === 'video' ? (
			<video controls={true} width="100%" height="auto" src={url}> An error occured </video> 
		) : (
			<GoodLoopUnit adID={vert} />
		)
	*/

	// TODO Don't render the GoodLoopUnit below until the user clicks "Oh yeah show me an ad"

	return (
		<div className={"ShareAd " + className} ref={doesIfVisibleRef}>
			<GoodLoopUnit adID={vert} />
			<CampaignPageLinks vert={vert} color={color} />
		</div>
	);
};

const CampaignPageLinks = ({color, vert}) => (
	<div className='text-center'>
		<h3 className='sub-header'> Share this ad on social media </h3>
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
