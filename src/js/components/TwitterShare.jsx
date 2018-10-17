// Twitter share button wrapped in React component
// Is a bit fiddly as their API is intended to be used with Vanilla JS/jQuery

// GOTCHA: Twitter share button is set up by Twitter code.
// Once created, there appears to be no of changing the target url (to point to a different gl.vert)
// Tried rewriting as an <a></a> (https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/parameter-reference1.html)
// but that didn't make any difference. Appears the only way to get this component to update properly
// would be to have it delete the contents of a given div, then create a Twitter button

// As clearing out components isn't very "React", I've decided to just not call TwitterShare until an adID is loaded
// Not the worst, as the adunit should only load once anyway, but it is quite annoying
import React from 'react';

// Having users share our ads would actually 
// be quite a clever way to alleviate a shortage of publishers.

// Renders Twitter share button as well as a preview of the ad to be shared via the Good-loop ad unit
class TwitterShare extends React.Component {
	constructor(props) {
		super(props);

		const {adID} = props;

		// Create ref by callback https://reactjs.org/docs/refs-and-the-dom.html#callback-refs

		this.setRef = (ref, value) => {
			this[ref] = value;
		};

		this.focusRef = (ref) => {
			if (this[ref]) this[ref].focus();
		};

		this.state = {
			adID,
			twttrPV: null
		};
	}
	
	componentWillMount() {
		// Need to know when Twitter API script has finished loading			
		const twttrPV = new Promise( (resolve, reject) => {
			const $head = document.querySelector('head');
			const $script = document.createElement('script');
			$script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
			$script.addEventListener('load', () => {
				resolve(true);
			});
			$script.addEventListener('error', () => {
				reject(false);
			});
			$head.appendChild($script);
		});
		this.setState({twttrPV});
	}

	componentDidMount() {
		const {adID, twttrPV} = this.state; 
		
		this.focusRef('twitterShareRef'); // resolve DOM element that Tweet button will be loaded in to

		twttrPV.then( scriptLoaded => {
			if(scriptLoaded) {
				const {twttr} = window; // placed in to window by file loaded from Twitter CDN (https://platform.twitter.com/widgets.js)
				const src = adID ? 'https://as.good-loop.com/?gl.vert=' + adID : 'https://as.good-loop.com';

				twttr.widgets.createShareButton(src, this.twitterShareRef, {
					text: 'I just gave to charity by watching a @GoodLoopHQ ad :)',
					size: 'large',
					dnt: 'true' // Do Not Track
				});
			}
		});
	} 

	render() {
		// Dan had requested that there be some sort of "positive feedback" from share the ad
		// Was the mention of adding some sort of tracking URL so that users would be able
		// to see how many of their followers watched the ad that they shared.
		return (
			<div className="TwitterShare">
				<div ref={e => this.setRef('twitterShareRef', e)} />
			</div>);
	}
}

module.exports = TwitterShare;
