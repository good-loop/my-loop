import React from 'react';
import DataStore from '../../../base/plumbing/DataStore';
import { animated } from 'react-spring';
import { Col, Container, Row } from 'reactstrap';
import { GLModalBackdrop } from '../GLCards';
import KStatus from '../../../base/data/KStatus';
import {CardSeperator, CampaignImpactOne, CampaignImpactTwo, HowItWorks, DonationsCard, circleLogo, LearnMore, BrandLogoRows} from './StoriesComponents';
import { ErrorDisplay } from '../ImpactComponents';
import ImpactLoadingScreen from '../ImpactLoadingScreen';
import Money from '../../../base/data/Money';
import AdvertsCatalogue from '../../campaignpage/AdvertsCatalogue';
import Advert from '../../../base/data/Advert';
import DevOnly from '../../../base/components/DevOnly';
import PortalLink from '../../../base/components/PortalLink';
import ImpactDebit from '../../../base/data/ImpactDebit';
import Misc from '../../../MiscOverrides';
import { getId } from '../../../base/data/DataClass';

/** Sort function for ImpactDebit objects (currently no-op) */
const impactDebitComparator = (a, b) => {
	// sort impact debits, ranking first by priority then by the cash value of the debit
	// "b - a" is used to invert the sort so [0] is the most impactful impact
	let result = (b.impact.priority || 0) - (a.impact.priority || 0); // sort by priority
	if(result === 0) result = (b.impact.amountGBP || 0) - (a.impact.amountGBP || 0); // if equal, sort by GBP
	if(result === 0) result = (b.id || "").localeCompare(a.id || ""); // if equal, sort by id alphabetically
	return result;
};


/** 
 * @param {NGO[]} charities
 * @param {ImpactDebit} 
 * @returns {?NGO}
*/
const charityForImpact = (charities, {impact}) => {
	assert(charities, impact);
	if ( ! impact) return null;
	let charity = charities.find(charity => getId(charity) === impact.charity);
	if ( ! charity) {
		console.warn("Could not find charity "+impact.charity+" in ",charities);
	}
	return charity;
}
/**
 * the B2B pages is used between the impact hub & the public myloop page, /impact/stories/... & /campaign/... respectively
 * This component is just the page content and is used by both. Required to be split to allow impact hubs extra features
 */
const ImpactB2BContent = ({pvBaseObjects, totalString, mainLogo, footer}) => {
	if (!pvBaseObjects.resolved) return <ImpactLoadingScreen baseObj={pvBaseObjects}/>
	if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />

	const baseObjects = pvBaseObjects.value;
	let { brand, charities, impactDebits } = baseObjects;

	if (!impactDebits.length) return <ErrorDisplay e={{message: 'No impact debits found for this campaign'}} />

	const path = DataStore.getValue(['location', 'path']);
	const glVertiser = DataStore.getUrlValue('gl.vertiser');
	//if ((path.length != 2 && !glVertiser) || path[0] !== "campaign") return <ErrorDisplay e={{error:"Invalid URL"}} />

	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
	const itemType = "campaign"
	const itemId = path[1]

	impactDebits = impactDebits.sort(impactDebitComparator);

	const [firstImpact = null, secondImpact = null] = impactDebits;
	const firstCharity = charityForImpact(charities, firstImpact);
	const secondCharity = secondImpact && charityForImpact(charities, secondImpact);	
	return (
		<Col style={{paddingRight: 0, overflow: 'hidden'}}>
			<SplashCard {...baseObjects} mainLogo={mainLogo} />
			<BrandLogoRows {...baseObjects} mainLogo={mainLogo} row />
			{firstImpact && <CardSeperator text={`Here's What: ${brand.name}'s Campaign\nWith Good-Loop Has Achieved...`} />}
			{firstImpact && <CampaignSpotlight {...baseObjects} impact={firstImpact} charity={firstCharity} status={status} />}
			<HowItWorks {...baseObjects} totalString={totalString} />
			{firstImpact && <CardSeperator text={`Here's a Look At What You're Helping\nSupport With ${brand.name}`} />}
			{firstImpact && <CampaignImpactOne {...baseObjects} logo={mainLogo} charity={firstCharity} impactDebit={firstImpact} />}
			{secondImpact && <CampaignImpactTwo {...baseObjects} logo={mainLogo} charity={secondCharity} impactDebit={secondImpact} />}
			{firstImpact && <DonationsCard {...baseObjects} />}
			<LearnMore />
			{footer && <Footer charities={charities} mainLogo={mainLogo} />}
		</Col>
	)
};

export const ImpactB2B = ({pvBaseObjects, totalString, mainLogo, footer=false}) => {
	return (
		<div id="ImpactB2C-container" className='stories-container'>
			{ImpactB2BContent({pvBaseObjects, totalString, mainLogo, footer})}
		</div>
	)
}

export const ImpactStoriesB2B = ({pvBaseObjects, navToggleAnimation, totalString, mainLogo, footer=true}) => {
	return(
		<>
			<div className="iview-positioner pr-md-1">
				<Container id="ImpactB2C-container" className="stories-container">
					<Row>
						<animated.div className="impact-navbar-flow" style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}} />
						{ImpactB2BContent({pvBaseObjects, totalString, mainLogo, footer})}
					</Row>
				</Container>
			</div>
			<GLModalBackdrop/>
		</>
	)
}


