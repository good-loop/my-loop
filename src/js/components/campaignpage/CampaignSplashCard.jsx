import React from 'react';

import ACard from '../cards/ACard';
import Counter from '../../base/components/Counter';
import GoodLoopAd from './GoodLoopAd';
import WhiteCircle from './WhiteCircle';

const SplashCard = ({ branding, campaignPage, donationValue, adId, landing }) => {
	console.log(campaignPage);
	console.log(branding);
	return (
		<div className="impact-hub-splash">
			<img src={campaignPage.bg} className="w-100 splash-img" />
			<img src="/img/redcurve.svg" className="w-100 splash-curve"/>
			<div className="hero splash-card px-5">
				<div className="splash-content">
					<div className="hero-circles">
						<WhiteCircle width="25%">
							<img src={branding.logo}/>
						</WhiteCircle>
						<img src="/img/plus.png" className="plus"/>
						<WhiteCircle width="25%">
							<img src="/img/good-loop-logo-primary.svg"/>
						</WhiteCircle>
						<img src="/img/plus.png" className="plus"/>
						<WhiteCircle width="25%">
							<div className="sub-header">362,401 people</div>
						</WhiteCircle>
					</div>
					{//<img className="hero-logo pb-3 w-100" src="/img/SplashScreenIcons.png" alt="advertiser-logo" />
					}
					{ landing ? <div className="top-advert-player">
						<GoodLoopAd vertId={adId} size="landscape" nonce={`landscape${adId}`} production />
					</div> : '' }
					<div className="flex-column flex-center pt-5">
						<div className="header text-white">
							<div>
								<span>Raised { donationValue? <Counter currencySymbol="£" sigFigs={4} value={donationValue} minimumFractionDigits={2}/> : "money" } for charities</span>
							</div>
						</div>
						<p className="text-white subtext">by using ethical online ads</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplashCard;
