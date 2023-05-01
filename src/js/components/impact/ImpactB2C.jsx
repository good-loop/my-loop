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
import { fetchBaseObjects } from './impactdata';
import { ErrorDisplay } from './ImpactComponents';
import ImpactLoadingScreen from './ImpactLoadingScreen';
import { PlaceholderCard } from './ImpactPlaceholderCard';
import { AccordionCollapse } from 'react-bootstrap';

const CampaignImpact = () => {
    const path = DataStore.getValue(['location', 'path']);
    console.log("Lewis: path", path)
	if (path.length != 2 || path[0] !== "campaign") return <ErrorDisplay e={{error:"Invalid URL"}} />

	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;
    const itemType = "campaign"
	const itemId = path[1]

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
    const mainLogo = campaign?.branding?.logo || brand?.branding?.logo;
    return (
        <Container id="ImpactB2C-container">
            <SplashCard masterBrand={masterBrand} impactDebits={impactDebits} charities={charities} totalString={totalString}/>
            <BrandLogoRows mainLogo={mainLogo} charities={charities} />
            <PoweredByGL />
            <HowItWorks campaign={campaign} charities={charities} totalString={totalString}/>
            <CardSeperator text={`Here's a Look At What You're Helping\nSupport With ${masterBrand.name}`} />
            <CampaignImpactOne campaign={campaign} brand={brand} logo={mainLogo} charities={charities} impactDebits={impactDebits}/>
            <CampaignImpactTwo campaign={campaign} brand={brand} logo={mainLogo} charities={charities} impactDebits={impactDebits}/>
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

const SplashCard = ({masterBrand, impactDebits, charities, totalString}) => {
    charities = charities !== [] ? "Dogs Trust" : "WWE";

    return (
        <div className='story-card' id='i-splash'>        
        <div className='top-text-block'>
            <h2 className='white font-weight-bold'>Thank You</h2>
            <h3 className='white'>For Watching {masterBrand.name} Advert And <br /> Supporting {charities} !</h3>
        </div>

        <div id='splash-earth'>
            <p>Together We've Raised:</p>
            <h2>£{totalString}</h2>
            <p>And Counting</p>
        </div>
    </div>)

}

const BrandLogoRows = ({mainLogo, charities}) => {
    return (
    <div id='brand-charities' style={{padding: "2%"}}>
        <div className='topRow'><img className='logo' src={mainLogo} /></div>
        <div className='botRow'><img className='logo' src={mainLogo} /><img className='logo' src={mainLogo} /><img className='logo' src={mainLogo} /></div>
    </div>)
}

const PoweredByGL = () => {
    return (
        <div id='powered-by-gl'>
            <p className='text' style={{margin: 0}}>Your Donation Was Powered by Good-Loop</p>
            <img className='align-self-center mb-3' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
            <div className='row'>
                <button>tictok</button>
                <button>insta</button>
            </div>
      </div> 
)
}


const HowItWorks = ({campaign, charities, totalString}) => {

    const startDate = campaign.created.substr(0, campaign.created.indexOf("T")).split("-"); // in format 2022-12-16T04:52:53, we don't care about anything after T
    const year = startDate[0].substr(2, 4);
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][startDate[1] - 1]
    const viewcount = Campaign.viewcount({campaign: campaign, status: KStatus.PUBLISHED});

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
                    <h3 className='white'>X Is Donated</h3>
                    <p className='text white'>For Every View</p>
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
                        <img src={charities[0].headerImage} className='fill-img'/>
                    </div>
                    <p>After the Campagin</p>
                    <h3 className='white'>£{totalString}+ In Donations</h3>
                    <p className='text white'>Funded By The Advert</p>
                </div>
            </div>
        </div>
    )
}

