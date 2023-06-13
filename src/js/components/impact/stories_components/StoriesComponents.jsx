
import React, {useState} from 'react';
import DataStore from '../../../base/plumbing/DataStore';
import { Container, Row, Col } from 'reactstrap';
import Circle from '../../../base/components/Circle';
import NGO from '../../../base/data/NGO';
import Money from '../../../base/data/Money';
import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import Campaign from '../../../base/data/Campaign';
import Advertiser from '../../../base/data/Advertiser';
import {addAmountSuffixToNumber, isMobile} from '../../../base/utils/miscutils'
import { fetchBaseObjects } from '../impactdata';
import { ErrorDisplay } from '../ImpactComponents';
import { addScript } from '../../../base/utils/miscutils';
import CampaignPage from '../../campaignpage/CampaignPage';
import {Modal, ModalBody} from 'reactstrap';
/**
 * A thin card that contains just the supplied text,
 * @param {string} text  
 * @returns {React.ReactElement} 
 */
export const CardSeperator = ({text}) => {
	return (
	<div className={"cardSeperator"}>
		<p className='text'>{text}</p>
	</div>
	)
} 

/**
 * For the 'most impactful' impact, we show a statistic & either a fact or another image
 * If the statistic is missing or we don't have enough images on the charity, return an empty element
 * @param {string} logo url for the logo of the charity 
 * @param {NGO} charity what charity will this impactDebit donate to?
 * @param {impactDebit} impactDebit the 'most impactful' impact the campaign has done
 * @returns {React.ReactElement} 
 */
export const CampaignImpactOne = ({logo, charity, impactDebit}) => {

	// due to an annoying bug on local setup, we should be using the first 
	const text = {
		cause : impactDebit.impact.impactCause || false,
		stats : impactDebit.impact.impactStats || false,
		dyk : impactDebit.impact.fact || false,
		fact : impactDebit.impact.factSource || false,
		factName : impactDebit.impact.factSourceName || false,
		factUrl : impactDebit.impact.factSourceUrl || false,
	}

	// can't show this without a stat
	if(!text.cause || !text.stats) return <></>
	
	// we can't show the card if we don't have the images to populate it
	// if we don't have a fact we replace it with another image so that increases the amount required
	let factPresent = (text.fact && text.factName && text.factUrl);
	const imgList = NGO.images(charity);
	if((factPresent && imgList.length < 2) || (! factPresent && imgList.length < 3)) return <></>

	return (
		<div id="campaign-impact-one" className='campaign-impact'>
			{CharityArms(1, (charity.logo || logo))}
			<div className='impact-section'>

				{/* top row */}
				<Row id="impact-one-toprow" className='impact-row flex-mobile-dir'>

					<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
						<img src={imgList[0].contentUrl || imgList[0]} alt="charity image 1" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
					</div>

					<div className='p-2 bg-gl-red right camp-impact-card'>
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve dark-curve" />
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve normal-curve" />
						<div className='cause-container'>
							<p className='cause'>{text.cause}</p>
							<h2 className='description'>{text.stats}</h2>
							<p className='with-charity'>With {charity.name}</p>
						</div>
					</div>

				</Row>

				{/* bottom row */}
				<Row id="impact-one-botrow" className='impact-row flex-mobile-dir'>

					{factPresent && 
						<div className='p-2 bg-gl-darker-grey left camp-impact-card'>
							<img src="/img/Impact/did-you-know.svg" className='quote-box'/>
							<div className='dyk-container'>
								<p className='dyk'>Did You Know?</p>
								<p className='fact'>{text.fact}</p>
								<p className='source'>Source: <a className="source-link" href={text.factUrl}>{text.factName}</a></p>
							</div>
						</div>
					}
					{!factPresent && 
						<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
							<img src={imgList[2].contentUrl || imgList[2]} alt="charity image 2" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
						</div>
					}

					<div className='p-2 bg-gl-white right camp-impact-card camp-impact-img'>
						<img src={charity.imageList[1].contentUrl} alt="charity image 2" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
					</div>

				</Row>
			</div>

		</div>
	)
}

/**
 * For the second 'second most impactful' impact, we show a statistic & a testimonial
 * If we don't have a testimonial, default to the charities description
 * If the statistic or both the testimonial & description are missing, return an empty element
 * @param {string} logo url for the logo of the charity 
 * @param {NGO} charity what charity will this impactDebit donate to?
 * @param {impactDebit} impactDebit the 'second most impactful' impact the campaign has done
 * @returns {React.ReactElement} 
 */
