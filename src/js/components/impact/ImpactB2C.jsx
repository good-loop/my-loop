
import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { Card as CardCollapse } from '../../base/components/CardAccordion';
import TODO from '../../base/components/TODO';
import { Button, Col, Container, InputGroup, Row } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop, markPageLoaded } from './GLCards';
import NGO from '../../base/data/NGO';
import Money from '../../base/data/Money';
import CharityLogo from '../CharityLogo';
import C from '../../C';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import { getDataItem } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import List from '../../base/data/List';
import Campaign from '../../base/data/Campaign';
import Advertiser from '../../base/data/Advertiser';
import { getImpressionsByCampaignByCountry } from './impactdata';
import printer from '../../base/utils/printer'
import {addAmountSuffixToNumber} from '../../base/utils/miscutils'
import { fetchBaseObjects } from './impactdata';
import { ErrorDisplay } from './ImpactComponents';
import ImpactLoadingScreen from './ImpactLoadingScreen';
import { PlaceholderCard } from './ImpactPlaceholderCard';
import { addScript } from '../../base/utils/miscutils';
import LinkOut from '../../base/components/LinkOut';
import Icon from '../../base/components/Icon';
import CampaignPage from '../campaignpage/CampaignPage';

const CampaignImpact = () => {
    const path = DataStore.getValue(['location', 'path']);
	if (path.length != 2 || path[0] !== "campaign") return <ErrorDisplay e={{error:"Invalid URL"}} />

	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
    const itemType = "campaign"
	const itemId = path[1]

    // before we fetch the data we need for stories, check to see if it's a legacy impact page
    const LEGACY_IMPACT_IDS = []
    if(LEGACY_IMPACT_IDS.includes(itemId)) return <CampaignPage />;

    let pvBaseObjects = DataStore.fetch(['misc','impactBaseObjects',itemType,status,'all',itemId], () => {
		return fetchBaseObjects({itemId, itemType, status});
	});

    if (pvBaseObjects.error) return <ErrorDisplay e={pvBaseObjects.error} />
    if (! pvBaseObjects.resolved) return <ImpactLoadingScreen baseObj={pvBaseObjects}/>
	
    let {campaign, brand, masterBrand, subBrands, subCampaigns, impactDebits=[], charities=[]} = pvBaseObjects.value || {};
    masterBrand = masterBrand || brand;

	let totalDonation = Money.total(impactDebits.map(debit => debit?.impact?.amount || new Money(0)));
	// Returns NaN if impactDebits is an empty array
	if (isNaN(totalDonation.value)) totalDonation = new Money(0);
	const totalString = Money.prettyStr(totalDonation);

    console.log("lewis: ", {campaign, brand, masterBrand, impactDebits, charities});

    // sort impact debits, ranking first by priority then by the cash value of the debit
	// "b - a" is used to invert the sort so [0] is the most impactful impact
	impactDebits.sort((a, b) => {
		let result = (b.impact.priority || 0) - (a.impact.priority || 0);
		if(result === 0) result = (b.impact.amountGBP || 0) - (a.impact.amountGBP || 0);
		return result;
	});
    console.log(impactDebits)
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
            {firstImpact && <CampaignImpactTwo campaign={campaign} brand={brand} logo={mainLogo} charity={firstCharity} impactDebit={firstImpact}/>}
            <MakingADifference logo={mainLogo} charities={charities} />
            <CardSeperator text={`Here's How You Can Keep Involved\nWith Good-Loop`} />
            <GetInvolvedCard />
            <DonationsCard campaign={campaign} brand={brand} impactDebits={impactDebits} charities={charities} />
            <LearnMore />
        </Container>
    )
}


const CardSeperator = ({text}) => {
	return (
	<div className={"cardSeperator"}>
		<p className='text'>{text}</p>
	</div>
	)
} 

