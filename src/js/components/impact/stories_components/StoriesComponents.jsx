
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
import { addScript } from '../../../base/utils/miscutils';
import CampaignPage from '../../campaignpage/CampaignPage';


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
                    <p>{month}' {year} Campaign{subCampaigns ? "s" : ""} Launch{subCampaigns ? "" : "es"}</p>
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
    console.log("doncard", campaign, subCampaigns)
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

    const donations = impactDebits.map((debit, index) => {

        const charId = debit.impact.charity;
        const charity = charities.find((c) => c.id === charId)
        if (!charity) return;

        const img = charity.headerImage || "";
        const logo = charity.logo;
        const displayName = charity.displayName;
        const raised = debit.impact.amountGBP;

        return (
        <div className='impact-debit' key={index}>
            <img className="debit-header" src={img} alt={displayName + " header image"}/>
            <div className='debit-content'>
                <p className='debit-name'>{displayName}</p>
                <p className='debit-amount'>£{raised} RAISED...</p>
                <img className="debit-logo" src={logo} alt={displayName + " logo"} />
            </div>
        </div>
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
    const CharityLogos = charities.map((c, i) => <li style={{width:"15vh"}} key={i}><img style={{width:"100%"}} src={c.logo}/></li>)
    
    if(row) {
        CharityLogos.unshift(<li style={{width:"15vh"}} key={CharityLogos.length}><img style={{width:"100%"}} src={mainLogo}/></li>)
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