import React from 'react';
import Counter from '../../base/components/Counter';
import WhiteCircle from './WhiteCircle';
import printer from '../../base/utils/printer';
import { space, scrollTo } from '../../base/utils/miscutils';
import ShareButton from '../ShareButton';
import DevLink from './DevLink';
import MDText from '../../base/components/MDText';
import KStatus from '../../base/data/KStatus';
import LinkOut from '../../base/components/LinkOut';
import ServerIO from '../../plumbing/ServerIO';
import Campaign from '../../base/data/Campaign';
import DynImg from '../../base/components/DynImg';
import C from '../../C';

/**
 * @param {Object} p
 * @param ?? campaignPage
 * 
 */
const CampaignSplashCard = ({ branding, shareMeta, pdf, campaignPage, donationValue, totalViewCount, charities, status }) => {

	let ongoing = Campaign.isOngoing(campaignPage);
	console.log("SPLASH CARD TOTAL VIEW COUNT", totalViewCount);
	let numPeople = printer.prettyNumber(Math.round(totalViewCount), 10);
	if (numPeople === "0") numPeople = false;

	let charityName = 'charity';
	if (charities && charities.length === 1 && charities[0]) charityName = charities[0].displayName || charities[0].name;

	const donationDisplay = <b>{donationValue ? <Counter amount={donationValue} minimumFractionDigits={2} preserveSize /> : "money"}</b>;

	let splashText = <>
		<div className="header text-white">
			<span>
				{ongoing ? "Raising " : "Raised "}
				{donationDisplay} for
				{' '}{charityName}
			</span>
		</div>
		<p className="text-white subtext">by using ethical online ads</p>
	</>;
	// Change the splashText to show wider impact?
	if (campaignPage.showWiderImpact && campaignPage.widerAnnualDntn) {
		splashText = <div className="header text-white text-right">
			<div>
				We donate <LinkOut href={campaignPage.widerUrl}>
					<b><Counter sigFigs={4} amount={campaignPage.widerAnnualDntn} minimumFractionDigits={2} preserveSize /></b> a year
				</LinkOut>
				<br /><br />
				<div>
					{donationDisplay} of it is raised by<br />ethical online ads
				</div>
			</div>
		</div>;
	}

	return (<>
		<div className="impact-hub-splash position-relative">
			<DynImg src={campaignPage.bg ? campaignPage.bg : "/img/lightcurve.svg"} className={space("w-100", campaignPage.bg ? "splash-img" : "splash-curve")} alt="splash" />
			<div className="dark-overlay" />
			<img src="/img/redcurve.svg" className="w-100 splash-curve" alt="curve" />
			<div className="hero splash-card px-5">
				<div className="splash-content">
					<div className="hero-circles">
						<WhiteCircle>
							{branding.logo ? <img src={branding.logo} alt="brand logo" /> : JSON.stringify(branding)}
						</WhiteCircle>
						<img src="/img/plus.png" className="plus" alt="+" />
						<WhiteCircle>
							<div className="sub-header">{numPeople ? <><span className="num">{numPeople}</span> people</> : "The Community"}</div>
						</WhiteCircle>
					</div>
					<div className="flex-column flex-center pt-5 splash-text">
						{splashText}
						{campaignPage.id && <DevLink href={ServerIO.PORTAL_ENDPOINT + '/#campaign/' + escape(campaignPage.id)} target="_portal">Campaign Editor (using {campaignPage.id})</DevLink>}
					</div>
				</div>
			</div>
			<div className="splash-buttons">
				{pdf && <C.A className="btn btn-primary mr-md-3" href={pdf} target="_blank">Download in pdf</C.A>}
				<ShareButton meta={shareMeta} className="btn-transparent fill" url={window.location.href}>Share</ShareButton>
			</div>
			<DraftBanner status={status} />
			<div className="splash-cta d-flex flex-column">
				<button className="btn btn-secondary text-uppercase" onClick={e => scrollTo("our-impact")}>
					See what we've achieved
				</button>
				{/* <a className='text-uppercase mt-3 join' href="/tabsforgood">Join the good-loop movement</a> */}
			</div>
		</div>
		<WiderImpactQuote campaign={campaignPage} />
	</>);
};

const WiderImpactQuote = ({ campaign }) => {
	// e.g. "As part of our [CSR strategy](https://www.google.com/?q=hello) we decided to run some of our ad campaigns with Good-Loop. They provide a framewrork where 50% of the cost of our ads goes to charities chosen by the ad viewers.";
	if (!campaign.showWiderImpact || !campaign.widerImpactQuote) {
		return null;
	}

	return (<div className="wider-impact-quote p-5">
		<div className="text-left w-75 p-5 m-auto d-inline-flex flex-row justify-content-center align-items-start">
			{/* Two sections - first column is the quotation mark, positioned to line up nicely against the text, second column is the quote itself */}
			<div md={2} style={{ fontSize: "7rem", marginTop: -50, marginRight: 20 }} className="d-flex flex-column justify-content-start align-items-center">
				"
			</div>
			<div className="d-flex flex-column justify-content-end align-items-start">
				<b>
					<MDText source={campaign.widerImpactQuote} />
				</b>
			</div>
		</div>
	</div>);
};

const DraftBanner = ({ status }) => {
	if (status !== KStatus.DRAFT && status !== KStatus.MODIFIED) {
		return null;
	}
	// const [hide, setHide] = useState(false);

	return (
		<div className="position-absolute draft-banner">
			<img src="/img/sticker.png" />
			{/* <button type="button" className="btn btn-primary" onClick={() => setHide(true)}>Hide banner</button> */}
		</div>
	);
};

export default CampaignSplashCard;
