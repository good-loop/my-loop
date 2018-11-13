import React from 'react';
import md5 from 'md5';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import TwitterShare from './TwitterShare';
import C from '../C';
import Person from '../base/data/Person';

/** Returns promise that resolves when Good-Loop unit is loaded and ready */
const injectGoodLoopUnit = ({adID, vastTag, thisRef}) => {
	const iframe = document.createElement('iframe');

	/** Elements to place in Good-Loop iframe */
	const $script = document.createElement('script');
	$script.setAttribute('src', adID ? ServerIO.AS_ENDPOINT + '/unit.js?gl.variant=pre-roll&gl.vert=' + adID : ServerIO.AS_ENDPOINT + '/unit.js?gl.variant=pre-roll');

	const $div = document.createElement('div');
	$div.setAttribute('class', 'goodloopad');

	$div.setAttribute('data-format', 'player');
	$div.setAttribute('data-mobile-format', 'player');

	iframe.setAttribute('id', 'good-loop-iframe');
	iframe.setAttribute('frameborder', 0);
	iframe.setAttribute('scrolling', 'auto');
	
	iframe.style.height = 'auto';
	iframe.style.width = 'auto';
	iframe.style['max-width'] = '100%';
	// HACK (26/10/18): allow adunit to still run and pick out ad ID and video
	// 08/11/18 updated this so that the adunit will display for vast videos
	if( !vastTag ) {
		iframe.style.display = 'none';
	}

	iframe.addEventListener('load', () => {
		window.iframe = iframe;
		iframe.contentDocument.body.style.overflow = 'hidden';
		iframe.contentDocument.body.appendChild($script);
		iframe.contentDocument.body.appendChild($div);
	});
	/** */
	thisRef.adunitRef.appendChild(iframe);

	// No ad ID provided
	// Going to load the adunit, let it pick an ad,
	// then pull the relevant ad ID out of the iframe

	const adIDPV = new Promise( (resolve, reject) => {
		$script.addEventListener('load', () => {
			resolve(iframe.contentWindow);
		});

		$script.addEventListener('error', () => {
			reject(false);
		});

		iframe.addEventListener('error', () => {
			reject(false);
		});
	});

	return {adIDPV, iframe};
};

class ShareAnAd extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		// Create ref by callback https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
		
		// Don't need to declare these, but vaguely helpful to see what's used
		this.adunitRef = null;

		this.setRef = (ref, value) => {
			this[ref] = value;
		};

		this.focusRef = (ref) => {
			if (this[ref]) this[ref].focus();
		};

		const { adHistory } = props;

		if( adHistory ) {
			const {vert, video, mobileVideo, vastTag} = adHistory;

			// ID of Good-loop ad to be shown
			// Imagining that we will sometimes have set this based on user's ad history
			this.state = {
				adID: vert,
				mobileVideo,
				video,
				vastTag
			};
		}
	}

	// Would usually prefer to put this sort of thing in to componentWillMount
	// but lifecycle goes willMount -> render -> didMount, and this.adunitRef
	// needs to be a valid reference for us to put the iframe into
	componentDidMount() { 
		this.focusRef('adunitRef'); 

		const {adID, mobileVideo, vastTag, video} = this.state;

		// Handles two cases:
		// 1) The user has no view history => the adunit picks an ad for them to watch
		//	(will need to make sure that they see the GoodLoop unit if it picks a VAST ad!)
		// 2) The last ad they watched was a VAST ad. Use the GoodLoop player to play.
		if( !video && !mobileVideo ) {
			const {adIDPV, iframe} = injectGoodLoopUnit({adID, thisRef: this, vastTag});
			// Grab ad ID chosen by adunit and place in to DataStore/state
			adIDPV.then( contentWindow => { 
				// Assuming that adunit has not embedded itself in another iframe
				const {goodloop} = contentWindow;
				const id = goodloop.vert.adid; 
				const vid = goodloop.vert.video;
				const mobVid = goodloop.vert.mobileVideo;
				const glVastTag = goodloop.vert.vastTag;

				this.setState({adID: id, video: vid, mobileVideo: mobVid}); 

				// User has no previous view history, but the ad picked by the unit is a VAST ad
				// Want to show them the GoodLoop unit in this case
				if( glVastTag ) {
					iframe.style.display = 'block';
					this.setState({vastTag: glVastTag});
				}
			});
		}     
	} 

	render() {
		// Think we can safely assume that there will always be a 'video' for us to latch on to
		const {adID, mobileVideo, video} = this.state;

		// COPIED FROM UNIT.JS
		// Identify if we're on mobile or not
		let isMobile;
		if( mobileVideo ) {
			const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
			isMobile = !!(userAgent.match('/mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i'));
		}

		const twitterXId = Person.getTwitterXId();
		// Array of the form [{Id:"8facbac79b73d31c36716e584d631969", views: 1}]
		const twitterSocialShareIds = twitterXId ? DataStore.getValue(['data', 'Person', twitterXId, 'socialShareIds']) : null; 

		return (
			<div className="ShareAd">
				<h2> Share this ad on social media </h2>
				{ video || mobileVideo ? <video controls="true" width="100%" height="auto" src={isMobile? mobileVideo : video}> An error occured </video> : null }
				<div ref={e => this.setRef('adunitRef', e)} />
				{ adID && twitterXId ? <TwitterShare adID={this.state.adID} TwitterXId={twitterXId} /> : null}
				{ twitterSocialShareIds ? SharedAdsDisplay(twitterSocialShareIds) : null }
			</div>
		);
	}
}

const SharedAdsDisplay = twitterSocialShareIds => (
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
				{twitterSocialShareIds.map( shareId => {
					const {adName, dateShared, views} = shareId;
					
					return (
						<tr key='id'>
							<td> {adName} </td>
							<td> {views} </td>
							<td> {dateShared} </td>
						</tr>
					);
				})}
			</tbody>
		</table>
	</div>
);

export default ShareAnAd;
