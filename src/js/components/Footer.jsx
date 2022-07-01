import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import DynImg from '../base/components/DynImg';
import PropControl from '../base/components/PropControl';
import { space, equals, isPortraitMobile } from '../base/utils/miscutils';
import C from '../C';
import SubscriptionBox, { SubscriptionForm } from './cards/SubscriptionBox';

const setFooterClassName = (className) => {
	// NB: update if not equals, which avoids the infinite loop bug of default update behaviour
	if (equals(getFooterClassName(), className)) {
		return; // no-op
	}
	DataStore.setValue(['widget','Footer', 'className'], className);
}

const getFooterClassName = () => DataStore.getValue(['widget','Footer', 'className']) || DataStore.setValue(['widget','Footer', 'className'], '', false);

const pageBGs = {
	// 'ourstory': 'bg-gl-light-pink',
	'green': 'bg-greenmedia-darkcyan',
};

/**
 * The current My-Loop footer
 */
const MyLoopFooter = ({page}) => {
	// Some pages take custom background colours above the curve
	const bgColour = pageBGs[page] || null;

	// Allow inner pages to modify className for styling
	let dsClassName = getFooterClassName();
	const fullClassName = space('my-loop-footer', bgColour, dsClassName);
	return <Container fluid className={fullClassName}>
		<svg className="w-100 footer-curve color-gl-dark-turquoise" viewBox="0 0 2560 593" version="1.1" xmlns="http://www.w3.org/2000/svg">
			<path d="m 0.003,-0.001 c 0,0 356.72,665.074 1297.3,296.564 940.58,-368.51 1468.515,280.543 1468.515,280.543 v 221.17 H 0.003 Z" fill="currentColor" />
		</svg>
		<Row>
			<DynImg src="/img/homepage/Turtle.png" className='turtle'/>
			<div className='bg-gl-dark-turquoise w-100 p-5' style={{marginTop:-1}}>
				<Row>
					<Col md={6}>
						<SubscriptionForm label={"Sign up to our Newsletter for some Good News :)"} thankYouTextcolour="white" />
					</Col>
					{ ! isPortraitMobile() &&
						<Col md={6} className="d-flex justify-content-end">
							<div className="stamps d-flex flex-row align-items-end p-3">
								<div>
									<img src="/img/footer/Net-carbon-negative.svg" className="logo-lg"/>
								</div>
								<div>
									<img src="/img/footer/B-corp.svg" className="logo-lg"/>
								</div>
							</div>
						</Col>
					}
				</Row>
				<Row className="social-icons mx-auto pt-5 mt-5">
					<Col xs={3}>
						<C.A href="https://twitter.com/goodloophq">
							<img src="/img/footer/twitter_icon.200w.png" className="w-100"/>
						</C.A>
					</Col>
					<Col xs={3}>
						<C.A href="https://www.facebook.com/the.good.loop/">
							<img src="/img/footer/facebook_icon.200w.png" className="w-100"/>
						</C.A>
					</Col>
					<Col xs={3}>
						<C.A href="https://www.instagram.com/goodloophq/">
							<img src="/img/footer/insta_icon.200w.png" className="w-100"/>
						</C.A>
					</Col>
					<Col xs={3}>
						<C.A href="https://www.linkedin.com/company/good.loop?trk=biz-companies-cym">
							<img src="/img/footer/linkedin_icon.200w.png" className="w-100"/>
						</C.A>
					</Col>
				</Row>
				<Row className='mt-5 footer-links text-center small mx-auto'>
					<Col>
						<C.A href="https://doc.good-loop.com/policy/privacy-policy.html">
							<p>Privacy policy</p>
						</C.A>
					</Col>
					<Col>
						<C.A href="https://doc.good-loop.com/policy/cookie-policy.html">
							<p>Cookie policy</p>
						</C.A>
					</Col>
					<Col>
						<C.A href="https://doc.good-loop.com/terms/terms-of-use.html">
							<p>Terms of use</p>
						</C.A>
					</Col>
					<Col>
						<C.A href="https://doc.good-loop.com/policy/brand-safety-policy.html">
							<p>Brand safety policy</p>
						</C.A>
					</Col>
				</Row>
				{isPortraitMobile() &&
					<Col md={6} className="d-flex justify-content-center pt-5 mt-5">
						<div className="stamps d-flex flex-row align-items-end py-1 px-3">
							<div>
								<img src="/img/footer/Net-carbon-negative.svg" className="logo-lg"/>
							</div>
							<div>
								<img src="/img/footer/B-corp.svg" className="logo-lg"/>
							</div>
						</div>
					</Col>
				}
			</div>
		</Row>
	</Container>;
}

export default MyLoopFooter;
export {setFooterClassName};
