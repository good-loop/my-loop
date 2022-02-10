import React, { useState, useEffect } from 'react';
import { RegisterLink, setLoginVerb, setShowLogin } from '../../base/components/LoginWidget';
import { Col, Container, Row, Carousel, CarouselControl, CarouselItem } from 'reactstrap';
import BG from '../../base/components/BG';
import { getBrowserVendor, isPortraitMobile, modifyHash, scrollTo, space } from '../../base/utils/miscutils';
import C from '../../C';
import Icon from '../../base/components/Icon';
import LinkOut from '../../base/components/LinkOut';
import CharityLogo from '../CharityLogo';
import { SubscriptionForm } from '../cards/SubscriptionBox';
import Login from '../../base/youagain';
import BSCarousel from '../../base/components/BSCarousel';
import { T4GCTA } from '../T4GSignUp';

const PageCard = ({id, className, children}) => {
	return <Container id={id} fluid className={space('page-card', className)}>
		<Container>
			{children}
		</Container>
	</Container>
};

/**
 * A page card with a curve SVG sitting on top
 * @param {String} color a gl-color for the background and curve - requires a curve svg of matching name in /img/curves/, e.g. light-blue = curve-light-blue.svg
 * @returns 
 */
const CurvePageCard = ({color, className, style, bgClassName, bgImg, children}) => {
	const TopComponent = bgImg ? BG : 'div';
	const myStyle = {marginTop:-1, marginBottom:-10, ...style};
	return <>
		<TopComponent className={bgClassName} style={myStyle} src={bgImg}>
			<img src={"/img/curves/curve-"+color+".svg"} className='w-100'/>
		</TopComponent>
		{/* Not using PageCard here */}
		<div className={space("bg-gl-"+color, className, "pb-5 w-100")}>
			<Container>
				{children}
			</Container>
		</div>
	</>;
};

const CardImgLeft = ({classname, imgUrl, children}) =>{
	return(
	<Row className={space('mt-5 rounded', classname)}>
		<Col className='p-0' md={6}>
			<img className="w-100 p-0" src={imgUrl} alt="" />
		</Col>
		<Col md={6} className='text-left d-flex flex-column justify-content-around py-5 px-3'>
			{children}
		</Col>
	</Row>
	)
}

const MyLandingSection = ({ngo, title, text, bgImg}) => {
	if ( ! title) {
		title = `Turn your web browsing into ${(ngo && "cash for " + ngo.name) || "charity donations"}. For free.`;
	}
	if ( ! text) {
		text = `Get our Tabs For Good Browser Plugin today and start raising money for ${(ngo && ngo.name) || "good causes"} - just by browsing the internet.`;
	}
	if ( ! bgImg && ngo) bgImg = ngo.images;
	return (
		<>
		<BG src={isPortraitMobile() ? null : bgImg} className="landing-bg">
			<BG src="/img/LandingCharity/t4g-splash-screen-background.svg" className="landing-splash">
				<Container fluid className="d-flex justify-content-center">
					<Row className="mb-3 mt-5">
							<Col md={1} sm={0} /* left padding, but not on mobile */></Col>
							<Col md={6} className="landing-left">
									<div className="title mt-5"> 
											<h2>{title}</h2>
											<p>{text}</p>
									</div>
									<div className="cta-buttons text-uppercase mt-5">
											<T4GCTA className="w-100"/>
											<button className="btn btn-secondary w-100 text-uppercase mt-3"	
												onClick={e => scrollTo("howitworks")}										
											>
													See how it works
											</button>
									</div>
							</Col>
					</Row>
				</Container>				
			</BG>
		</BG>
		</>
	);
};

const CornerHummingbird = () => {
	return (
		<img src="/img/green/hummingbird.png" className="corner-hummingbird"/>
	);
}

