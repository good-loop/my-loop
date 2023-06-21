
import React, { useState } from 'react';
import { Col, Modal, ModalBody, Row } from 'reactstrap';
import C from '../../../C';
import Misc from '../../../MiscOverrides';
import { isDev } from '../../../base/Roles';
import DevOnly from '../../../base/components/DevOnly';
import LinkOut, { Cite } from '../../../base/components/LinkOut';
import Logo from '../../../base/components/Logo';
import PortalLink from '../../../base/components/PortalLink';
import PropControl from '../../../base/components/PropControl';
import SavePublishDeleteEtc from '../../../base/components/SavePublishDeleteEtc';
import TODO from '../../../base/components/TODO';
import Advertiser from '../../../base/data/Advertiser';
import Campaign from '../../../base/data/Campaign';
import { getId } from '../../../base/data/DataClass';
import Impact from '../../../base/data/Impact';
import KStatus from '../../../base/data/KStatus';
import Money from '../../../base/data/Money';
import NGO from '../../../base/data/NGO';
import { getDataItem } from '../../../base/plumbing/Crud';
import { getUrlValue, setUrlValue } from '../../../base/plumbing/DataStore';
import { asDate, dateStr, printPeriod } from '../../../base/utils/date-utils';
import { addAmountSuffixToNumber, space, yessy } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
/*
 * A thin card that contains just the supplied text,
 * @param {string} text  
 * @returns {React.ReactElement} 
 */
export const CardSeperator = ({ text }) => {
	return (
		<div className={"cardSeperator"}>
			<p className='text'>{text}</p>
		</div>
	)
}

/**
 * For the 'most impactful' impact, we show a statistic & either a fact or another image
 * If the statistic is missing or we don't have enough images on the charity, return an empty element
 * @param {number} p.i 1 or 2
 * @param {string} logo url for the logo of the charity 
 * @param {NGO} charity what charity will this impactDebit donate to?
 * @param {impactDebit} impactDebit the 'most impactful' impact the campaign has done
 * @returns {React.ReactElement} 
 */
