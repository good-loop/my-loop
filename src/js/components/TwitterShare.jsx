
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

module.exports = TwitterShare;
