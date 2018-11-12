
// This is making noise in the js console -- it's probably repeatedly calling Twitter.
// TODO We don't need to use the Twitter button. We can use a dialog, with an iframe using a twitter intent url
// MVP: just use a a tag (no dialog no iframe)
// copy-pasta from https://as.good-loop.com:
// <a href="https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fas.good-loop.com%2F&amp;ref_src=twsrc%5Etfw&amp;text=I%20just%20gave%20to%20charity%20by%20watching%20a%20%40GoodLoopHQ%20ad%20%3A)&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fas.good-loop.com%2F%3Fvert%3Dvert_ajdoxcbg" class="btn" id="b"><i></i><span class="label" id="l">Tweet</span></a>


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
import md5 from 'md5';
import ServerIO from '../plumbing/ServerIO';
import {saveSocialShareId} from '../base/Profiler';
import Person from '../base/data/Person';

// Having users share our ads would actually 
// be quite a clever way to alleviate a shortage of publishers.

// Renders Twitter share button as well as a preview of the ad to be shared via the Good-loop ad unit
class TwitterShare extends React.Component {
	constructor(props) {
		super(props);

		const {adID, TwitterXId} = props;

		// Create ref by callback https://reactjs.org/docs/refs-and-the-dom.html#callback-refs

		this.setRef = (ref, value) => {
			this[ref] = value;
		};

		this.focusRef = (ref) => {
			if (this[ref]) this[ref].focus();
		};

		// Make hash out of service name and vert ID
		// Important that ID generated always be the same for given service + adID
		// Don't want the user to be able to generate multiple tracking IDs for
		// the same ad. If the share it multiple times, would like share count to be aggregated
		const TwitterSocialShareId = md5( 'twitter' + adID );

		this.state = {
			adID,
			twttrPV: null,
			TwitterXId,
			TwitterSocialShareId
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
		const {twttrPV, TwitterXId, TwitterSocialShareId} = this.state; 

		this.focusRef('twitterShareRef'); // resolve DOM element that Tweet button will be loaded in to

		twttrPV.then( () => {
			const {twttr} = window;

			if(twttr) {
				twttr.widgets.load();

				twttr.events.bind('click', () => saveSocialShareId(TwitterXId, TwitterSocialShareId));
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
		
		// adID and socialShareId should always come paired
		// Only reason a socialShareId wouldn't be created is if we don't have and adID
		const {adID, TwitterSocialShareId} = this.state;

		return (
			<a className="twitter-share-button"
				href="https://twitter.com/intent/tweet"
				data-dnt="true"
				data-size="large"
				data-text="I just gave to charity by watching a @GoodLoopHQ ad :)"
				data-url={adID ? ServerIO.AS_ENDPOINT + '/?gl.vert=' + adID + '&gl.socialShareId=' + TwitterSocialShareId : ServerIO.AS_ENDPOINT}
			>
					Tweet
			</a>);
	}
}

module.exports = TwitterShare;
