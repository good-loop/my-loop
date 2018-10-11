// Twitter share button wrapped in React component
// Is a bit fiddly as their API is intended to be used with Vanilla JS/jQuery
import React from 'react';

// Having users share our ads would actually 
// be quite a clever way to alleviate a shortage of publishers.
class TwitterShare extends React.Component {
    constructor(props) {
		super(props);

		// Create ref by callback https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
		this.twitterShareRef = null;

		this.setTwitterShareRef = e => {
			this.twitterShareRef = e;
		};

		this.focusTwitterShareRef = () => {
			if (this.twitterShareRef) this.twitterShareRef.focus();
		};
    }

    componentDidMount() {
        const {twttr} = window; // placed in to window by file loaded from Twitter CDN (https://platform.twitter.com/widgets.js)
		
		this.focusTwitterShareRef();
		if(twttr) {
            twttr.widgets.createShareButton("https://as.good-loop.com", this.twitterShareRef, {
                text: 'I just gave to charity by watching a @GoodLoopHQ ad :)',
                size: 'large',
                dnt: 'true' // Do Not Track
            });
        }
    } 

    render() {
		// Dan had requested that there be some sort of "positive feedback" from share the ad
		// Was the mention of adding some sort of tracking URL so that users would be able
		// to see how many of their followers watched the ad that they shared.
		
		// As we don't control the Twitter share button, we can't generate an ad URL onClick
		// What we can do is generate an ad URL in componentWillMount/componentDidMount
		// Doesn't matter if it ends up not being used.
        return <div ref={this.setTwitterShareRef}></div>;
    }
}

module.exports = TwitterShare;
