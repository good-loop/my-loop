import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardImg, CardText, CardTitle, Col, Container, Row } from 'reactstrap';
import { useSpring } from 'react-spring';

import { isMobile, space } from '../../base/utils/miscutils'
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
	ArrowLink,
} from './CommonComponents';
import BG from '../../base/components/BG';
import { setFooterClassName } from '../Footer';
import { T4GHowItWorksButton, T4GSignUpButton } from '../T4GSignUp';
import { MyDataSignUpButton, MyDataSignUpModal } from '../mydata/MyDataSignUp';
import TickerTotal from '../TickerTotal';
import Page from './AccountPage';

const HomePage = ({ spring }) => {
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
			<LogoBanner logoList={['img/LandingBrand/H&M-Logo.png', 'img/LandingBrand/toms-shoes-logo.png', 'img/LandingBrand/universal-music-group-logo.png', 'img/LandingBrand/Logo_NIKE.png', 'img/LandingBrand/Unilever-logo.png']} />
			<SlideCardsSection />
			<NewsAwards nostars><h3 style={{ fontWeight: '600' }}>As Featured In</h3></NewsAwards>
			<CurveTransition hummingBird curveColour="light-pink" />
			<StoriesSection />
			<DiscoverMoreCard />
			<MovementCard />
		</div>
	</>);
};

