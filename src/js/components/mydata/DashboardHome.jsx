import React from 'react';
import { Container, Row, Col} from 'reactstrap';
import { ProfileDot } from './MyDataCommonComponents';
import { getCharityObject, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';

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
		<Container className='achievement-card border border-dark rounded bg-secondary py-3'>
			<div className='text-center text-white'>
				<p>Together We've Raised</p>
				<p>£3,928,120</p>
				<p>For Global Causes</p>
			</div>
			<img src="/img/placeholder-circle.png" className='w-100' alt="" />
			<Container className='achievement-card border border-white rounded bg-white my-3 py-3'>
				<p className='text-center'>Some Things We've Achieved</p>
				<ProfileDot><>20,001 Meals For Children</></ProfileDot>
				<ProfileDot><>600 Life-Saving Medicine Kets</></ProfileDot>
				<ProfileDot><>100 Guide Dog Puppies Trained</></ProfileDot>
			</Container>
		</Container>
		</>);
}

const DashboardHome = () => {

	return (<>
		<LatestNewsCard />
		<AchievementCard />
	</>)
}

export default DashboardHome;