const SplashCard = ({brand, mainLogo}) => {
	const logoCircle = circleLogo({logo: mainLogo});

	return (
		<div id='stories-splash'>
			<Row style={{height:"100%", position:"relative"}}>
				<img id="splash-bg" src={brand.branding?.backgroundImage || "/img/Impact/waves.svg"}/>
				<Row id="splash-curves" style={{height:"100%", position:"absolute"}}>
					<div className='padding-div'/>
					<img className="splash-curve" src="/img/Impact/splash-curve.svg" />
					<div className="splash-bgColor" />
				</Row>
				<Col id='splash-content'>
						{logoCircle}
						<h1 className='color-gl-white' >Turning our advertising into a force for good</h1>
						<p className="text">Powered By Good-Loop</p>
						<img className="adsForGood" src="/img/Impact/AdsForGood.svg"/>
				</Col>
				<img src="/img/Impact/curve-desat-blue.svg" className='splash-curve-mobile' id="splash-curve-mobile-1"/>
				<img src="/img/Impact/curve-desat-blue.svg" className='splash-curve-mobile' id="splash-curve-mobile-2"/>
			</Row>
		</div>
	)
}

/**
 * 
 * @param {Object} p
 * @param {ImpactDebit} p.impact 
 * @returns 
 */
const CampaignSpotlight = ({impact, charity, campaign, subCampaigns, status}) => {
	if ( ! charity) console.warn("no charity?! ",campaign,impact);
	if(!campaign) campaign = subCampaigns.find(c => 
		(c.id == impact.campaign) || (c.jobNumber == impact.campaign) || (c.jobNumber == impact.jobNumber)
	)
	let pvAds = Advert.fetchForCampaigns({campaignIds:[campaign.id], status:status});
	if(! pvAds.resolved) return <></>

	// dates (often not set)
	const start = impact.start;
	const end = impact.end;
	const date = impact.impact.date;
	// const startDate = impact.created.substr(0, impact.created.indexOf("T")).split("-"); // in format 2022-12-16T04:52:53, we don't care about anything after T
	// const startYear = startDate[0]; // get the decades only, will need patched in ~ 80 years
	// const startMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][startDate[1] - 1]
	// const startDay = startDate[2]
	const ads = pvAds.value.hits

	const isMobile = () => {
		return window.innerWidth < 768;
	}

	const adWithDecoration = ({ads, classNames}) => {
		return (
		<div className={`ad-deco-cont ${classNames}`}>
			<div className='spotlight-ad'>
				<AdvertsCatalogue ads={ads} noPreviews className='ads-catalogue' captions={false}/>
				<img className='phone-container' src="/img/Impact/iphone-frame-16-9-padded-notch.svg" />
			</div>
			<div className='spotlight-decoration'>
				<img className='decoration leaves leaves-1' src='/img/Impact/tadg-leaves.png'/>
				<img className='decoration leaves leaves-2' src='/img/Impact/tadg-leaves.png'/>
				<img className='decoration leaves leaves-3' src='/img/Impact/tadg-leaves.png'/>
				<img className='decoration leaves sparkle' src='/img/Impact/sparkle.png'/>
			</div>
		</div>
		)
	}

	return (
		<div id="campaign-spotlight">
			<img id="spotlight-bg" className="splash-curve" src="/img/Impact/earth-curve.png" />
			<Row id="spotlight-content">
				<Col id='campaign-info'>
					<div className='campaign-grouped-content'>
						<h1>£{Money.prettyString({amount: impact.impact.amountGBP})}</h1>
						<h2>Raised</h2>
						{charity && <h4 className='font'>Supporting {NGO.displayName(charity)}</h4>}
						<DevOnly><PortalLink item={charity} /></DevOnly>
						<ImpactInfo impact={impact.impact} />
					</div>
					{isMobile() && adWithDecoration({ads:[ads[0]], classNames:'mobile'})}
					<div className='campaign-grouped-content'>						
						<p>
							<Misc.RoughDate date={start} />
							{start && (end || date) && " - "}
							<Misc.RoughDate date={end || date} />
						</p>
					</div>
					<DevOnly><PortalLink item={impact} /></DevOnly>
				</Col>
				<Col id="spotlight-ads">
					{/* ads taken out of flow due to huge performance & styling issues when the navbar expands */}
				</Col>
			</Row>
			{!isMobile() && adWithDecoration({ads})}

		</div>
	);
};


/**
 * Can we say e.g. "10 trees planted"?
 * @param {*} param0 
 */
const ImpactInfo = ({impact}) => {
	if (impact.name && impact.n) {
		return <p>{impact.n} {impact.name}</p>
	}
	if (impact.name) {
		return <p>{impact.name}</p>
	}
	return null;
};


const Footer = ({charities, mainLogo}) => {
	const CharityLogos = charities.map((c, i) => <li style={{width:"15vh", alignSelf:"center"}} key={i}><img style={{width:"100%"}} src={c.logo}/></li>)

	return (
		<div id="impact-footer-container">
			<Col id='stories-footer' className='impact-footer'>
				<p className='text'>Advertising That's A Force For Good</p>
				<div className='topRow'><img className='logo' src={mainLogo} style={{width: "100%"}}/></div>
				<img className="adsForGood" src="/img/Impact/AdsForGood.svg" style={{width:"15vw"}}/>
				<ul style={{listStyleType: "none"}}>
					{CharityLogos}
				</ul>
			</Col>
			<img src="/img/Impact/images-combined.png" id="images-combined"/>
			<img src="/img/Impact/world-card.png" id="holding-world" />
		</div>
	);
};
