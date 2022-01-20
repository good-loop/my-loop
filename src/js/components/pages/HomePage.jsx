import React, { useEffect } from 'react';
import { Container } from 'reactstrap';
// import PV from 'promise-value';
import { useSpring } from 'react-spring';

import DataStore from '../../base/plumbing/DataStore';
import Roles from '../../base/Roles';
import LandingSection, { springPageDown } from '../LandingSection';
import SubscriptionBox from '../cards/SubscriptionBox';
import { isPortraitMobile, stopEvent } from '../../base/utils/miscutils';
import { RegisterLink, setLoginVerb, setShowLogin } from '../../base/components/LoginWidget';
import CharitySection from '../CharitySection';
import MyLandingSection from '../MyLandingSection';

window.DEBUG = false;

const HowTabsForGoodWorks = () => {
	return (
	<div className="how-tabs-for-good-works container text-center pt-3">
		<h1>How Tabs For Good Works</h1>
		<div className="row pt-5">
			<div className="col-md-4">
				<img className='w-50' src="/img/homepage/globe.png" alt="" />
				<h3 className='pt-4'>Open a tab</h3>
				<p className='pt-3'>When you open a new tab, we display a small unobtrusive banner ad at the bottom of your page while you're busy browsing away. </p>
			</div>
			<div className="col-md-4">
				<img className='w-50' src="/img/homepage/heart.png" alt="" />
				<h3 className='pt-4'>Unlock a donation</h3>
				<p className='pt-3'>As a thank you for letting the ad appear on your page, 
					you make a free donation to charity, funded by us. 50% of the ad money to be precise. </p>
			</div>
			<div className="col-md-4">
				<img className='w-50' src="/img/homepage/world.png" alt="" />
				<h3 className='pt-4'>That's it!</h3>
				<p className='pt-3'>We don't track your online activity and you don't even have to click on the ad to make the donation happen. It really is that simple. </p>
			</div>
		</div>
	</div>
	)
}

const TabsForGoodSlideCard = () => {
	return (
		<div className="tabs-for-goods-slide-card">
			<div className="container">
				<div className="upper-cta">
					<p>Start transforming your web browsing into life saving vaccines, meals for children in need, preserving habitats for endangered animals, plus many more good causes.</p>
					<RegisterLink className="btn btn-primary h-100 d-flex align-items-center justify-content-center">
						Sign up for the Tabs For Good
					</RegisterLink>
					<button id="newsletter-btn" className="btn btn-newsletter h-100 d-flex align-items-center justify-content-center">
						Learn More About Tabs For Good
					</button>
				</div>

				<div className="slide-cards row">
					<div className="col-6">
						<h3>Slide 1 of 2</h3>
						Visualaisation of picking a charity and getting browsing with T4G
					</div>
					<div className="col-6">
						<h3>It Couldn't be easier to get started</h3>
						Sign up for Tabs For Good.
						Pick the charity you want to support.
						Start browsing with the Tabs for Good plugin and raise money for charity. For Free.
					</div>
				</div>
			</div>
		</div>
	)
}

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
}

const WatchVideoCard = () => {
	return(
		<div className="watch-video-card">
			<div className="container text-center">
				<h1 className='pt-5'>Let's make the internet a more positive place. Together.</h1>
				<div className="row pt-5">
					<div className="col-md-4">
						<img className='w-50' src="/img/homepage/globe.png" alt="" />
						<h3 className='pt-4'>50% of online ad fees donated to charity </h3>
					</div>
					<div className="col-md-4">
						<img className='w-50' src="/img/homepage/heart.png" alt="" />
						<h3 className='pt-4'>Helping brands offset their digital carbon footprint</h3>
					</div>
					<div className="col-md-4">
						<img className='w-50' src="/img/homepage/world.png" alt="" />
						<h3 className='pt-4'>Keeping your online privacy safe no matter what</h3>
					</div>
				</div>
				<h1 className='pt-5'>WATCH TO SEE HOW WE’RE CREATING A MOVEMENT</h1>
				<video src=""></video>
				<p>We’re working with fantastic brands that want to join us in making the internet a more positive place. <br/><br/>
				The way we’re doing it couldn’t be simpler. We just need the final piece of the puzzle to make it happen – you. Sign up and join the Good-Loop movement today. </p>
				<RegisterLink className="btn btn-primary h-100 d-flex align-items-center justify-content-center">
					Sign up for the Tabs For Good
				</RegisterLink>
				<p className='our-story'>Want to learn more? Check out <a href="#">OUR STORY</a></p>
			</div>
		</div>
	)
}

const HomePage = ({spring}) => {
	//spring the page down if asked to for how it works section
	const [, setY] = useSpring(() => ({ y: 0 }));

	if (spring) springPageDown(setY);

	// If we're currently in as.good-loop.com, and we have a glvert param defined, we should redirect to campaign page
	useEffect(() => {
		const urlParams = DataStore.getValue(['location', 'params']);
		if (Object.keys(urlParams).includes('gl.vert')) {
			window.location.href = `/#campaign/?gl.vert=${urlParams['gl.vert']}`;
		}
	});

	// <ShareAdCard /> is buggy, so removed for now

	return (<>
		<div className="HomePage widepage">
			<MyLandingSection />
			<HowTabsForGoodWorks />
			<TabsForGoodSlideCard />
			<CharityBanner />
			<WatchVideoCard />
			<SubscriptionBox className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};

const showRegisterForm = e => {
	stopEvent(e);
	setLoginVerb('register');
	setShowLogin(true);
};


export default HomePage;