const SplashCard = ({masterBrand, impact, charity, totalString}) => {
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

const BrandLogoRows = ({mainLogo, charities}) => {
    const CharityLogos = charities.map((c, i) => <li><img key={i} src={c.logo}/></li>)
    return (
    <div id='brand-charities' style={{padding: "2%"}}>
        <div className='topRow'><img className='logo' src={mainLogo} style={{width: "100%"}}/></div>
        <ul style={{listStyleType: "none"}}>
            {CharityLogos}
        </ul>
    </div>)
}

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

function SocialMediaLinks({dark}) {
    const instagramImg = dark ? "/img/getinvolved/instagram-round.png" : "/img/footer/insta_icon.200w.png"  
    const facebookImg = dark ?  "/img/getinvolved/facebook-round.png" : "/img/footer/facebook_icon.200w.png"
    const twitterImg = dark ?   "/img/getinvolved/twitter-round.png" : "/img/footer/twitter_icon.200w.png"  

    return (<>
        <Row>
            <C.A className="" href={C.app.instagramLink}> <img src={instagramImg} alt="instagram logo" className='link-logo' /></C.A>
            <C.A className="ml-2" href={C.app.facebookLink}> <img src={facebookImg} alt="facebook logo" className='link-logo' /></C.A>        
            <C.A className="ml-2" href={C.app.twitterLink}> <img src={twitterImg} alt="twitter logo" className='link-logo' /></C.A>
        </Row>
    </>);
}

const HowItWorks = ({campaign, charities, totalString}) => {

    const startDate = campaign.created.substr(0, campaign.created.indexOf("T")).split("-"); // in format 2022-12-16T04:52:53, we don't care about anything after T
    const year = startDate[0].substr(2, 4);
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][startDate[1] - 1]
    // get viewcount and format it into 2 sig figs & unit amount, eg 1,413,512 -> 1.4M
    const viewcount = addAmountSuffixToNumber(Number(Campaign.viewcount({campaign: campaign, status: KStatus.PUBLISHED}).toPrecision(2)));
    return (
        <div id="how-it-works" className='d-flex flex-column'>
            <div>
                <h2>How It Works</h2>
                <p className='text white'>With Good-Loop</p>
            </div>
            <div className='hiw-curve'>

                <div className='hiw-col'>
                    <h2>1.</h2>
                    <div className='white-circle'>
                        <img src="/img/Impact/this-ad-plants-trees.png" className='fill-img'/>
                    </div>
                    <p>{month}' {year} Camaign Launches</p>
                    <h3 className='white'>Every View Is<br />A Donation</h3>
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

const CharityArms = (i, logo) => {
    return (
    <div className='charities-arms-logo'>
        <img src="/img/mydata/supporting.png" alt="spark-decoration" className='spark spark-1'/>
        <img src="/img/mydata/supporting.png" alt="spark-decoration" className='spark spark-2'/>
        <img src={`/img/Impact/arm-${i}-l.png`} className='arm arm-left'/>
        <img src={`/img/Impact/arm-${i}-r.png`} className='arm arm-right'/>
        {circleLogo({logo:logo})}
    </div>)
}

const CampaignImpactOne = ({campaign, brand, logo, charity, impactDebit}) => {
    const placeholderText = {
        cause : "Supporting Food Redistribution",
        stats : "providing meals for children in need",
        dyk : "Over 3 million tonnes of the food that goes to waste each year is still edible - enough for 7 billion meals",
        dyk_source : {name: "The Food Foundation", src:"https://foodfoundation.org.uk/initiatives/food-insecurity-tracking"},
        projectTitle : "Placeholder Title",
        projectDesc : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porttitor semper purus et convallis. Duis mauris tellus, congue a sapien vel, hendrerit maximus magna. Sed eu dolor lacinia, vulputate est sit amet, volutpat tortor. Proin congue nunc sed libero rutrum placerat. Sed vulputate fermentum varius. Donec varius, arcu et finibus aliquet, orci sapien mollis turpis, vitae blandit justo quam ut sem. Duis convallis bibendum mauris quis suscipit. Cras metus neque, mollis sit amet semper vitae, fringilla ut lacus. Vestibulum iaculis ipsum orci, non ultrices sem rutrum et. Nulla facilisi. Proin dapibus blandit bibendum. Nunc et porta nunc.\n\nPraesent nunc ipsum, faucibus non scelerisque a, bibendum eget dolor. Vivamus dignissim, risus et fringilla volutpat, nisi magna interdum risus, sit amet faucibus ligula mauris vel neque. Praesent lacinia pellentesque elit, sit amet molestie nunc molestie ut. Suspendisse potenti. Curabitur a arcu nunc. Aenean vestibulum nisi tempus hendrerit tempus. Suspendisse potenti. In vestibulum leo vel tristique venenatis. Duis ut felis justo. Suspendisse ut accumsan tellus. Quisque sagittis magna urna, ut varius urna pellentesque a. Maecenas vel mollis ligula, at vehicula nisi."
    }

    console.log("Lewis chars", impactDebit, charity)
    // no images in the charity OR not enough OR 
 

    return (
        <div id="campaign-impact-one" className='campaign-impact'>
            {CharityArms(1, (charity.logo || logo))}


            <div className='impact-section'>
                <Row id="impact-one-toprow" className='impact-row '>
                    <div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
                        <img src={charity.imageList[0].contentUrl} alt="charity image 1" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                    </div>
                    <div className='p-2 bg-gl-red right camp-impact-card'>
                        <img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve dark-curve" />
                        <img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve normal-curve" />
                        <div className='cause-container'>
                            <p className='cause'>{placeholderText.cause}</p>
                            <h2 className='description'>{placeholderText.stats}</h2>
                            <p className='with-charity'>With {charity.name}</p>
                        </div>
                    </div>
                </Row>
                <Row id="impact-one-botrow" className='impact-row '>
                    <div className='p-2 bg-gl-darker-grey left camp-impact-card'>
                        <img src="/img/Impact/did-you-know.svg" className='quote-box'/>
                        <div className='dyk-container'>
                            <p className='dyk'>Did You Know?</p>
                            <p className='fact'>{placeholderText.dyk}</p>
                            <p className='source'>Source: <a className="source-link" href={placeholderText.dyk_source.src}>{placeholderText.dyk_source.name}</a></p>
                        </div>
                    </div>
                    <div className='p-2 bg-gl-white right camp-impact-card camp-impact-img'>
                        <img src={charity.imageList[1].contentUrl} alt="charity image 2" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                    </div>
                </Row>
            </div>

        </div>
    )
}

const CampaignImpactTwo = ({campaign, brand, logo, impactDebit, charity}) => {
    // this card needs to make use of a second impact, if it doesn't exist we can't use it!

    const placeholderText = {
        cause : "Supporting Food Banks",
        stats : "providing families with food from their local food bank",
        dyk : "Over 3 million tonnes of the food that goes to waste each year is still edible - enough for 7 billion meals",
        dyk_source : {name: "The Trussel Trust", src:"https://foodfoundation.org.uk/initiatives/food-insecurity-tracking"},
        projectTitle : "Placeholder Title",
        projectDesc : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porttitor semper purus et convallis. Duis mauris tellus, congue a sapien vel, hendrerit maximus magna. Sed eu dolor lacinia, vulputate est sit amet, volutpat tortor. Proin congue nunc sed libero rutrum placerat. Sed vulputate fermentum varius. Donec varius, arcu et finibus aliquet, orci sapien mollis turpis, vitae blandit justo quam ut sem. Duis convallis bibendum mauris quis suscipit. Cras metus neque, mollis sit amet semper vitae, fringilla ut lacus. Vestibulum iaculis ipsum orci, non ultrices sem rutrum et. Nulla facilisi. Proin dapibus blandit bibendum. Nunc et porta nunc.\n\nPraesent nunc ipsum, faucibus non scelerisque a, bibendum eget dolor. Vivamus dignissim, risus et fringilla volutpat, nisi magna interdum risus, sit amet faucibus ligula mauris vel neque. Praesent lacinia pellentesque elit, sit amet molestie nunc molestie ut. Suspendisse potenti. Curabitur a arcu nunc. Aenean vestibulum nisi tempus hendrerit tempus. Suspendisse potenti. In vestibulum leo vel tristique venenatis. Duis ut felis justo. Suspendisse ut accumsan tellus. Quisque sagittis magna urna, ut varius urna pellentesque a. Maecenas vel mollis ligula, at vehicula nisi."
    }

    console.log("Lewis chars", impactDebit, charity)
    // no images in the charity OR not enough OR 
 

    return (
        <div id="campaign-impact-two" className='campaign-impact'>

            {CharityArms(2, (charity.logo || logo))}

            <div className='impact-section'>
                <Row className='impact-row' id="row-1">
                    <div className='p-2 bg-gl-red right camp-impact-card' style={{position:"relative"}}>
                        <img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve dark-curve" />
                        <img src="/img/Impact/redcurve.svg" alt="redcurve background" className="curve normal-curve" />
                        <div className='cause-container'>
                            <p className='cause'>{placeholderText.cause}</p>
                            <h2 className='description'>{placeholderText.stats}</h2>
                            <p className='with-charity'>With {charity.name}</p>
                        </div>
                    </div>
                    <div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
                        <img src={charity.images} alt="charity image 1" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                    </div>
                </Row>
                <Row className='impact-row' id="row-2">
                    <div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
                        <img src={charity.imageList[3].contentUrl} alt="charity image 1" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                    </div>
                    <div className='p-2 bg-gl-light-pink right camp-impact-card camp-impact-img'>
                        <img src="/img/Impact/heart.png" className="heart-bg" />
                        <h2 className='color-gl-light-red mb-4'>Helping Fund Project Title</h2>
                        <p className='project-desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porttitor semper purus et convallis. Duis mauris tellus, congue a sapien vel, hendrerit maximus magna. Sed eu dolor lacinia, vulputate est sit amet, volutpat tortor. Proin congue nunc sed libero rutrum placerat. Sed vulputate fermentum varius. Donec varius, arcu et finibus aliquet, orci sapien mollis turpis, vitae blandit justo quam ut sem. Duis convallis bibendum mauris quis suscipit.<br /> Vestibulum iaculis ipsum orci, non ultrices sem rutrum et. Nulla facilisi. Proin dapibus blandit bibendum. Nunc et porta nunc.\n\nPraesent nunc ipsum, faucibus non scelerisque a, bibendum eget. </p>
                    </div>
                </Row>
            </div>

        </div>
    )
}

const MakingADifference = ({logo, charities}) => {
    console.log("chars", charities)
    
    const CharityLogos = charities.map((c, i) => <li><img key={i} src={c.logo}/></li>)
    

    console.log(CharityLogos)
    return (
        <div id="impact-making-a-diff">
            <div id="together-we-can-make-a-diff">
                <h2 className="color-gl-light-red" >Together we can make a difference -<br />brands, consumers and charities</h2>
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

        console.log("test: ", window.hbspt.forms);
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
            <Row id="social-TAG-row">
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
            <h2 className='text header-text'>{brand.name}'s Campaign{impactDebits.length > 1 ? "s" : ""} With Good-Loop</h2>
            <p className='text dates'>{startDate} - {endDate}</p>
            <div id="donation-details">
                {donations}
            </div>
        </div>

    )
}

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
            <h2 id="learn-more-text text">Learn More</h2>
            <Row className='link-row'>
                {links}
            </Row>
        </div>
    )
}

const circleLogo = ({logo}) => {
    return (
        <div className='logo-circle'>
            <img src={logo} className='logo'/>
        </div>
    )
}
export default CampaignImpact;