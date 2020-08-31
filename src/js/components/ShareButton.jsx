import React from 'react';
import {Row} from 'reactstrap';

class ShareButton extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			showing: false
		}
	}

	render () {
		return (
			<div className="position-relative">
				<div className={"btn " + this.props.className} onClick={() => this.setState({showing: !this.state.showing})}><i className="fas fa-share-alt mr-2" />{this.props.children}</div>
				{this.state.showing ?
					<div className="share-popup">
						<img src="/img/share/ShareBubble.svg" className="w-100 bubble"/>
						<Row className="popup-btns no-gutters w-100">
							<a className="col p-2" target="_blank" href="https://www.facebook.com/the.good.loop/"><img src="/img/share/Facebook.png" className="w-100"/></a>
							<a className="col p-2" target="_blank" href="https://twitter.com/GoodLoopHQ"><img src="/img/share/Twitter.png" className="w-100"/></a>
							<a className="col p-2" target="_blank" href="https://www.linkedin.com/company/good.loop"><img src="/img/share/LinkedIn.png" className="w-100"/></a>
							<a className="col p-2" target="_blank" href="https://testwebsite.good-loop.com/contact"><img src="/img/share/Email.png" className="w-100"/></a>
						</Row>
					</div>
				: null}
			</div>
		);
	}

}

export default ShareButton;