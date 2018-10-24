// Twitter share button wrapped in React component
// Is a bit fiddly as their API is intended to be used with Vanilla JS/jQuery

// GOTCHA: Twitter share button is set up by Twitter code.
// Once created, there appears to be no of changing the target url (to point to a different gl.vert)
// Tried rewriting as an <a></a> (https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/parameter-reference1.html)
// but that didn't make any difference. Appears the only way to get this component to update properly
// would be to have it delete the contents of a given div, then create a Twitter button

// Believe answer to this problem can be found in post by chrisf: https://stackoverflow.com/questions/10486354/dynamically-change-tweet-button-data-text-contents
// Think that Twitter's JavaScript function is updating the DOM in a way that React can't handle
// Watched it go through a few update cycles. Appears that the Twitter script, after loading, mutates all suitably labeled <a> tags
// in to iframes that host the Tweet button code. Problem is, that React doesn't reset this iframe to an <a>. Means that telling Twitter to rerun
// its mutation has no effect: there aren't any <a> tags to mutate.

// And that is why we're stuck with the current behaviour where the Tweet button does not update upon receiving new props.
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
		const {twttrPV} = this.state; 

		this.focusRef('twitterShareRef'); // resolve DOM element that Tweet button will be loaded in to

		twttrPV.then( () => {
			const {twttr} = window;

			if(twttr) {
				twttr.widgets.load();
			}
		});
	} 

	// componentWillUpdate(nextProps, nextState) {
	// 	if(nextProps.adID !== this.state.adID) this.setState({adID: nextProps.adID});
	// }

	componentWillReceiveProps(nextProps) {
		if( nextProps.adID !== this.adID) this.setState({adID: nextProps.adID});
	}

	componentDidUpdate() {
		// Force Tweet button to update
		const {twttr} = window;
		if(twttr) {
			twttr.widgets.load();
		}
	}

	render() {
		// Dan had requested that there be some sort of "positive feedback" from share the ad
		// Was the mention of adding some sort of tracking URL so that users would be able
		// to see how many of their followers watched the ad that they shared.
		// return <div className="TwitterShare" ref={e => this.setRef('twitterShareRef', e)} />;
		const {adID} = this.state;

		return (
			<a className="twitter-share-button"
				href="https://twitter.com/intent/tweet"
				data-dnt="true"
				data-size="large"
				data-text="I just gave to charity by watching a @GoodLoopHQ ad :)"
				data-url={adID ? 'https://as.good-loop.com/?gl.vert=' + adID : 'https://as.good-loop.com'}
			>
					Tweet
			</a>);
	}
}

module.exports = TwitterShare;
