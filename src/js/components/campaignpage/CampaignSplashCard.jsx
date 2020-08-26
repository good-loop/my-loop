import React from 'react';

import Counter from '../../base/components/Counter';
import GoodLoopAd from './GoodLoopAd';
import WhiteCircle from './WhiteCircle';
import printer from '../../base/utils/printer';

const SplashCard = ({ branding, campaignPage, donationValue, totalViewCount, adId, landing }) => {
	return (
		<div className="impact-hub-splash">
			<img src={campaignPage.bg} className="w-100 splash-img" alt="splash" />
			<div className="dark-overlay" />
			<img src="/img/redcurve.svg" className="w-100 splash-curve" alt="curve"/>
			<div className="hero splash-card px-5">
				<div className="splash-content">
					<div className="hero-circles">
						<WhiteCircle>
							<img src={branding.logo} alt="brand logo" />
						</WhiteCircle>
						<img src="/img/plus.png" className="plus" alt="+"/>
						<WhiteCircle>
							<img src="/img/good-loop-logo-primary.svg" alt="logo" />
						</WhiteCircle>
						<img src="/img/plus.png" className="plus" alt="+"/>
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
				<a className="btn btn-primary mr-md-3" href="TODO">Download in pdf</a><a className="btn btn-transparent" href="TODO"><i className="fas fa-share-alt mr-2" /> Share</a>
			</div>
		</div>
	);
};

export default SplashCard;
