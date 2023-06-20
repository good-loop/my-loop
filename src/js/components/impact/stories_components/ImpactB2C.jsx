
import React from 'react';
import DataStore from '../../../base/plumbing/DataStore';
import { Container, Row } from 'reactstrap';
import Circle from '../../../base/components/Circle';
import NGO from '../../../base/data/NGO';
import Money from '../../../base/data/Money';
import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import Campaign from '../../../base/data/Campaign';
import Advertiser from '../../../base/data/Advertiser';
import {addAmountSuffixToNumber} from '../../../base/utils/miscutils'
import { fetchBaseObjects } from '../impactdata';
import { ErrorDisplay } from '../ImpactComponents';
import ImpactLoadingScreen from '../ImpactLoadingScreen';
import { addScript } from '../../../base/utils/miscutils';
import CampaignPage from '../../campaignpage/CampaignPage';
import {CardSeperator, CampaignImpactOne, CampaignImpactTwo, HowItWorks, DonationsCard, circleLogo, LearnMore, CharityArms, BrandLogoRows} from './StoriesComponents';
import {ImpactB2B} from './ImpactB2B'

/**
 * Container for the new (as of 5/23) replacement for impact hub
 * Most up to date design : https://miro.com/app/board/uXjVMaoHMrI=/?share_link_id=8808857536 - specifically the B2C parts
 */
const CampaignImpact = () => {
	// setup page & check we have all the data we need
	const path = DataStore.getValue(['location', 'path']);
	const glVertiser = DataStore.getUrlValue('gl.vertiser');
	const b2b = DataStore.getUrlValue('b2b');
	if ((path.length != 2 && !glVertiser) || path[0] !== "campaign") return <ErrorDisplay e={{error:"Invalid URL"}} />
	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
	let itemType = "campaign"
	let itemId = path[1]

	// before we fetch the data we need for stories, check to see if it's a legacy impact page
	// temporary wee hack as of 17/5/23, we can only reach this page if we choose to within the url! 
	const LEGACY_IMPACT_IDS = []
	const newStories = DataStore.getUrlValue('newStories');

	// return old impact hub
	if(LEGACY_IMPACT_IDS.includes(itemId) ||  !newStories) return <CampaignPage />;
	
	if(glVertiser) {
		itemType = "brand"
		itemId = glVertiser
	}

	let pvBaseObjects = DataStore.fetch(['misc','impactBaseObjects',itemType,status,'all',itemId], () => {
		return fetchBaseObjects({itemId, itemType, status});
	})

	if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />
	if (! pvBaseObjects.resolved) return <ImpactLoadingScreen baseObj={pvBaseObjects}/>

	let {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits=[], charities=[]} = pvBaseObjects.value || {};
	masterBrand = masterBrand || brand;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
	if(impactDebits.length == 0) return <ErrorDisplay e={{message: "No impact debits found for this campaign"}} />
	// Returns NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);
	const totalString = Money.prettyStr(totalDonation);
	// sort impact debits, ranking first by priority then by the cash value of the debit
	// "b - a" is used to invert the sort so [0] is the most impactful impact
	impactDebits.sort((a, b) => {
		let result = (b.impact.priority || 0) - (a.impact.priority || 0); // sort by priority
		if(result === 0) result = (b.impact.amountGBP || 0) - (a.impact.amountGBP || 0); // if equal, sort by GBP
		return result;
		if(result === 0) result = b.id.localCompare(a.id); // if equal, sort by id alphabetically 
		return result;
	});

	let firstImpact  = impactDebits[0] || null
	let secondImpact = impactDebits[1] || null
	const firstCharity = firstImpact && charities.find((char) => char.id === firstImpact.impact.charity) || {};
	const secondaryCharity = secondImpact && charities.find((char) => char.id === secondImpact.impact.charity) || {};

	const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;

	if(b2b) return ImpactB2B({pvBaseObjects, totalString, mainLogo, footer:false})

	return (
		<Container fluid id="ImpactB2C-container">
			<SplashCard masterBrand={masterBrand} impact={firstImpact} charity={firstCharity} totalString={totalString}/>
			<BrandLogoRows mainLogo={mainLogo} charities={charities} />
			<PoweredByGL />
			<HowItWorks campaign={campaign} subCampaigns={subCampaigns} charities={charities} totalString={totalString}/>
			<CardSeperator text={`Here's a Look At What You're Helping\nSupport With ${masterBrand.name}`} />
			{firstImpact && <CampaignImpactOne campaign={campaign} brand={brand} logo={mainLogo} charity={firstCharity} impactDebit={firstImpact}/>}
			{secondImpact && <CampaignImpactTwo campaign={campaign} brand={brand} logo={mainLogo} charity={secondaryCharity} impactDebit={secondImpact}/>}
			<MakingADifference logo={mainLogo} charities={charities} />
			<CardSeperator text={`Here's How You Can Keep Involved\nWith Good-Loop`} />
			<GetInvolvedCard />
			<DonationsCard campaign={campaign} subCampaigns={subCampaigns} brand={brand} impactDebits={impactDebits} charities={charities} />
			<LearnMore />
		</Container>
	)
}

