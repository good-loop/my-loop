import React, { useState, useEffect } from 'react';
import { RegisterLink, setLoginVerb, setShowLogin } from '../../base/components/LoginWidget';
import { Col, Container, Row, Carousel, CarouselControl, CarouselItem } from 'reactstrap';
import BG from '../../base/components/BG';
import { getBrowserVendor, isPortraitMobile, space } from '../../base/utils/miscutils';
import C from '../../C';
import Icon from '../../base/components/Icon';
import { T4GSignUpButton } from '../T4GSignUp';
import LinkOut from '../../base/components/LinkOut';

const PageCard = ({className, children}) => {
	return <Container fluid className={space('page-card', className)}>
		<Container>
			{children}
		</Container>
	</Container>
};

const T4GCTAButton = ({className}) => {
	return isPortraitMobile() ? (
		// TODO make this button function
			<C.A className={space("btn btn-primary", className)}>
				Email me a link for desktop
			</C.A>
		) : (
			<T4GSignUpButton
			 className={className}>
				Sign up for Tabs For Good
			</T4GSignUpButton>
		);
};

export const T4GPluginButton = ({className}) => {
	const browser = getBrowserVendor();
	let href = {
		CHROME: "https://chrome.google.com/webstore/detail/good-loop-tabs-for-good/baifmdlpgkohekdoilaphabcbpnacgcm?hl=en&authuser=1",
		EDGE: "https://microsoftedge.microsoft.com/addons/detail/goodloop-tabs-for-good/affgfbmpcboljigkpdeamhieippkglkn"
	}[browser];
	if ( ! href) {
		return <span className={space(className, "disabled btn btn-secondary mt-2")} >Not available for {browser} yet</span>;
	}
	return <LinkOut className={space(className, "btn btn-primary mt-2")} href={href}>{browser} STORE</LinkOut>;
};

