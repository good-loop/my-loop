/**
 * Legal compliance and small print
 * 
 */

 /*
 Better Business Bureau (BBB) - Standard 19 
 (via Engage for Good)

Disclose: (DW paraphrasing)

1. The portion $ or % that goes to charity.

2. The duration

3. Any max oe min guaranteed donation amount

"50% of profits" is given as a *bad* example 
because profits is unclear.

https://engageforgood.com/
https://www.bbb.org/stlouis/charities-donors/standards-for-charity-accountability/
*/

import React, { Fragment, useState } from 'react';
import { Card } from 'reactstrap';
import Misc from '../../base/components/Misc';
import PageCard from '../../base/components/PageCard';
import Advert from '../../base/data/Advert';
import ImageObject from '../../base/data/ImageObject';

const CampaignDetailsCard = ({ads}) => {
	// TODO campaign grouping -- but the important legal case is a one advert link through
	return (<PageCard className='small' background={
			new ImageObject({src:"https://images.unsplash.com/photo-1542222024-c39e2281f121", author:"shot by Cerqueira", url:"https://unsplash.com/@shotbycerqueira?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText"})}>
		<h2>Campaign Donation Details</h2>		
		<p>
			50% of the advertising cost for each advert is donated. 		
			Most of the rest goes to pay the publisher and related companies. 
			Good-Loop and the advertising exchange make a small commission.
			The donations depend on viewers watching the adverts.
		</p>
		
		{ads.map(ad => <CampaignDetails ad={ad}/>)}

		<p>
			We support the Better Business Bureau's standard for charity donations within marketing. 
			This information is provided as part of meeting that standard.
			If you have and questions, please do <a href="https://good-loop.com/contact">contact us</a>.
		</p>
	</PageCard>);
};

const CampaignDetails = ({ad}) => {
	// TODO Max amount: <Misc.Money amount={Advert.} />
	return (<Card body>
		<i>Campaign: {ad.campaign}</i>
		{Advert.budget(ad) && Advert.budget(ad).total && <div>Maximum donation: {<Misc.Money amount={Advert.budget(ad).total} />} </div>}
		{Advert.start(ad) && <div>Start: <Misc.DateTag date={Advert.start(ad)} /></div>}
		{Advert.end(ad) && <div>End: <Misc.DateTag date={Advert.end(ad)} /></div>}
	</Card>);
};

export default CampaignDetailsCard;
