import React, { FC } from 'react';

import Roles from '../../base/Roles';
import printer from '../../base/utils/printer';
import Misc from '../../base/components/Misc';
import Counter from '../../base/components/Counter';
import GoodLoopAd from './GoodLoopAd';


const AdvertCard = ({ totalDonated, totalViews, id }) => {
	// Money raised by ad based on viewers

	return (
		<div className="ad-card">
			<GoodLoopAd vertId={id} size="landscape" nonce={`landscape${id}`} production />
			{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(id)} target='_portal'>Portal Editor</a></small> : null}
			<div className="pt-3 pb-5 mb-2 advert-impact-text" style={{margin: '0 auto'}}>
				<span>{printer.prettyNumber(totalViews)} people raised &pound;<Counter sigFigs={4} value={totalDonated} /> by watching an ad in this campaign</span>
			</div>
		</div>
	);
};

export default AdvertCard;