export const CampaignImpact = ({i, logo, charity, impactDebit }) => {
	// copy to allow local edits
	const text = Object.assign({}, impactDebit.storiesContent);

	let hideComponent = false;
	if ( ! charity) {
		return null;
	}
	if ( ! text.cause) {

	}
	
	// can't show this without stats or without a charity attatched
	if (!text.cause || !text.stats || !charity) hideComponent = true;

	// we can't show the card if we don't have the images to populate it
	// if we don't have a fact we replace it with another image so that increases the amount required
	let factPresent = (text.fact && text.factName && text.factUrl);
	const imgList = NGO.images(charity);
	if ((factPresent && imgList.length < 2) || (!factPresent && imgList.length < 3)) hideComponent = true;
	if (hideComponent && !isDev()) return <></>

	// if there's missing data but user is a dev, show component and point out missing parts
	if (hideComponent) {
		factPresent = true;
		Object.keys(text).forEach((key) => {
			if (!text[key]) text[key] = `<MISSING ${key} DATA >`
		})
		if (!charity) charity = { name: "CHARITY NOT FOUND", id: "MISSING ID" }
	}

	// if in dev mode, let users edit page content
	const [open, setOpen] = useState(false);
	const path = ['draft', 'ImpactDebit', impactDebit.id];
	const storiesPath = ['draft', 'ImpactDebit', impactDebit.id, "storiesContent"];
	let devModal = (
		<Modal isOpen={open} id="impact-cert-modal" className='impact-cert' toggle={() => setOpen(!open)} size="xl">
			<ModalBody className="d-flex modal-body">
				<Col>
					<h2>Props for Impact Stories</h2>
					<h4>Impact #{i}: <PortalLink item={impactDebit} /></h4>
					<br />
					<h4>Charity:<br />	Name: {charity.name || "MISSING"}<br />	ID: {charity.id || "MISSING"}, </h4>
					<PropControl type="number" prop="priority" path={path} label="Priority" className="font-weight-bold" />
					<PropControl type="number" prop="amountGBP" path={path} label="Amount In GBP" readOnly />
					<div className="mb-3 p-3 bg-light card">
						<h3>Impact Cause</h3>
						<PropControl type="textarea" label="Impact Cause" prop="impactCause" path={storiesPath} help="In format 'Supporting {Impact cause}' For example, 'Supporting Food Redistribution'" />
						<PropControl type="textarea" label="Impact Stat" prop="impactStats" path={storiesPath} help="What good did the brand do to support the above cause? For example, 'Providing meals for children in need'" />
					</div>
					<div className="mb-3 p-3 bg-light card">
						{i==1? <><h3>Bitesize fact</h3>
						<p>Replaced by image if empty</p>
						<PropControl type="textarea" label="Did-You-Know Fact" prop="fact" path={storiesPath} />
						<PropControl type="textarea" label="Sources Name" prop="factSourceName" path={storiesPath} />
						<PropControl type="textarea" label="Source URL" prop="factSourceUrl" path={storiesPath} />
						</> : <>
						<h3>Testimonial</h3>
						<p>Defaults to description of charity if testimonial itself is left empty</p>
						<PropControl type="textarea" label="Testimonial Title" prop="testimonialHeader" path={storiesPath} help="Header of testimonial card" />
						<PropControl type="textarea" label="Testimonial" prop="testimonialQuote" path={storiesPath} />
						<PropControl type="textarea" label="Testimonial Source Role" prop="testimonialJob" path={storiesPath} help="Role of whoever said the testimonial" />
						<PropControl type="textarea" label="Testimonial Source" prop="testimonialPerson" path={storiesPath} help="Name of whoever said the testimonial" />
						</>}
					</div>
				</Col>
				<SavePublishDeleteEtc type={C.TYPES.ImpactDebit} id={impactDebit.id} sendDiff />
			</ModalBody>
		</Modal>
	); // ./devModal

	return (
		<div id={"campaign-impact-"+i} className='campaign-impact'>
			<div style={{ width: "100%", height: "fit-content", padding: "2% 0 0" }}>{circleLogo({ logo: charity.logo })}</div>
			<DevOnly>
				<button style={{ height: "5vh" }} onClick={() => setOpen(true)}>Edit Content</button>
				{devModal}
			</DevOnly>
			<div className='impact-section'>
				{/* top row */}
				{imgList[0] && <Row className='impact-row flex-mobile-dir' id="impact-one-toprow" >

					<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
						<img src={imgList[0]} alt="charity image 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
					</div>

					<div className='p-2 bg-gl-red right camp-impact-card'>
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve dark-curve" />
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve normal-curve" />
						<div className='cause-container'>
							{text.cause && text.stats? <>
								<p className='cause'>{text.cause}</p>
								<h2 className='description'>{text.stats}</h2>
								<p className='with-charity'>With {charity.name}</p>
							</> : <>
								<p className='cause'>{NGO.summaryDescription(charity)}</p>
							</>}
						</div>
					</div>

				</Row>}

				{/* bottom row, if we have stuff */
				(imgList[1] && ((text.fact) || (text.cause && text.stats && NGO.summaryDescription(charity)))) // || imgList[2]
				 && <Row id="impact-one-botrow" className='impact-row flex-mobile-dir'>
					{text.fact &&
						<div className='p-2 bg-gl-darker-grey left camp-impact-card'>
							<img src="/img/Impact/did-you-know.svg" className='quote-box' />
							<div className='dyk-container'>
								<p className='dyk'>Did You Know?</p>
								<p className='fact'>{text.fact}</p>
								{text.factUrl && <p className='source'>Source: <LinkOut href={text.factUrl}>{text.factName}</LinkOut></p>}
							</div>
						</div>
					}
					{ ! text.fact && (text.cause && text.stats) && NGO.summaryDescription(charity) &&
						<div className='p-2 bg-gl-darker-grey left camp-impact-card'>
							<div className='dyk-container'>
								<p className='fact'>{NGO.summaryDescription(charity)}</p>
							</div>
						</div>
					}
					{/* TODO 2 images row option { ! text.fact && 
						<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
							<img src={imgList[Math.min(2, imgList.length - 1)]} alt="charity image 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
						</div>
					} */}
					<div className='p-2 bg-gl-white right camp-impact-card camp-impact-img'>
						<img src={imgList[imgList.length - 1]} alt="charity image 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
					</div>

				</Row>}
			</div>

		</div>
	)
}




/**
 * TODO refactor to use CampaignImpact
 * 
 * For the second 'second most impactful' impact, we show a statistic & a testimonial
 * If we don't have a testimonial, default to the charities description
 * If the statistic or both the testimonial & description are missing, return an empty element
 * @param {string} logo url for the logo of the charity 
 * @param {NGO} charity what charity will this impactDebit donate to?
 * @param {impactDebit} impactDebit the 'second most impactful' impact the campaign has done
 * @returns {React.ReactElement} 
 */
