import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropControl from '../base/components/PropControl';
import { space, equals } from '../base/utils/miscutils';

/**
 * @deprecated No longer used in My-Loop - remove?
 * @param style {Object} css styling
 */
const Footer = ({className, style }) => (
	<footer className={space('footer container-fluid', className)} style={style}>
		<div className="mainFooter container py-5">
			{/* Hide Social Links due to ssl issue in non https protocol (Chrome extension) */}
			{/* <div className="row justify-content-between">
				<div className="col-4">
					<hr/>
				</div>
				<div className="col-4 row text-center text-lg-right px-0 px-lg-5">
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://twitter.com/goodloophq" target="_blank">
							<img alt="twitter" src="/img/footer-logos/HomePage_footer_twitter.200w.png" className="w-100 noaos"/>
						</a>
					</div>
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://www.facebook.com/the.good.loop/" target="_blank">
							<img alt="facebook" src="/img/footer-logos/HomePage_footer_facebook_icon.200w.png" className="w-100 noaos"/>
						</a>
					</div>
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://www.instagram.com/goodloophq/" target="_blank">
							<img alt="instagram" src="/img/footer-logos/HomePage_Insta_icon.200w.png" className="w-100 noaos"/>
						</a>
					</div>
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://www.linkedin.com/company/good.loop/" target="_blank">
							<img alt="linkedin" src="/img/footer-logos/HomePage_footer_LinkedIn_icon.200w.png" className="w-100 noaos"/>
						</a>
					</div>
				</div>
				<div className="col-4">
					<hr/>
				</div>
			</div> */}
			<div className="row mt-3 justify-content-center">
				<img src="/img/new-logo-with-text-white.svg" width="200px" alt="Good-Loop-Logo" />
			</div>
			<div className="row mt-1 justify-content-center">
				<small>&copy; Good-Loop Ltd, all rights reserved. This website contains logos, trademarks, and branding material such as adverts that are the property of the respective brands. Good-Loop&trade; is a registered UK company no. SC548356.
				</small>
			</div>
		</div>
	</footer>
);

const setFooterClassName = (className) => {
	// NB: update if not equals, which avoids the infinite loop bug of default update behaviour
	if (equals(getFooterClassName(), className)) {
		return; // no-op
	}
	DataStore.setValue(['widget','Footer', 'className'], className);
}

const getFooterClassName = () => DataStore.getValue(['widget','Footer', 'className']) || DataStore.setValue(['widget','Footer', 'className'], '', false);

/**
 * The current My-Loop footer
 * @param {?String} className
 * @param {?String} style
 */
const MyLoopFooter = ({className, style}) => {
	// Allow inner pages to modify className for styling
	let dsClassName = getFooterClassName();
	const fullClassName = space('my-loop-footer', className, dsClassName);
	return <Container fluid className={fullClassName} style={style}>
		<Row>
			<img src="/img/curves/curve-dark-turquoise.svg" className='w-100 footer-curve'/>
			<img src="/img/footer/Hummingbird.png" className='hummingbird'/>
			<div className='bg-gl-dark-turquoise w-100 p-5' style={{marginTop:-1}}>
				<Row>
					<Col md={6}>
						<p className='white'><b>Sign up to our Newsletter for some Good News :)</b></p>
						{/* TODO make function */}
						<PropControl prop="email" path={["widget", "newsletter"]} type="text" placeholder="yourname@youremail.com" className="newsletter-email"/>
						<button className="btn btn-subscribe">Subscribe</button>
					</Col>
					<Col md={6}>
						
					</Col>
				</Row>
			</div>
		</Row>
	</Container>;
}

export default Footer;
export {MyLoopFooter, setFooterClassName};
