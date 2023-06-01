import React, { useEffect, useState, useRef } from 'react';
import DataStore from '../../../base/plumbing/DataStore';
import { useTransition, animated, useSpring } from 'react-spring';
import { Button, Col, Container, InputGroup, Row } from 'reactstrap';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop, markPageLoaded } from '../GLCards';
import KStatus from '../../../base/data/KStatus';
import {CardSeperator, CampaignImpactOne, CampaignImpactTwo, HowItWorks, DonationsCard, circleLogo, LearnMore, CharityArms, BrandLogoRows} from './StoriesComponents';
import { ErrorDisplay } from '../ImpactComponents';
import ImpactLoadingScreen from '../ImpactLoadingScreen';
import TODO from '../../../base/components/TODO';
import Money from '../../../base/data/Money';
import AdvertsCatalogue from '../../campaignpage/AdvertsCatalogue';
import Advert from '../../../base/data/Advert';
/**
 * 
 * @param {Object} p
 */
export const ImpactStoriesPage = ({pvBaseObjects, navToggleAnimation, totalString, brand, campaign, subBrands, charities, subCampaigns, impactDebits, mainLogo}) => {
	
	
	const path = DataStore.getValue(['location', 'path']);
    const glVertiser = DataStore.getUrlValue('gl.vertiser');
	//if ((path.length != 2 && !glVertiser) || path[0] !== "campaign") return <ErrorDisplay e={{error:"Invalid URL"}} />

	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
    const itemType = "campaign"
	const itemId = path[1]

    if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />
    if (! pvBaseObjects.resolved) return <ImpactLoadingScreen baseObj={pvBaseObjects}/>
	
	if(impactDebits.length == 0) return <ErrorDisplay e={{message: "No impact debits found for this campaign"}} />

    // sort impact debits, ranking first by priority then by the cash value of the debit
	// "b - a" is used to invert the sort so [0] is the most impactful impact
	impactDebits.sort((a, b) => {
		return 0;
		let result = (b.impact.priority || 0) - (a.impact.priority || 0); // sort by priority
		if(result === 0) result = (b.impact.amountGBP || 0) - (a.impact.amountGBP || 0); // if equal, sort by GBP
        if(result === 0) result = b.id.CompareTo(a.id); // if equal, sort by id alphabetically 
		return result;
	});

    let firstImpact  = impactDebits[0] || null
    let secondImpact = impactDebits[1] || null
    const firstCharity = firstImpact && charities.find((char) => char.id === firstImpact.impact.charity) || {};
    const secondaryCharity = secondImpact && charities.find((char) => char.id === secondImpact.impact.charity) || {};
	
	if (pvBaseObjects.resolved) console.log("base objs:", pvBaseObjects)
	// TODO refactor to break the code block below into shorter chunks so it's easier to see and edit
	// let mode = campaign ? 'campaign' : (mast)

	return (
	<>
		{pvBaseObjects.resolved &&
		<div className='iview-positioner pr-md-1'>

			<Container id="ImpactB2C-container" className='stories-container'>
				<Row>
					<animated.div className='impact-navbar-flow' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}}></animated.div>
					<Col style={{paddingRight: 0, overflow:"hidden"}}>
						<SplashCard brand={brand} campaigns={campaign} mainLogo={mainLogo}/>
						<BrandLogoRows mainLogo={mainLogo} charities={charities} row/>
						{firstImpact && <CardSeperator text={`Campaign Spotlight: ${firstImpact.name}`} />}
						{firstImpact && <CampaignSpotlight impact={firstImpact} charity={firstCharity} campaign={campaign} subCampaigns={subCampaigns} status={status}/>}
						<HowItWorks campaign={campaign} subCampaigns={subCampaigns} charities={charities} totalString={totalString}/>
						{firstImpact && <CardSeperator text={`Here's a Look At What You're Helping\nSupport With ${brand.name}`} />}
						{firstImpact && <CampaignImpactOne campaign={campaign} brand={brand} logo={mainLogo} charity={firstCharity} impactDebit={firstImpact}/>}
						{secondImpact && <CampaignImpactTwo campaign={campaign} brand={brand} logo={mainLogo} charity={secondaryCharity} impactDebit={secondImpact}/>}
						{firstImpact && <CardSeperator text={`Here's How You Can Keep Involved\nWith Good-Loop`} />}
						{firstImpact && <DonationsCard campaign={campaign} subCampaigns={subCampaigns} brand={brand} impactDebits={impactDebits} charities={charities} />}
						<LearnMore />
					</Col>
				</Row>
			</Container>
		</div>
		}
		<GLModalBackdrop/>
	</>
	);
};

const SplashCard = ({brand, mainLogo}) => {
	const logoCircle = circleLogo({logo:mainLogo});
	return (
		<div id='stories-splash'>
			<Row style={{height:"100%", position:"relative"}}>
				<img src={brand.branding?.backgroundImage || "/img/Impact/waves.svg"} style={{position:"absolute", height: "100%", width: "100%", overflow:"hidden", objectFit:"cover", zIndex:0}}/>
				<div className='padding-div'/>
				<img className="splash-curve" src="/img/Impact/splash-curve.svg" /> 
				<Col id='splash-content'>
					{logoCircle}
					<h1 className='color-gl-white' >Turning our advertising into a force for good</h1>
					<p className="text">Powered By Good-Loop</p>
					<img className="adsForGood" src="/img/Impact/AdsForGood.svg"/>
				</Col>
			</Row>
		</div>
	)
}

const CampaignSpotlight = ({impact, charity, campaign, subCampaigns, status}) => {

	if(!campaign) campaign = subCampaigns.find(c => (c.jobNumber == impact.jobNumber))

	let pvAds = Advert.fetchForCampaigns({campaignIds:[campaign.id], status:status});
	if(! pvAds.resolved) return <></>
	
    const startDate = impact.created.substr(0, impact.created.indexOf("T")).split("-"); // in format 2022-12-16T04:52:53, we don't care about anything after T
    const startYear = startDate[0]; // get the decades only, will need patched in ~ 80 years
    const startMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][startDate[1] - 1]
	const startDay = startDate[2]

	return (
		<div id="campaign-spotlight">
			<Row id="spotlight-bg">
				<div id="spotlight-bg-padding" />
				<img className="splash-curve" src="/img/Impact/splash-curve.svg" />
				<Col id="spotlight-bg-color" />
			</Row>
			<Row id="spotlight-content">
				<Col id='campaign-info'>
					<h1>£{Money.prettyString({amount: impact.impact.amountGBP})}</h1>
					<h2>Raised</h2>
					<h4 className='font'>Supporting {charity.displayName}</h4>
					<p className='font' id="spotlight-name">{impact.name}</p>
					<TODO>Check how we can actually tell a campaign is over
					<p className='font' id="spotlight-date">{startDay} {startMonth} {startMonth} - Present</p>
					</TODO>
				</Col>
				<Col id="spotlight-ads">
					<AdvertsCatalogue ads={pvAds.value.hits} noPreviews className='ads'/>
				</Col>
			</Row>
		</div>
	)
}