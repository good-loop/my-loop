/**
 * Do we need this, or could we refactor to just use the base SocialShare??
 */

import React from 'react';
import {IntentLink} from '../base/components/SocialShare';

const BaseSocialLogo = ({className='', service, style}) => (
	<div style={{display: 'inline-block'}}>
		<div 
			className={'color-gl-red intent-link intent-link-border ' + className}
			style={style}
		>
			<i className={'fab fa-2x fa-'+service} />
		</div>
	</div>
);

// Force all social media intent links used on My-Loop to have a uniform appearance
const MyLoopIntentLink = ({style, ...props}) => (
	<IntentLink
		{...props}
	>
		<BaseSocialLogo 
			style={style}
			service={props.service} 
		/>
	</IntentLink>
);

// Encourage consistency in social media logos used on My-Loop
const TwitterLogo = props => BaseSocialLogo({...props, service: 'twitter'});

const FacebookLogo = props => BaseSocialLogo({...props, service: 'facebook'});  

const LinkedinLogo = props => BaseSocialLogo({...props, service: 'linkedin'});  

const InstagramLogo = props => BaseSocialLogo({...props, service: 'instagram'});  

export {
	MyLoopIntentLink as IntentLink,
	FacebookLogo,
	InstagramLogo,
	LinkedinLogo,
	TwitterLogo,
};
