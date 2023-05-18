
import React from 'react';
import DataStore from '../../base/plumbing/DataStore';
import { Container, Row } from 'reactstrap';
import Circle from '../../base/components/Circle';
import NGO from '../../base/data/NGO';
import Money from '../../base/data/Money';
import C from '../../C';
import KStatus from '../../base/data/KStatus';
import Campaign from '../../base/data/Campaign';
import Advertiser from '../../base/data/Advertiser';
import {addAmountSuffixToNumber} from '../../base/utils/miscutils'
import { fetchBaseObjects } from './impactdata';
import { ErrorDisplay } from './ImpactComponents';
import ImpactLoadingScreen from './ImpactLoadingScreen';
import { addScript } from '../../base/utils/miscutils';
import CampaignPage from '../campaignpage/CampaignPage';

/**
 * Container for the new (as of 5/23) replacement for impact hub
 * Most up to date design : https://miro.com/app/board/uXjVMaoHMrI=/?share_link_id=8808857536 - specifically the B2C parts
 */
const CampaignImpact = () => {
    // setup page & check we have all the data we need
    const path = DataStore.getValue(['location', 'path']);
    const glVertiser = DataStore.getUrlValue('gl.vertiser');
	if ((path.length != 2 && !glVertiser) || path[0] !== "campaign") return <ErrorDisplay e={{error:"Invalid URL"}} />

	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
    const itemType = "campaign"
	const itemId = path[1]

    // before we fetch the data we need for stories, check to see if it's a legacy impact page
    // temporary wee hack as of 17/5/23, we can only reach this page if we choose to within the url! 
    const LEGACY_IMPACT_IDS = []
    if(glVertiser || LEGACY_IMPACT_IDS.includes(itemId) ||  ! DataStore.getUrlValue('newStories')) return <CampaignPage />;

    let pvBaseObjects = DataStore.fetch(['misc','impactBaseObjects',itemType,status,'all',itemId], () => {
		return fetchBaseObjects({itemId, itemType, status});
	});

    if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />
    if (! pvBaseObjects.resolved) return <ImpactLoadingScreen baseObj={pvBaseObjects}/>
	
    let {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits=[], charities=[]} = pvBaseObjects.value || {};
    masterBrand = masterBrand || brand;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
    if(impactDebits.length == 0) return <ErrorDisplay e={{message: "No impact debits found for this campaign"}} />

	// Returns NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);
	const totalString = Money.prettyStr(totalDonation);

    console.log("lewis: ", {campaign, brand, masterBrand, impactDebits, charities});

    // sort impact debits, ranking first by priority then by the cash value of the debit
	// "b - a" is used to invert the sort so [0] is the most impactful impact
	impactDebits.sort((a, b) => {
		let result = (b.impact.priority || 0) - (a.impact.priority || 0); // sort by priority
		if(result === 0) result = (b.impact.amountGBP || 0) - (a.impact.amountGBP || 0); // if equal, sort by GBP
        if(result === 0) result = b.id.CompareTo(a.id); // if equal, sort by id alphabetically 
		return result;
	});

    let firstImpact  = impactDebits[0] || null
    let secondImpact = impactDebits[1] || null
    const firstCharity = firstImpact && charities.find((char) => char.id === firstImpact.impact.charity) || {};
    const secondaryCharity = secondImpact && charities.find((char) => char.id === secondImpact.impact.charity) || {};

    const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;

    return (
        <Container id="ImpactB2C-container">
            <SplashCard masterBrand={masterBrand} impact={firstImpact} charity={firstCharity} totalString={totalString}/>
            <BrandLogoRows mainLogo={mainLogo} charities={charities} />
            <PoweredByGL />
            <HowItWorks campaign={campaign} charities={charities} totalString={totalString}/>
            <CardSeperator text={`Here's a Look At What You're Helping\nSupport With ${masterBrand.name}`} />
            {firstImpact && <CampaignImpactOne campaign={campaign} brand={brand} logo={mainLogo} charity={firstCharity} impactDebit={firstImpact}/>}
            {secondImpact && <CampaignImpactTwo campaign={campaign} brand={brand} logo={mainLogo} charity={secondaryCharity} impactDebit={secondImpact}/>}
            <MakingADifference logo={mainLogo} charities={charities} />
            <CardSeperator text={`Here's How You Can Keep Involved\nWith Good-Loop`} />
            <GetInvolvedCard />
            <DonationsCard campaign={campaign} brand={brand} impactDebits={impactDebits} charities={charities} />
            <LearnMore />
        </Container>
    )
}

/**
 * A thin card that contains just the supplied text,
 * @param {string} text  
 * @returns {React.ReactElement} 
 */
