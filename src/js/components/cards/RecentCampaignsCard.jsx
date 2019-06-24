import React from 'react';
import {SquareLogo} from '../Image';

const RecentCampaignsCard = () => {
	
	const vertisers = 
			[
				{
					name: "KitKat",
					adid: "xsINEuJV",
					logo: "/img/vertiser-logos/kitkat-logo-scaled.png",
					background: "https://as.good-loop.com/uploads/anon/kitkat__stats1__mini-6306904842484749395.jpg"
				},
				{
					name: "H&M",
					adid: "CeuNVbtW",
					logo: "/img/vertiser-logos/HM-logo.png",
					background: "https://as.good-loop.com/uploads/anon/kitkat__stats1__mini-6306904842484749395.jpg"
				},
				{
					name: "Linda McCartney",
					adid: "qprjFW1H",
					logo: "/img/vertiser-logos/linda-mac-logo.png",
					background: "https://as.good-loop.com/uploads/anon/kitkat__stats1__mini-6306904842484749395.jpg"
				},
				{
					name: "WWF",
					adid: "I6g1Ot1b",
					logo: "/img/vertiser-logos/wwf-logo.png",
					background: "https://as.good-loop.com/uploads/anon/kitkat__stats1__mini-6306904842484749395.jpg"
				},
				{
					name: "Doom Bar",
					adid: "ma9LU5chyU",
					logo: "/img/vertiser-logos/doom-bar-logo.png",
					background: "https://as.good-loop.com/uploads/anon/kitkat__stats1__mini-6306904842484749395.jpg"
				},
				{
					name: "British Gas",
					adid: "tEfu6NjSY5",
					logo: "/img/vertiser-logos/bg-logo-mobile.svg",
					background: "https://as.good-loop.com/uploads/anon/kitkat__stats1__mini-6306904842484749395.jpg"
				}
			];
	return (
		<div className="flex-row flex-wrap">
			{	vertisers.map(({adid, background, name, logo}) => 
				<a key={adid} href={"/#campaign/?gl.vert="+adid}>
					<SquareLogo alt={name} url={background}>
						<img src={logo} alt='vertiser-logo' />
					</SquareLogo>
				</a>)	
			}
		</div>		
	);
};

export default RecentCampaignsCard;
