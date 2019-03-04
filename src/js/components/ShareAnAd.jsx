import React, {useEffect, useState} from 'react';
import md5 from 'md5';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import C from '../C';
import Person from '../base/data/Person';
import {saveSocialShareId} from '../base/Profiler';
import GoodLoopUnit from '../base/components/GoodLoopUnit';
import {withLogsIfVisible} from '../base/components/HigherOrderComponents';

/**
 * Shows: 
 * 1) A preview of a GoodLoop ad. This is either the last ad watched by the user or a random ad
 * 2) A Twitter intent link to share this ad
 * 3) A table showing how many times their shared ads have been viewed by others
 */
const ShareAnAd = ({ adHistory, logsIfVisibleRef }) => {
	// Load in back-up vert data
	// Easiest to just always load back-up data:
	// avoids a race-condition where adHistory is provided after initial render has set off fetch
	// Could mean that backup data is always applied as promise resolves and overrides data passed via adHistory
	const [backUpVertData, setBackUpVertData] = useState({});
	useEffect( () => {
		ServerIO.load(ServerIO.AS_ENDPOINT + '/unit.json', {swallow:true})
			.then( res => {
				if( !res.vert ) {
					console.warn("Unit.json not returning any advert data?");
					return;
				}

				setBackUpVertData({
					vert: res.vert.id,
					...(res.vert.videos && res.vert.videos[0] || {}),
				});
			});
	}, []);
	let {vert, format, video} = adHistory || backUpVertData || {};

	const twitterXId = Person.getTwitterXId();

	return (
		<div className="ShareAd" ref={logsIfVisibleRef}>
			<h2> Share this ad on social media </h2>
			{ 
				format === 'video' 
					? <video controls={true} width="100%" height="auto" src={video}> An error occured </video> 
					: <GoodLoopUnit adID={vert} /> 
			}
			{
				twitterXId
				&& (
					<div>
						<TwitterIntentLink twitterXId={twitterXId} vert={vert} />
						<SharedAdStats twitterXId={twitterXId} />
					</div>
				)
			}
		</div>
	);
};

/** Do we want to make this a generic component? Feels like it should be
 * Twitter share button: user clicks and is prompted to tweet a link to one of our ads
 */
const TwitterIntentLink = ({vert, twitterXId}) => {
	// Allows us to track stats for ads shared by individual users
	const socialShareId = md5( twitterXId + vert );
	console.warn("IntentLink", vert);
	return (
		<a 
			href={"https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fas.good-loop.com%2F&amp;ref_src=twsrc%5Etfw&amp;text=I%20just%20gave%20to%20charity%20by%20watching%20a%20%40GoodLoopHQ%20ad%20%3A)&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fas.good-loop.com%2F%3Fgl.vert%3D" + encodeURIComponent(vert + "&gl.socialShareId=" + socialShareId)} 
			className="btn tweet-button" 
			id="b"
			target="_blank"
			rel="noreferrer"
			onClick={() => saveSocialShareId({xid: twitterXId, socialShareId, adid:vert})}
		>
			<span className='fa fa-twitter' />
			<span className="label" id="l">Tweet</span>
		</a>
	);
};

/** Table showing how many times adverts shared by the user on Twitter have been viewed */
const SharedAdStats = ({twitterXId}) => {
	const twitterSocialShareObjects = twitterXId && DataStore.getValue(['data', 'Person', twitterXId, 'socialShareIds']);
	if( !twitterSocialShareObjects ) return null;

	// Load number of times that shared ad has been viewed
	let views={};
	useEffect(() => {
		const shareIds = twitterSocialShareObjects.map( shareIdObject => shareIdObject.id);
		views = ServerIO.getViewCount(shareIds);
	}, [twitterSocialShareObjects]);

	// Load human-readable name for each shared ad
	const [names, setNames] = useState({});
	useEffect(() => {
		console.warn(twitterSocialShareObjects);
		twitterSocialShareObjects
			.forEach( shareObject => {
				ServerIO.getVertData(shareObject.adId)
					.then( res => {
						const { cargo={} } = res;
						const {id, name} = cargo;
						// Append to names only if an ad id and name have been returned
						return id && name && setNames({...names, [id]: name}); 
					});
			});
	}, [twitterSocialShareObjects]);

	return (
		<div className='sharedAds container-fluid'>
			Ads you have previously shared:
			<table className='word-wrap width100'>
				<thead>
					<tr>
						<th> Advert </th>
						<th> Views </th>
						<th> Shared on </th>
					</tr>
				</thead>
				<tbody>
					{twitterSocialShareObjects.map( shareIdObj => {
						const {id, adId, dateShared} = shareIdObj;

						return (
							<tr key={id}>
								<td> {names[adId] || adId} </td>
								<td> {views[id] || 0} </td>
								<td> {dateShared} </td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default withLogsIfVisible(ShareAnAd);