const CardSeperator = ({text}) => {
	return (
	<div className={"cardSeperator"}>
		<p className='text'>{text}</p>
	</div>
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
 * Card just containing {Brand Logo} \n {charity logos in rows}
 * @param {string} mainLogo charity logo url, falls back to brand logo
 * @param {Array<NGO>} charities charity logo url, falls back to brand logo
 * @returns {React.ReactElement} 
 */
const BrandLogoRows = ({mainLogo, charities}) => {
    const CharityLogos = charities.map((c, i) => <li key={i}><img src={c.logo}/></li>)
    return (
    <div id='brand-charities' style={{padding: "2%"}}>
        <div className='topRow'><img className='logo' src={mainLogo} style={{width: "100%"}}/></div>
        <ul style={{listStyleType: "none"}}>
            {CharityLogos}
        </ul>
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
 * Card describing to new users how watching ads leads to donations
 * @param {Campaign} campaign 
 * @param {Array<NGO>} charities
 * @param {string} totalString how much have we donated in total
 */
const HowItWorks = ({campaign, charities, totalString}) => {

    const startDate = campaign.created.substr(0, campaign.created.indexOf("T")).split("-"); // in format 2022-12-16T04:52:53, we don't care about anything after T
    const year = startDate[0].substr(2, 4); // get the decades only, will need patched in ~ 80 years
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][startDate[1] - 1]
    // get viewcount and format it into 2 sig figs & unit amount, eg 1,413,512 -> 1.4M
    const viewcount = addAmountSuffixToNumber(Number(Campaign.viewcount({campaign: campaign, status: KStatus.PUBLISHED}).toPrecision(2)));
    return (
        <div id="how-it-works" className='d-flex flex-column'>
            <div>
                <h2>How It Works</h2>
                <p className='text white'>With Good-Loop</p>
            </div>
            <div className="hiw-curve flex-mobile-dir">

                <div className='hiw-col'>
                    <h2>1.</h2>
                    <div className='white-circle'>
                        <img src="/img/Impact/this-ad-plants-trees.png" className='fill-img'/>
                    </div>
                    <p>{month}' {year} Camaign Launches</p>
                    <h3 className='white'>Every View Is<br />A Donation</h3> {/* TODO: figure out something closer to £N / VIEW to use here*/}
                </div>

                <div className='hiw-col'>
                    <h2>2.</h2>
                    <div className='white-circle'>
                        <img src="/img/Impact/OurStory_PeopleCrossingRoad.jpg" className='fill-img'/>
                    </div>                    
                    <p>Today</p>
                    <h3 className='white'>+{viewcount} People</h3>
                    <p className='text white'>Viewed The Advert So Far</p>
                </div>

                <div className='hiw-col'>
                    <h2>3.</h2>
                    <div className='white-circle'>
                        <img src={charities[0]?.headerImage} className='fill-img'/>
                    </div>
                    <p>After the Campagin</p>
                    <h3 className='white'>{totalString}+ In Donations</h3>
                    <p className='text white'>Funded By The Advert</p>
                </div>
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
const CharityArms = (i, logo) => {
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
 * For the 'most impactful' impact, we show a statistic & either a fact or another image
 * If the statistic is missing or we don't have enough images on the charity, return an empty element
 * @param {string} logo url for the logo of the charity 
 * @param {NGO} charity what charity will this impactDebit donate to?
 * @param {impactDebit} impactDebit the 'most impactful' impact the campaign has done
 * @returns {React.ReactElement} 
 */
const CampaignImpactOne = ({logo, charity, impactDebit}) => {

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
const CampaignImpactTwo = ({logo, impactDebit, charity}) => {
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
                    if(!form.checkValidity()){
                        return
                    }
                    // hide signup, show thank you
                    form.style.display = "none"
                    afterFormText.style.display = "block"
                    
                    })
            }
            })

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
    addScript({src: scriptUrl, onload:onLoad})

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

/**
 * For each impact debit, show its impact
 * TODO make each donation element into a modal that shows all the actual proof of the donation
 * @param {Campaign} campaign
 * @param {Advertiser} brand 
 * @param {Array<impactDebit>} impactDebits 
 * @param {Array<NGO>} charities
 * @returns {React.ReactElement} 
 */
const DonationsCard = ({campaign, brand, impactDebits, charities}) => {
    const getDate = (dateStr) => {
        let tempDate = dateStr.substr(0, dateStr.split("").findIndex((el) => el === "T")).split("-") // parse date 
        tempDate[1] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(tempDate[1]) - 1]
        return tempDate.reverse().join(" ") // [YYYY,MM,DD] -> "DD MM YYYY"
    }

    if(!campaign.created) return <></>
    let startDate = getDate(campaign.created)
    
    const endDate = campaign.end ? getDate(campaign.end) : "present";

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
 * Good Loop focused CTAs 
 * @returns {React.ReactElement} 
 */
const LearnMore = () => {

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
 * Puts a logo inside a white circle 
 * @param {string} logo url of the logo we want to show
 * @returns {React.ReactElement} 
 */
const circleLogo = ({logo}) => {
    return (
        <div className='logo-circle'>
            <img src={logo} className='logo'/>
        </div>
    )
}
export default CampaignImpact;