export const CampaignImpactTwo = ({ logo, impactDebit, charity }) => {
	// this card needs to make use of a second impact, if it doesn't exist we can't use it!

	const text = {
		cause: impactDebit.storiesContent?.impactCause || false,
		stats: impactDebit.storiesContent?.impactStats || false,

		testimonialQuote: impactDebit.storiesContent?.testimonialQuote || "",
		testimonialHeader: impactDebit.storiesContent?.testimonialHeader || "",
		testimonialJob: impactDebit.storiesContent?.testimonialJob || "",
		testimonialPerson: impactDebit.storiesContent?.testimonialPerson || ""
	}

	console.log("huh?", impactDebit.storiesContent, text)
	let hideComponent = false;


	// can't show this without a stat
	if (!text.cause || !text.stats) hideComponent = true;

	// if we're missing the quote, try to use the charities description instead
	// if that's missing, we can't show the card
	if (!text.testimonialQuote) text.testimonialQuote = charity.description;
	if (!text.testimonialQuote) hideComponent = true;

	// if we can't show the images, we can't show the card
	const imgList = NGO.images(charity);
	if (imgList.length < 2) hideComponent = true;

	if (hideComponent && !isDev()) return <></>
	if (hideComponent) {
		Object.keys(text).forEach((key) => {
			if (!text[key]) text[key] = "<MISSING DATA>"
		})
	}
	// if in dev mode, let users edit page content
	const [open, setOpen] = useState(false);
	const path = ['draft', 'ImpactDebit', impactDebit.id];
	const storiesPath = ['draft', 'ImpactDebit', impactDebit.id, "storiesContent"];
	// TODO refactor to share code with the Campaign One editor
	let devModal = (
		<Modal isOpen={open} id="impact-cert-modal" className='impact-cert' toggle={() => setOpen(!open)} size="xl">
			<ModalBody className="d-flex modal-body">
				<Col>
					<h2>Props for Impact Stories</h2>
					<h4>Impact #2:<br />	Name: {impactDebit.name || "MISSING"}<br />	ID: {impactDebit.id || "MISSING"}</h4>
					<br />
					<h4>Charity:<br />	Name: {charity.name || "MISSING"}<br />	ID: {charity.id || "MISSING"}, </h4>
					<PropControl type="number" prop="priority" path={path} label="Priority" className="font-weight-bold" />
					<PropControl type="number" prop="amountGBP" path={path} label="Amount In GBP" readOnly />
					<div className="mb-3 p-3 bg-light card">
						<h3>Impact Cause</h3>
						<PropControl type="textarea" label="Impact Cause" prop="impactCause" path={storiesPath} help="In format 'Supporting {Impact cause}' For example, 'Supporting Food Redistribution'" />
						<PropControl type="textarea" label="Impact Stat" prop="impactStats" path={storiesPath} help="What good did the brand do to support the above cause? For example, 'Providing meals for children in need'" />
					</div>
					<div className='mb-3 p-3 bg-light card'>
						<h3>Testimonial</h3>
						<p>Defaults to description of charity if testimonial itself is left empty</p>
						<PropControl type="textarea" label="Testimonial Title" prop="testimonialHeader" path={storiesPath} help="Header of testimonial card" />
						<PropControl type="textarea" label="Testimonial" prop="testimonialQuote" path={storiesPath} />
						<PropControl type="textarea" label="Testimonial Source Role" prop="testimonialJob" path={storiesPath} help="Role of whoever said the testimonial" />
						<PropControl type="textarea" label="Testimonial Source" prop="testimonialPerson" path={storiesPath} help="Name of whoever said the testimonial" />
					</div>
				</Col>
				<SavePublishDeleteEtc type={C.TYPES.ImpactDebit} id={impactDebit.id} sendDiff />
			</ModalBody>
		</Modal>
	)

	return (
		<div id="campaign-impact-2" className='campaign-impact'>
			<div style={{ width: "100%", height: "fit-content", padding: "2% 0 0" }}>{circleLogo({ logo: charity.logo })}</div>
			<DevOnly>
				<button style={{ height: "5vh" }} onClick={() => setOpen(true)}>Edit Content</button>
				{devModal}
			</DevOnly>
			<div className='impact-section'>
				<Row className='impact-row flex-mobile-dir'>
					<div className='p-2 bg-gl-red right camp-impact-card' style={{ position: "relative" }}>
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve dark-curve" />
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve normal-curve" />
						<div className='cause-container'>
							<p className='cause'>{text.cause}</p>
							<h2 className='description'>{text.stats}</h2>
							<p className='with-charity'>With {charity.name || charity.id}</p>
						</div>
					</div>
					<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
						<img src={imgList[0]} alt="charity image 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
					</div>
				</Row>
				<Row className='impact-row flex-mobile-dir' id="row-2">
					<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
						<img src={imgList[Math.min(1, imgList.length - 1)]} alt="charity image 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
					</div>
					<div className='p-2 bg-gl-light-pink right camp-impact-card camp-impact-img'>
						<img src='/img/Impact/heart.png' className='heart-bg' />
						<h2 className='color-gl-light-red mb-4'>{text.testimonialHeader}</h2>
						<p className='project-desc text'>{text.testimonialQuote}</p>
						<div className='testimonial-source'>
							<p>{text.testimonialPerson}</p>
							<p>{text.testimonialJob}</p>
						</div>
					</div>
				</Row>
			</div>

		</div>
	)
}


