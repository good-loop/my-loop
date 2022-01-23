import React from 'react';


const GreenLanding = ({ }) => {
	// like CampaignPage, this would prefer to run by a campaign id
	
	return <div id="green-landing">
		<div className="green-landing-splash">
			BRAND LOGO HERE<br />
			<div className="splash-tonnes">XXXX TONNES</div>
			carbon offset
			<div className="splash-trees">XXXX</div>
			trees planted<br />
			with
			<div className="splash-carbon-neutral">
				CARBON NEUTRAL ADS<br />
				BY GOOD-LOOP
			</div>
			<a className="splash-explore">EXPLORE OUR IMPACT</a>
		</div>
	</div>;
};

export default GreenLanding;
