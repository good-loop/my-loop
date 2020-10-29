import React, { useEffect } from 'react';
import { Container } from 'reactstrap';
// import PV from 'promise-value';
import { useSpring } from 'react-spring';

import DataStore from '../../base/plumbing/DataStore';
import MyLoopNavBar from '../MyLoopNavBar';
import Roles from '../../base/Roles';
import LandingSection, { springPageDown } from '../LandingSection';
import SubscriptionBox from '../cards/SubscriptionBox';
import { isPortraitMobile } from '../../base/utils/miscutils';

window.DEBUG = false;

const MyPage = ({spring}) => {
	//spring the page down if asked to for how it works section
	const [, setY] = useSpring(() => ({ y: 0 }));

	if (spring) springPageDown(setY);

	// If we're currently in as.good-loop.com, and we have a glvert param defined, we shpuld redirect to campaign page
	useEffect(() => {
		const urlParams = DataStore.getValue(['location', 'params']);
		if (Object.keys(urlParams).includes('gl.vert')) {
			window.location.href = `/#campaign/?gl.vert=${urlParams['gl.vert']}`;
		}
	});

	// <ShareAdCard /> is buggy, so removed for now

	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg"/>
		<div className='MyPage widepage'>
			<LandingSection setY={setY}/>
			<HowItWorksCard />
			<SubscriptionBox title="Subscribe to our monthly newsletter" className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};


const TestAd = () => {
	// see https://console.appnexus.com/placement?id=1610003
	if ( ! Roles.isDev()) return false;
	return (<div>
		<h4>Hello Dev. Yay! You've scrolled down here -- Let's see an ad and raise some money for charity :)</h4>
		<script src="http://ib.adnxs.com/ttj?id=17741445&size=300x250" type="text/javascript"></script>
	</div>);
};



const HowItWorksCard = () => {
	return (<div className="bg-white py-5"><Container>
		{isPortraitMobile() ?
		<embed src="/img/LandingBackground/svg-mobile/infographic.svg" className="w-100"/>
		: <embed src="/img/LandingBackground/svg-desktop/infographic.svg" className="w-100"/>}
	</Container></div>);
};

export default MyPage;
