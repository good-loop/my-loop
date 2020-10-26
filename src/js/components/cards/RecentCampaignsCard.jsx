import React from 'react';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import { Col, Row } from 'reactstrap';
import GoodLoopAd from '../campaignpage/GoodLoopAd';

const RecentCampaignsCard = () => {
	// TODO fetch data from portal
	const campaigns = 
			[
				{
					name: "KitKat",
					adid: "xsINEuJV"
				},
				{
					name: "H&M",
					adid: "CeuNVbtW"
				},
				{
					name: "Linda McCartney",
					adid: "qprjFW1H"
				},
				{
					name: "WWF",
					adid: "I6g1Ot1b"
				},
				{
					name: "Doom Bar",
					adid: "ma9LU5chyU"
				},
				{
					name: "British Gas",
					adid: "tEfu6NjSY5"
				}
			];
	return (
		<div id="campaign-cards">
			{campaigns.map(({adid, name}, i) => (<Row className="campaign" key={i}>
				<TVAdPlayer adid={adid} className="col-6"/>
				<Col md={6}>
					{name} raised X
				</Col>
			</Row>))}
		</div>
	);
};

const TVAdPlayer = ({adid, className}) => {
	const size = "landscape";
	return <div className={space("position-relative", className)}>
		<img src="/img/LandingBackground/TV_frame.png" className="w-100 invisible"/>
		<img src="/img/LandingBackground/TV_frame.png" className="w-100 position-absolute" style={{right:"0", top:"0", zIndex:2}}/>
		<div className="position-absolute tv-ad-player">
			<GoodLoopAd vertId={adid} size={size} nonce={`${size}${adid}`} production />
		</div>
	</div>;
};

export default RecentCampaignsCard;
