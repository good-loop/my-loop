import React from 'react';
import {space} from '../base/utils/miscutils';
import { SocialMediaFooterWidget } from './SocialLinksWidget';
import MDText from '../base/components/MDText';

/**
 * 
 * @param leftFooter {String} Markdown text
 * @param rightFooter {String} Markdown text
 * @param style {Object} css styling 
 */
const Footer = ({className, leftFooter, rightFooter, style, showSocialMediaLinks}) => (
	<div className={space('footer p-3', className)} style={style}>
		{showSocialMediaLinks? 
			<SocialMediaFooterWidget 
				type='goodloop'
				fb_url='https://www.facebook.com/the.good.loop/'
				tw_url='https://twitter.com/goodloophq'
				insta_url='https://www.instagram.com/goodloophq/'
			/> : null}
		<div className='footer-col leftFooter'>
			<div className='innerLeftFooter'>
				<MDText source={leftFooter} />
			</div>
		</div>
		<div className='mainFooter flex-column p-3'>
			<p>
				&copy; 2016-2020 <a href='https://good-loop.com/good-news/index'>Good-Loop Ltd</a>, all rights reserved.<br />
				<a href='https://doc.good-loop.com/policy/privacy-policy.html'>Privacy policy</a>
			</p>
			<p>
				Good-Loop&trade; is registered in Scotland, U.K. (No. SC548356)
			</p>
			<p>
				This web-app is open-source on <a target='_blank' href='https://github.com/good-loop/my-loop'>GitHub</a>.
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