/**
 * Card describing to new users how watching ads leads to donations
 * @param {Campaign} campaign 
 * @param {Array<NGO>} charities
 * @param {string} totalString how much have we donated in total
 */
export const HowItWorks = ({ campaign, subCampaigns, charities, totalString }) => {

	//find earlist campaign
	if (!campaign) campaign = subCampaigns.sort((a, b) => b.created - a.created)[0]
	const startDate = campaign.created.substr(0, campaign.created.indexOf("T")).split("-"); // in format 2022-12-16T04:52:53, we don't care about anything after T
	const year = startDate[0].substr(2, 4); // get the decades only, will need patched in ~ 80 years
	const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][startDate[1] - 1]
	// get viewcount and format it into 2 sig figs & unit amount, eg 1,413,512 -> 1.4M

	if ( ! yessy(subCampaigns)) subCampaigns = [campaign]

	const views = subCampaigns.reduce((sum, curCampaign) => {
		let count = Campaign.viewcount({ campaign: curCampaign, status: KStatus.PUBLISHED })
		if (typeof count !== 'number') count = 0
		return sum + Number(count)
	}, 0);
	const viewcount = addAmountSuffixToNumber(views.toPrecision(3));

	return (
		<div id="how-it-works" className='d-flex flex-column'>
			<div>
				<h2 className='color-gl-white'>How It Works</h2>
				<p className='text white'>With Good-Loop</p>
			</div>
			<div className="hiw-curve flex-mobile-dir">

				<div className='hiw-col'>
					<h2 className='color-gl-white'>1.</h2>
					<div className='white-circle'>
						<img src="/img/Impact/this-ad-plants-trees.png" className='fill-img' />
					</div>
					<p>{month}' {year} - Campaign{subCampaigns ? "s" : ""} Launch{subCampaigns ? "" : "es"}</p>
					<h3 className='color-gl-white'>Every View Is<br />A Donation</h3> {/* TODO: figure out something closer to £N / VIEW to use here*/}
				</div>

				<div className='hiw-col'>
					<h2 className='color-gl-white'>2.</h2>
					<div className='white-circle'>
						<img src="/img/Impact/OurStory_PeopleCrossingRoad.jpg" className='fill-img' />
					</div>
					<p>Today</p>
					<h3 className='color-gl-white'>{viewcount} People</h3>
					<p className='text white'>Viewed The Advert{subCampaigns ? "s" : ""} {viewcount<1000 && "So Far"}</p>
				</div>

				<div className='hiw-col'>
					<h2 className='color-gl-white'>3.</h2>
					<div className='white-circle'>
						<img src={NGO.images(charities[0])[0]} className='fill-img' />
					</div>
					<p>After the Campagin</p>
					<h3 className='color-gl-white'>{totalString} In Donations</h3>
					<p className='text white'>Funded By The Advert{subCampaigns ? "s" : ""}</p>
				</div>
			</div>
		</div>
	)
}

function findCharity(cid, charities) {
	let charity = charities.find(c => getId(c) === cid); // NB: this MUST use getId() to handle SoGive ids
	if (charity) return charity;
	if (cid === "Gold Standard") { // HACK where are the duff IDs coming from??
		console.warn("bad ID " + cid);
		charity = charities.find(c => getId(c) === "gold-standard");
	}
	return charity;
}

/**
 * For each impact debit, show its impact
 * TODO make each donation element into a modal that shows all the actual proof of the donation
 * @param {Campaign} campaign
 * @param {Advertiser} brand 
 * @param {Array<impactDebit>} impactDebits 
 * @param {Array<NGO>} charities
 * @returns {React.ReactElement} 
 */
