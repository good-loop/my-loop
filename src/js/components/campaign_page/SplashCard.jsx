import React from 'react';

import ACard from '../cards/ACard';
import Counter from '../../base/components/Counter';
import printer from '../../base/utils/printer';
import GoodLoopAd from './GoodLoopAd';

const SplashCard = ({ data }) => {
	// branding, donationValue, adId, landing
	const { branding, communityTotal = null, viewData = null, adId, name } = data;
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

	// If money is available display it in a counter
	const moneyCounter = (
		communityTotal ? <div className='header' style={{color: 'black'}}>
			&pound;<Counter sigFigs={4} value={totalDonated} minimumFractionDigits={2} />
		</div> : 'money'
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
					{ moneyCounter }
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