export const CampaignImpactTwo = ({logo, impactDebit, charity}) => {
	// this card needs to make use of a second impact, if it doesn't exist we can't use it!

	// due to an annoying bug on local setup, we should be using the first 
	const text = {
		cause : impactDebit.impact.impactCause || false,
		stats : impactDebit.impact.impactStats || false,

		testimonialQuote : impactDebit.impact.testimonialQuote || "",
		testimonialHeader : impactDebit.impact.testimonialHeader || "",
		testimonialJob : impactDebit.impact.testimonialJob || "",
		testimonialPerson : impactDebit.impact.testimonialPerson || ""
	}

	// can't show this without a stat
	if(!text.cause || !text.stats) return <></>
	
	// if we're missing the quote, try to use the charities description instead
	// if that's missing, we can't show the card
	if(!text.testimonialQuote) text.testimonialQuote = charity.description;
	if(!text.testimonialQuote) return <></>

	// if we can't show the images, we can't show the card
	const imgList = NGO.images(charity);
	if(imgList.length < 2) return <></>
	
	return (
		<div id="campaign-impact-two" className='campaign-impact'>

			{CharityArms(2, (charity.logo || logo))}

			<div className='impact-section'>
				<Row className='impact-row flex-mobile-dir' id="row-1">
					<div className='p-2 bg-gl-red right camp-impact-card' style={{position:"relative"}}>
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve dark-curve" />
						<img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve normal-curve" />
						<div className='cause-container'>
							<p className='cause'>{text.cause}</p>
							<h2 className='description'>{text.stats}</h2>
							<p className='with-charity'>With {charity.name || charity.id}</p>
						</div>
					</div>
					<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
						<img src={imgList[0].contentUrl || imgList[0]} alt="charity image 1" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
					</div>
				</Row>
				<Row className='impact-row flex-mobile-dir' id="row-2">
					<div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
						<img src={imgList[1].contentUrl || imgList[1]} alt="charity image 1" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
					</div>
					<div className='p-2 bg-gl-light-pink right camp-impact-card camp-impact-img'>
						<img src="/img/Impact/heart.png" className="heart-bg" />
						<h2 className='color-gl-light-red mb-4'>{text.testimonialHeader}</h2>
						<p className='project-desc text'>{text.testimonialQuote}</p>
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
export const HowItWorks = ({campaign, subCampaigns, charities, totalString}) => {

	//find earlist campaign
	if(!campaign) campaign = subCampaigns.sort((a, b) =>  b.created - a.created)[0]
	const startDate = campaign.created.substr(0, campaign.created.indexOf("T")).split("-"); // in format 2022-12-16T04:52:53, we don't care about anything after T
	const year = startDate[0].substr(2, 4); // get the decades only, will need patched in ~ 80 years
	const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][startDate[1] - 1]
	// get viewcount and format it into 2 sig figs & unit amount, eg 1,413,512 -> 1.4M

	if(!subCampaigns) subCampaigns = [campaign] 

	const viewcount = addAmountSuffixToNumber(
		subCampaigns.reduce((sum, cur) => {
			return sum + Number(Campaign.viewcount({campaign: campaign, status: KStatus.PUBLISHED}).toPrecision(2))
		}, 0)
	)

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
						<img src="/img/Impact/this-ad-plants-trees.png" className='fill-img'/>
					</div>
					<p>{month}' {year} - Campaign{subCampaigns ? "s" : ""} Launch{subCampaigns ? "" : "es"}</p>
					<h3 className='color-gl-white'>Every View Is<br />A Donation</h3> {/* TODO: figure out something closer to £N / VIEW to use here*/}
				</div>

				<div className='hiw-col'>
					<h2 className='color-gl-white'>2.</h2>
					<div className='white-circle'>
						<img src="/img/Impact/OurStory_PeopleCrossingRoad.jpg" className='fill-img'/>
					</div>
					<p>Today</p>
					<h3 className='color-gl-white'>+{viewcount} People</h3>
					<p className='text white'>Viewed The Advert{subCampaigns ? "s" : ""} So Far</p>
				</div>

				<div className='hiw-col'>
					<h2 className='color-gl-white'>3.</h2>
					<div className='white-circle'>
						<img src={charities[0]?.headerImage} className='fill-img'/>
					</div>
					<p>After the Campagin</p>
					<h3 className='color-gl-white'>{totalString}+ In Donations</h3>
					<p className='text white'>Funded By The Advert{subCampaigns ? "s" : ""}</p>
				</div>
			</div>
		</div>
	)
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
export const DonationsCard = ({campaign, subCampaigns, brand, impactDebits, charities}) => {
	const getDate = (dateStr) => {
		let tempDate = dateStr.substr(0, dateStr.split("").findIndex((el) => el === "T")).split("-") // parse date 
		tempDate[1] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(tempDate[1]) - 1]
		return tempDate.reverse().join(" ") // [YYYY,MM,DD] -> "DD MM YYYY"
	}

	// find earliest date if we expect a list
	if(!campaign) campaign = subCampaigns.sort((a, b) => {
		return b - a
	})[0];

	let startDate = getDate(campaign.created)
	
	// this isn't accurate?
	const endDate = campaign.end ? getDate(campaign.end) : "present";``
	console.log("????", impactDebits)

	// if we have multiple donations to the same charity, avoid using the same image over and over again
	let charityCounter = {}

	const donations = impactDebits.map((debit, index) => {

		const charId = debit.impact.charity;
		if(Object.keys(charityCounter).includes(charId)) {
			charityCounter[charId] += 1
		} else {
			charityCounter[charId] = 1
		}
		const charity = charities.find((c) => c.id === charId)
		if (!charity) return;
		const imgList = NGO.images(charity) || [""] 

		// get new image, if we have more impacts than images just loop the list
		const img = imgList[(charityCounter[charId] - 1) % imgList.length];

		console.log("aaahhHHHH", charId, imgList.length, imgList)
		const logo = charity.logo;
		const displayName = charity.displayName;
		const raised = debit.impact.amountGBP;
		const [open, setOpen] = useState(false);
		let donationModal = <ImpactCertificate brand={brand} impactDebit={debit} charity={charity} campaign={campaign} open={open} setOpen={setOpen}/>
		return (
		<button onClick={() => setOpen(!open)} style={{border: "none", backgroundColor:"none"}} className='impact-debit-container'>
			<div className='impact-debit' key={index}>
				{donationModal}
				<img className="debit-header" src={img} alt={displayName + " header image"}/>
				<div className='debit-content'>
					<p className='debit-name'>{displayName}</p>
					<p className='debit-amount'>£{raised} RAISED...</p>
					<img className="debit-logo" src={logo} alt={displayName + " logo"} />
				</div>
			</div>
		</button>
		)
	})

	return (
		<div className='flex flex-column'>
			<h2 className='text header-text' style={{margin: "0 5%"}}>{brand.name}'s Campaign{impactDebits.length > 1 ? "s" : ""} With Good-Loop</h2>
			<p className='text dates'>{startDate} - {endDate}</p>
			<div id="donation-details" className='flex-mobile-dir'>
				{donations}
			</div>
		</div>

	)
}