export const DonationsCard = ({ campaign, subCampaigns, brand, impactDebits, charities }) => {
	console.log("DonationsCard", "campaign", campaign, "subCampaigns", subCampaigns);
	// ?? do we have something in date-utils for this??
	const getDate = (dateStr) => {
		let tempDate = dateStr.substr(0, dateStr.split("").findIndex((el) => el === "T")).split("-") // parse date 
		tempDate[1] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(tempDate[1]) - 1]
		return tempDate.reverse().join(" ") // [YYYY,MM,DD] -> "DD MM YYYY"
	}

	// // find earliest date if we expect a list
	// if (!campaign) campaign = subCampaigns.sort((a, b) => {
	// 	return b - a
	// })[0];

	let allCampaigns = [campaign].concat(subCampaigns).filter(x => x);

	const getCampaign4Debit = debit => {
		let campaign4debit = allCampaigns.find(c => debit.campaign === c.id || debit.jobNumber === C.id || debit.jobNumber === c.jobNumber);
		return campaign4debit;
	};

	let starts = allCampaigns.map(c => Campaign.start(c) || c.created).filter(x => x);
	starts.sort();
	let startDate = starts[0]; //getDate(campaign.created)
	let ends = allCampaigns.map(c => Campaign.end(c) || c.created).filter(x => x);
	ends.sort();
	let endDate = ends[ends.length-1];

	// if we have multiple donations to the same charity, avoid using the same image over and over again
	let charityCounter = {}

	return (
		<div className='flex flex-column pt-5'>
			<h2 className='text header-text' style={{ margin: "0 5%" }}>{brand.name}'s Campaign{impactDebits.length > 1 ? "s" : ""} With Good-Loop</h2>
			<p className='text dates'>{dateStr(asDate(startDate))} - {dateStr(asDate(endDate))}</p>
			<div id="donation-details" className='flex-mobile-dir'>
				{impactDebits.map(debit => 
					<DonationCard key={debit.id} debit={debit} brand={brand} campaign={getCampaign4Debit(debit)} charityCounter={charityCounter} charities={charities} />
				)}
			</div>
		</div>
	);
}


function DonationCard({ debit, brand, campaign, charityCounter, charities }) {
	const charId = debit.impact.charity;
	if (Object.keys(charityCounter).includes(charId)) {
		charityCounter[charId] += 1
	} else {
		charityCounter[charId] = 1
	}
	const charity = findCharity(charId, charities);
	if (!charity) {
		console.warn("(skip) No charity for " + charId, debit, charities);
		return <div>No Charity for {charId}</div>;
	}
	const imgList = NGO.images(charity) || [""]

	// get new image, if we have more impacts than images just loop the list
	const img = imgList[(charityCounter[charId] - 1) % imgList.length];

	const logo = charity.logo;
	const displayName = NGO.displayName(charity);
	const moneyRaised = debit.impact.amount;
	let donationModal = <ImpactCertificate brand={brand} impactDebit={debit} charity={charity} campaign={campaign} />
	return (
		<button onClick={() => setUrlValue("open", debit.id)} style={{ border: "none", backgroundColor: "none" }} className='impact-debit-container'>
			<div className='impact-debit'>
				{donationModal}
				<img className="debit-header" src={img} alt={displayName + " header image"} />
				<div className='debit-content'>
					<p className='debit-name'>{displayName}</p>
					<p className='debit-amount'><Misc.Money amount={moneyRaised} /> RAISED</p>
					<img className="debit-logo" src={logo} alt={displayName + " logo"} />
				</div>
			</div>
		</button>
	);
}


/**
 * Puts a logo inside a white circle 
 * @param {string} logo url of the logo we want to show
 * @returns {React.ReactElement} 
 */
export const circleLogo = ({ logo }) => {
	return (
		<div className='logo-circle'>
			<img src={logo} className='logo' />
		</div>
	)
}

/**
 * Good Loop focused CTAs 
 * @returns {React.ReactElement} 
 */
export const LearnMore = () => {

	const makeLink = (img, link, linkText) => { return { image: img, link: link, linkText: linkText } }
	const links = [
		makeLink("/img/Impact/gl-beach.jpg", "https://good-loop.com/our-story", "About Good-Loop"),
		makeLink("/img/Impact/our_products.png", "https://good-loop.com/products", "Advertise With Us"),
		makeLink("/img/LandingBackground/involved_banner.png", "https://good-loop.com/good-news/index", "Good News"),
		makeLink("/img/mydata/product-page/tabs.png", "https://my.good-loop.com/tabsforgood", "Tabs For Good")
	].map((el) => {
		return (
			<div key={el.link} className='learn-more-box'>
				<a href={el.link} className='img-link'><img className="link-img" src={el.image} alt={el.linkText + " Image"} /></a>
				<a href={el.link} className="text-link">{el.linkText}</a>
			</div>
		)
	})

	return (
		<div id="learn-more">
			<h2 id="learn-more-text text" style={{ margin: "0 0 2.5% 0" }}>Learn More</h2>
			<div className='d-flex flex-mobile-dir link-row'>
				{links}
			</div>
		</div>
	)
}

/**
 * Top of impact cards, containing bunch of art & branding
 * @param {int} i picks between two sets of arm png's
 * @param {string} logo url for whatever logo we want to display in the middle 
 * @returns {React.ReactElement} 
 */
