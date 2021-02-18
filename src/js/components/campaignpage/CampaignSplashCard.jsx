import React from 'react';
import Counter from '../../base/components/Counter';
import WhiteCircle from './WhiteCircle';
import printer from '../../base/utils/printer';
import { space } from '../../base/utils/miscutils';
import ShareButton from '../ShareButton';
import DevLink from './DevLink';

/**
 * 
 * @param {?boolean} p.ongoing Is the campaign still running (and the total might go up)?
 */
const CampaignSplashCard = ({ branding, shareMeta, pdf, campaignPage, donationValue, totalViewCount, ongoing}) => {

	let numPeople = printer.prettyNumber(Math.round(totalViewCount), 10);
	if (numPeople === "0") numPeople = false;
	return (
		<div className="impact-hub-splash">
			<img src={campaignPage.bg ? campaignPage.bg : "/img/lightcurve.svg"} className={space("w-100", campaignPage.bg ? "splash-img" : "splash-curve")} alt="splash" />
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
							<div className="sub-header">{numPeople ? <><span className="num">{numPeople}</span> people</> : "Loading..."}</div>
						</WhiteCircle>
					</div>
					<div className="flex-column flex-center pt-5 splash-text">
						<div className="header text-white">
							<div>
								<span>Raised {donationValue? <Counter currencySymbol="£" sigFigs={4} preservePennies amount={donationValue} minimumFractionDigits={2} preserveSize/> : "money" } for 
									charity {ongoing && "so far"}</span>
							</div>
						</div>
						<p className="text-white subtext">by using ethical online ads</p>
						<DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/'+escape(campaignPage.id)} target="_portal">Campaign Editor (using {campaignPage.id})</DevLink>
					</div>
				</div>
			</div>
			<div className="splash-buttons">
				{pdf ? <a className="btn btn-primary mr-md-3" href={pdf} target="_blank">Download in pdf</a> : null}
				<ShareButton meta={shareMeta} className="btn-transparent fill" url={window.location.href}>Share</ShareButton>
			</div>
		</div>
	);
};

export default CampaignSplashCard;
