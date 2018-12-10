import React from 'react';
import md5 from 'md5';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import TwitterShare from './TwitterShare';
import C from '../C';
import Person from '../base/data/Person';

/** Returns promise that resolves when Good-Loop unit is loaded and ready */
const injectGoodLoopUnit = ({adID, thisRef}) => {
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

	iframe.addEventListener('load', () => {
		window.iframe = iframe;
		iframe.contentDocument.body.style.overflow = 'hidden';
		iframe.contentDocument.body.appendChild($script);
		iframe.contentDocument.body.appendChild($div);
	});

	thisRef.adunitRef.appendChild(iframe);
};

// TODO Does this need to be a component? If not, avoid React.Component in favour of functional jsx
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

					const {adid, video, mobileVideo, vastTag} = vert;
					this.setState({adID: adid, mobileVideo, vastTag, video});
				});
		}
	}

	// Would usually prefer to put this sort of thing in to componentWillMount
	// but lifecycle goes willMount -> render -> didMount, and this.adunitRef
	// needs to be a valid reference for us to put the iframe into
	componentDidMount() { 
		this.focusRef('adunitRef'); 

		const {adID, vastTag} = this.state;

		// Is a VAST ad. Need to use the GoodLoop player to display it
		if( vastTag ) injectGoodLoopUnit({adID, thisRef: this, vastTag});
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

		// TODO: clean this up?
		return (
			<div className="ShareAd">
				<h2> Share this ad on social media </h2>
				{ video || mobileVideo ? <video controls="true" width="100%" height="auto" src={isMobile? mobileVideo : video}> An error occured </video> : null }
				<div ref={e => this.setRef('adunitRef', e)} />
				{ adID && twitterXId ? <TwitterShare adID={this.state.adID} TwitterXId={twitterXId} /> : null}
				<SharedAdsDisplay xid={twitterXId} />
			</div>
		);
	}
}

const SharedAdsDisplay = ({xid}) => {
	const twitterSocialShareObjects = xid ? DataStore.getValue(['data', 'Person', xid, 'socialShareIds']) : null;
	if( !twitterSocialShareObjects ) return null;

	// Want an array of just the ID strings. Filter out other crap
	const shareIds = twitterSocialShareObjects.map( shareIdObject => shareIdObject.id);
	DataStore.fetch(['data', 'Person', xid, 'views'], () => ServerIO.getViewCount(shareIds));

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
						const {id, adId, name, dateShared} = shareIdObj;
						const views = DataStore.getValue(['data', 'Person', xid, 'views', id]);

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

export default ShareAnAd;
