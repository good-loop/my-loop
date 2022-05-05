import React, { useState, useEffect, useRef } from 'react';
import { RegisterLink, setLoginVerb, setShowLogin } from '../../base/components/LoginWidget';
import { Col, Container, Row, Carousel, CarouselControl, CarouselItem, Button } from 'reactstrap';
import BG from '../../base/components/BG';
import { getBrowserVendor, isMobile, isPortraitMobile, modifyHash, scrollTo, space, stopEvent } from '../../base/utils/miscutils';
import C from '../../C';
import Icon from '../../base/components/Icon';
import LinkOut from '../../base/components/LinkOut';
import CharityLogo from '../CharityLogo';
import { SubscriptionForm } from '../cards/SubscriptionBox';
import Login from '../../base/youagain';
import BSCarousel from '../../base/components/BSCarousel';
import { T4GSignUpButton, T4GHowItWorksButton } from '../T4GSignUp';
import Roles from '../../base/Roles';
import { A } from '../../base/plumbing/glrouter';
import NGOImage from '../../base/components/NGOImage';
import NGO from '../../base/data/NGO';
import {MyDataSignUpButton, MyDataSignUpModal, showMyDataSignUpModal} from '../mydata/MyDataSignUp';

export const accountMenuItems = [
	{page: "profile", label: "Data Profile"},
	{page: "tabsForGood", label: C.T4G},
	{page: "settings", label: "Settings"}
];

