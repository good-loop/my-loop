import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardImg, CardText, CardTitle, Col, Container, Row } from 'reactstrap';
// import PV from 'promise-value';
import { useSpring } from 'react-spring';

import { space } from '../../base/utils/miscutils'
import DataStore from '../../base/plumbing/DataStore';
import LandingSection, { springPageDown } from '../LandingSection';
import {
	NewsAwards,
	LogoBanner,
	MyLandingSection,
	MyDataButton,
	CurvePageCard,
	PageCard,
	CurveTransition,
	TwinCards,
} from './CommonComponents';
import BG from '../../base/components/BG';
import { setFooterClassName } from '../Footer';
import { T4GHowItWorksButton, T4GSignUpButton } from '../T4GSignUp';
import { MyDataSignUpButton } from '../mydata/MyDataSignUp';
import TickerTotal from '../TickerTotal';
import Page from './AccountPage';

const HomePage = ({spring}) => {
	//spring the page down if asked to for how it works section
	const [, setY] = useSpring(() => ({ y: 0 }));

	if (spring) springPageDown(setY);

	// If we're currently in as.good-loop.com, and we have a glvert param defined, we should redirect to campaign page
	useEffect(() => {
		const urlParams = DataStore.getValue(['location', 'params']);
		if (Object.keys(urlParams).includes('gl.vert')) {
			window.location.href = `/campaign/?gl.vert=${urlParams['gl.vert']}`;
		}
		setFooterClassName("bg-gl-light-blue");
	}, []);

	// <ShareAdCard /> is buggy, so removed for now

	return (<>
		<div className="HomePage widepage">
			<MyLandingSection />
			<LogoBanner />
			<FindOutMoreSection />
			<LogoBanner logoList={['img/LandingBrand/H&M-Logo.png','img/LandingBrand/toms-shoes-logo.png','img/LandingBrand/universal-music-group-logo.png', 'img/LandingBrand/Logo_NIKE.png', 'img/LandingBrand/Unilever-logo.png']} />
			<SlideCardsSection />
			<NewsAwards nostars><h3 style={{fontWeight:'600'}}>As Featured In</h3></NewsAwards>
			<CurveTransition hummingBird curveColour='light-pink' />
			<StoriesSection />
			<DiscoverMoreCard />
			<MovementCard />
		</div>
	</>);
};

const FindOutMoreSection = () => {

	return (<><BG image='img/homepage/our-mission-background-lg.svg' style={{backgroundPosition:'center bottom'}} >
		<PageCard id="upper-cta" >
			<div className='text-center'>
				<div className='rasied text-white'>
					<span>TOGETHER WE'VE RAISED</span> <br/>
					<TickerTotal noPennies={true} /> <br/>
					<span>For Global Causes</span>
				</div>
				<div className="conversation-bubble position-relative d-flex align-items-center justify-content-center">
					<img style={{maxWidth:'480px'}} src="img/homepage/our-mission-blob-with-bubbles.svg"/>
					<div className="bubble-content position-absolute" style={{top:'20%',margin:'0 10%',maxWidth:'400px'}}>
						<h3 style={{fontWeight:'600',marginBottom:'0'}}>Our Mission</h3>
						<h5 style={{fontWeight:'unset'}}>Changing The World: Together</h5>
						<p style={{fontSize:'.9rem',marginTop:'1rem'}}>At My Good-Loop we're harnessing consumer power and advertising billions, <b>donating 50%</b> of ad spend to charity - <b>connecting you with brands to fund the causes you case most about.</b></p>
						<a href='#' className='text-decoration-none'><span style={{textDecoration:"underline",fontWeight:'600'}}>Our Impact</span> →</a>
					</div>
				</div>
			</div>
		</PageCard>
		</BG></>);
};

/**
 * CTA Cards for T4G & MyData
 */
const SlideCardsSection = () => {
	const MyDataHowItWorksButton = ({className}) =>
	<a className={space("text-decoration-none mt-3", className)}  href="/mydata#howitworks">
		<span style={{textDecoration:"underline"}}>How It Works</span> →
	</a>;

	return (<>
		<PageCard className="tabs-for-goods-slide-card" >
			<h3 className='text-center' style={{fontSize:'1.25rem'}}>Here's How You Can Get Involved</h3>
			<div className="gridbox gridbox-md-2 gridbox-gap-4">
				<Card className='border shadow'>
					<CardImg className='bg-gl-light-pink' variant="top" src="img/homepage/tabs-for-good-card.png" />
					<CardBody>
						<div>
							<CardTitle className='color-gl-red'>
								<span style={{fontWeight:'bold'}}>TABS FOR GOOD</span> <br/>
								Support A Charity Of Your Choice For Free
							</CardTitle>
							<CardText className='color-gl-darker-grey'>
								Convert your browsing into donations, simply by opening tabs with our desktop browser extension.
							</CardText>
						</div>
						<div className="buttons">
							<T4GSignUpButton className="w-100 mb-3"/>
							<T4GHowItWorksButton className="w-100 color-gl-red" />
						</div>
					</CardBody>
				</Card>
				<Card className='border shadow'>
					<a id="mydata-cta" />
					<CardImg className='bg-gl-lighter-blue' variant="top" src="img/homepage/my-data-product.png" />
					<CardBody>
						<div>
							<CardTitle className='color-gl-red'>
								<span style={{fontWeight:'bold'}}>MY.DATA</span> <br/>
								How Many Cookies Have You Accepted Today?
							</CardTitle>
							<CardText className='color-gl-darker-grey'>
								Don't just give it away - control your data and convert it into charity donations with My Data.
							</CardText>
						</div>
						<div className="buttons">
							<MyDataButton className="w-100" />
							<MyDataHowItWorksButton className="w-100 color-gl-red" />
						</div>
					</CardBody>
				</Card>
			</div>
		</PageCard>
	</>)
}

