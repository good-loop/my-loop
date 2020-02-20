import React from 'react';

import ACard from '../cards/ACard';
import Counter from '../../base/components/Counter';
import printer from '../../base/utils/printer';
import GoodLoopAd from './GoodLoopAd';

/**
 * @param {??what}  branding
 * @param {?Number} communityTotal 
 * @param {??What} viewData
 */
const SplashCard = ({branding, communityTotal, viewData, adId, name}) => {
	// branding, donationValue, adId, landing
	const landing = false;

	const totalDonated = communityTotal ? communityTotal.total.value : '';
	const totalViews = viewData ? viewData.all.count : '';

	// If defined as landing page advert should display on top of the page
	// Normal behaviour is to display them at the bottom, no nothing here.
	const topAdvert = (
		landing ? <div className="top-advert-player">
			<GoodLoopAd vertId={adId} size="landscape" nonce={`landscape${adId}`} production />
		</div> : ''
	);

	return (
		<>
			<ACard className="hero">
				<div className='flex-row flex-centre p-1'>
					<img className='hero-logo' src={branding.logo} alt='advertiser-logo' />
				</div>
				{ topAdvert } {/* <---This will normally be empty */}
				<div className='sub-header p-1'>
					<div><span>Together our ads for good have raised</span></div>
					{communityTotal? 
						<div className='header' style={{color: 'black'}}>&pound;<Counter sigFigs={4} value={totalDonated} minimumFractionDigits={2} /></div>
						: '...'}
				</div>
			</ACard>
			<div className="container-fluid" style={{backgroundColor: '#af2009'}}>
				<div className="intro-text">
					<span>
						At {name} we want to give back.
						We work with Good-Loop to put out Ads for Good, and donate money to charity.
						Together with <span className="font-weight-bold">{printer.prettyNumber(totalViews, 4)}</span> people
						we've raised funds for the following causes and can't wait to see our positive impact go even further.
						See our impact below.
					</span>
				</div>
			</div>
		</>
	);
};

export default SplashCard;
