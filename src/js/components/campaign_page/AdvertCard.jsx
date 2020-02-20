import React from 'react';

import Roles from '../../base/Roles';
import printer from '../../base/utils/printer';
import Misc from '../../base/components/Misc';
import Counter from '../../base/components/Counter';
import GoodLoopAd from './GoodLoopAd';

const AdvertCard = ({ campaignData, ad, viewCountProp, donationTotal, totalViewCount }) => {
	const thisViewCount = viewCountProp || '';
	const { id } = campaignData;


	// Money raised by ad based on viewers
	const moneyRaised = donationTotal * (thisViewCount / totalViewCount);
	const totalRaised = campaignData.communityTotal ? Math.floor(campaignData.communityTotal.total.value) : '';
	const viewcount = viewCountProp.viewData ? viewCountProp.viewData.all.count : 0;

	return (
		<div className="ad-card">
			<GoodLoopAd vertId={id} size="landscape" nonce={`landscape${id}`} production />
			{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(id)} target='_portal'>Portal Editor</a></small> : null}
			<div className="pt-3 pb-5 mb-2 advert-impact-text" style={{margin: '0 auto'}}>
				<span>{printer.prettyNumber(viewcount)} people raised &pound;<Counter sigFigs={4} value={totalRaised} /> by watching an ad in this campaign</span>
			</div>
		</div>
	);
};

export default AdvertCard;
