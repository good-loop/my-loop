// Twitter share button wrapped in React component
// Is a bit fiddly as their API is intended to be used with Vanilla JS/jQuery
import React from 'react';

// Having users share our ads would actually 
// be quite a clever way to alleviate a shortage of publishers.

// Renders Twitter share button as well as a preview of the ad to be shared via the Good-loop ad unit
class TwitterShare extends React.Component {
	constructor(props) {
		super(props);

		// Create ref by callback https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
		this.twitterShareRef = null;

		this.setRef = (ref, value) => {
			this[ref] = value;
		};

		this.focusRef = (ref) => {
			if (this[ref]) this[ref].focus();
		};

		this.state = {
			twttr: null,
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
		twttrPV.then( scriptLoaded => { if(scriptLoaded) this.setState({twttr: window.twttr}); });
	}

	componentDidMount() {
		const {twttrPV} = this.state; 
		
		this.focusRef('twitterShareRef'); // resolve DOM element that Tweet button will be loaded in to
		
		twttrPV.then( scriptLoaded => {
			if(scriptLoaded) {
				const {twttr} = window; // placed in to window by file loaded from Twitter CDN (https://platform.twitter.com/widgets.js)

				twttr.widgets.createShareButton("https://as.good-loop.com", this.twitterShareRef, {
					text: 'I just gave to charity by watching a @GoodLoopHQ ad :)',
					size: 'large',
					dnt: 'true' // Do Not Track
				});

				this.setState({twttr: window.twttr});
			}
		});
	} 

	render() {
		// Dan had requested that there be some sort of "positive feedback" from share the ad
		// Was the mention of adding some sort of tracking URL so that users would be able
		// to see how many of their followers watched the ad that they shared.

		// As we don't control the Twitter share button, we can't generate an ad URL onClick
		// What we can do is generate an ad URL in componentWillMount/componentDidMount
		// Doesn't matter if it ends up not being used.
		return <div ref={e => this.setRef('twitterShareRef', e)}></div>;
	}
}

module.exports = TwitterShare;
