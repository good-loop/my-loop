import React from 'react';
import { join } from 'wwutils';
import { SocialMediaFooterWidget } from './SocialLinksWidget';
import MDText from '../base/components/MDText';

// usign css grid (and flex in ie10+) to make the footer mobile responsive & had to create innerFooter divs to align content to the bottom using display:table
const Footer = ({className, leftFooter, rightFooter, style}) => (
	<div className={join('footer pad1', className)} style={style}>
		<SocialMediaFooterWidget 
			type='goodloop'
			fb_url='https://www.facebook.com/the.good.loop/'
			tw_url='https://twitter.com/goodloophq'
			insta_url='https://www.instagram.com/good.loop.ads/'
		/>
		<div className='footer-col leftFooter'>
			<div className='innerLeftFooter'>
				<MDText source={leftFooter} />
			</div>
		</div>
		<div className='footer-col mainFooter'>
			<p>
				Ads for Good by Good-Loop Ltd.<br />
				&copy; 2019 Good-Loop <a href="mailto:daniel@good-loop.com?Subject=My-Loop%20query" target="_top">Contact Us</a>
				&nbsp; This web-app is open-source on <a target='_blank' href='https://github.com/good-loop/my-loop'>GitHub</a>.
			</p>
		</div>
		<div className='footer-col rightFooter'>
			<div className='innerRightFooter'>
				<MDText source={rightFooter} />
			</div>
		</div>
	</div>
);

export default Footer;
