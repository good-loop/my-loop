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

const SocialMediaShareWidget = ({donationValue, charities, adName, url=window.location.href}) => {
	const shareText = shareTextFn({donationValue, charities, adName});
	
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
const SocialMediaFooterWidget = ({type, name, fb_url, tw_url, insta_url, yt_url}) => {
	// TODO dont use gl-es-0x underlying server urls
	return (
		<div className={'social '.concat(type)}>
			<MDText source={name} />
			<div className="social-links">
				{fb_url && <a href={fb_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/facebook.png' /></a>}
				{tw_url && <a href={tw_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/twitter.png' /></a>}
				{insta_url && <a href={insta_url} target='_blank'><img src='https://gl-es-05.good-loop.com/cdn/images/instagram.png' /></a>}
				{yt_url && <a href={yt_url} target='_blank'><img src='https://gl-es-04.good-loop.com/cdn/images/youtube.png' /></a>}
			</div>
		</div>
	);
};

export { SocialMediaFooterWidget, SocialMediaShareWidget };
