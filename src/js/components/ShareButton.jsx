import React, {useState} from 'react';
import { Row } from 'reactstrap';
import { encURI, space } from '../base/utils/miscutils';
import C from '../C';

/**
 * Produces a button with sharing links and dynamic meta, using ShareServlet
 * @param {String} url
 * @param {String} title for meta
 * @param {String} image for meta
 * @param {String} descriptions for meta
 * @param {?String} tweep twitter handle (defaults to @GoodLoopHQ)
 * @param {?String} card twitter card type, defaults to summary (https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
 * @param {Object} meta an object with title, image and description to use as a convinience prop in place of those 3
 * @param {Boolean} absolute render a button that can handle absolute positioning
 * @param {String} className
 * @param {String} style
 * @param {Function} onShare triggers after the share has been clicked
 * @param {Boolean} menuOnly renders the button menu with no button if true
 */
const ShareButton = ({url, meta, title, image, description, tweep, card, absolute, className, style, children, onShare, menuOnly}) => {
	const [showing, setShowing] = useState(false);

	// Generate ShareServlet sharing url
	// Don't use ServerIO.AS_ENDPOINT - it is set to live for my-loop
	// let shareUrl = new URL(`${C.HTTPS}://${C.SERVER_TYPE}as.good-loop.com/share`);
	// if (!meta) meta = {title, image, description, tweep, card};
	// if (meta.title) shareUrl.searchParams.append('title', meta.title);
	// if (meta.image) shareUrl.searchParams.append('image', meta.image);
	// if (meta.description) shareUrl.searchParams.append('desc', meta.description);
	// shareUrl.searchParams.append('tweep', meta.tweep || "GoodLoopHQ");
	// shareUrl.searchParams.append('card', meta.card || "summary");

	// shareUrl.searchParams.append("link", url);
	// //console.log("ShareServlet generated URL: " + url);
	// shareUrl = encURI(shareUrl.href);

	// NB: theres no unicode character for share
	// c.f. https://stackoverflow.com/questions/23358594/is-there-a-unicode-character-for-the-share-icon
	// (which includes a css hack for making .<: look like it)

	// Deprecate ShareServlet sharing url
	let shareUrl = new URL(window.location.href);
	shareUrl = encURI(shareUrl.href);

	const ShareMenu = () => <div className={space("share-popup", menuOnly ? space("menu-only", className) : "")}>
		<img src="/img/share/ShareBubble.svg" className="w-100 bubble" alt="share icon"/>
		<Row className="popup-btns no-gutters w-100">
			<a className="col p-2" onClick={onShare} target="_blank" href={"https://www.facebook.com/sharer/sharer.php?u=" + shareUrl}><img src="/img/share/Facebook.png" className="w-100"/></a>
			<a className="col p-2" onClick={onShare} target="_blank" href={"https://twitter.com/intent/tweet?url=" + shareUrl}><img src="/img/share/Twitter.png" className="w-100"/></a>
			<a className="col p-2" onClick={onShare} target="_blank" href={"http://www.linkedin.com/shareArticle?mini=true&url=" + shareUrl}><img src="/img/share/LinkedIn.png" className="w-100"/></a>
			<a className="col p-2" onClick={onShare} target="_blank" href={"mailto:?&subject=&body=" + url}><img src="/img/share/Email.png" className="w-100"/></a>
		</Row>
	</div>;

	return menuOnly ? (
		<ShareMenu/>
	) :(
		<div className={space(absolute ? "position-absolute" : "position-relative", "d-inline-block share-btn")} style={style}>
			<div className={space("btn", className)} onClick={() => setShowing(!showing)}><i className="fas fa-share-alt mr-2" />{children}</div>
			{showing && <ShareMenu/>}
		</div>
	);
};

export default ShareButton;