const CharityBanner = () => {
    return <Container className="charity-icons mb-5">
        <Row className="text-center">
					<Col><img src="img/LandingCharity/tommys.png" alt="" /></Col>
					<Col><img src="img/LandingCharity/refuge.png" alt="" /></Col>
					<Col><img src="img/LandingCharity/save-the-children.png" alt="" /></Col>
					<Col><img src="img/LandingCharity/NSPCC.png" alt="" /></Col>
					<Col className='d-none d-lg-block'><img src="img/LandingCharity/dementiauk.png" alt="" /></Col>
					<Col className='d-none d-lg-block'><img src="img/LandingCharity/wwf.png" alt="" /></Col>
					<Col className='d-none d-lg-block'><img src="img/LandingCharity/mssociety.png" alt="" /></Col>
					<Col className='d-none d-lg-block'><img src="img/LandingCharity/centrepoint.png" alt="" /></Col>
					<Col className='d-none d-lg-block'><img src="img/LandingCharity/GOSH.png" alt="" /></Col>
        </Row>
				<Row className="text-center">
					<Col className='d-block d-lg-none'><img src="img/LandingCharity/wwf.png" alt="" /></Col>
					<Col className='d-block d-lg-none'><img src="img/LandingCharity/mssociety.png" alt="" /></Col>
					<Col className='d-block d-lg-none'><img src="img/LandingCharity/centrepoint.png" alt="" /></Col>
					<Col className='d-block d-lg-none'><img src="img/LandingCharity/GOSH.png" alt="" /></Col>
        </Row>
    </Container>;
};


const HowTabsForGoodWorks = ({classname}) => {
	return (
		<PageCard id="howitworks" className={space("how-tabs-for-good-works bg-gl-pale-orange text-center", classname)}>
			<h1>How Tabs For Good Works</h1>
			<Row className="pt-5">
				<Col md={4} className='pt-2 pt-md-0 how-it-works-points'>
					<img className='w-50' src="/img/homepage/globe.png" alt="" />
					<h3 className='pt-4'>Open a tab</h3>
					<p className='pt-3'>When you open a new tab, we display a small unobtrusive banner ad at the bottom of your page while you're busy browsing away. </p>
				</Col>
				<Col md={4} className='pt-2 pt-md-0 how-it-works-points'>
					<img className='w-50' src="/img/homepage/heart.png" alt="" />
					<h3 className='pt-4'>Unlock a donation</h3>
					<p className='pt-3'>As a thank you for letting the ad appear on your page, 
						you make a free donation to charity, funded by us. 50% of the ad money to be precise. </p>
				</Col>
				<Col md={4} className='pt-2 pt-md-0 how-it-works-points'>
					<img className='w-50' src="/img/homepage/world.png" alt="" />
					<h3 className='pt-4'>That's it!</h3>
					<p className='pt-3'>We don't track your online activity and you don't even have to click on the ad to make the donation happen. It really is that simple. </p>
				</Col>
			</Row>
		</PageCard>
	);
};

const T4GCharityScreenshot = ({ngo, className, ...props}) => {
	return <BG src="/img/LandingCharity/T4GScreenshot.png" className={className} center {...props}>
		{ngo && <CharityLogo charity={ngo} className="t4gscreenshot-logo"/>}
	</BG>;
}

/**
 * 
 * @param {?NGO} ngo if specified, inserts the charity images and info into the slides
 * @param {?String} img a url for an image to insert if no charity is provided
 * @param {?Boolean} showUpperCTA shows the upper CTA section (e.g. on the HomePage) 
 * @param {?Boolean} showLowerCTA shows the lower CTA section (e.g. on the T4G charity pages)
 * @param {?String} bgClassName change the background colour of the carousel section with a bg-class
 */