const CampaignImpactOne = ({campaign, brand, logo, charities, impactDebits}) => {

    // find what debit has the most 'impact'
    // TODO get this to consider non-cash impact, currently we only care for the cold hard cash a campaign raised (no trees)
    const impact = impactDebits.reduce((acc, cur) => {
        return (cur.impact.amountGBP > acc.amountGBP) ? cur : acc;
    }, {amountGBP: -1, priority: -1})

    // if there's no charities, we can't show anything
    if(!charities || charities.length == 0) return <></>
    const charity = charities.find((char) => char.id === impact.impact.charity);

    // no images in the charity OR not enough OR 
    if(!charity || !charity.imageList || charity.imageList.length < 2) return <></>
    let fact = false || (charity.imageList.length >= 3 && <img src={charity.imageList[2].contentUrl} alt="charity image 2" style={{width:"100%", height:"100%", objectFit:"cover"}}/>)
 

    return (
        <div id="campaign-impact-one" className='campaign-impact'>
            
            <div id='charities-arms-logo'>
                <h2>hand~~</h2>
                <img className='logo' src={logo} />
                <h2>~~hand</h2>
            </div>

            <div className='impact-section'>
                <Row id="impact-one-toprow" className='impact-row '>
                    <div className='p-2 bg-gl-white left camp-impact-card camp-impact-img'>
                        <img src={charity.imageList[0].contentUrl} alt="charity image 1" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                    </div>
                    <div className='p-2 bg-gl-red right camp-impact-card'>
                        Impact Stats
                    </div>
                </Row>
                <Row id="impact-one-botrow" className='impact-row '>
                    <div className='p-2 bg-gl-darker-grey left camp-impact-card'>
                        Did You Know Bitesize Fact
                    </div>
                    <div className='p-2 bg-gl-white right camp-impact-card camp-impact-img'>
                        <img src={charity.imageList[1].contentUrl} alt="charity image 2" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                    </div>
                </Row>
            </div>

        </div>
    )
}

const CampaignImpactTwo = ({campaign, brand, logo, impactDebits, charities}) => {

    // this card needs to make use of a second impact, if it doesn't exist we can't use it!
    if(!impactDebits || impactDebits.length < 2) return <></>

    // find what debit has the second most 'impact'
    // TODO get this to consider non-cash impact, currently we only care for the cold hard cash a campaign raised (no trees)
    const impact = impactDebits.reduce((acc, cur) => {
        return (cur.impact.amountGBP > acc[0].impact.amountGBP) ? [cur, acc[0]] : acc; // keep track of two highest impacts
    }, [{impact: {amountGBP: -1}}, {}])[0]

    // if there's no charities, we can't show anything
    if(!charities || charities.length == 0) return <></>
    const charity = charities.find((char) => char.id === impact.impact.charity);

    // no images in the charity OR not enough OR 
    if(!charity || !charity.imageList || charity.imageList.length < 2) return <></>
    

    return (
        <div id="campaign-impact-two" className='campaign-impact'>

            <div id='charities-arms-logo'>
                <h2>hand~~</h2>
                <img className='logo' src={logo} />
                <h2>~~hand</h2>
            </div>

            <div className='impact-section'>
                <Row className='impact-row '>
                    <div className='p-2 bg-gl-red left camp-impact-card camp-impact-img'>
                        Charity Image
                    </div>
                    <div className='p-2 bg-gl-white  right camp-impact-card'>
                        Impact Stats
                    </div>
                </Row>
                <Row className='impact-row '>
                    <div className='p-2 bg-gl-white left camp-impact-card'>
                        Did You Know Bitesize Fact
                    </div>
                    <div className='p-2 bg-gl-light-pink right camp-impact-card camp-impact-img'>
                        Charity Image
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
    useEffect(() => {
        const script = document.createElement('script');
        script.src='https://js.hsforms.net/forms/v2.js';
        document.body.appendChild(script);
        script.addEventListener('load', () => {
            // @TS-ignore
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
                const test = setTimeout(() => {
                    const hbsptId = "0e8c944d-211b-4249-b63e-7bbad428afe5"
                    let form = document.getElementById("hsForm_"+hbsptId)
                    console.log("Lewis:", form)
                    // add placeholders to both text inputs
                    form.querySelector("#firstname-"+hbsptId)
                        .placeholder = "Sam"
                    form.querySelector("#email-"+hbsptId)
                        .placeholder = "Sam@hello.com"
            
                    // add normal button styling to submit
                    form.querySelector("[type=submit]")
                        .classList.add("btn", "btn-primary")
            
                    // add 'change page' on submit
                    form.addEventListener("submit", (e) => {
                        if(!form.checkValidity()){
                            return
                        }
                    }) 
                }, 5000);
                
            }
        });
    }, [])

    return (
        <div id="get-involved">
            <Row id="social-TAG-row">
                <div id="socials-cta">
                    <img className='cta-image' src="/img/Impact/gl-beach.jpg"/>
                    <h2 className='color-gl-muddy-blue'>Follow Good-Loop</h2>
                    <p className='text'>Keep an eye out for our events, courses and<br />career oppertunities</p>
                    <button>tictok</button>
                    <button>insta</button>
                </div>
                <div id="TAG-cta">
                    <img className='cta-image' src="/img/Impact/tabs.png"/>
                    <h2 className='color-gl-muddy-blue'>Browse With Us</h2>
                    <p className='text'>Raise money for your favourite charity for<br />free, simply by opening new tabs</p>
                    <button>Find out more</button>
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
            <div className='learn-more-box'>
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
export default CampaignImpact;