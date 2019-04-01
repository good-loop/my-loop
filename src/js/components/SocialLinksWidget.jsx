import React from 'react';
import _ from 'lodash';
import MDText from '../base/components/MDText';
import {IntentLink} from '../base/components/SocialShare';
import Money from '../base/data/Money';

/** What should appear in Tweet/Facebook link/LinkedIn article
// Contains fallbacks for where donation amount, charities or advertiser name is not specified
@returns {String} e.g. TOMS helped raise £££ for Crisis
 */ 
const shareTextFn = ({donationValue, charities, adName="We"}) => {
	const amount = new Money({currency: 'GBP', value: donationValue});

	const currencySymbol = Money.CURRENCY[(amount.currency || 'GBP').toUpperCase()];
	const amountText = Money.prettyString({amount}) || 'money';
	let charityText;

	if( charities && charities.length !== 0) {
		// Safety: filter out any charities that do not have a human-readable name
		const charityNames = charities && charities.reduce( (arrayOut, charity) => charity.name ? arrayOut.concat(charity.name) : arrayOut, []);
		
		if( !charityNames ) {
			charityText = 'charity';
		} else if ( charityNames.length === 1) {
			charityText = charityNames[0];
		} else {
			// Pull out last two elements as these are formatted differently
			const finalTwoCharityNames = charityNames.splice(charityNames.length - 2, 2);

			charityText = `${charityNames.map( charityName => charityName + ', ')}${finalTwoCharityNames[0]} and ${finalTwoCharityNames[1]}`;
		} 
	}

	return `${adName} helped to raise ${currencySymbol}${amountText} for ${charityText}`;
};

const SocialMediaShareWidget = ({donationValue, charities, adName}) => {
	const shareText = shareTextFn({donationValue, charities, adName});
	const url = window.location.href;
	
	return (
		<div className="social share-page">
			<MDText source='Share this page' />
			<div className="social-links">
				<IntentLink service='facebook' text={shareText} url={url}>
					<img src='https://gl-es-05.good-loop.com/cdn/images/facebook.png' alt='share-on-facebook' />
				</IntentLink>
				<IntentLink service='twitter' text={shareText} url={url}>
					<img src='https://gl-es-04.good-loop.com/cdn/images/twitter.png' alt='share-on-twitter' />			
				</IntentLink>
				<IntentLink service='linkedin' text={shareText} url={url}>
					<img src='https://gl-es-05.good-loop.com/cdn/images/instagram.png' alt='share-on-linkedin' />			
				</IntentLink>
			</div>
		</div>
	);
};

/**
 * @param type {!String} vertiser|goodloop
 * @param branding {Branding}
 */
const SocialMediaFooterWidget = ({type, name, branding}) => {
	// TODO dont use gl-es-0x underlying server urls
	return (
		<div className={'social '.concat(type)}>
			<MDText source={name} />
			<div className="social-links">
				{branding && branding.fb_url? <a href={branding.fb_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/facebook.png' /></a> : null}
				{branding && branding.tw_url? <a href={branding.tw_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/twitter.png' /></a> : null}
				{branding && branding.insta_url? <a href={branding.insta_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/instagram.png' /></a> : null}
				{branding && branding.yt_url? <a href={branding.yt_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/youtube.png' /></a> : null}
			</div>
		</div>
	);
};

// good-loop social media links
const SocialMediaGLFooterWidget = () => {
	// goodloop branding data
	const gl_social = {
		fb_url: 'https://www.facebook.com/the.good.loop/',
		tw_url: 'https://twitter.com/goodloophq',
		insta_url: 'https://www.instagram.com/good.loop.ads/',
	};
	return <SocialMediaFooterWidget type={'goodloop'} name={'GOOD-LOOP'} branding={gl_social} />;
};

export { SocialMediaGLFooterWidget, SocialMediaFooterWidget, SocialMediaShareWidget };