const TabsForGoodSlideSection = ({ngo, img, showUpperCTA, showLowerCTA, bgClassName}) => {

	const name = (ngo && ngo.name) || "charity";

	const items = [
		<>
			<p>Sign up for Tabs for Good.</p>
			<p>Start browsing with the Tabs for Good plugin.</p>
			<p>Raise money for {name}. For free.</p>
		</>,
		<>
			<p>Follow your online impact in the My.Good-Loop hub and see how much you’re raising for {name} – just by browsing the internet.</p>
		</>
	];
	const titles = [
		"It couldn't be easier to get started",
		"...And see your impact grow"
	];

	const slides = items.map((content, i) => (
			<div key={i} className='d-flex flex-column justify-content-between h-100'>
				<h3>{titles[i]}</h3>
				<div className='slide-content'>
					{content}
				</div>
				<T4GCTA className="t4gcta"/>
			</div>
	));

	return (<>
		<PageCard className={space("tabs-for-goods-slide-card", bgClassName)}>
			{showUpperCTA && <div className="upper-cta text-center white">
				<h1 className='mb-5'>Sign Up Today!</h1>
				<h4>Start transforming your web browsing into life saving vaccines, meals for children in need, preserving habitats for endangered animals, plus many more good causes.</h4>
				<div className="upper-cta-btn mt-5">
					<T4GCTA className="w-100"/>
					<button className="btn btn-secondary w-100 text-uppercase mt-3 d-none d-md-block">
						Learn More About Tabs For Good
					</button>
					<button className="btn btn-secondary w-100 text-uppercase mt-3 d-block d-md-none">
						Learn More
					</button>
				</div>
			</div>}
			<Row className="slideshow mt-5 d-none d-md-flex" noGutters>
				<Col md={6} className="slide-left overflow-hidden">
					<T4GCharityScreenshot ngo={ngo} className="slide-img"/>
				</Col>
				<Col md={6} className="slide-right p-5">
					<BSCarousel>
						{slides}
					</BSCarousel>
				</Col>
			</Row>
		</PageCard>

		{showLowerCTA && <>
			<CurvePageCard color="desat-blue" bgClassName={bgClassName} style={{marginTop:-100}}>
				<h1 className='white'>Start using tabs for good today and together we'll...</h1>
				<Row className="mt-5">
					<Col md={4} className='pt-2 pt-md-0'> 
						<div className="tricard-inner">
							<img className='w-100' src={(ngo && ngo.logo) || ""} alt="" />
							<div className='p-3'>
								<h3>Donate 50% of online ad fees to {name}</h3>
							</div>
						</div>
					</Col>
					<Col md={4} className='pt-2 pt-md-0'>
						<div className="tricard-inner">
							<img className='w-100' src={(ngo && ngo.images) || "/img/homepage/tree-planting.png"} alt="" />
							<div className='p-3'>
								<h3>{ngo ? "Let's help "+name+" do even more good. Together." : "Give that money to a charity of your choice"}</h3>
							</div>
						</div>
					</Col>
					<Col md={4} className='pt-2 pt-md-0'>
						<div className="tricard-inner">
							<img className='w-100' src="/img/homepage/amyanddaniel.png" alt="" />
							<div className='p-3'>
								<h3>Do good without taking up any time or effort</h3>
							</div>
						</div>
					</Col>
				</Row>
			</CurvePageCard>
		</>}
	</>)
};

const NewsAwards = ({children}) => {
	let firstIMG="/img/pub-logos/campaign-logo.png";
	let firstLink="https://www.campaignlive.co.uk/article/meet-start-up-helping-nestle-nike-unilever-unite-programmatic-purpose/1722847";
	let secondIMG="/img/pub-logos/marketing-brew-logo.png" ;
	let secondLink="https://www.morningbrew.com/marketing/stories/2021/11/24/good-loop-is-creating-tools-to-make-ad-tech-more-ethical-and-sustainable"				;
	let thirdIMG="/img/pub-logos/forbes-logo.jpeg" ;
	let thirdLink="https://www.forbes.com/sites/afdhelaziz/2020/06/25/goodloop-an-ethical-advertising-platform-that-allows-brands-to-spend-media-dollars-and-do-good-at-the-same-time-launches-in-the-united-states/?sh=22ac280c3987";

	return(
		<PageCard>
			{children}
			<div className="container text-center">
				<div className="row">
					<div className="col sparks"><img className='logo' src="/img/homepage/Stars.png" alt="" /></div>
					<div className="col">
						<LinkOut href={firstLink}><img className='logo logo-lg' src={firstIMG} alt="" /></LinkOut>
					</div>
					<div className="col">
						<LinkOut href={secondLink}><img className='logo logo-lg' src={secondIMG} alt="" /></LinkOut>
					</div>
					<div className="col">
						<LinkOut href={thirdLink}><img className='logo logo-lg' src={thirdIMG} alt="" /></LinkOut>
					</div>
					<div className="col sparks"><img className='logo' src="/img/homepage/Stars.png" alt="" /></div>
				</div>
			</div>
		</PageCard>
	)
};

const TestimonialSectionTitle = () => {
	return(<>
	{/* <img className='w-100' src="img/homepage/curve.svg" alt="" /> */}
	<div className="testimonial-title">
		<div className="container">
			<div className="testimonial-upper text-center">
				<h1>TOGETHER WE'VE RAISED OVER £3.9 MILLION!</h1>
				<p>We donate to charities worldwide. Spreading that money far and wide to those who need it the most. All thanks to our fantastic Good-Loop community.</p>
				{/* <a className='btn btn-primary text-uppercase' href="#">Explore our charity impact</a> */}
			</div>
		</div>
	</div>
	</>
	)
};