/**
 * Puts a logo inside a white circle 
 * @param {string} logo url of the logo we want to show
 * @returns {React.ReactElement} 
 */
export const circleLogo = ({logo}) => {
	return (
		<div className='logo-circle'>
			<img src={logo} className='logo'/>
		</div>
	)
}

/**
 * Good Loop focused CTAs 
 * @returns {React.ReactElement} 
 */
export const LearnMore = () => {

	const makeLink = (img, link, linkText) => {return {image:img, link:link, linkText:linkText} }
	const links = [
		makeLink("/img/Impact/gl-beach.jpg", "https://good-loop.com/our-story", "About Good-Loop"),
		makeLink("/img/Impact/our_products.png", "https://good-loop.com/products", "Advertise With Us"),
		makeLink("/img/LandingBackground/involved_banner.png", "https://good-loop.com/good-news/index", "Good News"),
		makeLink("/img/mydata/product-page/tabs.png", "https://my.good-loop.com/tabsforgood", "Tabs For Good")
	].map((el) => {
		return (
			<div key={el.link} className='learn-more-box'>
				<a href={el.link} className='img-link'><img className="link-img" src={el.image} alt={el.linkText + " Image"}/></a>
				<a href={el.link} className="text-link">{el.linkText}</a>
			</div>
		)
	})

	return (
		<div id="learn-more">
			<h2 id="learn-more-text text" style={{margin: "0 0 2.5% 0"}}>Learn More</h2>
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
		<img src="/img/mydata/supporting.png" alt="spark-decoration" className='spark spark-1'/>
		<img src="/img/mydata/supporting.png" alt="spark-decoration" className='spark spark-2'/>
		<img src={`/img/Impact/arm-${i%2}-l.png`} className='arm arm-left'/>
		<img src={`/img/Impact/arm-${i%2}-r.png`} className='arm arm-right'/>
		{circleLogo({logo:logo})}
	</div>)
}

