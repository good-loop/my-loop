import React from 'react';
import {Row} from 'reactstrap';

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
		}
	}
	
	render () {

		// Generate ShareServlet sharing url
		let metaProps = this.props.meta;
		if (!metaProps)
			metaProps = this.props;
		let params = [];
		if (metaProps.title)
			params.push('title=' + escape(metaProps.title));
		if (metaProps.image)
			params.push('image=' + escape(metaProps.image));
		if (metaProps.description)
			params.push('desc=' + escape(metaProps.description));
		let url = "https://as.good-loop.com/share?"; //title=Foo&link=" + escape(this.props.url);
		let paramCount = 0;
		params.forEach (param => {
			url += (paramCount != 0 ? "&" : "") + param;
			paramCount ++;
		});
		url += (paramCount != 0 ? "&" : "") + "link=" + escape(this.props.url);
		console.log("Sharing: " + url);
		url = escape(url);
		console.log("Escaped: " + url);

		return (
			<div className="position-relative">
				<div className={"btn " + this.props.className} onClick={() => this.setState({showing: !this.state.showing})}><i className="fas fa-share-alt mr-2" />{this.props.children}</div>
				{this.state.showing ?
					<div className="share-popup">
						<img src="/img/share/ShareBubble.svg" className="w-100 bubble"/>
						<Row className="popup-btns no-gutters w-100">
							<a className="col p-2" target="_blank" href={"https://www.facebook.com/sharer/sharer.php?u=" + url}><img src="/img/share/Facebook.png" className="w-100"/></a>
							<a className="col p-2" target="_blank" href={"https://twitter.com/intent/tweet?url=" + url}><img src="/img/share/Twitter.png" className="w-100"/></a>
							<a className="col p-2" target="_blank" href={"http://www.linkedin.com/shareArticle?mini=true&url=" + url}><img src="/img/share/LinkedIn.png" className="w-100"/></a>
							<a className="col p-2" target="_blank" href={"mailto:hello@good-loop.com?&subject=&body=" + url}><img src="/img/share/Email.png" className="w-100"/></a>
						</Row>
					</div>
				: null}
			</div>
		);
	}

}

export default ShareButton;