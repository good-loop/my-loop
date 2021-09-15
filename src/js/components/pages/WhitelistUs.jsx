import React, { useEffect } from 'react';
import MyLoopNavBar from '../MyLoopNavBar';
import SubscriptionBox from '../cards/SubscriptionBox';
import { Col, Container, Row } from 'reactstrap';

window.DEBUG = false;

const WhitelistUs = () => {
	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text.svg" logoScroll="/img/new-logo-with-text-white.svg" />
		<div className="WhitelistUs">
			{/* <img src="/img/LandingBackground/involved_banner.png" alt="banner" className="w-100 mt-5"/> */}
			<Container className="py-5">
				{/* what is this div for?? */}
				<div className="d-flex justify-content-center align-items-center mb-5" />
				{/* Offset this to the right - technically off-center but looks weighted otherwise, eyes are weird */}
				<Row className="ml-md-5 pl-md-5 text-center text-md-left mb-5">
					<Col md={6}>
						<div className="w-100 h-100 flex-column unset-margins justify-content-center mission">
							<h2 className="mr-auto mb-3">It looks like you have AdBlock enabled</h2>
							<p>We can't raise money for charity without displaying ads. Please disable your adblocker or whitelist us so Tabs for Good can work!</p>
						</div>
					</Col>
					<Col md={6}>
						<img className="w-50 mt-4" src="/img/whitelist/red-toggle-on.png"/>
					</Col>
				</Row>
				<Row className="mr-md-5 pr-md-5 text-center text-md-left">
					<Col md={6} className="text-md-center">
						<img className="w-75" src="/img/whitelist/adblock-pause.png"/>
					</Col>
					<Col md={6}>
						<div className="w-100 h-100 flex-column unset-margins justify-content-center mission">
							<h2 className="mr-auto mb-3">Whitelist Tabs For Good</h2>
							<p>Simply pause ad blocker on this page, or manually add <code>my.good-loop.com</code> to your ad blocker whitelist filter.</p>
							<p>We can start rasing money for charity.</p>
						</div>
					</Col>
				</Row>
			</Container>
			<SubscriptionBox className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};


export default WhitelistUs;
