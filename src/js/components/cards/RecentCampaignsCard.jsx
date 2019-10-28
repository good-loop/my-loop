import React from 'react';
import {SquareLogo} from '../Image';

const RecentCampaignsCard = () => {
	// TODO fetch data from portal
	const vertisers = 
			[
				{
					name: "KitKat",
					adid: "xsINEuJV",
					logo: "/img/vertiser-logos/kitkat-logo-scaled.png",
					background: "/img/kitkatpic.jpg",
					charityName: 'Cocoa Initiative'
				},
				{
					name: "H&M",
					adid: "CeuNVbtW",
					logo: "/img/vertiser-logos/HM-logo.png",
					background: "/img/hmpic.jpg",
					charityName: 'Water Aid'
				},
				{
					name: "Linda McCartney",
					adid: "qprjFW1H",
					logo: "/img/vertiser-logos/linda-mac-logo.png",
					background: "/img/lindamccartneypic.jpg",
					charityName: 'Food Banks'
				},
				{
					name: "WWF",
					adid: "I6g1Ot1b",
					logo: "/img/vertiser-logos/wwf-logo.png",
					background: "/img/wwfpic.jpg",
					charityName: 'WWF'
				},
				{
					name: "Doom Bar",
					adid: "ma9LU5chyU",
					logo: "/img/vertiser-logos/doom-bar-logo.png",
					background: "/img/doombarpic.jpg",
					charityName: 'Beach Cleans'
				},
				{
					name: "British Gas",
					adid: "tEfu6NjSY5",
					logo: "/img/vertiser-logos/bg-logo-mobile.svg",
					background: "/img/britishgaspic.jpg",
					charityName: 'Carers UK'
				}
			];
	return (
		<div className="flex-row flex-wrap" id="campaign-cards">
			{vertisers.map(({adid, background, charityName, name, logo}) => (
				<SquareLogo className="contrast-text campaign-card" alt={name} url={background} key={adid}>
					<img className="vertiser-logo" src={logo} alt="vertiser-logo" />
					<div className="campaign-name sub-header white">{charityName}</div>
					<a className="logo-link" href={'/#campaign/?gl.vert=' + escape(adid)}>&nbsp;</a>
				</SquareLogo>
			))}
		</div>
	);
};

export default RecentCampaignsCard;
