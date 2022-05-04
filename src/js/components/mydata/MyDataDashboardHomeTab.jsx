import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Alert} from 'reactstrap';
import { ProfileDot, ProfileDotRow, getThisWeeksAd, hasWatchedThisWeeksAd } from './MyDataCommonComponents';
import { getCharityObject, getEmail, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import ServerIO from '../../plumbing/ServerIO'
import TickerTotal from '../TickerTotal';
import Icon from '../../base/components/Icon';
import { T4GCharityScreenshot } from '../pages/CommonComponents';
import NGO from '../../base/data/NGO';
import C from '../../C';
import { getId } from '../../base/data/DataClass';
import NGOImage from '../../base/components/NGOImage';
import NGODescription from '../../base/components/NGODescription';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import CharityLogo from '../CharityLogo';
import Misc from '../../base/components/Misc';

// Hidden until we get some latest news to show
/*
const LatestNewsCard = () => {
	const pvNgo = getCharityObject();
    let ngo = null;
    if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

	return (<>
	<h1>Latest News</h1>
	<Container className='latest-news-card border border-dark rounded'>
		<Row id="latest-news-title-tab">
		</Row>
		<Row id="latest-news-content">
			<Col xs={4}>
			<img src="/img/placeholder-circle.png" className='w-100' alt="" />
			</Col>
			<Col xs={8}>
				<p>Complete Your Profile To Unlock More Donations for {ngo && ngo.name}.</p>
			</Col>
		</Row>
	</Container>
	</>);
};*/

const AchievementCard = () => {
	return (<>
	<h1 className="mt-4">Our Community Impact</h1>
	<Container className='dashboard-card achievements'>
			<Container className='together-we-raised'>
				<h3>Together we've raised</h3>
				<h1>&lt;&nbsp;<TickerTotal/>&nbsp;&gt;</h1>
				<h3>For global causes</h3>
			
				<Container className="d-flex flex-row justify-content-center">
					<img src="/img/mydata/world-impact.png" className='img-lg' />
				</Container>

				<Container className="my-2 py-2 text-white">
					<ProfileDotRow>
						<ProfileDot imgUrl="/img/mydata/supporting.png"><>1 Million Trees Planted</></ProfileDot>
						<ProfileDot imgUrl="/img/mydata/supporting.png"><>183,318 Meals For Children</></ProfileDot>
						<ProfileDot imgUrl="/img/mydata/supporting.png"><>500+ Helpline Calls</></ProfileDot>
					</ProfileDotRow>
				</Container>
			</Container>		
	</Container>
	</>)
}

const ThisWeeksAdCard = () => {
	// if user clicked "watch it again", override watched
	const [watchAnyway, setWatchAnyway] = useState(false);
	// The good-loop unit is calling back too fast before its loaded - use a timeout for now
	// TODO get proper loading callback
	const [adLoaded, setAdLoaded] = useState(false);
	useEffect(() => {
		setTimeout(() => setAdLoaded(true), 2500);
	}, [adLoaded]);

	const pvAd = getThisWeeksAd();
	const exists = !!(pvAd && pvAd.resolved && pvAd.value);
	const adid = exists && pvAd.value.id;
	const watched = adid && hasWatchedThisWeeksAd(adid) && !watchAnyway;

	const WatchedAd = ({className, style, showBtn}) => {
		const watchAgain = () => {
			setWatchAnyway(true);
			setAdLoaded(false);
		}
		return <div className={space("watch-ad-done", className)} style={style}>
			<img src="/img/mydata/green_tick.png" className="green-tick"/>
			<div className="watched-text">
				<h3>Weekly watch done!</h3>
				{showBtn && <>
					<Button color="primary" onClick={watchAgain}>Watch it again<br/></Button>
					<p><small>After the first view, watching again does not raise extra money.</small></p>
				</>}
			</div>
		</div>;
	}

	return (<Container className='dashboard-card'>
			<h1>Watch This Week's Ad</h1>
			<div className="position-relative">
			{!watched ? 
				<div className="position-relative d-flex flex-column justify-content-center align-items-center">
					{adLoaded && exists && <WatchedAd className="position-absolute" style={{top:0, left:0, width:"100%", height:"100%"}}/>}
					{exists && adid ? <GoodLoopUnit vertId={adid} className="dashboard-ad"/>
						: (pvAd && pvAd.resolved ? <>
							<h3>No ad this week!</h3>
							<p>Check back another time to raise money for charity</p>
						</> : <Misc.Loading />)}
				</div> : 
				<WatchedAd showBtn/>}
			</div>
			<br/>
			<p className="text-center">When you watch one of our ads 50% of the ad fee goes to charity.</p>
		</Container>);
};

const GetT4GCard = ({ngo}) => {
	return <Container className="dashboard-card">
		<h1>Get Tabs for Good</h1>
		<Row>
			<Col md={6} className="mb-3 mb-md-0">
				<img src="/img/homepage/slide-1.png" className="w-100"/>
			</Col>
			<Col md={6} className="d-flex flex-column align-items-center justify-content-center">
				<p className="text-center">Add Tabs for Good to your desktop browser to raise money for {NGO.displayName(ngo)} while you surf the web</p>
				<C.A href={ngo ? "/charity/" + getId(ngo) : "/tabsforgood"}><Button color="primary">Find out more</Button></C.A>
			</Col>
		</Row>
	</Container>;
};

const AboutYourCharity = ({ngo}) => {
	const name = NGO.displayName(ngo);
	return (
		<Container className="dashboard-card supporting">
			<h5 className="pt-2">Your Are Supporting</h5>
			{ngo && <div className="charity-logo"><CharityLogo charity={ngo} /></div>}
			<NGOImage src="/img/stats1-cropped.jpg" main ngo={ngo} className="w-100"/>
			
			<h4 className="mt-3 text-left">What {name} Is Doing</h4>
			<NGODescription extended ngo={ngo} className="text-center"/>
		</Container>
	)
};

const MyDataDashboardHomeTab = () => {

	const pvCharity = getCharityObject();
	const ngo = pvCharity && (pvCharity.value || pvCharity.interim);
	
	return (<>
		{/*<LatestNewsCard />*/}
		<AchievementCard />
		<br/>
		<AboutYourCharity ngo={ngo}/>
		<h3 className="px-3 my-3 my-md-5">Ways to Raise Even More</h3>
		<ThisWeeksAdCard />
		<br/>
		<GetT4GCard ngo={ngo}/>
		<br/>
		<FeedbackCard />
	</>)
};

const FeedbackCard = () => {
	let [sent, setSent] = useState();
	const sendFeedback = () => {
		let data = {
			name: Login.getId(),
			email: getEmail(),
			message: DataStore.getValue("widget","feedback","message"),
			notify: "support@good-loop.com"
		};
		ServerIO.load("https://profiler.good-loop.com/form/good-loop.com", {data, method: 'POST'});
		setSent(true);
	};

	return (<Container className="dashboard-card">
		<h1>Send Feedback</h1>
		<p>Let us know what you think! Feedback really helps us to learn and improve.</p>
		<Row>
			{/* TODO an image <Col md={6} className="mb-3 mb-md-0">
				<img src="/img/homepage/slide-1.png" className="w-100"/>
			</Col> */}
			<Col className="d-flex flex-column align-items-center justify-content-center">
				<Form onSubmit={sendFeedback} className="w-75" >
					<PropControl label="Your Message" className="w-100" disabled={sent} type="textarea" rows={5} prop="message" path={["widget","feedback"]} />
					<Button disabled={sent} color="primary" className='mx-auto w-75 mt-2' onClick={sendFeedback}>Send</Button>
				</Form>
				{sent && <Alert color="success">Thank you - Your message has been sent.</Alert>}
			</Col>
		</Row>
</Container>);
};

export default MyDataDashboardHomeTab;