import React from 'react';
import MyLoopNavBar from '../MyLoopNavBar';
import SubscriptionBox from '../cards/SubscriptionBox';
import { Col, Container, Row } from 'reactstrap';

window.DEBUG = false;

const AllowlistUs = () => {
	window.scroll(0,0);

	let noNavbar = document.createElement('style');
	noNavbar.innerHTML = '.nav-item:last-child {visibility: hidden;}';
	document.head.appendChild(noNavbar);
	
	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text.svg" logoScroll="/img/new-logo-with-text-white.svg" />
		<img className="adblock-arrow" src="/img/allowlist/adblock-arrow.png" alt="" />
		<div className="AllowlistUs">
			<div className="m-5">
				<br/> <br/>
			</div>
			<Container className="py-5">
				<div className="d-flex justify-content-center align-items-center" />
				<Row className="text-center text-md-left">
					<Col md={8}>
						<h1 className="mr-auto">It looks like you're using an Ad Blocker.</h1>
					</Col>
				</Row>
				<Row className="text-center text-md-left">
					<Col md={6}>
						<div className="justify-content-left">
							<p>We can't raise money for charity without displaying ads. Please disable your adblocker or allowlist us so Tabs for Good can work!</p>
						</div>
					</Col>
					<Col md={6}>
						<img className="w-100" src="/img/allowlist/red-toggle-on.png"/>
					</Col>
				</Row>
				<div className="m-5">
					<br/>
				</div>
				<Row className="text-center text-md-right justify-content-end">
					<Col md={8}>
						<h1 className="ml-auto">Allowlist Tabs For Good.</h1>
					</Col>
				</Row>
				<Row className="text-center text-md-right">
					<Col md={6} className="text-md-center">
						<img className="w-100" src="/img/allowlist/turnoffadblockerflowery.png"/>
					</Col>
					<Col md={6}>
						<div className="justify-content-center">
							<p>Simply pause Adblocker on this page or manually add <br/> <code>my.good-loop.com</code> to your ad blocker allowlist/ whitelist filter to <br/> enable us to start raising money for charity.</p>
						</div>
					</Col>
				</Row>
			</Container>
			<SubscriptionBox className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};


export default AllowlistUs;