/**
 * Splash card for the impact B2C page
 * This isn't up to date with the design! The animations we got turned out to be a huge pain to work with so will come with the next version
 * @param {Advertiser} masterBrand 
 * @param {NGO} charity  what charity received the most 'impact' ? If a brand has > 1 charity donated to it then this won't be reflected here, how should we handle that - Lewis ?
 * @param {string} totalString  total amount donated in GBP
 * @returns {React.ReactElement} 
 */
const SplashCard = ({masterBrand, charity, totalString}) => {
	return (
		<div className='story-card' id='i-splash'>
		<div className='top-text-block'>
			<h2 className='white font-weight-bold'>Thank You</h2>
			<h3 className='white'>For Watching {masterBrand.name} Advert And <br /> Supporting {charity.displayName}!</h3>
		</div>
		<Circle className = "splash-earth true-center" center>
			<p>Together We've Raised:</p>
			<h2>{totalString}</h2>
			<p>And Counting</p>
		</Circle>
		<div>{/* this div is here just to trick flexbox into centering the above circle*/}</div>
	</div>)

}

/**
 * Card containing social media CTAs
 * @returns {React.ReactElement} 
 */
function PoweredByGL() {
	return (
		<div id='powered-by-gl'>
			<img src="/img/homepage/bubble-spark.png" alt="spark-decoration" className='bubble-spark spark-1'/>
			<img src="/img/homepage/bubble-spark.png" alt="spark-decoration" className='bubble-spark spark-2'/>
			<p className='text' style={{margin: 0}}>Your Donation Was Powered by Good-Loop</p>
			<img className='adsForGood align-self-center mb-3' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
			<div className='row'>
				<SocialMediaLinks />
			</div>
	  </div> 
);
}

/**
 * Row of social media links
 * @param {boolean} dark do we want to use the dark logos or not?
 * @returns {React.ReactElement} 
 */
function SocialMediaLinks({dark}) {
	const instagramImg = dark ? "/img/getinvolved/instagram-round.png" : "/img/footer/insta_icon.200w.png"  
	const facebookImg = dark ?  "/img/getinvolved/facebook-round.png" : "/img/footer/facebook_icon.200w.png"
	const twitterImg = dark ?   "/img/getinvolved/twitter-round.png" : "/img/footer/twitter_icon.200w.png"  

	return (<>
		<div className='flex-mobile-dir social-media-links'>
			<C.A className="" href={C.app.instagramLink}> <img src={instagramImg} alt="instagram logo" className='link-logo' /></C.A>
			<C.A className="ml-2" href={C.app.facebookLink}> <img src={facebookImg} alt="facebook logo" className='link-logo' /></C.A>
			<C.A className="ml-2" href={C.app.twitterLink}> <img src={twitterImg} alt="twitter logo" className='link-logo' /></C.A>
		</div>
	</>);
}

/**
 * Another card to advertise ourselves
 * TODO the styling we were sent to be used was in an awful format - more sparkles & stuff to come in v2 (17/05/23 - lewis)
 * @param {string} logo url for brand logo
 * @param {Array<NGO>} charities 
 * @returns {React.ReactElement} 
 */
