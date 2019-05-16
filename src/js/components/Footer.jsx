import React from 'react';
import { join } from 'wwutils';
import { SocialMediaFooterWidget } from './SocialLinksWidget';
import MDText from '../base/components/MDText';

const Footer = ({className, leftFooter, rightFooter, style}) => (
	<div className={join('footer pad1', className)} style={style}>
		<SocialMediaFooterWidget 
			type='goodloop'
			fb_url='https://www.facebook.com/the.good.loop/'
			tw_url='https://twitter.com/goodloophq'
			insta_url='https://www.instagram.com/goodloophq/'
		/>
		<div className='footer-col leftFooter'>
			<div className='innerLeftFooter'>
				<MDText source={leftFooter} />
			</div>
		</div>
		<div className='mainFooter flex-column'>
			<p className='text-block'>
				&copy; 2016-2019 Good-Loop Ltd. <a href=''>Privacy policy</a>
				<br />
				Registered in Scotland, Uk (No. SC548356)
				<br />
				127 Rose Street South Lane, Edinburgh, EH2 4BB
				<br />
			</p>
			<p className='margin1'>
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
