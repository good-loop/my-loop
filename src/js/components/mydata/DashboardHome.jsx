import React from 'react';
import { Container, Row, Col} from 'reactstrap';
import { ProfileDot } from './MyDataCommonComponents';
import { getCharityObject, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import { getDataList } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import ServerIO from '../../plumbing/ServerIO';

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
};

const AchievementCard = () => {
	return (<>
		<h1>Here's What We've Achieved As a Community...</h1>
		<Container className='dashboard-card'>
			<div className='text-center text-white'>
				<p>Together We've Raised</p>
				<p>£3,928,120</p>
				<p>For Global Causes</p>
			</div>
			<img src="/img/placeholder-circle.png" className='w-100' alt="" />
			<Container className='border border-white rounded bg-white my-3 py-3'>
				<p className='text-center'>Some Things We've Achieved</p>
				<ProfileDot><>20,000 Meals For Children</></ProfileDot>
				<ProfileDot><>600 Life-Saving Medicine Kits</></ProfileDot>
				<ProfileDot><>100 Guide Dog Puppies Trained</></ProfileDot>
			</Container>
		</Container>
		</>);
}

const DashboardHome = () => {

	return (<>
		<LatestNewsCard />
		<AchievementCard />
		<h1>Ways to Raise Even More</h1>
		<><h1>TODO projects Card</h1></>
		<ThisWeeksAdCard />
		<><h1>TODO Get T4G Card</h1></>
	</>)
}


const ThisWeeksAdCard = () => {
	// load ad from scheduledcontent
	// TODO filter by start, end
	let pvMyAds = getDataList({type:"ScheduledContent", status:KStatus.PUBLISHED, domain:ServerIO.PORTAL_ENDPOINT});		
	let schedcon = pvMyAds.value && List.first(pvMyAds.value);
	let adid = schedcon && schedcon.adid;
	// FIXME query datalog for evt:donation vert:adid BUT need the adunit here to log your user id!
	const pvData = getDataLogData({q:"evt:donation",start:"3 months ago",end:"now",name:"watched-this-weeks",});
	let watched = pvData.value; 
	return (<Container className='dashboard-card'>
			<h1>Watch This Week's Ad {watched && <Done />}</h1>			
			{pvMyAds.resolved? <GoodLoopUnit vertId={adid} /> : <Misc.Loading />}
			<p>When you watch one of our ads 50% of the ad fee goes to charity.</p>
		</Container>);
};

const Done = () => <Icon name="tick" size="lg" color="green" />;

export default DashboardHome;