const MakingADifference = ({logo, charities}) => {
	const CharityLogos = charities.map((c, i) => <li><img key={i} src={c.logo}/></li>)

	return (
		<div id="impact-making-a-diff">
			<div id="together-we-can-make-a-diff">
				<h2 className="color-gl-light-red" style={{margin: "0 10% 0 10%"}}>Together we can make a difference -<br />brands, consumers and charities</h2>
				<img className="brandlogo" src={logo} />
				<ul>
					{CharityLogos}
				</ul>
			</div>
			<div id="diff-powered-by-gl">
				<p className='text'>Powered By Good-Loop</p>
				<img className='align-self-center mb-3 img-adsforgood' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
			</div>
		</div>
	)
}

/**
 * Hubspot form to let users sign up via email 
 * @returns {React.ReactElement} 
 */
const GetInvolvedCard = () => {
	// set up the hubspot form for getting a users email
	const scriptUrl = 'https://js.hsforms.net/forms/v2.js';
	const onLoad = () => {
		if (window.hbspt) {
		const hbsptId = "0e8c944d-211b-4249-b63e-7bbad428afe5"
		// @TS-ignore
		window.hbspt.forms.create({
			region: "eu1",
			portalId: "25392416",
			formId: hbsptId,
			target: '#hubspotForm',
			onFormReady: function() {
				let form = document.getElementById("hsForm_"+hbsptId)

				// add placeholders to both text inputs
				form.querySelector("#firstname-"+hbsptId)
					.placeholder = "Sam"
				form.querySelector("#email-"+hbsptId)
					.placeholder = "Sam@hello.com"

				// add normal button styling to submit
				form.querySelector("[type=submit]")
					.classList.add("btn", "btn-primary")

				form.addEventListener("submit", (e) => {
					if(!form.checkValidity()) return;
					// hide signup, show thank you
					form.style.display = "none"
					afterFormText.style.display = "block"
				});
			}
		});

		const _ = setTimeout(() => {
			const hbsptId = "0e8c944d-211b-4249-b63e-7bbad428afe5"
			let form = document.getElementById("hsForm_"+hbsptId)

			// add placeholders to both text inputs
			form.querySelector("#firstname-"+hbsptId)
				.placeholder = "Sam"
			form.querySelector("#email-"+hbsptId)
				.placeholder = "Sam@hello.com"

			// add normal button styling to submit
			let button = form.querySelector("[type=submit]")
			button.classList.add("btn", "btn-primary")
			button.value = "SUBSCRIBE"

			// add 'change page' on submit
			form.addEventListener("submit", (e) => {
				if(!form.checkValidity()){
					return
				}
			}) 
		}, 5000); // this is real dumb, but I can't seem to find what the trigger we want to hook onto. TODO stop this from being stupid
	}}

	addScript({src: scriptUrl, onload})

	return (
		<div id="get-involved">
			<Row id="social-TAG-row" className='flex-mobile-dir'>
				<div id="socials-cta" className="cta-card">
					<img className='cta-image' src="/img/Impact/gl-beach.jpg"/>
					<h2 className='color-gl-muddy-blue'>Follow Good-Loop</h2>
					<p className='text'>Keep an eye out for our events, courses and<br />career oppertunities</p>
					<SocialMediaLinks dark/>
				</div>
				<div id="TAG-cta" className="cta-card">
					<img className='cta-image' src="/img/Impact/tabs.png"/>
					<h2 className='color-gl-muddy-blue'>Browse With Us</h2>
					<p className='text'>Raise money for your favourite charity for<br />free, simply by opening new tabs</p>
					<a className='btn btn-primary' href="https://localmy.good-loop.com/tabsforgood" style={{textTransform:"unset"}}>Find out more</a>
				</div>
			</Row>
			<div id="email-cta">
				<script charset="utf-8" type="text/javascript" src="//js-eu1.hsforms.net/forms/embed/v2.js"></script>
				<h2 className='color-gl-muddy-blue'>Keep In Touch</h2>
				<p className='text'>Get a tree planted on your behalf and<br />recieve good news updates</p>
				<div id="hubspotForm" />
			</div>
		</div>
	)
}

export default CampaignImpact;