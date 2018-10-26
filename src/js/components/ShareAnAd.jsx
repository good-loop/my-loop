import React from 'react';
import DataStore from '../base/plumbing/DataStore';
import TwitterShare from './TwitterShare';

class ShareAnAd extends React.Component {
	constructor(props) {
		super(props);

		// Create ref by callback https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
		
		// Don't need to declare these, but vaguely helpful to see what's used
		this.adunitRef = null;

		this.setRef = (ref, value) => {
			this[ref] = value;
		};

		this.focusRef = (ref) => {
			if (this[ref]) this[ref].focus();
		};

		const adID = DataStore.getValue(['widget', 'TwitterShare', 'adID']);
		const mobileVideo = DataStore.getValue(['widget', 'TwitterShare', 'mobileVideo']);
		const video = DataStore.getValue(['widget', 'TwitterShare', 'video']);

		// ID of Good-loop ad to be shown
		// Imagining that we will sometimes have set this based on user's ad history
		this.state = {
			adID,
			mobileVideo,
			video
		};
	}

	// Would usually prefer to put this sort of thing in to componentWillMount
	// but lifecycle goes willMount -> render -> didMount, and this.adunitRef
	// needs to be a valid reference for us to put the iframe into
	componentDidMount() { 
		this.focusRef('adunitRef'); 

		const {adID} = this.state;

		const iframe = document.createElement('iframe');

		/** Elements to place in Good-Loop iframe */
		const $script = document.createElement('script');
		$script.setAttribute('src', adID ? '//as.good-loop.com/unit.js?gl.vert=' + adID : '//as.good-loop.com/unit.js');

		const $div = document.createElement('div');
		$div.setAttribute('class', 'goodloopad');

		// Choose stickyfooter because it looks ok at any width/height
		$div.setAttribute('data-format', 'stickyfooter');
		$div.setAttribute('data-mobile-format', 'stickyfooter');

		iframe.setAttribute('id', 'good-loop-iframe');
		iframe.setAttribute('frameborder', 0);
		iframe.setAttribute('scrolling', 'auto');
		
		iframe.style.height = '102px';
		iframe.style.width = '100%';
		// HACK (26/10/18): allow adunit to still run and pick out ad ID and video
		// Will display actual video in a video tag. Solves problem with
		// adunit not making good use of space on mobile
		// Only one that fits screen is stickyfooter, but the actual video ad is
		// tiny for this
		iframe.style.display = 'none';

		iframe.addEventListener('load', () => {
			window.iframe = iframe;
			iframe.contentDocument.body.style.overflow = 'hidden';
			iframe.contentDocument.body.appendChild($script);
			iframe.contentDocument.body.appendChild($div);
		});
		/** */
		this.adunitRef.appendChild(iframe);

		if( !adID ) {
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

			// Grab ad ID chosen by adunit and place in to DataStore/state
			adIDPV.then( contentWindow => { 
				// Assuming that adunit has not embedded itself in another iframe
				const {goodloop} = contentWindow;
				const id = goodloop.vert.adid; 
				const vid = goodloop.vert.video;
				const mobVid = goodloop.vert.mobileVideo;

				DataStore.setValue(['widget', 'TwitterShare', 'adID'], id);
				DataStore.setValue(['widget', 'TwitterShare', 'video'], vid);
				DataStore.setValue(['widget', 'TwitterShare', 'mobileVideo'], vid);

				this.setState({adID: id, video: vid, mobileVideo: mobVid}); 
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

		return (
			<div className="ShareAd">
				<h2> Share this ad on social media </h2>
				<video controls="true" width="100%" height="auto" src={isMobile? mobileVideo : video}> An error occured </video>
				<div ref={e => this.setRef('adunitRef', e)} />
				{ adID ? <TwitterShare adID={this.state.adID} /> : null}
			</div>
		);
	}
}

export default ShareAnAd;
