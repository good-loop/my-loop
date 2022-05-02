import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Alert} from 'reactstrap';
import { ProfileDot, ProfileDotRow } from './MyDataCommonComponents';
import { getCharityObject, getEmail, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import { getDataList } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import ServerIO from '../../plumbing/ServerIO'
import TickerTotal from '../TickerTotal';
import SearchQuery from '../../base/searchquery';
import { getDataLogData } from '../../base/plumbing/DataLog';
import Icon from '../../base/components/Icon';
import { T4GCharityScreenshot } from '../pages/CommonComponents';
import NGO from '../../base/data/NGO';
import C from '../../C';
import { getId } from '../../base/data/DataClass';
import NGOImage from '../../base/components/NGOImage';
import NGODescription from '../../base/components/NGODescription';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import DataStore from '../../base/plumbing/DataStore';

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
	return (
	<Container className='dashboard-card'>
			<div className='text-center text-white'>
				<h3>Together we've raised</h3>
				<h1><TickerTotal/></h1>
				<h3>For global causes</h3>
			</div>
			<div className="d-flex flex-row justify-content-center align-items-center">
				<img TODOMYDATA_img src="/img/placeholder-circle.png" className='img-lg' alt="" />
			</div>
			<Container className='border border-white rounded bg-white my-3 py-3'>
				<p className='text-center'>Some Things We've Achieved</p>
				<ProfileDotRow>
					<ProfileDot TODOMYDATA_img><>20,000 Meals For Children</></ProfileDot>
					<ProfileDot TODOMYDATA_img><>600 Life-Saving Medicine Kits</></ProfileDot>
					<ProfileDot TODOMYDATA_img><>100 Guide Dog Puppies Trained</></ProfileDot>
				</ProfileDotRow>
			</Container>
	</Container>
	);
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
	// load ad from scheduledcontent
	// TODO filter by start, end
	let pvMyAds = getDataList({type:"ScheduledContent", status:KStatus.PUBLISHED, domain:ServerIO.PORTAL_ENDPOINT});		
	let schedcon = pvMyAds.value && List.first(pvMyAds.value);
	let adid = schedcon && schedcon.adid;

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

	// if ( TODO ! adid) {
	// 	return <p>No ad available.</p>
	// }
	// query datalog for evt:minview vert:adid BUT need the adunit here to log your user id!
	let sq = new SearchQuery("evt:minview");
	sq = SearchQuery.setProp(sq, "vert", adid);
	sq = SearchQuery.setProp(sq, "user", Login.getId());
	let q = sq.query;
	const pvData = getDataLogData({dataspace:"gl",q, start:"3 months ago",end:"now",name:"watched-this-weeks",});
	let watched = !!(pvData.value && pvData.value.allCount) && !watchAnyway;

	return (<Container className='dashboard-card'>
			<h1>Watch This Week's Ad</h1>
			<div className="position-relative">
			{!watched ? <div className="position-relative d-flex flex-row justify-content-center align-items-center">
				{adLoaded && <WatchedAd className="position-absolute" style={{top:0, left:0, width:"100%", height:"100%"}}/>}
				{pvMyAds.resolved? <GoodLoopUnit vertId={adid} className="dashboard-ad"/> : <Misc.Loading />}
			</div> : <WatchedAd showBtn/>}
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
	return <Container className="dashboard-card">
		<h1>About your charity</h1>
		<Row>
			<Col md={6} className="mb-3 mb-md-0">
				<NGOImage src="/img/stats1-cropped.jpg" main ngo={ngo} className="w-100"/>
			</Col>
			<Col md={6}>
				<NGODescription extended ngo={ngo} className="text-center"/>
			</Col>
		</Row>
	</Container>
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
		<FeedbackCard />
	</>)
};

const FeedbackCard = () => {
	let [sent, setSent] = useState();
	const sendFeedback = () => {
		ServerIO.post("https://profiler.good-loop.com/form/good-loop.com", {
			name: Login.getId(),
			email: getEmail(),
			message: DataStore.getValue("widget","feedback","message"),
			notify: "support@good-loop.com"
		});
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
				<Form onSubmit={sendFeedback} >
					<PropControl disabled={sent} type="textarea" prop="message" path={["widget","feedback"]} />
					<Button disabled={sent} color="primary" className='mx-auto w-75 mt-2' onClick={sendFeedback}>Send</Button>
				</Form>
				{send && <Alert color="success">Thank you - Your message has been sent.</Alert>}
			</Col>
		</Row>
</Container>);
};

export default MyDataDashboardHomeTab;