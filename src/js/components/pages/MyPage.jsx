import React, { useEffect } from 'react';
import { Container, Button, Form, FormGroup, Label} from 'reactstrap';
// import PV from 'promise-value';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import Counter from '../../base/components/Counter';

import PropControl from '../../base/components/PropControl';

import ServerIO from '../../plumbing/ServerIO';
import MyLoopNavBar from '../MyLoopNavBar';
import Footer from '../Footer';
import ACard from '../cards/ACard';
import SignUpConnectCard from '../cards/SignUpConnectCard';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import {GlLogoGenericSvg, glLogoDefaultSvg, splitColouredCircleSVG} from '../svg';
import Roles from '../../base/Roles';
import LandingSection from '../LandingSection';
import SubscriptionBox from '../cards/SubscriptionBox';

window.DEBUG = false;

const MyPage = () => {
	//ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

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
			<LandingSection />
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
		<img src="/img/LandingBackground/infographic.png" className="w-100"/>
	</Container></div>);
};

export default MyPage;
