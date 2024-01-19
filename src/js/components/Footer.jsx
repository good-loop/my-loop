import React from 'react';
import { Container, Row, Col } from 'reactstrap';

import { space, equals } from '../base/utils/miscutils';
import { SubscriptionForm } from './cards/SubscriptionBox';

import C from '../C';
import DataStore from '../base/plumbing/DataStore';


const setFooterClassName = (className) => {
	// NB: update if not equals, which avoids the infinite loop bug of default update behaviour
	if (equals(getFooterClassName(), className)) {
		return; // no-op
	}
	DataStore.setValue(['widget', 'Footer', 'className'], className);
};

const getFooterClassName = () => DataStore.getValue(['widget', 'Footer', 'className']) || DataStore.setValue(['widget', 'Footer', 'className'], '', false);

const pageBGs = {
	// 'ourstory': 'bg-gl-light-pink',
	'green': 'bg-greenmedia-darkcyan',
	'ourimpact': 'bg-gl-light-blue',
	'ourstory': 'bg-gl-desat-blue',
};

const MyLoopFooterSummer2022 = ({ page }) => {
	// Some pages take custom background colours above the curve
	const bgColour = pageBGs[page] || null;

	// Allow inner pages to modify className for styling
	let dsClassName = getFooterClassName();
	const fullClassName = space('my-loop-footer', bgColour, dsClassName);

	return <Container fluid className={fullClassName}>
		<div className="text-center position-relative d-flex flex-column align-items-center">
			<h5>Keep in touch</h5>
			<h5>join the ads for good movement</h5>
			<img className="position-relative" style={{ width: '120%', maxWidth: '500px' }} src="/img/footer/newsletter-background.svg" />
			<div className="position-absolute" style={{ maxWidth: '360px', top: '5em' }}>
				<p className="mt-5">In partnership with</p>
				<img style={{ width: '140px' }} src="/img/footer/Eden.org_RGB.png" />
				<p className="font-weight-bold color-gl-red">Subscribe to get a tree planted on your behalf and receive even more good news!</p>
				<SubscriptionForm className="w-100" buttonText="Subscribe" thankYouTextcolour="text-muted" showTrees buttomColor="primary" />
			</div>
			<img className="position-absolute" style={{ width: '120%', maxWidth: '500px', pointerEvents: 'none' }} src="/img/footer/cloud-overlay.png" />

			<Row className="social-icons mx-auto">
				<Col xs={3}>
					<C.A href="https://twitter.com/goodloophq" target="_blank">
						<img src="/img/footer/twitter_icon.200w.png" className="w-100" />
					</C.A>
				</Col>
				<Col xs={3}>
					<C.A href="https://www.facebook.com/the.good.loop/" target="_blank">
						<img src="/img/footer/facebook_icon.200w.png" className="w-100" />
					</C.A>
				</Col>
				<Col xs={3}>
					<C.A href="https://www.instagram.com/goodloophq/" target="_blank">
						<img src="/img/footer/insta_icon.200w.png" className="w-100" />
					</C.A>
				</Col>
				<Col xs={3}>
					<C.A href="https://www.linkedin.com/company/good.loop?trk=biz-companies-cym" target="_blank">
						<img src="/img/footer/linkedin_icon.200w.png" className="w-100" />
					</C.A>
				</Col>
			</Row>

		</div>

		<FooterNavigation />

		<div className="bg-black" id="footer-bCorp-carbonNegative-logos">
			<Row>
				<img src="/img/footer/B-corp.svg" className="logo-lg" />
				<img src="/img/footer/Net-carbon-negative.svg" className="logo-lg" />
			</Row>
		</div>
	</Container>;
};


const FooterNavigation = () => {
	return (
		<div className="fluid" id="footer-nav-container">
			<div className='row justify-content-between'>
				<div className='col-6 col-md mt-5 mt-md-0 footer-links'>
					<div className="d-inline-block">
						<h5>More</h5>
						<a href='https://doc.good-loop.com/policy/privacy-policy.html'>Privacy policy</a><br />
						<a href='https://doc.good-loop.com/policy/cookie-policy.html'>Cookie policy</a><br />
						<a href='https://doc.good-loop.com/terms/terms-of-use.html'>Terms of use</a><br />
						<a href='https://doc.good-loop.com/policy/brand-safety-policy.html'>Brand Safety Policy</a><br />
					</div>
				</div>
				<div className='col-6 col-md mt-5 mt-md-0 footer-links'>
					<div className="d-inline-block">
						<h5>For business</h5>
						<a href="https://good-loop.com/what-we-do">What we do</a><br />
						<a href="https://good-loop.com/products">Products</a><br />
						<a href="https://good-loop.com/brands">Brands and agencies</a><br />
						<a href="https://good-loop.com/charities">Charities</a><br />
						<a href="https://good-loop.com/case-study/index">Case studies</a><br />
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyLoopFooterSummer2022;
export { setFooterClassName };
