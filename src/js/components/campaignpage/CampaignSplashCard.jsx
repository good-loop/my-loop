import React from 'react';
import Counter from '../../base/components/Counter';
import WhiteCircle from './WhiteCircle';
import printer from '../../base/utils/printer';
import { space } from '../../base/utils/miscutils';
import ShareButton from '../ShareButton';
import DevLink from './DevLink';
import MDText from '../../base/components/MDText';
import KStatus from '../../base/data/KStatus';

/**
 * 
 */
const CampaignSplashCard = ({ branding, shareMeta, pdf, campaignPage, donationValue, totalViewCount, charities, status}) => {

	let { ongoing } = campaignPage
	console.log("SPLASH CARD TOTAL VIEW COUNT", totalViewCount);
	let numPeople = printer.prettyNumber(Math.round(totalViewCount), 10);
	if (numPeople === "0") numPeople = false;

	let charityName = 'charity';
	if (charities && charities.length === 1 && charities[0]) charityName = charities[0].displayName || charities[0].name;

	const donationDisplay = <b>{donationValue ? <Counter currencySymbol="£" amount={donationValue} minimumFractionDigits={2} preserveSize/> : "money"}</b>;

	let splashText = <>
		<div className="header text-white">
			<div>
				<span>
					{ongoing ? "Raising " : "Raised "}
					{donationDisplay} for
					{' '}{charityName}
				</span>
			</div>
		</div>
		<p className="text-white subtext">by using ethical online ads</p>
	</>;

	// TODO Campaign property showWiderImpact && widerImpactDntn
	if (campaignPage.showWiderImpact && campaignPage.widerAnnualDntn) {
		const widerDntnText = <><b><Counter currencySymbol="£" sigFigs={4} amount={campaignPage.widerAnnualDntn} minimumFractionDigits={2} preserveSize/></b> a year</>;
		splashText = <>
			<div className="header text-white text-right">
				<div>
					<span>
						We donate &nbsp;
						{campaignPage.widerUrl ? (
							<a href={campaignPage.widerUrl}>{widerDntnText}</a>
						) : widerDntnText}
					</span>
					<br/><br/>
					<div>
						{donationDisplay} of it is raised by<br/>ad campaigns
					</div>
				</div>
			</div>
		</>;
	}

	const quote = campaignPage.widerImpactQuote;//"As part of our [CSR strategy](https://www.google.com/?q=hello) we decided to run some of our ad campaigns with Good-Loop. They provide a framewrork where 50% of the cost of our ads goes to charities chosen by the ad viewers.";

	let widerImpactQuote = campaignPage.showWiderImpact && quote && <div className="wider-impact-quote p-5">
		<div className="text-left w-75 p-5 m-auto d-inline-flex flex-row justify-content-center align-items-start">
			{/* Two sections - first column is the quotation mark, positioned to line up nicely against the text, second column is the quote itself */}
			<div md={2} style={{fontSize:"7rem", marginTop:-50, marginRight:20}} className="d-flex flex-column justify-content-start align-items-center">
				"
			</div>
			<div className="d-flex flex-column justify-content-end align-items-start">
				<b>
					<MDText source={quote}/>
				</b>
			</div>
		</div>
	</div>

	return (<>
		<div className="impact-hub-splash position-relative">
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
						{splashText}
						{campaignPage.id && <DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/'+escape(campaignPage.id)} target="_portal">Campaign Editor (using {campaignPage.id})</DevLink>}
					</div>
				</div>
			</div>
			<div className="splash-buttons">
				{pdf ? <a className="btn btn-primary mr-md-3" href={pdf} target="_blank">Download in pdf</a> : null}
				<ShareButton meta={shareMeta} className="btn-transparent fill" url={window.location.href}>Share</ShareButton>
			</div>
			<DraftBanner status={status}/>
		</div>
		{widerImpactQuote}
	</>);
};

const DraftBanner = ({status}) => {
	if (status !== KStatus.DRAFT && status !== KStatus.MODIFIED) {
		return null;
	}
	// const [hide, setHide] = useState(false);

	return (
		<div className="position-absolute draft-banner">
			<img src="/img/sticker.png"/>
			{/* <button type="button" className="btn btn-primary" onClick={() => setHide(true)}>Hide banner</button> */}
		</div>
	);
}

export default CampaignSplashCard;
