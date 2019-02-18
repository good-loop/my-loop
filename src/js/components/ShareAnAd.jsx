import React from 'react';
import md5 from 'md5';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import C from '../C';
import Person from '../base/data/Person';
import {saveSocialShareId} from '../base/Profiler';
import GoodLoopUnit from '../base/components/GoodLoopUnit';

// TODO Does this need to be a component? If not, avoid React.Component in favour of functional jsx
// (18/02/19) Should be possible now that GoodLoopUnit is inserted elsewhere, but still need div reference is order to report
// when a div becomes visible.
class ShareAnAd extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};

		const { adHistory } = props;

		if( adHistory ) {
			const {vert, video, format} = adHistory;

			// ID of Good-loop ad to be shown
			// Imagining that we will sometimes have set this based on user's ad history
			this.state = {
				adID: vert,
				format,
				video,
			};
		}
	}

	componentWillMount() {
		const {adID} = this.state;

		// If the user has not watched an ad, have the back-end pick one and send us the json
		if( !adID ) {
			ServerIO.load(ServerIO.AS_ENDPOINT + '/unit.json', {swallow:true})
				.then( res => {
					const {vert} = res;

					if( !vert ) {
						console.warn("Unit.json not returning any advert data?");
						return;
					}

					const {adid, video, format} = vert;
					this.setState({adID: adid, format, video});
				});
		}
	}

	componentDidMount() { 
		// Report to MixPanel if div is visible to the user
		window.addEventListener('scroll', () => ServerIO.logIfVisible(this.wrapper, "ShareAnAdVisible"));
	} 

	render() {
		// Think we can safely assume that there will always be a 'video' for us to latch on to
		const {adID, format, video} = this.state;

		const twitterXId = Person.getTwitterXId();

		return (
			<div className="ShareAd" ref={el => this.wrapper = el}>
				<h2> Share this ad on social media </h2>
				{ 
					format === 'video' ? 
						<video controls={true} width="100%" height="auto" src={video}> An error occured </video> :
						<GoodLoopUnit adID={adID} /> 
				}
				<TwitterShare adID={adID} TwitterXId={twitterXId} />
				<SharedAdsDisplay xid={twitterXId} />
			</div>
		);
	}
} // ./ShareAnAd

/** 
 * Table with data on ads shared by the user
 * Data shown: Name of Advert	Number of times somebody has viewed ad shared by user	  Date Shared
 * A unique tracking ID is used to determine how many people have watched an ad as a result of it being shared
 */
const SharedAdsDisplay = ({xid}) => {
	const twitterSocialShareObjects = xid ? DataStore.getValue(['data', 'Person', xid, 'socialShareIds']) : null;
	if( !twitterSocialShareObjects ) return null;

	// Want an array of just the ID strings. Filter out other crap
	const shareIds = twitterSocialShareObjects.map( shareIdObject => shareIdObject.id);
	// Load number of times that shared ad has been viewed
	DataStore.fetch(['data', 'Person', xid, 'views'], () => ServerIO.getViewCount(shareIds));
	// Load human-readable name for each shared ad
	twitterSocialShareObjects.forEach( shareObject => {
		const {adId, id} = shareObject;
		DataStore.fetch(['data', 'Person', xid, 'adData', id], () => ServerIO.getVertData(adId));
	});

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
						const views = DataStore.getValue(['data', 'Person', xid, 'views', id]);
						const name = DataStore.getValue(['data', 'Person', xid, 'adData', id, 'name']);

						return (
							<tr key='id'>
								<td> {name || adId} </td>
								<td> {views} </td>
								<td> {dateShared} </td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

const TwitterShare = ({adID, TwitterXId}) => {
	const TwitterSocialShareId = md5( TwitterXId + adID );

	const onClick = () => saveSocialShareId({xid: TwitterXId, socialShareId: TwitterSocialShareId, adID});

	// ??maybe just use gl.via=uxid + a post nonce instead of the social share id machinery??

	return (
		<a href={"https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fas.good-loop.com%2F&amp;ref_src=twsrc%5Etfw&amp;text=I%20just%20gave%20to%20charity%20by%20watching%20a%20%40GoodLoopHQ%20ad%20%3A)&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fas.good-loop.com%2F%3Fgl.vert%3D" + encodeURIComponent(adID + "&gl.socialShareId=" + TwitterSocialShareId)} 
			className="btn tweet-button" 
			id="b"
			target="_blank"
			rel="noreferrer"
			onClick={onClick}
		>
			<span className='fa fa-twitter' />
			<span className="label" id="l">Tweet</span>
		</a>);
};

export default ShareAnAd;
