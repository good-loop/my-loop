import React, { useState, useEffect } from 'react';
import { RegisterLink, setLoginVerb, setShowLogin } from '../../base/components/LoginWidget';
import { Col, Container, Row } from 'reactstrap';
import BG from '../../base/components/BG';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import C from '../../C';

const T4GCTAButton = ({className}) => {
	return isPortraitMobile() ? (
			<C.A className={space("btn btn-primary", className)}>
				Email me a link for desktop
			</C.A>
		) : (
			<RegisterLink className={space("btn btn-primary", className)}>
				Sign up for Tabs For Good
			</RegisterLink>
		);
};

const MyLandingSection = ({ngo}) => {

	return (
		<>
            <BG src={(ngo && ngo.images) || ""} className="landing-bg">
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


const HowTabsForGoodWorks = () => {
	return (
		<Container className="how-tabs-for-good-works text-center pt-3">
			<h1>How Tabs For Good Works</h1>
			<Row className="pt-5">
				<Col md={4}>
					<img className='w-50' src="/img/homepage/globe.png" alt="" />
					<h3 className='pt-4'>Open a tab</h3>
					<p className='pt-3'>When you open a new tab, we display a small unobtrusive banner ad at the bottom of your page while you're busy browsing away. </p>
				</Col>
				<Col md={4}>
					<img className='w-50' src="/img/homepage/heart.png" alt="" />
					<h3 className='pt-4'>Unlock a donation</h3>
					<p className='pt-3'>As a thank you for letting the ad appear on your page, 
						you make a free donation to charity, funded by us. 50% of the ad money to be precise. </p>
				</Col>
				<Col md={4}>
					<img className='w-50' src="/img/homepage/world.png" alt="" />
					<h3 className='pt-4'>That's it!</h3>
					<p className='pt-3'>We don't track your online activity and you don't even have to click on the ad to make the donation happen. It really is that simple. </p>
				</Col>
			</Row>
		</Container>
	);
};

const TabsForGoodSlideSection = () => {

	const [slider1, setSlider1] = useState('active');
	const [slider2, setSlider2] = useState('inactive');

	const clickSlider1 = () => {
		setSlider1('active');
		setSlider2('inactive');
	}
	const clickSlider2 = () => {
		setSlider1('inactive');
		setSlider2('active');
	}

	return (
		<div className="tabs-for-goods-slide-card">
			<div className="container">
				<div className="upper-cta text-center white">
					<p>Start transforming your web browsing into life saving vaccines, meals for children in need, preserving habitats for endangered animals, plus many more good causes.</p>
					<div className="upper-cta-btn">
						<RegisterLink className="btn btn-primary w-100 text-uppercase">
							Sign up for the Tabs For Good
						</RegisterLink>
						<button className="btn btn-myloop-secondary w-100 text-uppercase mt-3">
							Learn More About Tabs For Good
						</button>
					</div>
				</div>
				<div className="slideshow mt-5">
					<div className={"slide row "+slider1}>
						<div className="col-md-6 slide-left text-center p-5">
							<h3 className='mt-5'>Slide 1 of 2</h3>
							<p className='mt-5'>Visualisation of picking a charity and getting browsing with T4G</p>
							<div className="slideshowDots">
								<div className={"slideshowDot "+slider1} onClick={clickSlider1}></div>
								<div className={"slideshowDot "+slider2} onClick={clickSlider2}></div>
							</div>
						</div>
						<div className="col-md-6 slide-right p-5">
							<h3>It couldn't be easier to get started</h3>
							<p>Sign up for Tabs For Good. <br/>
							Pick the charity you want to support. <br/>
							Start browsing with the Tabs for Good plugin and raise money for charity. For free.</p>
							<a className="btn btn-primary" href="#">Sign up for Tabs for Good</a>
						</div>
					</div>
					<div className={"slide row "+slider2}>
						<div className="col-md-6 slide-left-2 text-center p-5">
							<h3 className='mt-5'>Slide 2 of 2</h3>
							<p className='mt-5'>Visualisation of picking a charity and getting browsing with T4G</p>
							<div className="slideshowDots">
								<div className={"slideshowDot "+slider1} onClick={clickSlider1}></div>
								<div className={"slideshowDot "+slider2} onClick={clickSlider2}></div>
							</div>
						</div>
						<div className="col-md-6 slide-right p-5">
							<h3>It couldn't be easier to get started</h3>
							<p>Follow your online impact in the My.Good-Loop hub and see how much you're raising for charity - just be browsing the internet.</p>
							<a className="btn btn-primary" href="#">Sign up for Tabs for Good</a>
						</div>
					</div>
				</div>
			</div>

		</div>
	)
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
		<div className="get-involved-section">
			<div className="container text-center">
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
							<a href=""><img src="" alt="twitter" /></a>
							<a href=""><img src="" alt="facebook" /></a>
							<a href=""><img src="" alt="instagram" /></a>
							<a href=""><img src="" alt="linkedin" /></a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
};

const TriCards = () => {
	return(
		<div className="container">
			<div className="row mt-5">
				<div className="col-md-4"> 
					<div className="tircard-inner">
						<img className='w-100' src="img/homepage/good-loop-for-business.png" alt="" />
						<h4>Good Loop For Business</h4>
						<p>Discover... a sentence about this page/article <a href="#">Read More</a></p>
					</div>
				</div>
				<div className="col-md-4">
					<div className="tircard-inner">
						<img className='w-100' src="img/homepage/tree-planting.png" alt="" />
						<h4>Tree Planting For The Future</h4>
						<p>Discover... a sentence about this page/article <a href="#">Read More</a></p>
					</div>
				</div>
				<div className="col-md-4">
					<div className="tircard-inner">
						<img className='w-100' src="img/homepage/amyanddaniel.png" alt="" />
						<h4>How It All Began</h4>
						<p>Discover... a sentence about this page/article <a href="#">Read More</a></p>
					</div>
				</div>
			</div>
		</div>
	)
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
	T4GCTAButton
};