const PageCard = ({id, className, ref, children}) => {
	// Why two containers?? Is the outer one for card-specific css rules to latch onto??
	return <Container id={id} ref={ref} fluid className={space('page-card', className)}>
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
const CurvePageCard = ({color, className, style, bgClassName, bgImg, bgSize, bgPosition, topSpace, children}) => {

	const TopComponent = bgImg ? BG : 'div';
	const myStyle = {marginTop:-1, marginBottom:-10, backgroundSize:bgSize, backgroundPosition:bgPosition, ...style};
	return <>
		<TopComponent className={bgClassName} style={myStyle} src={bgImg}>
			{/*
			BG approach was causing weird clipping behaviour with the SVG - reverted to a safer option for now
			<BG src={"/img/curves/curve-"+color+".svg"} className="w-100 curves"/>*/}
			<img src={"/img/curves/curve-"+color+".svg"} className='w-100' style={{paddingTop:topSpace}}/>
		</TopComponent>
		{/* Not using PageCard here */}
		<div className={space("bg-gl-"+color, className, "pb-3 w-100")}>
			<Container>
				{children}
			</Container>
		</div>
	</>;
};

const CardImgLeft = ({classname, imgUrl, roundedImg, children}) =>{
	return(
	<Row className={space('mt-5 rounded overflow-hidden', classname)}>
		<Col className='p-0' md={6}>
			<BG className={space("w-100", roundedImg ? "round-img" : "")} src={imgUrl} alt="" center ratio={100}/>
		</Col>
		<Col md={6} className='text-left d-flex flex-column justify-content-around p-5'>
			{children}
		</Col>
	</Row>
	)
}

const MyLandingBackgroundImage = ({bgImg, ngo, children}) => {

	if (isPortraitMobile()) return bgImg || ngo ? (
		<div className='mobile-landing-curve'>
			<NGOImage bg header ngo={ngo} src={bgImg} className="mobile-curve-container">
				<img src="/img/curves/mobile-curve-white.svg" className='mobile-curve'/>
			</NGOImage>
			<div className='bg-white mobile-curve-fill'>
				{children}
			</div>
		</div>
	) : (
		<div className='mobile-landing-curve'>
			<BG src="/img/LandingBackground/svg-mobile/mobile-splash-background-0.svg" className="mobile-curve-container">
				<BG src="/img/LandingBackground/svg-mobile/Mobile-splash-background-1.png">
					<BG src="/img/LandingBackground/svg-mobile/mobile-splash-background-2.svg">
						<img src="/img/LandingBackground/svg-mobile/Mobile-splash-background-4.png" className="w-100"/>
					</BG>
				</BG>
			</BG>
			<div className='bg-white mobile-curve-fill'>
				{children}
			</div>
		</div>
	);

	return bgImg || ngo ? (
		<NGOImage bg header ngo={ngo} src={bgImg} className="landing-bg d-md-block d-none" center>
			<BG src={"/img/LandingCharity/t4g-splash-screen-background.svg"} className="landing-splash" center>
				{children}
			</BG>
		</NGOImage>
	) : (
		<BG src="/img/splash-screen/background-0.svg" className="landing-bg d-md-block d-none" center>
			<BG src="/img/splash-screen/background-1.png" center>
				<BG src="/img/splash-screen/background-2.svg" center>
					<BG src="/img/splash-screen/background-3.png" className="landing-bg" center>
						{children}
					</BG>
				</BG>
			</BG>
		</BG>
	);
}

const MyLandingSection = ({ngo, title, text, bgImg, shiftLeft, t4g=true, mydata=true}) => {
	const name = NGO.displayName(ngo);
	
	if ( ! title) {
		title = `Turn your web browsing into ${(ngo && "cash for " + name) || "charity donations"}. For free.`;
	}
	if ( ! text) {
		text = `Get our Tabs for Good Browser Plugin today and raise money for ${(ngo && name) || "good causes"} - just by browsing the internet.`;
	}
	const multiProduct = mydata && t4g; // some extra is needed to separate multiple products
	return (<>
		<MyLandingBackgroundImage bgImg={bgImg} ngo={ngo}>
			<Container fluid className={space("d-flex", !shiftLeft ? "justify-content-center" : "left-padding")}>
				<Row className="splash-top-margin">
						{!shiftLeft && <Col md={1} sm={0} /* left padding, but not on mobile */></Col>}
						<Col md={5} className="landing-left">
								<div className="title"> 
									<h1 className='text-left bolder'>{title}</h1>
									<p className='leader-text nomargin'>{text}</p>
								</div>
								{t4g && <div className={multiProduct && 'product'}>
									{multiProduct && <h4>Tabs for Good</h4>}
									<T4GSignUpButton className="w-100"/>
									<T4GHowItWorksButton className="w-100" />
								</div>}
								{mydata && <div className={multiProduct && 'product'}>
									{multiProduct && <h4><span className="new">new</span> My.Data</h4>}
									<MyDataSignUpButton className="w-100 mt-3" />
									<MyDataSignUpModal />
								</div>}
						</Col>
						{shiftLeft && <Col md={6} className='d-none d-xl-block' style={{zIndex:'-99'}}></Col>}
				</Row>
			</Container>
		</MyLandingBackgroundImage>
</>);
};

const MyDuoLandingSection = ({ngo, title, bgImg}) => {
	const name = NGO.displayName(ngo);

	const mobileWidth = window.innerWidth <= 768;
	const fontSizeCTA = mobileWidth ? '.8rem' : '1rem';
	
	if ( ! title) {
		title = `Turn your web browsing into ${(ngo && "cash for " + name) || "charity donations"}. For free.`;
	}

	const scrollToUpperCta = () => document.getElementById("upper-cta").scrollIntoView({behavior: "smooth"});


	return (<>
	<Container fluid className="home-landing-splash px-0" >
		<BG minHeight={mobileWidth ? null : "32vw"} 
		src={mobileWidth ? 'img/splash-screen/background-mobile.svg' : 'img/splash-screen/svg-bg-lg.svg'}
		className={mobileWidth ? null : 'd-flex justify-content-center align-items-center'}>
		<img src='img/splash-screen/foreground-mobile.png' className="d-md-none d-block w-100" />
		<img src='img/splash-screen/foreground-desktop.png' className="d-none d-md-block w-100 position-absolute" />
		<div className="splash-content d-flex flex-column align-items-center" style={!mobileWidth ? {margin:'0 34vw'} : null}>
			{title && <h1 className='text-center bolder text-white mx-3 mt-3'>{title}</h1>}
			<button className='btn btn-primary btn-lg mt-3 mx-auto mb-5' onClick={scrollToUpperCta}>Discover My.Good-Loop</button>
		</div>
		</BG>
	</Container>
	<Container fluid className="landing-duo-cta bg-gl-light-pink d-flex justify-content-center py-3 px-1">
		<a onClick={e => {
			stopEvent(e);
			showMyDataSignUpModal();
		}} className='text-decoration-none'>
			<div style={{borderRadius:'10px'}} className="mydata-splash-cta splash-cta bg-white shadow d-flex justify-content-between align-items-center mx-1 p-2">
				<img src="img/mydata/data-cta.png" className='logo'/>
				<span className='font-weight-bold p-1 pl-3 mx-auto' style={{fontSize:fontSizeCTA,transform:'translate(0, 10%)'}} >Sign Up For My.Data</span>
			</div>
		</a>
		<MyDataSignUpModal /> {/*NB: This Modal should be placed _outside_ of the anchor tags otherwise it can break rendering. Why? I don't know.*/}
		<C.A href='/tabsforgood' className='text-decoration-none'>
			<div style={{borderRadius:'10px'}} className="t4g-splash-cta splash-cta bg-white shadow d-flex justify-content-between align-items-center mx-1 p-2">
				<img src="img/mydata/t4g-cta.png" className='logo'/>
				<span className='font-weight-bold p-1 pl-3 mx-auto' style={{fontSize:fontSizeCTA,transform:'translate(0, 10%)'}}>Get Tabs For Good</span>
			</div>
		</C.A>
	</Container>
	</>);
}

const CornerHummingbird = () => {
	return (
		<img src="/img/green/hummingbird.png" className="corner-hummingbird"/>
	);
}

const CharityBanner = () => {
    return <Container className="charity-icons my-5">
        <Row className="text-center">
					<Col className='d-none d-md-block'><img src="img/LandingCharity/tommys.png" alt="" /></Col>
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
					<Col className='d-none d-md-block d-lg-none'><img src="img/LandingCharity/mssociety.png" alt="" /></Col>
					<Col className='d-block d-lg-none'><img src="img/LandingCharity/centrepoint.png" alt="" /></Col>
					<Col className='d-block d-lg-none'><img src="img/LandingCharity/GOSH.png" alt="" /></Col>
        </Row>
    </Container>;
};


const HowTabsForGoodWorks = ({className, shortTitle}) => {
	return (
		<PageCard id="howitworks" className={space("how-tabs-for-good-works text-center", className)}>
			<h1>{shortTitle ? "Here's how it works" : "How Tabs for Good Works"}</h1>
			<Row className="pt-5">
				<Col md={4} className='pt-2 pt-md-0 how-it-works-points'>
					<img className='w-50' src="/img/icons/laptop.png" alt="" />
					<h3 className='pt-4'>Open a tab</h3>
					<p className='pt-3 px-2'>When you open a new tab, we display a small unobtrusive banner ad at the bottom of your page while you're busy browsing away. </p>
				</Col>
				<Col md={4} className='pt-2 pt-md-0 how-it-works-points'>
					<img className='w-50' src="/img/icons/coin.png" alt="" />
					<h3 className='pt-4'>Unlock a donation</h3>
					<p className='pt-3 px-2'>As a thank you for letting the ad appear on your page, 
						you make a free donation to charity, funded by us. 50% of the ad money to be precise. </p>
				</Col>
				<Col md={4} className='pt-2 pt-md-0 how-it-works-points'>
					<img className='w-50' src="/img/icons/tick.png" alt="" />
					<h3 className='pt-4'>That's it!</h3>
					<p className='pt-3 px-2'>We don't track your online activity and you don't even have to click on the ad to make the donation happen. It really is that simple. </p>
				</Col>
			</Row>
		</PageCard>
	);
};

/**
 * ??describe this
 * Did put the charity logo onto a screenshot of T4G - but the current image no longer works for that
 */
const T4GCharityScreenshot = ({ngo, className, ...props}) => {
	return <BG src="/img/homepage/slide-1.png" className={className} center {...props}>
		{/*ngo && <CharityLogo charity={ngo} className="t4gscreenshot-logo"/>*/}
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
	const name = NGO.displayName(ngo);

	return (<>
		<PageCard className={space("tabs-for-goods-slide-card", bgClassName)}>
			{showUpperCTA && <div className="upper-cta white">
				<h1 className='mb-5 white'>Sign Up Today!</h1>
				<p className='leader-text text-center'>Start transforming your web browsing into life saving vaccines, meals for children in need, preserving habitats for endangered animals, plus many more good causes.</p>
				<img src="/img/homepage/bird-cloud.png" className='hummingbird'/>
				<img src="/img/signup/hand-globe-coins.png" className='hand-globe'/>
				<div className="mt-5">
					<T4GSignUpButton className="w-50 d-block mx-auto"/>

					<Button className="btn btn-secondary text-uppercase mt-3 w-50 d-block mx-auto" href="/tabsforgood">						
						Learn More <span className="d-none d-md-inline">About Tabs for Good</span>
					</Button>
				</div>
			</div>}
			<TabsForGoodSlideSection2 ngo={ngo} />
		</PageCard>

		{showLowerCTA && <>
			<CurvePageCard color="desat-blue" bgClassName={bgClassName}>
				<h1 className='white'>Start using Tabs for Good today and together we'll...</h1>
				<Row className="mt-5">
					<Col md={4} className='pt-2 pt-md-0'> 
						<div className="tricard-inner">
							{/* <img className='w-100' src={(ngo && ngo.logo) || "img/TabsForGood/fifty-card.png"} alt="" /> */}
							<img className='w-100' src={(ngo ? "../img/TabsForGood/fifty-card.png" : "img/TabsForGood/fifty-card.png")} alt="" />
							<div className='p-3'>
								<h3>Donate 50% of online ad fees to {ngo ? name : "good causes"}</h3>
							</div>
						</div>
					</Col>
					<Col md={4} className='pt-2 pt-md-0'>
						<div className="tricard-inner">
							<img className='w-100 bg-gl-light-pink' src={(ngo ? "../img/TabsForGood/world-card.png" : "img/TabsForGood/world-card.png")} alt="" />
							<div className='p-3'>
								<h3>{ngo ? "Let's help "+name+" do even more good. Together." : "Give that money to a charity of your choice"}</h3>
							</div>
						</div>
					</Col>
					<Col md={4} className='pt-2 pt-md-0'>
						<div className="tricard-inner">
							<img className='w-100' src="../img/TabsForGood/girl-card.png" alt="" />
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

export const TabsForGoodSlideSection2 = ({ngo}) => {
	const name = NGO.displayName(ngo) || "charity";
	const items = [
		<>
			<p>Sign up for Tabs for Good.</p>
			<p>Start browsing with the Tabs for Good plugin.</p>
			<p>Raise money for {name}. For free.</p>
		</>,
		<>
			<p>Follow your online impact in the My.Good-Loop hub and see how much you're raising for {name} - just by browsing the internet.</p>
		</>
	];

	const titles = [
		"It couldn't be easier to get started",
		"...And see your impact grow"
	];
	const images = [
		<T4GCharityScreenshot ngo={ngo} className="slide-img"/>,
		<BG src="/img/homepage/slide-2.png" className="slide-img" center></BG>
	]

	return (
	<BSCarousel className="d-none d-md-flex mt-5">
		{items.map((content, i) => 
			<Row className="slideshow" noGutters key={i}>
				<Col md={6} className="slide-left overflow-hidden">
					{images[i]}
				</Col>
				<Col md={6} className="slide-right p-5">
					<div key={i} className='d-flex flex-column justify-content-between h-100 p-3'>
						<h3>{titles[i]}</h3>
						<div className='slide-content'>
							{content}
						</div>
						<T4GSignUpButton className="t4gcta"/>
					</div>
				</Col>
			</Row>
		)}
		</BSCarousel>
	);
};

const NewsAwards = ({children}) => {
	let firstIMG="/img/pub-logos/campaign-logo.png";
	let firstLink="https://www.campaignlive.co.uk/article/meet-start-up-helping-nestle-nike-unilever-unite-programmatic-purpose/1722847";
	let secondIMG="/img/pub-logos/marketing-brew-logo.png" ;
	let secondLink="https://www.morningbrew.com/marketing/stories/2021/11/24/good-loop-is-creating-tools-to-make-ad-tech-more-ethical-and-sustainable"				;
	let thirdIMG="/img/pub-logos/forbes-logo.jpeg" ;
	let thirdLink="https://www.forbes.com/sites/afdhelaziz/2020/06/25/goodloop-an-ethical-advertising-platform-that-allows-brands-to-spend-media-dollars-and-do-good-at-the-same-time-launches-in-the-united-states/?sh=22ac280c3987";

	return(
		<PageCard className="py-3">
			<div className="text-center">
				{children}
				<div className="row">
					<div className="col align-items-center justify-content-center d-none d-md-flex"><img className='logo' src="/img/homepage/Stars.png" alt="" /></div>
					<div className="col">
						<LinkOut href={firstLink}><img className='logo logo-xl' src={firstIMG} alt="" /></LinkOut>
					</div>
					<div className="col">
						<LinkOut href={secondLink}><img className='logo logo-xl' src={secondIMG} alt="" /></LinkOut>
					</div>
					<div className="col">
						<LinkOut href={thirdLink}><img className='logo logo-xl' src={thirdIMG} alt="" /></LinkOut>
					</div>
					<div className="col align-items-center justify-content-center d-none d-md-flex"><img className='logo' src="/img/homepage/Stars.png" alt="" /></div>
				</div>
			</div>
		</PageCard>
	)
};

const TestimonialSectionTitle = () => {
	return(<>
	<div className="testimonial-title">
		<div className="container">
			<div className="testimonial-upper text-center">
				<h1>Together we've raised over £3.9 million!</h1>
				<p className='leader-text' style={{marginBottom:"6rem"}}>We donate to charities worldwide. Spreading that money far and wide to those who need it the most. All thanks to our fantastic Good-Loop community.</p>
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
			<img src="/img/curves/curve-dark-turquoise-bottom.svg" className="w-100 d-none d-md-block"/>
			<div className="container">
				<div className="testimonial-card my-0 mb-md-5">
					<div className="row">
						<div className="col-md-6 p-0">
							<img className='w-100 h-100' src="/img/homepage/photo-by-priscilla-du-preez-unsplash.jpg" alt="" />
						</div>
						<div className="col-md-6 testimonial-right">
								<Circle className="mx-auto" width="8em"><img className="logo logo-xl" src="/img/charity-logos/centrepoint.png" alt="Centrepoint" /></Circle>
								<img src="/img/homepage/quote.svg" className='quote-img'/>
								<h3 className='sm mt-5'>Supporting centrepoint</h3>
								<p>"The amazing income generated by GoodLoop will support a wider selection of teams and projects - unrestricted funds are really useful and enable Centrepoint to be dynamic with the way we support young people."</p>
								<p><i>Lucy Coleman, Senior Corporate Development Manager, Centrepoint (2020)</i></p>
								<p className='TODO read-more'>READ MORE ABOUT OUR <a href="#">CHARITY IMPACT</a></p>
						</div>
					</div>
				</div>
				<div className="testimonial-impact text-center">
					<div className="row pt-5">
						<div className="col-md-4 testimonial-points row">	
							<div className="col">
								<Circle className="mx-auto" width='4em'>
									<img className='logo' src="/img/charity-logos/we-forest.jpeg" alt="We Forest logo" />
								</Circle>
								<h3 className='pt-md-4 pt-3'>721.3 Hectares</h3>
								<p className='nomargin'>of forest restored<br/>(that's 1,000+ football pitches!)</p>
							</div>
						</div>
						<div className="col-md-4 testimonial-points">
							<div className="col">
								<Circle className="mx-auto" width='4em'>
									<img className='logo' src="/img/charity-logos/no-kid-hungry.png" alt="No Kid Hungry logo" />
								</Circle>
								<h3 className='pt-md-4 pt-3'>183,318 Meals</h3>
								<p className='nomargin'>provided for children</p>
							</div>
						</div>
						<div className="col-md-4 row testimonial-points">
							<div className="col">
								<Circle className="mx-auto" width='4em'>
									<img className='logo' src="/img/charity-logos/mind.png" alt="Mind logo" />
								</Circle>
								<h3 className='pt-md-4 pt-3'>500+ Helpline Calls</h3>
								<p className='nomargin'>and 195 hours of online peer-to-peer support</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div className="bg-gl-light-pink">
			<img src="/img/curves/curve-desat-blue-round-bottom.svg" className='w-100' alt="" />
		</div>
	</>)
};

/**
 * A white circle with centered content
 */
const Circle = ({className, color="bg-light", width,children}) => {
	return <div 
		className={space(className, color, 'rounded-circle justify-content-center align-items-center overflow-hidden')} 
		style={{width,height:width}}>
		{children}
		</div>;
};


const PositivePlaceSection = ({className, showCTA}) => {
	return <PageCard className={space("positive-place-section text-center", className)}>
		<h1 className='pt-5'>Let's make the internet a more positive place. Together.</h1>
		<Row className="pt-5 d-flex justify-content-around">
			<Col md={3} className="video-points">
				<img className='w-50' src="img/icons/fifty-percent.png" alt="" />
				<h3 className='pt-4'>Supporting charity</h3>
				<p className="white">50% of online ad fees donated to charity</p>
			</Col>
			<Col md={3} className="video-points">
				<img className='w-50' src="img/icons/world-hand.png" alt="" />
				<h3 className='pt-4'>Planet positive</h3>
				<p className="white">Helping brands offset their digital carbon footprint</p>
			</Col>
			<Col md={3} className="video-points">
				<img className='w-50' src="img/icons/padlock.png" alt="" />
				<h3 className='pt-4'>Privacy friendly</h3>
				<p className="white">Keeping your online privacy safe no matter what</p>
			</Col>
		</Row>
		{showCTA && <T4GSignUpButton className="mt-5" />}
	</PageCard>
}

const WatchVideoSection = () => {
	let videoLink = isMobile() ? "img/homepage/t4gpromovid_480p.m4v" : "img/homepage/t4gpromovid_720p.m4v";

	const [preview, setPreview] = useState('');
	const vidRef = useRef(null);

	const playVideo = () => {
		setPreview("d-none");
		vidRef.current.play();
	}

	return(<>
	<PageCard className="watch-video-section">
		<div className="text-center">
			<h1 className='pt-5'>Watch To See How We're Creating A Movement</h1>
			<div className="promovid">
				<img className={space(preview, 'w-100')} src="img/homepage/video_preview.png" alt="video preview" onClick={playVideo}/>
				<video ref={vidRef} className='w-100' preload="auto" controls>
					<source src={videoLink} type="video/mp4" />
				</video>
			</div>
			<img src="/img/green/hummingbird.png" className='hummingbird d-none d-md-block'/>
			<img src="/img/signup/hand-globe-coins.png" className='hand-globe-coins d-none d-md-block' />
			<div className="m-5">
				<p className='leader-text'>We're working with fantastic brands that want to join us in making the internet a more positive place. <br/><br/>
				The way we're doing it couldn't be simpler. We just need the final piece of the puzzle to make it happen - you. Sign up and join the Good-Loop movement today. </p>
				<T4GSignUpButton className="mx-5 mt-5" dUnset />
				{/* <p className='our-story black m-5 pb-5'>Want to learn more? Check out <a href="#">OUR STORY</a></p> */}
			</div>
			
		</div>
	</PageCard>
	</>
	)
};

const GetInvolvedSection = () => {
	return(
		<PageCard className="get-involved-section text-center bg-gl-light-pink">
			<img src="/img/green/hummingbird.png" className='hummingbird'/>
			<div className='get-involved-text'>
				<h1>This is just the beginning. sign up and join our movement.</h1>
				<p className='leader-text mt-5'>We’re developing exciting new products that will help us all make the internet a more positive place. Register below to get exclusive access to future product launches and more ways to raise money for charity while you browse.</p>
				<SubscriptionForm purpose='preregister' buttonText="Register for Updates" />
			</div>
			<div className="row pt-5">
				<div className="col-md-4 get-involved-points">
					<img className='w-25' src="/img/homepage/globe.png" alt="" />
					<h3 className='pt-md-4 mb-0 ml-1 sm'>Donate to charity. For free. </h3>
				</div>
				<div className="col-md-4 get-involved-points">
					<img className='w-25' src="/img/homepage/heart.png" alt="" />
					<h3 className='pt-md-4 mb-0 ml-1 sm'>Make the world a better place</h3>
				</div>
				<div className="col-md-4 get-involved-points">
					<img className='w-25' src="/img/homepage/world.png" alt="" />
					<h3 className='pt-md-4 mb-0 ml-1 sm'>Just by browsing the internet</h3>
				</div>
			</div>
		</PageCard>
	)
};

const TriCards = ({className, titles, texts, images, links=["#", "#", "#"] }) => {
	return(
		<PageCard className={space("tri-card", className)}>
			<Row className="mt-5">
				<Col md={4} className='pt-2 pt-md-0'> 
					<div className="tricard-inner">
						<img className='w-100' src={images[0]} alt="" />
						<div className='tricard-text p-3'>
							<h3>{titles[0]}</h3>
							<span>{texts[0]} </span><C.A href={links[0]}>Read More</C.A>
						</div>
					</div>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<div className="tricard-inner">
						<img className='w-100' src={images[1]} alt="" />
						<div className='tricard-text p-3'>
							<h3>{titles[1]}</h3>
							<span>{texts[1]} </span><C.A href={links[1]}>Read More</C.A>
						</div>
					</div>
				</Col>
				<Col md={4} className='pt-2 pt-md-0'>
					<div className="tricard-inner">
						<img className='w-100' src={images[2]} alt="" />
						<div className='tricard-text p-3'>
							<h3>{titles[2]}</h3>
							<span>{texts[2]} </span><C.A href={links[2]}>Read More</C.A>
						</div>
					</div>
				</Col>
			</Row>
		</PageCard>
	)
};

const WhatIsTabsForGood	= ({ngo}) => {
	return (<>
		<PageCard className="how-tabs-for-good-works text-center">
			<h1 className='mb-4'>What is Tabs for Good?</h1>
			<p className=''><b>Tabs for Good is your browser plugin that transforms web browsing into charity donations for free. Helping turn your browsing into life saving vaccines, meals for children in need, preservation of habitats for endangered animals, plus many more good causes.</b></p>
			<Row className="py-5 d-none d-md-flex">
				<Col md={4}>
					<NGOImage bg center ngo={ngo} main src="/img/LandingCharity/photo-by-andrii-ryzhkov-unsplash.jpg"
						ratio={100} alt=""/>
				</Col>
				<Col md={4}>
					{/* Center image remains as the T4G graphic */}
					<BG center src="/img/homepage/slide-1.png"
						ratio={100} alt="" />
				</Col>
				<Col md={4}>
					<NGOImage bg center ngo={ngo} imgIdx={0} src="/img/LandingCharity/photo-by-larm-rmah-unsplash.jpg"
						ratio={100} alt="" />
				</Col>
				{/*<Col md={4}>
					<BG center src={(ngo && ngo.images) || (imgs && imgs[2]) || "/img/homepage/world.png"} ratio={100} alt="" />
				</Col>*/}
			</Row>
			<img className="d-md-none w-100" src="/img/LandingCharity/laptop-1.png" />
			<T4GSignUpButton className="mx-auto"/>
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
	T4GCharityScreenshot,
	GetInvolvedSection,
	CharityBanner,
	MyLandingSection,	
	MyDuoLandingSection,
	PageCard,
	CurvePageCard,
	WhatIsTabsForGood,
	CardImgLeft,
	CornerHummingbird
};
