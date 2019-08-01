import React from 'react';
import { join } from 'wwutils';
import { SocialMediaFooterWidget } from './SocialLinksWidget';
import MDText from '../base/components/MDText';

const Footer = ({className, leftFooter, rightFooter, style, showSocialMediaLinks}) => (
	<div className={join('footer pad1', className)} style={style}>
		{
			showSocialMediaLinks
			&& (
				<SocialMediaFooterWidget 
					type='goodloop'
					fb_url='https://www.facebook.com/the.good.loop/'
					tw_url='https://twitter.com/goodloophq'
					insta_url='https://www.instagram.com/goodloophq/'
				/>
			)
		}
		<div className='footer-col leftFooter'>
			<div className='innerLeftFooter'>
				<MDText source={leftFooter} />
			</div>
		</div>
		<div className='mainFooter flex-column pad1'>
			<p>
				&copy; 2016-2019 <a href='https://www.good-loop.com/blog'>Good-Loop Ltd</a>, all rights reserved. <a href='https://www.good-loop.com/privacy-policy'>Privacy policy</a>
			</p>
			<p>Good-Loop&trade; is registered in Scotland, U.K. (No. SC548356)</p>
			<p>127 Rose Street South Lane, Edinburgh, EH2 4BB</p>
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
