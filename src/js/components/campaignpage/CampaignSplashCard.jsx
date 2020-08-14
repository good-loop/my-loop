import React from 'react';

import Counter from '../../base/components/Counter';
import GoodLoopAd from './GoodLoopAd';
import WhiteCircle from './WhiteCircle';
import printer from '../../base/utils/printer';

const SplashCard = ({ branding, campaignPage, donationValue, totalViewCount, adId, landing }) => {
	console.log(campaignPage);
	console.log(branding);
	return (
		<div className="impact-hub-splash">
			<img src={campaignPage.bg} className="w-100 splash-img" />
			<div className="dark-overlay"></div>
			<img src="/img/redcurve.svg" className="w-100 splash-curve"/>
			<div className="hero splash-card px-5">
				<div className="splash-content">
					<div className="hero-circles">
						<WhiteCircle>
							<img src={branding.logo}/>
						</WhiteCircle>
						<img src="/img/plus.png" className="plus"/>
						<WhiteCircle>
							<img src="/img/good-loop-logo-primary.svg"/>
						</WhiteCircle>
						<img src="/img/plus.png" className="plus"/>
						<WhiteCircle>
							<div className="sub-header">{printer.prettyNumber(totalViewCount)} people</div>
						</WhiteCircle>
					</div>
					{ landing ? <div className="top-advert-player">
						<GoodLoopAd vertId={adId} size="landscape" nonce={`landscape${adId}`} production />
					</div> : '' }
					<div className="flex-column flex-center pt-3 pt-md-5 splash-text">
						<div className="header text-white">
							<div>
								<span>Raised { donationValue? <Counter currencySymbol="£" sigFigs={4} value={donationValue} minimumFractionDigits={2}/> : "money" } for charities</span>
							</div>
						</div>
						<p className="text-white subtext">by using ethical online ads</p>
 					</div>
				</div>
			</div>
			<div className="splash-buttons">
				<a className="btn btn-primary mr-md-3" href="TODO">Download in pdf</a><a className="btn btn-transparent" href="TODO"><i class="fas fa-share-alt mr-2"></i> Share</a>
			</div>
		</div>
	);
};

export default SplashCard;
