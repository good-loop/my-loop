import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import MyLoopNavBar from '../MyLoopNavBar';
import WhiteCircle from '../campaignpage/WhiteCircle';
import ShareButton from '../ShareButton';
import SubscriptionBox from '../cards/SubscriptionBox';
import { LoginLink } from '../../base/components/LoginWidget';

const GetInvolvedPage = () => {

	const openCookieSettings = e => {
		e.preventDefault();
		window.cookiehub.openSettings();
	};

	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
		<div className="GetInvolvedPage">
			<img src="/img/LandingBackground/involved_banner.png" className="w-100 mt-5"/>
			<Container className="py-5">
				<h1 className="text-center">Get involved and be part<br/>of the ad revolution</h1>
				<div className="d-flex justify-content-center align-items-center mb-5">
				</div>
                {// Offset this to the right - technically off-center but looks weighted otherwise, eyes are weird
                }
				<Row className="ml-md-5 pl-md-5 text-center text-md-left"> 
					<Col md={6}>
						<div className="w-100 h-100 flex-column unset-margins justify-content-center mission">
							<h2 className="mr-auto">What is our mission?</h2><br/>
							<p>Our mission is to change the global ad industry for good through turning adverts into charitable donations.
								<span className="color-gl-light-red"> $586 billion was spent on advertising</span> in 2019 alone<a target="_blank" href="/resources/statistic_id236943_global-advertising-revenue-2012-2024.pdf">*</a> -
								if that money had gone through Good-Loop, we could completely
								<span className="color-gl-light-red"> stop the rise of greenhouse gas in just one year</span><a target="_blank" rel="noreferrer" href="https://www.bloomberg.com/news/articles/2019-10-23/how-to-halt-global-warming-for-300-billion">*</a>.
								As part of the Good-Loop community, you can help us make that a reality.</p>
						</div>
					</Col>
					<Col md={6}>
						<video className="w-100" src="/img/LandingBackground/Yinyang.mp4" autoPlay loop muted/>
					</Col>
				</Row>
				<div className="flex-column unset-margins text-center pt-5 mt-5 justify-content-center align-items-center">
					<h2 className="mb-5">What could you do to help us?</h2>

					<WhiteCircle width="125px" className="my-5"><h1>1.</h1></WhiteCircle>
					<h4 className="mb-3">Sign up</h4>
					<p className="w-md-50 mb-5">Creating an account unlocks more features, which help us do even more good and give you more control.<br/><LoginLink><div className="btn btn-transparent fill">Sign up</div></LoginLink></p>

					<WhiteCircle width="125px" className="my-5"><h1>2.</h1></WhiteCircle>
					<h4 className="mb-3">Recognise the Good-Loop ads</h4>
					<p className="w-md-50">Remember our logo, so whenever you see one of our ads, you could recognise it and watch it for a few seconds to unlock a donation.</p>
					<img className="w-md-25 mb-5" src="/img/new-logo-with-text.svg"/>
                    
					<WhiteCircle width="125px" className="my-5"><h1>3.</h1></WhiteCircle>
					<h4 className="mb-3">Share the good news</h4>
					<p className="w-md-50">Spread the word about our mission by telling your friends about it and by sharing this website on one of your social media channels.</p>
					<ShareButton className="btn-transparent fill"
						title="My-Loop"
						image="/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png"
						description="Using ads for good"
						url="https://my.good-loop.com"
					>
						Share
					</ShareButton>
					<div className="pb-5"></div>
				</div>

			</Container>
			<SubscriptionBox title="Subscribe to our monthly newsletter" className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};

export default GetInvolvedPage;