/**
 * Card just containing {Brand Logo} \n {charity logos in rows}
 * @param {string} mainLogo charity logo url, falls back to brand logo
 * @param {Array<NGO>} charities charity logo url, falls back to brand logo
 * @returns {React.ReactElement} 
 */
export const BrandLogoRows = ({mainLogo, charities, row}) => {
	const CharityLogos = charities.map((c, i) => <li style={{width:"15vh", alignSelf:"center"}} key={i}><img style={{width:"100%"}} src={c.logo}/></li>)
	
	if(row) {
		CharityLogos.unshift(<li style={{width:"15vh", alignSelf:"center"}} key={CharityLogos.length}><img style={{width:"100%"}} src={mainLogo}/></li>)
		return (
			<Row id='brand-charities' style={{padding: "2%", placeContent:"center"}}>
			<ul style={{listStyleType: "none"}}>
				{CharityLogos}
			</ul>
			</Row>
		)
	}
	 
	return (
		<div id='brand-charities' style={{padding: "2%"}}> 
			<div className='topRow'><img className='logo' src={mainLogo} style={{width: "100%"}}/></div>
			<ul style={{listStyleType: "none"}}>
				{CharityLogos}
			</ul>
		</div>
	)
}

const ImpactCertificate= ({brand, impactDebit, campaign, charity, open, setOpen}) => {
	let charityName = charity.displayName || charity.name || charity.id;
	let charityDesc = charity.summaryDescription || charity.description
	let campaignName = campaign.name || brand.name || campaign.id;

	const charityUN_SDGS = [1, 4, 9]

	const impactType = true ? "Donation" : "Offset"
	
	// where do we find these?
	// no matter the type, each certificate follows an identical structure
	// only differences are the values and the names of fields
	const details = {
		"Donation" : {
			// donation details
			amountType : "Donation",
			detailsAmount : "£XX.XX",
			breakdownHeader : "Breakdown",
			breakdownText : "£0.XX donated per (x) completed views",
			creditsName : "Impact",
			creditsValue : "1234 Trees Planted",
			byGoodLoop : "Powered by Good-Loop",
			goodLoopImg : "/img/Impact/AdsForGood.svg",

			// donation status
			statusTitles : [
				"Campaign\nLaunched",
				"Campaign\nCompleted",
				"Donation\nProcessing",
				"Donation\nMade"
			],
			statusCompleted : [
				true,
				true,
				false,
				false
			],
			statusDates : [
				"DD/MM/YY",
				"DD/MM/YY",
				"DD/MM/YY",
				"DD/MM/YY"
			],
			
			// Links
			links : [
				{url : "www.google.com", icon:"", linkText:"Donation Receipt", linkImg:"/img/Impact/donation-icon.svg"},
				{url : "www.google.com", icon:"", linkText:"Tree Planting Certificate", linkImg:"/img/Impact/donation-icon.svg"}
			]
		},

		"Offset" : {
			// donation details
			amountType : "CO2e Offset",
			detailsAmount : "XX.XXT",
			breakdownHeader : "Offset Cost",
			breakdownText : "£XXX",
			creditsName : "Credits",
			creditsValue : "180",
			byGoodLoop : "Managed by Good-Loop",
			goodLoopImg : "/img/Impact/AdsForGood.svg",

			// donation status
			statusTitles : [
				"Measurement Period Commenced",
				"Measurement Period Completed",
				"Offset Processing",
				"Offset Actioned"
			],
			statusCompleted : [
				true,
				true,
				true,
				false
			],
			statusDates : [
				"DD/MM/YY",
				"DD/MM/YY",
				"DD/MM/YY",
				"DD/MM/YY"
			],
			
			// Links
			links : [
				{url : "www.google.com", icon:"", linkText:"Donation Receipt"},
				{url : "www.google.com", icon:"", linkText:"Tree Planting Certificate"}
			]
		},
	}[impactType]

	let donationStatus = details.statusDates.map((_, i) => {
		return (
		<div className="donation-status">
			<p>{details.statusDates[i]}</p>
			{details.statusCompleted[i] && <img src="/img/Impact/tick-circle.svg" className='donation-tick'/>}
			{! details.statusCompleted[i] && <img src="/img/Impact/blank-tick.svg" className='donation-tick'/>}
			<p className='light-bold'>{details.statusTitles[i]}</p>
		</div>)
	}) 

	let donationLinks = details.links.map((link, i) => {
		return (
		<a className="donation-link" href={link.url}>
			<img src={link.linkImg} />
			<p className='light-bold'>{link.linkText}</p>
		</a>)
	})

	console.log("ismobile???" , isMobile())
	const modalClasses = `${isMobile() ? "flex-column" : "flex-row"} d-flex`
	return (
		<Modal isOpen={open} id="impact-cert-modal" className='impact-cert' toggle={() => setOpen(!open)} size="xl">
			<ModalBody className="d-flex modal-body" style={{padding:0, height:"90vh"}}>
				{/* Col 1 on desktop, top row on mobile*/}
				<div className='flex-column cert-col left justify-content-between' style={{padding:"5%", flexBasis:"50%"}}>
					<div className='charity-description justify-content-between'>
						<img style={{maxWidth:"40%"}} src={charity.logo} />
						<h4 className='mt-5 charity-name'>{charityName}</h4>
						<p className='text mt-4'>{charityDesc}</p>
						{charity.url && <p className='text mt-4'>Find out more: <a href={charity.url}>{charityName}</a></p>}
					</div>
					<div className='charity-SDG mt-5'>
						<p className='text'>Primary UN SDG supported by {charityName}</p>
					</div>
					<div className='charity-numbers mt-5 p-3' style={{background:"@gl-lighter-blue"}}>
						<p className='text small-header light-bold'>{charityName} Projects</p>
						<p className='text mt-1'>Registered charity number: ????????? </p>
						<p className='text mt-1'>Company Number: ????????? </p>
					</div>
				</div>

				{/* Col 2 on desktop, bot row on mobile*/}
				<div className='flex-column cert-col right' style={{background:"@gl-lighter-blue", flexBasis:"50%"}}>
					<div className='brand-ngo-logos' style={{background:"white", padding:"1% 2.5% 1% 1.25%"}}>
						<Row className="cert-logo-row" style={{height:"10vh", margin:0}}>
							<div className="logo-container">
								<img src={brand.branding.logo}/>
							</div>
							<div className='logo-text-top' style={{display:"flex", alignItems:"center"}}>
								<p className='text'>{campaignName}</p>
							</div>
						</Row>
						<Row className="cert-logo-row" style={{height:"10vh", margin:0}}>
							<div className="logo-container" style={{width:"30%"}}>
							   <img src={charity.logo || charity.altlogo}/>
							</div>
							<div className='logo-text-bot' style={{display:"flex", alignItems:"center"}}>
								<p className='text'>{charityName}</p>
							</div>
						</Row>
					</div>

					<div id='donation-details' style={{display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
						
						<div>
							<p className='text offset-header'>{impactType.toUpperCase()} DETAILS</p>
							<div id="offset-details">
								<Row class="offset-content" style={{margin:0}}>
									<Col style={{borderRight: "solid 1px lightgray"}}>
										<p className='text light-bold'>{details.amountType}</p>
										<h2 className='color-gl-red'>{details.detailsAmount}</h2>
									</Col>
									<Col style={{borderRight: "solid 1px lightgray", padding:0}}>
										<div style={{borderBottom: "solid 1px lightgray", padding:"0 5% 10%"}}>
											<p className='text light-bold'>{details.breakdownHeader}</p>
											<p className='color-gl-red'>{details.breakdownText}</p>
										</div>
										<div style={{padding:"10% 5%"}}>
											<p className='text light-bold'>{details.creditsName}</p>
											<p className='color-gl-red'>{details.creditsValue}</p>
										</div>
									</Col>
									<Col style={{display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
										<p className='text light-bold'>{details.byGoodLoop}</p>
										<img src={details.goodLoopImg} style={{width:"100%"}}/>
										<p className='small-legal-text'>small legal stuff text</p>
									</Col>
								</Row>
							</div>
						</div>

						<div>
							<p className='text offset-header'>{impactType.toUpperCase()} STATUS</p>
							<div id="offset-status">
								<Col class="offset-content" style={{margin:0}}>
									<p className="light-bold">Tracking ID: XXXX</p>
									<Row style={{justifyContent:"space-around"}}>
										<div id='status-line' />
										{donationStatus[0]}
										{donationStatus[1]}
										{donationStatus[2]}
										{donationStatus[3]}
									</Row>
								</Col>
							</div>
						</div>

						<div>
							<p className='text offset-header'>LINKS</p>
							<div id="offset-links">
								<Row class="offset-content" style={{margin:0,placeContent:'space-around'}}>
									{donationLinks}
								</Row>
							</div>
						</div>

					</div>
				</div>
			</ModalBody>
		</Modal>
	)
}
