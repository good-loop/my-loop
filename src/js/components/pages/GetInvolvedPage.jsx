import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { getAllXIds } from '../../base/data/Person';
import SubscriptionBox from '../cards/SubscriptionBox';
import MyLoopNavBar from '../MyLoopNavBar';
import { MoreToDo } from './AccountPage';

const Ref = ({href}) => {
	return <a className='Ref' target="_blank" rel="noreferrer" href={href}>*</a>;
};

const GetInvolvedPage = () => {
	let xids = getAllXIds(); 
	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
		<div className="GetInvolvedPage">
			<img src="/img/LandingBackground/involved_banner.png" alt="banner" className="w-100 mt-5"/>
			<Container className="py-5">
				<h1 className="text-center">Get involved and be part<br/>of the ad revolution</h1>
				{/* what is this div for?? */}
				<div className="d-flex justify-content-center align-items-center mb-5" />
				{/* Offset this to the right - technically off-center but looks weighted otherwise, eyes are weird */}
				<Row className="ml-md-5 pl-md-5 text-center text-md-left"> 
					<Col md={6}>
						<div className="w-100 h-100 flex-column unset-margins justify-content-center mission">
							<h2 className="mr-auto">What is our mission?</h2>
							<p>Our mission is to change the global ad industry for good through turning adverts into charitable donations.
								<em>$586 billion was spent on advertising</em> in 2019 alone<Ref href='/resources/statistic_id236943_global-advertising-revenue-2012-2024.pdf' /> - if 
								that money had gone through Good-Loop, we could completely <em>stop 
									the rise of greenhouse gas in just one year</em><Ref href="https://www.bloomberg.com/news/articles/2019-10-23/how-to-halt-global-warming-for-300-billion"/>.
								As part of the Good-Loop community, you can help us make that a reality.</p>
						</div>
					</Col>
					<Col md={6}>
						<video className="w-100" src="/img/LandingBackground/Yinyang.mp4" autoPlay loop muted/>
					</Col>
				</Row>
				<div className="flex-column unset-margins pt-5 pb-5 mt-5 justify-content-center align-items-center">
					<h2 className="text-center mb-5">What can you do to help?</h2>				
					<MoreToDo xids={xids} />
				</div>
				<div className="GetInTouch text-center">
					<h2 className="mr-auto">Get in touch</h2>					
					<p>Tell us what you think: <a target="_blank" href='mailto:hello@good-loop.com?subject=My%20thoughts%20on%20My.Good-Loop'>hello@good-loop.com</a></p>
					<p>Interested in hosting Ads For Good on your blog or website? <a href='https://www.good-loop.com/contact'>Let us know</a>.</p>
				</div>
			</Container>
			<SubscriptionBox title="Subscribe to our monthly newsletter" className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};

export default GetInvolvedPage;