export const CharityArms = (i, logo) => {
	return (
		<div className='charities-arms-logo'>
			<img src="/img/mydata/supporting.png" alt="spark-decoration" className='spark spark-1' />
			<img src="/img/mydata/supporting.png" alt="spark-decoration" className='spark spark-2' />
			<img src={`/img/Impact/arm-${i % 2}-l.png`} className='arm arm-left' />
			<img src={`/img/Impact/arm-${i % 2}-r.png`} className='arm arm-right' />
			{circleLogo({ logo: logo })}
		</div>)
}

/**
 * Card just containing {Brand Logo} \n {charity logos in rows}
 * @param {string} mainLogo charity logo url, falls back to brand logo
 * @param {Array<NGO>} charities charity logo url, falls back to brand logo
 * @returns {React.ReactElement} 
 */
export const BrandLogoRows = ({ mainLogo, charities, row }) => {
	const CharityLogos = charities.map((c, i) => <li style={{ width: "15vh", alignSelf: "center" }} key={i}><img style={{ width: "100%" }} src={c.logo} /></li>)

	if (row) {
		CharityLogos.unshift(<li style={{ width: "15vh", alignSelf: "center" }} key={CharityLogos.length}><img style={{ width: "100%" }} src={mainLogo} /></li>)
		return (
			<Row id='brand-charities' style={{ padding: "2%", placeContent: "center" }}>
				<ul style={{ listStyleType: "none" }}>
					{CharityLogos}
				</ul>
			</Row>
		)
	}

	return (
		<div id='brand-charities' style={{ padding: "2%" }}>
			<div className='topRow'><img className='logo' src={mainLogo} style={{ width: "100%" }} /></div>
			<ul style={{ listStyleType: "none" }}>
				{CharityLogos}
			</ul>
		</div>
	)
}

/**
 * 
 * @param {Object} p
 * @param {NGO} p.charity
 * @returns 
 */
