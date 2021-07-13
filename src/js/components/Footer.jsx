import React from 'react';
import { space } from '../base/utils/miscutils';

/**
 *
 * @param leftFooter {String} Markdown text
 * @param rightFooter {String} Markdown text
 * @param style {Object} css styling
 */
const Footer = ({className, style }) => (
	<footer className={space('footer container-fluid', className)} style={style}>
		<div className="mainFooter container py-5">
			<div className="row justify-content-between">
				<div className="col-4">
					<hr/>
				</div>
				<div className="col-4 row text-center text-lg-right px-0 px-lg-5">
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://twitter.com/MyGood_Loop" target="_blank">
							<img alt="twitter" src="/img/footer-logos/HomePage_footer_twitter.200w.png" className="w-100 noaos"/>
						</a>
					</div>
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://www.facebook.com/My-Good-Loop-100134565560826" target="_blank">
							<img alt="facebook" src="/img/footer-logos/HomePage_footer_facebook_icon.200w.png" className="w-100 noaos"/>
						</a>
					</div>
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://www.instagram.com/my.goodloop/" target="_blank">
							<img alt="instagram" src="/img/footer-logos/HomePage_Insta_icon.200w.png" className="w-100 noaos"/>
						</a>
					</div>
					<div className="col d-flex flex-row justify-content-center align-items-center px-0 px-lg-3 mx-1 mx-lg-0">
						<a href="https://www.linkedin.com/showcase/my-good-loop/" target="_blank">
							<img alt="linkedin" src="/img/footer-logos/HomePage_footer_LinkedIn_icon.200w.png" className="w-100 noaos"/>
						</a>
					</div>
				</div>
				<div className="col-4">
					<hr/>
				</div>
			</div>
			<div className="row mt-3 justify-content-center">
				<img src="/img/new-logo-with-text-white.svg" width="200px" alt="Good-Loop-Logo" />
			</div>
			<div className="row mt-1 justify-content-center">
				<small>&copy; Good-Loop Ltd, all rights reserved. Good-Loop&trade; is a registered UK company no. SC548356.</small>
			</div>
		</div>
	</footer>
);

export default Footer;