const TestimonialSectionLower = () => {
	return(<>
		<div className="testimonial-lower">
			<img className='w-100 d-none d-md-block' src="/img/curves/curve-dark-turquoise-bottom.svg" alt="" />
			<div className="container">
				<div className="testimonial-card my-0 my-md-5">
					<div className="row">
						<div className="col-md-6 p-0">
							<img className='w-100 h-100' src="img/homepage/testimonial-1.png" alt="" />
						</div>
						<div className="col-md-6 testimonial-right p-5">
								<h3>Testimonial</h3>

								<p>"The amazing income generated by GoodLoop will support a wider selection of teams and projects - unrestricted funds are really useful and enable Centrepoint to be dynamic with the way we support young people."</p>
								<p>Lucy Coleman, Senior Corporate Development Manager, Centrepoint (2020)</p>
								<p className='TODO read-more'>READ MORE ABOUT OUR <a href="#">CHARITY IMPACT</a></p>
						</div>
					</div>
				</div>
				<div className="testimonial-impact text-center">
					<div className="row pt-5">
						<div className="col-md-4 testimonial-points">							
							<Circle className="mx-auto" width='8em'>
								<img className='logo logo-lg' src="/img/charity-logos/we-forest.jpeg" alt="We Forest logo" />
							</Circle>
							<h3 className='pt-md-4'>721.3 Hectares</h3>
							<p className=''>of forest restored - that's 1,000+ football pitches!</p>
						</div>
						<div className="col-md-4 testimonial-points">
							<Circle className="mx-auto" width='8em'>
								<img className='logo logo-lg' src="/img/charity-logos/no-kid-hungry.png" alt="No Kid Hungry logo" />
							</Circle>
							<h3 className='pt-md-4'>183,318 Meals</h3>
							<p className=''>provided for children</p>
						</div>
						<div className="col-md-4 testimonial-points">
							<Circle className="mx-auto" width='8em'>
								<img className='logo logo-lg' src="/img/charity-logos/mind.png" alt="Mind logo" />
							</Circle>
							<h3 className='pt-md-4'>500+ Helpline Calls</h3>
							<p className=''>and 195 hours of online peer-to-peer support</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<img src="/img/curves/curve-desat-blue-round-bottom.svg" className='w-100' alt="" />
	</>)
};

/**
 * A white circle with centered content
 */
const Circle = ({className, color="bg-light", width,children}) => {
	return <div 
		className={space(className, color, 'rounded-circle d-flex justify-content-center align-items-center')} 
		style={{width,height:width}}>
		{children}
		</div>;
};


const PositivePlaceSection = ({className, showCTA}) => {
	return <PageCard className={space("positive-place-section text-center", className)}>
		<h1 className='pt-5'>Let's make the internet a more positive place. Together.</h1>
		<Row className="pt-5">
			<Col md={4} className="video-points">
				<img className='w-50' src="/img/homepage/bird-circle.png" alt="" />
				<h3 className='pt-4'>50% of online ad fees donated to charity </h3>
			</Col>
			<Col md={4} className="video-points">
				<img className='w-50' src="/img/homepage/heart.png" alt="" />
				<h3 className='pt-4'>Helping brands offset their digital carbon footprint</h3>
			</Col>
			<Col md={4} className="video-points">
				<img className='w-50' src="/img/homepage/girl-circle.png" alt="" />
				<h3 className='pt-4'>Keeping your online privacy safe no matter what</h3>
			</Col>
		</Row>
		{showCTA && <T4GCTA className="mt-5" />}
	</PageCard>
}

const WatchVideoSection = () => {
	return(<>
	<PageCard className="watch-video-section">
		<div className="text-center">
			<h1 className='pt-5'>WATCH TO SEE HOW WE’RE CREATING A MOVEMENT</h1>
			<img className='w-100 my-5' src="img/homepage/video.png" alt="" />
			<p>We’re working with fantastic brands that want to join us in making the internet a more positive place. <br/><br/>
			The way we’re doing it couldn’t be simpler. We just need the final piece of the puzzle to make it happen – you. Sign up and join the Good-Loop movement today. </p>
			<RegisterLink className="btn btn-primary mt-5">
				Sign up for the Tabs For Good
			</RegisterLink>
			{/* <p className='our-story black m-5 pb-5'>Want to learn more? Check out <a href="#">OUR STORY</a></p> */}
		</div>
	</PageCard>
	</>
	)
};