const ImpactCertificate = ({ brand, impactDebit, campaign, charity }) => {
	let charityName = NGO.displayName(charity);
	let charityDesc = charity.summaryDescription || charity.description;
	let campaignName = campaign.name || brand.name || campaign.id;

	let unsdg = impactDebit.impact.unsdg || charity.unsdg;

	const impact = impactDebit.impact;
	const isOffset = Impact.isCarbonOffset(impact);
	const impactType = isOffset ? "Offset" : "Donation";

	// Can we find a certificate?
	const pvCredit = impactDebit.creditId ? getDataItem({ type: C.TYPES.ImpactCredit, id: impactDebit.creditId, status: KStatus.PUBLISHED }) : {};

	// where do we find these?
	// no matter the type, each certificate follows an identical structure
	// only differences are the values and the names of fields
	const details = {
		"Donation": {
			// donation details
			amountType: "Donation",
			detailsAmount: `£${Money.prettyString({ amount: impact.amountGBP || 0 })}`,
			creditsName: "Impact",
			creditsValue: "1234 Trees Planted",
			// Links
			links: [
				{ url: "www.google.com", icon: "", linkText: "Donation Receipt", linkImg: "/img/Impact/donation-icon.svg" },
				{ url: "www.google.com", icon: "", linkText: "Tree Planting Certificate", linkImg: "/img/Impact/donation-icon.svg" }
			]
		},

		"Offset": {
			// donation details
			amountType: "CO2e Offset",
			detailsAmount: "XX.XXT",
			creditsName: "Credits",
			creditsValue: "180",
			// Links
			links: [
				{ url: "www.google.com", icon: "", linkText: "Donation Receipt" },
				{ url: "www.google.com", icon: "", linkText: "Tree Planting Certificate" }
			]
		},
	}[impactType]

	let statusTitles = isOffset ? [
		"Measurement Period Commenced",
		"Measurement Period Completed",
		"Offset Processing",
		"Offset Actioned"
	] : [
		"Campaign\nLaunched",
		"Campaign\nCompleted",
		"Donation\nProcessing",
		"Donation\nMade"
	];
	let statusCompleted = [];
	let statusDates = [campaign?.topLineItem?.start, campaign?.topLineItem?.end];
	if (statusDates[0] && asDate(statusDates[0])?.getTime() < new Date().getTime()) {
		statusCompleted[0] = true;
	}
	if (statusDates[1] && asDate(statusDates[1])?.getTime() < new Date().getTime()) {
		statusCompleted[1] = true;
	}
	if (pvCredit.value?.paid || impactDebit.stage === "PROJECT_DONE" || impactDebit.stage === "CHARITY_PAID") {
		statusCompleted = [true, true, true, true];
		statusDates[3] = pvCredit.value?.paid;
	}
	let donationStatus = statusTitles.map((statusTitle, i) => {
		return (
			<div key={statusTitle} className="donation-status">
				<p>{statusDates[i] ? <Misc.DateTag date={statusDates[i]} /> : (statusCompleted[i] ? <span>&nbsp;</span> : "...")}</p>
				<img src={statusCompleted[i] ? "/img/Impact/tick-circle.svg" : "/img/Impact/blank-tick.svg"} className='donation-tick' />
				<p className='light-bold'>{statusTitle}</p>
			</div>)
	})


	let donationLinks = details.links.map((link, i) => {
		return (
			<a key={i} className="donation-link" href={link.url}>
				<img src={link.linkImg} />
				<p className='light-bold'>{link.linkText}</p>
			</a>)
	})

	// Use a url parameter so people can link to a certificate
	const openId = getUrlValue("open");
	return (
		<Modal isOpen={openId === impactDebit.id} id="impact-cert-modal" className='impact-cert' toggle={() => setUrlValue("open", false)} size="xl">
			<ModalBody className="d-flex modal-body" style={{ padding: 0, minHeight: "90vh" }}>
				{/* Col 1 on desktop, top row on mobile*/}
				<div className='flex-column cert-col left justify-content-between' style={{ padding: "5%", flexBasis: "50%" }}>
					<div className='charity-description justify-content-between'>
						<Row>
							<Col><Logo size="xl" item={charity} /></Col>
							<Col><h4 className='mt-5 charity-name'>{charityName}</h4></Col>
						</Row>
						<p className='text mt-4'>{charityDesc}</p>
						{charity.url && <p className='text mt-4'>Find out more: <a href={charity.url}>{charityName}</a></p>}
					</div>
					<div className='charity-SDG mt-5'>
						{unsdg ? <p className='text'>Primary UN SDG supported: {NGO.UNSDGs[unsdg]}
						</p> : <DevOnly>set UN SDG for this <PortalLink item={charity}>charity</PortalLink></DevOnly>}
						{unsdg && <img src={`/img/Impact/UN_Goals/${unsdg}.png`} style={{ width: '15%', marginTop: '2%' }} alt='SDG Logo' />}
					</div>
					<div className='charity-numbers mt-5 p-3' style={{ background: "@gl-lighter-blue" }}>
						<p className='text small-header light-bold'>{charity.name}</p>
						{NGO.regs(charity).map(reg => <p key={reg.id} className='text mt-1'>{reg.organisation} registration number: {reg.id}</p>)}
					</div>
					<DevOnly>Charity: <PortalLink item={charity} /></DevOnly>
					{/* <DonationSmallPrint isDone={statusCompleted[4]} campaign={campaign} impact={impact} brand={brand} impactDebit={impactDebit} /> */}
				</div>{/* ./ col 1 */}

				{/* Col 2 on desktop, bot row on mobile*/}
				<div className='flex-column cert-col right' style={{ background: "@gl-lighter-blue", flexBasis: "50%" }}>
					<div className='brand-ngo-logos' style={{ background: "white", padding: "1% 2.5% 1% 1.25%" }}>
						<Row className="cert-logo-row" style={{ height: "10vh", margin: 0 }}>
							<div className="logo-container">
								<Logo item={brand} />
							</div>
							<div className='logo-text-top' style={{ display: "flex", alignItems: "center" }}>
								<p className='text'>{campaignName && "Campaign: "+campaignName}</p>
							</div>
						</Row>
						{/* no need to dupe the charity logo <Row className="cert-logo-row" style={{ height: "10vh", margin: 0 }}>
							<div className="logo-container" style={{ width: "30%" }}>
								<img src={charity.logo || charity.altlogo} />
							</div>
							<div className='logo-text-bot' style={{ display: "flex", alignItems: "center" }}>
								<p className='text'>{charityName}</p>
							</div>
						</Row> */}
					</div>

					<div id='donation-details' style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
						<div>
							<p className='text offset-header'>{impactType.toUpperCase()}</p>
							<div id="offset-details">
								<Row className="offset-content" style={{ margin: 0 }}>
									<Col style={{ borderRight: "solid 1px lightgray" }}>
										<p className='text light-bold'>{isOffset ? "Carbon Offset" : "Donation"}</p>
										<h2 className='color-gl-red'><Misc.Money amount={impactDebit.impact.amount} /></h2>
										<DevOnly>ImpactDebit: <PortalLink item={impactDebit} /></DevOnly>
									</Col>
									<Col style={{ borderRight: "solid 1px lightgray", padding: 0 }}>
										<div style={{ borderBottom: "solid 1px lightgray", padding: "0 5% 10%" }}>
											<p className='text light-bold'>Breakdown</p>
											<div className='color-gl-red'>
												<DonationModelInfo campaign={campaign} />
											</div>
										</div>
										<div style={{ padding: "10% 5%" }}>
											<p className='text light-bold'>{isOffset ? "Credits" : "Impact"}</p>
											<p className='color-gl-red'>{Impact.str(impact)}</p>
										</div>
									</Col>
									<Col style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
										<p className='text light-bold'>{isOffset? "Managed":"Powered"} by Good-Loop</p>
										<img src="/img/Impact/AdsForGood.svg" style={{ width: "100%" }} />
										<p className='small-legal-text'>Registered UK company: SC548356</p>
									</Col>
								</Row>
							</div>
						</div>

						<div>
							<p className='text offset-header'>{impactType.toUpperCase()} STATUS</p>
							<div id="offset-status">
								<Col className="offset-content" style={{ margin: 0 }}>
									<DevOnly>Campaign: <PortalLink item={campaign} /></DevOnly>
									<Row style={{ justifyContent: "space-around" }}>
										<div id='status-line' />
										{/* ticks and dates for launched ... paid */}
										{donationStatus}
									</Row>
									<p className="">Tracking IDs: {[impactDebit.donationId || impactDebit.id, campaign.id, campaign.xref].filter(x => x).join(", ")}
									</p>
								</Col>
							</div>
						</div>

						{donationLinks.length && <div>
							<p className='text offset-header'>LINKS</p>
							<div id="offset-links">
								<Row className="offset-content" style={{ margin: 0, placeContent: 'space-around' }}>
									{donationLinks}
								</Row>
							</div>
						</div>}

						<div>
							<p className='text offset-header'>DETAILS</p>
							<Row className="offset-content" style={{ margin: 0, placeContent: 'space-around' }}>
							<DonationSmallPrint isDone={statusCompleted[4]} campaign={campaign} impact={impact} brand={brand} impactDebit={impactDebit} />
							</Row>
						</div>

					</div>
				</div>
			</ModalBody>
		</Modal>
	)
}