const MyLandingSection = ({ngo}) => {

	return (
		<>
            <BG src={isPortraitMobile() ? null : ((ngo && ngo.images) || "")} className="landing-bg">
                <BG src="/img/LandingCharity/t4g-splash-screen-background.svg" className="landing-splash">
                    <Container fluid className="d-flex justify-content-center">
                        <Row className="mb-3 mt-5">
                            <Col md={6} className="landing-left">
                                <div className="title mt-5"> 
                                    <h2>Turn your web browsing into {(ngo && "cash for " + ngo.name) || "charity donations"}. For free.</h2>
                                    <p>Get our Tabs For Good Browser Plugin today and start raising money for {(ngo && ngo.name) || "good causes"} – just by browsing the internet. </p>
                                </div>
                                <div className="cta-buttons text-uppercase mt-5">
                                    <T4GCTAButton className="w-100"/>
                                    <button className="btn btn-secondary w-100 text-uppercase mt-3">
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

const CharityCarousel = () => {
    return <Container className="charity-icons mb-5">
        <Row className="text-center">
            <Col className="d-none d-md-block"><img className='circle-arrow' src="img/homepage/left-arrow.png" alt="" /></Col>
            <Col className="d-flex justify-content-between">
                <div className=""><img src="img/homepage/safethechildren_circle.png" alt="" /></div>
                <div className=""><img src="img/homepage/circle-image-1.png" alt="" /></div>
                <div className=""><img src="img/homepage/wwf-circle.png" alt="" /></div>
                <div className=""><img src="img/homepage/circle-image-2.png" alt="" /></div>
                <div className=""><img src="img/homepage/nspcc_circle.png" alt="" /></div>
            </Col>
            <Col className="d-none d-md-block"><img className='circle-arrow' src="img/homepage/right-arrow.png" alt="" /></Col>
        </Row>
    </Container>;
};


const HowTabsForGoodWorks = ({classname}) => {
	return (
		<PageCard className={space("how-tabs-for-good-works bg-gl-pale-orange text-center", classname)}>
			<h1>How Tabs For Good Works</h1>
			<Row className="pt-5">
				<Col md={4} className='pt-2 pt-md-0'>
					<img className='w-50' src="/img/homepage/globe.png" alt="" />
					<h3 className='pt-4'>Open a tab</h3>
					<p className='pt-3'>When you open a new tab, we display a small unobtrusive banner ad at the bottom of your page while you're busy browsing away. </p>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<img className='w-50' src="/img/homepage/heart.png" alt="" />
					<h3 className='pt-4'>Unlock a donation</h3>
					<p className='pt-3'>As a thank you for letting the ad appear on your page, 
						you make a free donation to charity, funded by us. 50% of the ad money to be precise. </p>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<img className='w-50' src="/img/homepage/world.png" alt="" />
					<h3 className='pt-4'>That's it!</h3>
					<p className='pt-3'>We don't track your online activity and you don't even have to click on the ad to make the donation happen. It really is that simple. </p>
				</Col>
			</Row>
		</PageCard>
	);
};

/**
 * 
 * @param {?NGO} ngo if specified, inserts the charity images and info into the slides
 * @param {?String} img a url for an image to insert if no charity is provided
 * @param {?Boolean} showUpperCTA shows the upper CTA section (e.g. on the HomePage) 
 * @param {?Boolean} showLowerCTA shows the lower CTA section (e.g. on the T4G charity pages)
 * @param {?String} bgClassName change the background colour of the carousel section with a bg-class
 */
const TabsForGoodSlideSection = ({ngo, img, showUpperCTA, showLowerCTA, bgClassName}) => {

	const [animating, setAnimating] = useState(false);
	const [index, setIndex] = useState(0);

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

	const next = () => {
		if (animating) return;
		const nextIndex = index === items.length - 1 ? 0 : index + 1;
		setIndex(nextIndex);
	}
	
	const previous = () => {
		if (animating) return;
		const nextIndex = index === 0 ? items.length - 1 : index - 1;
		setIndex(nextIndex);
	}
	
	const goToIndex = (newIndex) => {
		if (animating) return;
		setIndex(newIndex);
	}

	const slides = items.map((content, i) => (
		<CarouselItem
			key={i}
			//className="slide-right"
			onExiting={() => setAnimating(true)}
			onExited={() => setAnimating(false)}
		>
			<div className='d-flex flex-column justify-content-between h-100'>
				<h3>It couldn't be easier to get started</h3>
				<div className='slide-content'>
					{content}
				</div>
				<T4GCTAButton className="t4gcta"/>
			</div>
		</CarouselItem>
	));

	return (<>
		<PageCard className={space("tabs-for-goods-slide-card", bgClassName)}>
			{showUpperCTA && <div className="upper-cta text-center white">
				<h4>Start transforming your web browsing into life saving vaccines, meals for children in need, preserving habitats for endangered animals, plus many more good causes.</h4>
				<div className="upper-cta-btn mt-5">
					<T4GCTAButton className="w-100"/>
					<button className="btn btn-secondary w-100 text-uppercase mt-3">
						Learn More About Tabs For Good
					</button>
				</div>
			</div>}
			<Row className="slideshow mt-5" noGutters>
				<Col md={6} className="slide-left overflow-hidden d-none d-md-flex">
					<BG src={(ngo && ngo.images) || img} className="slide-img">
					</BG>
				</Col>
				<Col md={6} className="slide-right p-5">
					<Carousel
						activeIndex={index}
						next={next}
						previous={previous}
						interval={false}
					>
						{slides}
						<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
						<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
					</Carousel>
				</Col>
			</Row>
		</PageCard>
		{showLowerCTA && <>
			<div className={bgClassName} style={{marginTop:-1}}>
				<img src="/img/curves/curve-desat-blue.svg" className='w-100'/>
			</div>
			<PageCard className="bg-gl-desat-blue" style={{marginTop:-100}}>
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
							<img className='w-100' src="/img/homepage/tree-planting.png" alt="" />
							<div className='p-3'>
								<h3>{ngo ? "Help (insert cause) TODO FIND BETTER TEXT" : "Give that money to a charity of your choice"}</h3>
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
			</PageCard>
		</>}
	</>)
};

const NewsSection = () => {
	return(
	<div className="news-section">
		<div className="container text-center">
			<div className="row my-5">
				<div className="col sparks"><img className='logo' src="img/homepage/Stars.png" alt="" /></div>
				<div className="col"><img className='logo' src="img/homepage/BBCNews.png" alt="" /></div>
				<div className="col"><img className='logo' src="img/homepage/The-Guardian.png" alt="" /></div>
				<div className="col"><img className='logo' src="img/homepage/BBCNews.png" alt="" /></div>
				<div className="col sparks"><img className='logo' src="img/homepage/Stars.png" alt="" /></div>
			</div>
		</div>
	</div>
	)
};

const TestimonialSection = () => {
	return(
		<div className="testimonial-section">
			<div className="container py-5">
				<div className="testimonial-upper text-center">
					<h1>TOGETHER WE’VE RAISED OVER £X MILLION!</h1>
					<p>Throughout 2021 we donated to XX charities worldwide. Spreading that money far and wide to those who need it the most. All thanks to our fantastic Good-Loop community.</p>
					<a className='btn btn-primary text-uppercase' href="#">Explore our charity impact</a>
				</div>
				<div className="testimonial-card my-5">
					<div className="row">
						<div className="col-md-6 p-0">
							<img className='w-100' src="img/homepage/testimonial-1.png" alt="" />
						</div>
						<div className="col-md-6 testimonial-right p-5">
								<h3>Testimonial</h3>
								<p>Working with Good-Loop we have achieved xxxxx, a charity testimonial... Working with Good-Loop we have achieved xxxxx, a charity testimonial... Working with Good-Loop we have achieved xxxxx, a charity testimonial... </p>
								<p>Charity Representative, Charity Name</p>
								<p className='read-more'>READ MORE ABOUT OUR <a href="#">CHARITY IMPACT</a></p>
						</div>
					</div>
				</div>
				<div className="testimonial-lower text-center">
					<div className="row pt-5">
						<div className="col-md-4 testimonial-points">
							<img className='w-25' src="/img/homepage/globe.png" alt="" />
							<h3 className='pt-4'>Charity Impact</h3>
							<p className='pt-3'>Example - People + UK </p>
						</div>
						<div className="col-md-4 testimonial-points">
							<img className='w-25' src="/img/homepage/heart.png" alt="" />
							<h3 className='pt-4'>Charity Impact</h3>
							<p className='pt-3'>Example - People + Global</p>
						</div>
						<div className="col-md-4 testimonial-points">
							<img className='w-25' src="/img/homepage/world.png" alt="" />
							<h3 className='pt-4'>Charity Impact</h3>
							<p className='pt-3'>Example - People + Nature</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
};

const CharityBanner = () => {
	return(
		<div className="row my-3">
			<div className="col">
				<img src="" alt="" />
			</div>
			<div className="col">
				<img src="" alt="" />
			</div>
			<div className="col">
				<img className='logo' src="img/LandingCharity/save-the-children-logo.png" alt="" />
			</div>
			<div className="col">
				<img src="" alt="" />
			</div>
			<div className="col">
				<img src="" alt="" />
			</div>
			<div className="col">
				<img className='logo' src="img/LandingCharity/wwf_logo.png" alt="" />
			</div>
			<div className="col">
				<img src="" alt="" />
			</div>
			<div className="col">
				<img className='logo' src="img/LandingCharity/centrepoint-logo.png" alt="" />
			</div>
			<div className="col">
				<img className='logo' src="img/LandingCharity/GOSH-logo.png" alt="" />
			</div>
		</div>
	)
};

const WatchVideoSection = () => {
	return(
		<div className="watch-video-section">
			<div className="container text-center">
				<h1 className='pt-5'>Let's make the internet a more positive place. Together.</h1>
				<div className="row pt-5">
					<div className="col-md-4 video-points">
						<img className='w-50' src="/img/homepage/bird-circle.png" alt="" />
						<h3 className='pt-4'>50% of online ad fees donated to charity </h3>
					</div>
					<div className="col-md-4 video-points">
						<img className='w-50' src="/img/homepage/heart.png" alt="" />
						<h3 className='pt-4'>Helping brands offset their digital carbon footprint</h3>
					</div>
					<div className="col-md-4 video-points">
						<img className='w-50' src="/img/homepage/girl-circle.png" alt="" />
						<h3 className='pt-4'>Keeping your online privacy safe no matter what</h3>
					</div>
				</div>
				<h1 className='pt-5'>WATCH TO SEE HOW WE’RE CREATING A MOVEMENT</h1>
				<video src=""></video>
				<h4>We’re working with fantastic brands that want to join us in making the internet a more positive place. <br/><br/>
				The way we’re doing it couldn’t be simpler. We just need the final piece of the puzzle to make it happen – you. Sign up and join the Good-Loop movement today. </h4>
				<RegisterLink className="btn btn-primary w-50 mt-5">
					Sign up for the Tabs For Good
				</RegisterLink>
				<p className='our-story black m-5 pb-5'>Want to learn more? Check out <a href="#">OUR STORY</a></p>
			</div>
		</div>
	)
};

const GetInvolvedSection = () => {
	return(
		<PageCard className="get-involved-section text-center">
			<h1>THIS IS JUST THE BEGINNING. SIGN UP AND JOIN OUR MOVEMENT.</h1>
			<p>We’re developing exciting new products that will help us all make the internet a more positive place. Register below to get exclusive access to future product launches and join the Good-Loop movement.</p>
			<div className="row pt-5">
				<div className="col-md-4">
					<img className='w-50' src="/img/homepage/globe.png" alt="" />
					<h3 className='pt-4'>Donate to charity. For free. </h3>
				</div>
				<div className="col-md-4">
					<img className='w-50' src="/img/homepage/heart.png" alt="" />
					<h3 className='pt-4'>Make the world a better place</h3>
				</div>
				<div className="col-md-4">
					<img className='w-50' src="/img/homepage/world.png" alt="" />
					<h3 className='pt-4'>Just by browsing the internet</h3>
				</div>
			</div>
			<a className='btn btn-primary' href="#">Join the Good-Loop Movement</a>
			<div className="social-links">
				<div className="row my-5">
					<div className="col">
						<a href="https://twitter.com/goodloophq"><Icon name="twitter" /></a>
						<a href="https://www.facebook.com/the.good.loop/"><Icon name="facebook" /></a>
						<a href="https://www.instagram.com/goodloophq/"><Icon name="instagram" /></a>
						<a href="https://www.linkedin.com/company/good.loop"><Icon name="linkedin" /></a>
					</div>
				</div>
			</div>
		</PageCard>
	)
};

const TriCards = () => {
	return(
		<Container>
			<Row className="mt-5">
				<Col md={4} className='pt-2 pt-md-0'> 
					<div className="tricard-inner">
						<img className='w-100' src="/img/homepage/good-loop-for-business.png" alt="" />
						<div className='p-3'>
							<h3>Good Loop For Business</h3>
							<p>Discover... a sentence about this page/article <C.A href="#">Read More</C.A></p>
						</div>
					</div>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<div className="tricard-inner">
						<img className='w-100' src="/img/homepage/tree-planting.png" alt="" />
						<div className='p-3'>
							<h3>Tree Planting For The Future</h3>
							<p>Discover... a sentence about this page/article <C.A href="#">Read More</C.A></p>
						</div>
					</div>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<div className="tricard-inner">
						<img className='w-100' src="/img/homepage/amyanddaniel.png" alt="" />
						<div className='p-3'>
							<h3>How It All Began</h3>
							<p>Discover... a sentence about this page/article <C.A href="#">Read More</C.A></p>
						</div>
					</div>
				</Col>
			</Row>
		</Container>
	)
};

const WhatIsTabsForGood	= ({ngo}) => {
	return (<>
		<PageCard className="how-tabs-for-good-works text-center">
			<h1 className='mb-4'>What is Tabs for Good?</h1>
			<p className=''><b>Tabs for Good is your browser plugin that transforms web browsing into charity donations for free. Helping turn your browsing into life saving vaccines, meals for children in need, preservation of habitats for endangered animals, plus many more good causes.</b></p>
			<Row className="py-5">
				<Col md={4}>
					<img className='w-100' src={(ngo && ngo.images) || "/img/homepage/globe.png"} alt="" />
				</Col>
				<Col md={4}>
					<img className='w-100' src={(ngo && ngo.images) || "/img/homepage/heart.png"} alt="" />
				</Col>
				<Col md={4}>
					<img className='w-100' src={(ngo && ngo.images) || "/img/homepage/world.png"} alt="" />
				</Col>
			</Row>
			<T4GCTAButton className="mx-auto"/>
		</PageCard>
	</>);
};


export {
    TabsForGoodSlideSection,
    HowTabsForGoodWorks,
    NewsSection,
    WatchVideoSection,
    TriCards,
    TestimonialSection,
    GetInvolvedSection,
    CharityBanner,
    CharityCarousel,
    MyLandingSection,
	T4GCTAButton,
	PageCard,
	WhatIsTabsForGood
};
