import React from 'react';
import { Container, Row, Col} from 'reactstrap';
import { ProfileDot } from './MyDataCommonComponents';
import { getCharityObject, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import { getDataList } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import ServerIO from '../../plumbing/ServerIO'
import TickerTotal from '../TickerTotal';
import SearchQuery from '../../base/searchquery';
import { getDataLogData } from '../../base/plumbing/DataLog';
import Icon from '../../base/components/Icon';

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
		<Container className='dashboard-card'>
			<div className='text-center text-white'>
				<h3>Together we've raised</h3>
				<h1><TickerTotal/></h1>
				<h3>For global causes</h3>
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
		{/*<LatestNewsCard />*/}
		<AchievementCard />
		<br/>
		<h3>Ways to Raise Even More</h3>
		<ThisWeeksAdCard />
		<br/>
		<><h1>TODO Get T4G Card</h1></>
	</>)
}


const ThisWeeksAdCard = () => {
	// load ad from scheduledcontent
	// TODO filter by start, end
	let pvMyAds = getDataList({type:"ScheduledContent", status:KStatus.PUBLISHED, domain:ServerIO.PORTAL_ENDPOINT});		
	let schedcon = pvMyAds.value && List.first(pvMyAds.value);
	let adid = schedcon && schedcon.adid;
	// if ( TODO ! adid) {
	// 	return <p>No ad available.</p>
	// }
	// query datalog for evt:minview vert:adid BUT need the adunit here to log your user id!
	let sq = new SearchQuery("evt:minview");
	sq = SearchQuery.setProp(sq, "vert", adid);
	sq = SearchQuery.setProp(sq, "user", Login.getId());
	let q = sq.query;
	const pvData = getDataLogData({dataspace:"gl",q, start:"3 months ago",end:"now",name:"watched-this-weeks",});
	let watched = pvData.value && pvData.value.allCount; 
	return (<Container className='dashboard-card'>
			<h1>Watch This Week's Ad {watched && <Done />}</h1>			
			{pvMyAds.resolved? <GoodLoopUnit vertId={adid} /> : <Misc.Loading />}
			<p>When you watch one of our ads 50% of the ad fee goes to charity.</p>
		</Container>);
};

const Done = () => <Icon name="tick" size="lg" color="green" />;

export default DashboardHome;