const DonationModelInfo = ({campaign}) => {
	// {dntnModel.input==="CPA" && <span>One donation {dntnModel.perInput && <span>of <Misc.Money amount={dntnModel.perInput}/></span>} per user is made when the user engages.</span>}
	// {dntnModel.fraction? printer.prettyNumber(100*dntnModel.fraction, 2)+"%" : "A fraction"} of the advertising cost is donated. Most of the rest goes to pay the publisher and related companies. Good-Loop and the advertising exchange make a small commission. The donations depend on viewers seeing the adverts.
	return <>
		{campaign.dntnModel?.perInput && <span><Misc.Money amount={campaign.dntnModel.perInput} /> per </span>}
		{/* {campaign.maxDntn && <span>Upto a limit of: <Misc.Money amount={campaign.maxDntn} /></span>} done in Details */}
	</>
}

function DonationSmallPrint({ campaign, impact, isDone }) {
	let isOffset = Impact.isCarbonOffset(impact);
	if (isOffset) {
		campaign.dntnModel
		return (<div className=''>
			The offset organisations are not recommending or endorsing the products in return.
			We are simply glad to support the good work they do.
			{!isDone && <div>Amounts for campaigns that are in progress or recently finished are estimates and may be subject to audit.</div>}
		</div>);
	}
	let dntnModel = campaign?.dntnModel || {};
	return (<div className=''>
		{dntnModel.input==="CPA" && <span>One donation {dntnModel.perInput && <span>of <Misc.Money amount={dntnModel.perInput}/></span>} per user is made when the user engages.</span>}
		{dntnModel.fraction? printer.prettyNumber(100*dntnModel.fraction, 2)+"%" : "A fraction"} of the advertising cost is donated. Most of the rest goes to pay the publisher and related companies. Good-Loop and the advertising exchange make a small commission. The donations depend on viewers seeing the adverts.
		{campaign?.maxDntn && <span>The maximum that can be donated from this campaign is <Misc.Money amount={campaign.maxDntn} /></span>}

		{impact.name && <div>Impacts such as "{I18N.tr(impact.name)}" are representative.
			We don't ring-fence funding, as the charity can better assess the best use of funds.
			Cost/impact figures are as reported by the charity or by the impact assessor SoGive.</div>}

		<div>Donations are provided without conditions. The charities are not recommending or endorsing the products in return.
			They're just doing good — which we are glad to support.</div>

		{!isDone && <div>Amounts for campaigns that are in progress or recently finished are estimates and may be subject to audit.</div>}

		<div>This information follows the guidelines of the New York Attorney General for best practice in cause marketing,<Cite href="https://www.charitiesnys.com/cause_marketing.html" /> and the Better Business Bureau's standard for donations in marketing.</div>
		
		{campaign.smallPrint && <div>{campaign.smallPrint}</div>}
	</div>);
}