const StoriesSection = () => {
	const cardOne = {
		imgUrl: 'img/ourstory/Good-Loop_UsingAdMoneyForGoodWithBG.png',
		imgClass: 'bg-gl-light-pink',
		title: <span className='text-uppercase' style={{fontWeight:'bold'}}>We can make things happen?</span>,
		text: 'Our amazing community has so far supported everything from childhood literacy to coral reef protection and Black Lives Matter.',
		button: 'Discover Our Impact'
	}

	const cardTwo = {
		imgUrl: 'img/homepage/amyanddaniel.png',
		imgClass: 'bg-gl-blue',
		title: <span className='text-uppercase' style={{fontWeight:'bold'}}>How it all began</span>,
		text: 'My.Good-Loop is brought you by the team at Good-Loop, founded by Amy Williams and Daniel Winterstein.',
		button: 'Our Story'
	}

	return (
		<PageCard className='stories-section pt-0'>
			<h3 style={{textTransform:'unset',fontWeight:'600'}}>The My.Good-Loop Story</h3>
			<p className='color-gl-muddy-blue mb-0'>Converting the multi-billion dollar online advertsing industry into a force for good - with you.</p>
			{/* <TwinCards TwinCardsContent={[].concat(cardOne, cardTwo)} /> */}
			<div className="gridbox gridbox-md-2 gridbox-gap-4 text-center" style={{zIndex:'2'}}>
 				<Card className='border shadow'>
 					<CardImg className='bg-gl-light-pink' variant="top" src="img/ourstory/Good-Loop_UsingAdMoneyForGoodWithBG.png" />
 					<CardBody>
 						<div>
 							<CardTitle className='color-gl-red'>
 								<span className='text-uppercase' style={{fontWeight:'bold'}}>We can make things happen</span> <br/>
 							</CardTitle>
 							<CardText className='color-gl-darker-grey'>
 								Our amazing community has so far supported everything from childhood literacy to coral reef protection and Black Lives Matter.
 							</CardText>
 						</div>
 						<div className="buttons">
 							Discover Our Impact
 						</div>
 					</CardBody>
 				</Card>
 				<Card className='border shadow'>
 					<CardImg className='bg-gl-blue' variant="top" src="img/homepage/amyanddaniel.png" />
 					<CardBody>
 						<div>
 							<CardTitle className='color-gl-red'>
 								<span className='text-uppercase' style={{fontWeight:'bold'}}>How it all began</span> <br/>
 							</CardTitle>
 							<CardText className='color-gl-darker-grey'>
 								My.Good-Loop is brought you by the team at Good-Loop, founded by Amy Williams and Daniel Winterstein.
 							</CardText>
 						</div>
 						<div className="buttons">
 							Our Story
 						</div>
 					</CardBody>
 				</Card>
 			</div>
 			

			<div className="testimonial-blob position-relative d-flex align-items-center justify-content-center mt-5 pb-5">
				<img style={{maxWidth:'480px',zIndex:'1',margin:'0 -1rem'}} src="img/homepage/testimonial-blob-logo.svg"/>
				<div className="bubble-content position-absolute" style={{top:'20%',margin:'0 10%',maxWidth:'400px',zIndex:'2'}}>
					<img className='logo position-absolute' style={{top:'-3rem'}} src="img/homepage/quote-red.svg" alt="quote" /> <br/>
					<span className='color-gl-red' style={{fontSize:'.9rem'}}>We're delighted to name Good-Loop as one of our partners. By simply watching an advert, users can contribute to the WWF's mission of creating a world where people and wildwife can thrive together.</span> <br/>
					<div className="name-title color-gl-darker-grey mt-2" style={{fontSize:'.9rem'}}>
						<span>CHIARA CADEL,</span> <br/>
						<span>PARTNERSHIPS MANAGER, WWF</span>
					</div>
					<div className="text-center">
						<img style={{maxWidth:'2rem'}} src="img/LandingCharity/wwf_logo.png" alt="wwf" />
					</div>
				</div>
			</div>
		<img className="w-100 position-absolute" style={{bottom:'0',zIndex:'0',transform:'translate(-50%, 0)',left:'50%',maxWidth:'768px'}} src="img/homepage/world-map.svg" alt="world-map" />
		</PageCard>
	)
}