const FindOutMoreSection = () => {

	return (<><BG image="img/homepage/our-mission-background-lg.svg" style={{ backgroundPosition: 'center bottom' }} >
		<PageCard id="upper-cta" >
			<div className="text-center">
				<div className="raised text-white" style={{ fontFamily: 'Montserrat' }}>
					<span>TOGETHER WE'VE RAISED</span> <br />
					<TickerTotal noPennies={true} style={{ fontWeight: '900' }} /> <br />
					<span>For Global Causes</span>
				</div>
				<div className="conversation-bubble position-relative d-flex align-items-center justify-content-center">
					<img className="w-100" style={{ maxWidth: '480px' }} src="img/homepage/our-mission-blob.svg" />
					<img className="position-absolute" style={{ width: (isMobile() ? '1024px' : '1400px'), top: (isMobile() ? '-10em' : '-13em'), left: (isMobile() ? '-18em' : '') }} src="img/homepage/our-mission-images-lg.png" />
					<div className="bubble-content position-absolute" style={{ top: (isMobile() ? '12%' : '20%'), margin: '0 10%', maxWidth: '400px' }}>
						<h3 style={{ fontWeight: '600', marginBottom: '0' }}>Our Mission</h3>
						<h5 style={{ fontWeight: 'unset' }}>Changing The World: Together</h5>
						<p style={{ fontSize: '.9rem', marginTop: '1rem' }}>At My Good-Loop we're harnessing consumer power and advertising billions, <b>donating 50%</b> of ad spend to charity - <b>connecting you with brands to fund the causes you care most about.</b></p>
						<a href="/ourimpact" className="text-decoration-none"><span style={{ textDecoration: "underline", fontWeight: '600' }}>Our Impact</span> →</a>
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

	const cardOne = {
		imgUrl: 'img/homepage/tabs-for-good-card.png',
		imgClass: 'bg-gl-light-pink',
		title: <><span style={{ fontWeight: 'bold' }}>TABS FOR GOOD</span> <br />Support A Charity Of Your Choice For Free</>,
		text: 'Convert your browsing into donations, simply by opening tabs with our desktop browser extension',
		button: <><T4GSignUpButton className="w-100 mb-3" />	<T4GHowItWorksButton className="w-100 color-gl-red" /></>
	}

	// To quickly remove all references of My.Data, a TwinCards component had to be removed.
	// Due to unfamilairity with all of our components, going into TwinCards & taking out what's returned for one of the cards -
	// - seemed like the fastest approach that wouldn't have adverse affects.
	let OneCard = ({ cardData }) => (
		<>
			<div className="text-center mt-5" style={{ zIndex: '2' }}>
				<Row style={{ height: '30em' }} className="shadow">
					<Col md={6} className="p-0 d-none d-md-block">
						<BG image={cardData.imgUrl} className={space(cardData.imgClass, "h-100 w-100 rounded")}
							style={{ backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }} />
					</Col>
					<Col md={6} className="p-0">
						<Card className="m-0 w-100 h-100 p-5">
							<CardBody className="d-flex justify-content-center">
								<div>
									<CardTitle className="color-gl-red">
										{cardData.title}
									</CardTitle>
									<CardText className="color-gl-darker-grey">
										{cardData.text}
									</CardText>
								</div>
								<div className="buttons mt-3">
									{cardData.button}
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
			<img src="img/TabsForGood/sparkle.png" className="logo my-3" />
		</>)

	/*const cardTwo = {
		imgUrl: 'img/homepage/my-data-product.png',
		imgClass: 'bg-gl-lighter-blue',
		title: <><span style={{ fontWeight: 'bold' }}>MY.DATA</span> <br />How Many Cookies Have You Accepted Today?</>,
		text: "Don't just give your data away - control your data and convert it into charity donations with My.Data",
		button: <><MyDataSignUpModal /><MyDataButton className="w-100" /> <ArrowLink className="w-100 color-gl-red" link="/getmydata#howitworks" >How it works</ArrowLink></>
	}*/

	return (<>
		<PageCard className="tabs-for-goods-slide-card" >
			<h3 className="text-center" style={{ fontSize: '1.25rem' }}>here's how you can get involved</h3>
			<p className="text-center d-none d-md-block color-gl-muddy-blue">As well as our adverts, we're creating some smart ways to help you do some good every day, for free...</p>
			{/*<TwinCards twinCardsContent={[].concat(cardOne, cardTwo)} /> */}
			<OneCard cardData={cardOne} />
		</PageCard>
	</>)
}

const StoriesSection = () => {
	const cardOne = {
		imgUrl: 'img/ourstory/Good-Loop_UsingAdMoneyForGoodWithBG.png',
		imgClass: 'bg-gl-light-pink',
		title: <span className="text-uppercase" style={{ fontWeight: 'bold' }}>We can make things happen</span>,
		text: 'Our amazing community has so far supported everything from childhood literacy to coral reef protection and Black Lives Matter.',
		button: <ArrowLink className="w-100 color-gl-red" link="/ourimpact" >Discover our Impact</ArrowLink>
	}

	const cardTwo = {
		imgUrl: 'img/homepage/amyanddaniel.png',
		imgClass: 'bg-gl-blue',
		title: <span className="text-uppercase" style={{ fontWeight: 'bold' }}>How it all began</span>,
		text: 'My.Good-Loop is brought you by the team at Good-Loop, founded by Amy Williams and Daniel Winterstein.',
		button: <ArrowLink className="w-100 color-gl-red" link="/ourstory">Our Story</ArrowLink>
	}

	const testimonialOne = {
		onMobileClass: 'd-flex',
		quoteImg: 'img/homepage/quote-red.svg',
		quoteClass: 'color-gl-red',
		quoteBg: 'img/homepage/testimonial-blob.svg',
		quote: "We're delighted to name Good-Loop as one of our partners. By simply watching an advert, users can contribute to the WWF's mission of creating a world where people and wildlife can thrive together.",
		name: 'CHIARA CADEL',
		title: 'PARTNERSHIPS MANAGER, WWF',
		logo: 'img/LandingCharity/wwf_logo.png',
		bobLogo: 'img/homepage/bubble-leopard.png',
	}

	const testimonialTwo = {
		onMobileClass: 'd-none d-xl-flex',
		quoteImg: 'img/homepage/quote-blue.svg',
		quoteClass: 'color-gl-muddy-blue',
		quoteBg: 'img/homepage/testimonial-blob-mid.svg',
		quote: <><b>Thanks to (Good-Loop) and their viewers, over £20,000 has been raised for our organisation.</b> <br /><br /> Funds such as these help us to stand up for bees and other insects, work with farmers, organisations and landowners to manage their land in wildlife-friendly ways, and support our work to secure better protection for our precious marine mammals.</>,
		name: 'LEANNE MANCHESTER',
		title: 'DIGITAL MARKETING MANAGER, THE WILDLIFE TRUSTS',
		logo: 'img/homepage/TWT_LOGO.png',
		bobLogo: 'img/homepage/bubble-wildlife.png',
	}

	const testimonialThree = {
		onMobileClass: 'd-none d-xl-flex',
		quoteImg: 'img/homepage/quote-red.svg',
		quoteClass: 'color-gl-red',
		quoteBg: 'img/homepage/testimonial-blob-long.svg',
		quote: <><b>We are delighted to be working with Good-Loop and their partnering brands. Good-Loop are incredibly proactive and deliver excellent levels of stewardship. </b> <br /><br /> Donation values have recently doubled and they continue to support children throughout the globe by partnering with Save the Children. Over £45,000 has been raised in the short period our partnership has been established. Sincere thanks for your ongoing support.</>,
		name: 'BECCA MCNAIR',
		title: 'COMMUNITY FUNDRAISING AND ENGAGEMENT MANAGER, SAVE THE CHILDREN UK',
		logo: 'img/LandingCharity/save-the-children.png',
		bobLogo: 'img/homepage/bubble-kids.png',
		spanFontSize: '.8rem',
	}

	return (
		<PageCard className="stories-section pt-0">
			<h3 className="text-md-center" style={{ textTransform: 'unset', fontWeight: '600' }}>The My.Good-Loop Story</h3>
			<p className="color-gl-muddy-blue mb-0 text-md-center">Converting the multi-billion dollar online advertising industry into a force for good - with you.</p>
			<TwinCards twinCardsContent={[].concat(cardOne, cardTwo)} />

			<div className="testimonials-section">
				{[].concat(testimonialOne, testimonialTwo, testimonialThree).map((testimonial, index) => {
					let bubbleTop = '20%'
					if (testimonial.quoteBg && testimonial.quoteBg !== 'img/homepage/testimonial-blob.svg') bubbleTop = '12%';
					if (!testimonial.spanFontSize) testimonial.spanFontSize = '.9rem'
					return (
						<div className={space(testimonial.onMobileClass, 'testimonial-blob align-items-center justify-content-center mt-5 pb-5')} key={index} >
							<img style={{ width: '480px', zIndex: '1', margin: '0 -1rem' }} src={testimonial.quoteBg} />
							<img className="bubble-image position-absolute" style={{ zIndex: '1', maxHeight: '7rem', right: 0, bottom: '1rem' }} src={testimonial.bobLogo} />
							<div className="bubble-content position-absolute" style={{ top: bubbleTop, margin: '0 10%', maxWidth: '380px', zIndex: '2' }}>
								<img className="logo position-absolute" style={{ top: '-3rem' }} src={testimonial.quoteImg} alt="quote" /> <br />
								<span className={testimonial.quoteClass} style={{ fontSize: testimonial.spanFontSize }}>{testimonial.quote}</span> <br />
								<div className="name-title color-gl-darker-grey mt-2" style={{ fontSize: '.9rem' }}>
									<span>{testimonial.name},</span> <br />
									<span>{testimonial.title}</span>
								</div>
								<div className="text-center">
									<img style={{ maxHeight: '2rem' }} src={testimonial.logo} alt="wwf" />
								</div>
							</div>
						</div>
					)
				})}
			</div>

			<img className="w-100 position-absolute" style={{ bottom: '0', zIndex: '0', transform: 'translate(-50%, 0)', left: '50%', maxWidth: '768px' }} src="img/homepage/world-map.svg" alt="world-map" />
		</PageCard>
	)
}

export const DiscoverMoreCard = ({ title = "Discover More", subtitle, discoverContents }) => {
	if (!discoverContents) discoverContents = [
		{
			img: 'img/mydata/product-page/links-t4g.png',
			span: 'Install',
			linkTitle: 'Tabs for Good',
			href: '/tabsforgood'
		},
		{
			img: 'img/mydata/product-page/links-our-impact.png',
			span: 'Explore',
			linkTitle: 'Our Impact Hub',
			href: '/impactoverview'
		},
		{
			img: 'img/mydata/product-page/links-our-story.png',
			span: 'Read',
			linkTitle: 'Our Story',
			href: '/ourstory'
		},
	]

	return (
		<PageCard>
			<h3 className="mb-3 text-md-center" style={{ fontWeight: '600' }}>{title}</h3>
			<p className="text-md-center color-gl-desat-blue">{subtitle}</p>
			<Row>
				{discoverContents.map((content, index) => {
					return (
						<Col key={index} xs={4} className="text-center text-nowrap d-flex flex-column justify-content-between align-items-center" >
							<img className="shadow mx-3" style={{ maxWidth: '80px', borderRadius: '50%' }} src={content.img} />
							<p className="m-0 mt-2 color-gl-light-blue">{content.span}</p>
							<a className="color-gl-muddy-blue font-weight-bold" href={content.href}>{content.linkTitle}</a>
						</Col>
					)
				})}
			</Row>
		</PageCard>
	)
}

export const MovementCard = () => {
	const movementContents = [
		{
			img: 'img/homepage/planet-positive.png',
			span: 'Good for the planet'
		},
		{
			img: 'img/homepage/responsible-journalism.png',
			span: 'Supporting responsible journalism'
		},
		{
			img: 'img/homepage/50-charity.png',
			span: '50% of ad fees to charity'
		},
	]

	return (<>
		<BG image="img/homepage/our-movement-background-lg.svg" style={{ backgroundPosition: 'center top' }}>
			<PageCard>
				<div className="movement-blob position-relative d-flex align-items-center justify-content-center pb-5">
					<img style={{ maxWidth: '480px', zIndex: '1', margin: '0 -1rem' }} src="img/homepage/movement-blob-images.svg" />
					<div className="bubble-content position-absolute text-center" style={{ top: '18%', margin: '0 10%', maxWidth: '400px', zIndex: '2' }}>
						<h4 className="color-gl-red">Join our movement</h4>
						<p className="color-gl-dark-grey" style={isMobile() ? { fontSize: '.9rem' } : {}} >Start transforming your web browsing and data into <b>life saving vaccines, meals for children in need, habitats for endangered animals,</b> plus many more good causes.</p>
						<ArrowLink className="color-gl-red font-weight-bold" link="/tabsforgood">Get involved</ArrowLink>
					</div>
				</div>
				<img className="position-absolute w-100 join-our-movement-bg-front" src="img/homepage/our-movement-front-curve.svg" />
			</PageCard>
		</BG>
		<PageCard className="text-center text-white bg-gl-light-blue pt-0">
			<h4 className="m-0" style={{ fontWeight: '600' }}>MY.GOOD-LOOP</h4>
			<p>By Good-Loop</p>
			<Row>
				{movementContents.map((content, index) => {
					return (
						<Col key={index} xs={12} md={4} className="text-center text-nowrap d-flex flex-column justify-content-between align-items-center" >
							<img className="mx-3" style={{ maxWidth: '100px', borderRadius: '50%' }} src={content.img} />
							<p className="m-0 mt-2 font-weight-bold">{content.span}</p>
						</Col>
					)
				})}
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
			<h1 className="mb-4 white">Join our movement!</h1>
			<p className="leader-text text-center">Start transforming your web browsing into life saving vaccines, meals for children in need, habitats for endangered animals, plus many more good causes.</p>
			<img src="/img/homepage/bird-cloud.png" className="top-right" />
			<img src="/img/signup/hand-globe-coins.png" className="top-left" />
		</div>
		<div className="gridbox gridbox-md-2 gridbox-gap-4">
			<Card>
				<CardImg variant="top" src="/img/homepage/slide-1.png" />
				<CardBody>
					<CardTitle><h3 className="gl-dark-blue">Tabs for Good</h3></CardTitle>
					<CardText>Turn your web browsing into charity donations. Easy and free.</CardText>
					<T4GSignUpButton className="w-100" />
					<T4GHowItWorksButton className="w-100" />
				</CardBody>
			</Card>
			<Card>
				<a id="mydata-cta" />
				<CardImg className="bg-gl-dark-blue" variant="top" src="/img/mydata/onboarding-2.png" />
				<CardBody>
					<CardTitle><h3 className="gl-dark-blue">My.Data</h3></CardTitle>
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
