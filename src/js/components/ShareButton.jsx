import React from 'react';
import {Row} from 'reactstrap';
import { encURI, space } from '../base/utils/miscutils';

/*
 * Produces a button with sharing links and dynamic meta, using ShareServlet
 * Props:
 * url - must be provided!
 * title
 * image
 * description
 */
class ShareButton extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			showing: false
		};
	}

	render () {
		// Generate ShareServlet sharing url
		let url = new URL("https://as.good-loop.com/share");
		let metaProps = this.props.meta;
		if (!metaProps) metaProps = this.props;
		if (metaProps.title) url.searchParams.append('title', metaProps.title);
		if (metaProps.image) url.searchParams.append('image', metaProps.image);
		if (metaProps.description) url.searchParams.append('desc', metaProps.description);
		url.searchParams.append("link", this.props.url);
		//console.log("ShareServlet generated URL: " + url);
		url = encURI(url.href);

		// NB: theres no unicode character for share
		// c.f. https://stackoverflow.com/questions/23358594/is-there-a-unicode-character-for-the-share-icon
		// (which includes a css hack for making .<: look like it)

		return (
			<div className={space(this.props.absolute ? "position-absolute" : "position-relative", "d-inline-block share-btn")} style={this.props.style}>
				<div className={space("btn", this.props.className)} onClick={() => this.setState({showing: !this.state.showing})}><i className="fas fa-share-alt mr-2" />{this.props.children}</div>
				{this.state.showing &&
					<div className="share-popup">
						<img src="/img/share/ShareBubble.svg" className="w-100 bubble" alt="share icon"/>
						<Row className="popup-btns no-gutters w-100">
							<a className="col p-2" onClick={this.props.onShare} target="_blank" href={"https://www.facebook.com/sharer/sharer.php?u=" + url}><img src="/img/share/Facebook.png" className="w-100"/></a>
							<a className="col p-2" onClick={this.props.onShare} target="_blank" href={"https://twitter.com/intent/tweet?url=" + url}><img src="/img/share/Twitter.png" className="w-100"/></a>
							<a className="col p-2" onClick={this.props.onShare} target="_blank" href={"http://www.linkedin.com/shareArticle?mini=true&url=" + url}><img src="/img/share/LinkedIn.png" className="w-100"/></a>
							<a className="col p-2" onClick={this.props.onShare} target="_blank" href={"mailto:?&subject=&body=" + this.props.url}><img src="/img/share/Email.png" className="w-100"/></a>
						</Row>
					</div>
				}
			</div>
		);
	}
};

export default ShareButton;
