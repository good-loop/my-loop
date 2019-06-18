import React, {useEffect, useState, useRef} from 'react';
import md5 from 'md5';
import { XId } from 'wwutils';
import DataStore from '../../base/plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import {saveSocialShareId} from '../../base/Profiler';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import {IntentLink} from '../../base/components/SocialShare';
import {useLogsIfVisible} from '../../base/components/CustomHooks';

// TODO: force ShareAnAd to use non-VAST video rather than loading Good-Loop player? Thinking about how to reduce loading times, that might be an idea.

/**
 * Shows: 
 * 1) A preview of a GoodLoop ad. This is either the last ad watched by the user or a random ad
 * 2) A Twitter intent link to share this ad
 * 3) A table showing how many times their shared ads have been viewed by others
 */
const ShareAnAd = ({ adHistory, color, xids=[] }) => {
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
	let {vert, format, url} = adHistory || backUpVertData || {};

	const twitterXId = xids.find(id => XId.service(id)==='twitter');
	const socialShareId = twitterXId && md5( twitterXId + vert );

	let doesIfVisibleRef = useRef();
	useLogsIfVisible(doesIfVisibleRef, 'ShareAnAdVisible');

	return (
		<div className="ShareAd" ref={doesIfVisibleRef}>
			{ 
				format === 'video' 
					? <video controls={true} width="100%" height="auto" src={url}> An error occured </video> 
					: <GoodLoopUnit adID={vert} /> 
			}
			{
				// twitterXId
				true
				&& (
					<div>
						<h3 className='sub-header'> Share this ad on social media </h3>
						<IntentLink 
							onClick={() => saveSocialShareId({xid: twitterXId, socialShareId, adid:vert})}
							service='twitter' 
							style={{backgroundColor: 'none', margin: '0 1rem', textDecoration: 'none'}}
							text='I just gave to charity by watching a GoodLoop ad'
							url={`https://as.good-loop.com/?gl.vert=${vert}&gl.socialShareId=${socialShareId}`}
						>
							<div className='color-gl-red intent-link intent-link-border' style={{color}}>
								<i className='fa fa-2x fa-twitter' />
							</div>
						</IntentLink>
						<IntentLink 
							onClick={() => saveSocialShareId({xid: twitterXId, socialShareId, adid:vert})}
							service='facebook' 
							style={{backgroundColor: 'none', margin: '0 1rem', textDecoration: 'none'}}
							text='I just gave to charity by watching a GoodLoop ad'
							url={`https://as.good-loop.com/?gl.vert=${vert}&gl.socialShareId=${socialShareId}`}
						>
							<div className='color-gl-red intent-link intent-link-border' style={{color}}>
								<i className='fa fa-2x fa-facebook' />
							</div>
						</IntentLink>
						{/* <SharedAdStats twitterXId={twitterXId} /> */}
					</div>
				)
			}
		</div>
	);
};

/** Table showing how many times adverts shared by the user on Twitter have been viewed 
 * (15/04/19) This has been turned off as I (MW) cannot think of a nice way of:
 * 1) Making this feature useable to non-registered users
 * 2) Ensuring that stats are correctly carried over after a user has signed up
 * 
 * In it's current form, this feature is not well presented, and I think that it should be hidden for the moment 
*/
const SharedAdStats = ({twitterXId}) => {
	const twitterSocialShareObjects = twitterXId && DataStore.getValue(['data', 'Person', 'xids', twitterXId, 'socialShareIds']);
	if( !twitterSocialShareObjects ) {
		return (
			<div className='top-pad1'>
				Come back later to see how much your followers have raised for charity
			</div>
		);
	}

	// Load number of times that shared ad has been viewed
	let views={};
	useEffect(() => {
		const shareIds = twitterSocialShareObjects.map( shareIdObject => shareIdObject.id);
		views = ServerIO.getViewCount(shareIds);
	}, [twitterSocialShareObjects]);

	// Load human-readable name for each shared ad
	const [names, setNames] = useState({});
	useEffect(() => {
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
			<div className='bottom-pad1 top-pad1'>
				Ads you have previously shared:
			</div>
			<table className='word-wrap width100pct'>
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

export default ShareAnAd;