const GetInvolvedSection = () => {
	return(
		<PageCard className="get-involved-section text-center">
			<h1>THIS IS JUST THE BEGINNING. SIGN UP AND JOIN OUR MOVEMENT.</h1>
			<p>We’re developing exciting new products that will help us all make the internet a more positive place. Register below to get exclusive access to future product launches and more ways to raise money for charity while you browse.</p>
			<SubscriptionForm />
			<div className="row pt-5">
				<div className="col-md-4 get-involved-points">
					<img className='w-50' src="/img/homepage/globe.png" alt="" />
					<h3 className='pt-md-4 mb-0 ml-1'>Donate to charity. For free. </h3>
				</div>
				<div className="col-md-4 get-involved-points">
					<img className='w-50' src="/img/homepage/heart.png" alt="" />
					<h3 className='pt-md-4 mb-0 ml-1'>Make the world a better place</h3>
				</div>
				<div className="col-md-4 get-involved-points">
					<img className='w-50' src="/img/homepage/world.png" alt="" />
					<h3 className='pt-md-4 mb-0 ml-1'>Just by browsing the internet</h3>
				</div>
			</div>
			{/* <a className='btn btn-primary' href="#">Join the Good-Loop Movement</a> */}
			{/* <div className="social-links">
				<div className="row my-5">
					<div className="col">
						<a href="https://twitter.com/goodloophq"><Icon name="twitter" /></a>
						<a href="https://www.facebook.com/the.good.loop/"><Icon name="facebook" /></a>
						<a href="https://www.instagram.com/goodloophq/"><Icon name="instagram" /></a>
						<a href="https://www.linkedin.com/company/good.loop"><Icon name="linkedin" /></a>
					</div>
				</div>
			</div> */}
		</PageCard>
	)
};

const TriCards = ({className, firstTitle, firstText, secondTitle, secondText, thirdTitle, thirdText,
firstIMG, secondIMG, thirdIMG, firstLink="#", secondLink="#", thirdLink="#" }) => {
	return(
		<PageCard className={space("tri-card", className)}>
			<Row className="mt-5">
				<Col md={4} className='pt-2 pt-md-0'> 
					<div className="tricard-inner">
						<img className='w-100' src={firstIMG} alt="" />
						<div className='tricard-text p-3'>
							<h3>{firstTitle}</h3>
							<span>{firstText} </span><C.A href={firstLink}>Read More</C.A>
						</div>
					</div>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<div className="tricard-inner">
						<img className='w-100' src={secondIMG} alt="" />
						<div className='tricard-text p-3'>
							<h3>{secondTitle}</h3>
							<span>{secondText} </span><C.A href={secondLink}>Read More</C.A>
						</div>
					</div>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<div className="tricard-inner">
						<img className='w-100' src={thirdIMG} alt="" />
						<div className='tricard-text p-3'>
							<h3>{thirdTitle}</h3>
							<span>{thirdText} </span><C.A href={thirdLink}>Read More</C.A>
						</div>
					</div>
				</Col>
			</Row>
		</PageCard>
	)
};

const WhatIsTabsForGood	= ({ngo, imgs}) => {
	return (<>
		<PageCard className="how-tabs-for-good-works text-center">
			<h1 className='mb-4'>What is Tabs for Good?</h1>
			<p className=''><b>Tabs for Good is your browser plugin that transforms web browsing into charity donations for free. Helping turn your browsing into life saving vaccines, meals for children in need, preservation of habitats for endangered animals, plus many more good causes.</b></p>
			<Row className="py-5">
				<Col md={6}>
					<T4GCharityScreenshot ngo={ngo} ratio={100}/>
				</Col>
				<Col md={6}>
					<BG center src={(ngo && ngo.images) || (imgs && imgs[1]) || "/img/homepage/heart.png"} ratio={100} alt="" />
				</Col>
				{/*<Col md={4}>
					<BG center src={(ngo && ngo.images) || (imgs && imgs[2]) || "/img/homepage/world.png"} ratio={100} alt="" />
				</Col>*/}
			</Row>
			<T4GCTA className="mx-auto"/>
		</PageCard>
	</>);
};


export {
	TabsForGoodSlideSection,
	HowTabsForGoodWorks,
	NewsAwards,
	WatchVideoSection,
	PositivePlaceSection,
	TriCards,
	TestimonialSectionTitle,
	TestimonialSectionLower,
	GetInvolvedSection,
	CharityBanner,
	MyLandingSection,	
	PageCard,
	CurvePageCard,
	WhatIsTabsForGood,
	CardImgLeft,
	CornerHummingbird
};