const DiscoverMoreCard = () => {
	const discoverContents = [
		{img: 'img/placeholder-circle.png',
		span: 'Download',
		linkTitle: 'Impact Report',
		href: 'https://good-loop.com/donations-report'},
		{img: 'img/placeholder-circle.png',
		span: 'Explore',
		linkTitle: 'Our Impact Hub',
		href: '/impactoverview'},
		{img: 'img/placeholder-circle.png',
		span: 'Read',
		linkTitle: 'Our Blog',
		href: 'https://good-loop.com/good-news/index'},
	]

	return(
		<PageCard>
			<h3 className='mb-3' style={{fontWeight:'600'}}>Discover More</h3>
			<Row>
				{discoverContents.map((content, index) => {
					return (
						<Col key={index} xs={4} className="text-center text-nowrap d-flex flex-column justify-content-between align-items-center" >
							<img className='shadow mx-3' style={{maxWidth:'80px',borderRadius:'50%'}} src={content.img} />
							<p className='m-0 mt-2 color-gl-light-blue'>{content.span}</p>
							<a className='color-gl-muddy-blue font-weight-bold' href={content.href}>{content.linkTitle}</a>
						</Col>
					)})}
			</Row>
		</PageCard>
	)
}

const MovementCard = () => {
	const movementContents = [
		{img: 'img/homepage/planet-positive.png',
		span: 'Good For The Planet'},
		{img: 'img/homepage/responsible-journalism.png',
		span: 'Supporting Responible Journalism'},
		{img: 'img/homepage/50-charity.png',
		span: '50% Of Ad Fees To Charity'},
	]

	return(<>
		<BG image='img/homepage/our-movement-bground-bg.svg' style={{backgroundPosition:'center top',zIndex:'-2'}}>
			<PageCard>
				<div className="movement-blob position-relative d-flex align-items-center justify-content-center pb-5">
					<img style={{maxWidth:'480px',zIndex:'1',margin:'0 -1rem'}} src="img/homepage/movement-blob-images.svg"/>
					<div className="bubble-content position-absolute text-center" style={{top:'18%',margin:'0 10%',maxWidth:'400px',zIndex:'2'}}>
						<h4 className='color-gl-red'>Join Our Movement</h4>
						<p className='color-gl-dark-grey'>Start Transforming Your Web Browsing And Data Into <b>Life Saving Vaccines, Meals For Children In Need, Habitats For Endangered Animals,</b> Plus Many More Good Causes.</p>
						<a className='color-gl-red font-weight-bold' href='#'><span style={{textDecoration:"underline"}}>Get Involved</span> →</a>
					</div>
				</div>
				<img className='position-absolute w-100 join-our-movement-bg-front' src="img/homepage/our-movement-bground-front.svg" />
			</PageCard>
		</BG>
		<PageCard className='text-center text-white bg-gl-light-blue pt-0'>
			<h4 className='m-0' style={{fontWeight:'600'}}>MY.GOOD-LOOP</h4>
			<p>By Good-Loop</p>
			<Row>
				{movementContents.map((content, index) => {
					return (
						<Col key={index} xs={12} md={4} className="text-center text-nowrap d-flex flex-column justify-content-between align-items-center" >
							<img className='mx-3' style={{maxWidth:'100px',borderRadius:'50%'}} src={content.img} />
							<p className='m-0 mt-2 font-weight-bold'>{content.span}</p>
						</Col>
				)})}
			</Row>
		</PageCard>
	</>)
}

/**
 * @deprecated Replaced by FindOutMoreSection
 * @returns {JSX.Element}
 */
const JoinOurMovement = () => <>	
	<PageCard id="upper-cta" className="tabs-for-goods-slide-card" >
		<div className="upper-cta white">
			<h1 className='mb-4 white'>Join Our Movement!</h1>
			<p className='leader-text text-center'>Start transforming your web browsing into life saving vaccines, meals for children in need, habitats for endangered animals, plus many more good causes.</p>
			<img src="/img/homepage/bird-cloud.png" className='top-right'/>
			<img src="/img/signup/hand-globe-coins.png" className='top-left'/>
		</div>
		<div className="gridbox gridbox-md-2 gridbox-gap-4">
				<Card>
					<CardImg variant="top" src="/img/homepage/slide-1.png" />
					<CardBody>
						<CardTitle><h3 className='gl-dark-blue'>Tabs for Good</h3></CardTitle>
						<CardText>Turn your web browsing into charity donations. Easy and free.</CardText>
						<T4GSignUpButton className="w-100"/>
						<T4GHowItWorksButton className="w-100" />
					</CardBody>
				</Card>
				<Card>
					<a id="mydata-cta" />
					<CardImg className='bg-gl-dark-blue' variant="top" src="/img/mydata/onboarding-2.png" />
					<CardBody>
						<CardTitle><h3 className='gl-dark-blue'>My.Data</h3></CardTitle>
						<CardText>
							Don't just give it away - support charity with your data
						</CardText>
						<MyDataSignUpButton id="mydata-signup-button" className="w-100 mt-3" /> {/* NB: assume the modal is on the page already */}
					</CardBody>
				</Card>
		</div>
	</PageCard>
</>;

export default HomePage;