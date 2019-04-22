import React from 'react';
import {RoundLogo} from './Image';

const RecentCampaignsCard = () => {
	
	const vertisers = 
			[
				{
					"name": "KitKat",
					"adid": "xsINEuJV",
					"logo": "https://as.good-loop.com/uploads/anon/kithead1-8689246171902103163.png"
				},
				{
					"name": "H&M",
					"adid": "CeuNVbtW",
					"logo": "/img/HM-logo.png"
				},
				{
					"name": "Linda McCartney",
					"adid": "qprjFW1H",
					"logo": "https://cookschool.club/wp-content/uploads/2018/09/imageedit_1_9636644754-300x200.png"
				},
				{
					"name": "WWF",
					"adid": "I6g1Ot1b",
					"logo": "/img/wwf-logo.png"
				},
				{
					"name": "Doom Bar",
					"adid": "ma9LU5chyU",
					"logo": "/img/doom-bar-logo.png"
				},
			];
	return (
		<div className="vertiser-row">
			{	vertisers.map(x => 
				<a key={x.adid} href={"/#campaign/?gl.vert="+x.adid}>
					<RoundLogo alt={x.name} url={x.logo} />
				</a>)	
			}
		</div>		
	);
};

export default RecentCampaignsCard;
