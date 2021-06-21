import React, { useEffect } from 'react';
import { Container } from 'reactstrap';
// import PV from 'promise-value';
import { useSpring } from 'react-spring';

import DataStore from '../../base/plumbing/DataStore';
import MyLoopNavBar from '../MyLoopNavBar';
import Roles from '../../base/Roles';
import LandingSection, { springPageDown } from '../LandingSection';
import SubscriptionBox from '../cards/SubscriptionBox';
import { isPortraitMobile, stopEvent } from '../../base/utils/miscutils';
import { RegisterLink, setLoginVerb, setShowLogin } from '../../base/components/LoginWidget';
import CharitySection from '../CharitySection';

window.DEBUG = false;

const MyPage = ({spring}) => {
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
		<MyLoopNavBar logo="/img/new-logo-with-text.svg" logoScroll="/img/new-logo-with-text-white.svg" />
		<div className='MyPage widepage'>
			<LandingSection setY={setY}/>
			<CharitySection />
			<HowItWorksCard />
			{false && <AttentionIsValuableCard /> /* was this cut for a reason? */}
			<SubscriptionBox title="Subscribe to our monthly newsletter" className="bg-gl-light-red big-sub-box"/>
		</div>
	</>);
};

const showRegisterForm = e => {
	stopEvent(e);
	setLoginVerb('register');
	setShowLogin(true);
};

const HowItWorksCard = () => {
	const setRegisterButton = (embedEl) => {
		if (!embedEl || !embedEl.getSVGDocument) return;
		const svgDOM = embedEl.getSVGDocument();
		if (!svgDOM) return;
		const registerButton = svgDOM.getElementById('register-button');
		if (!registerButton) {
			console.error("No element with ID #register-button within infograhpic.svg")
			return;
		}
		registerButton.addEventListener('click', showRegisterForm);
	};

	return (<div className="bg-white py-5">
		<Container>
			<h2 className="text-center mt-5">We support your favorite causes</h2> 
			{isPortraitMobile() ? <>
				<embed src="/img/LandingBackground/svg-mobile/infographic.svg" className="w-100"/>
				{/* Center CTA btn - not included in mobile SVG */}
				<div className="flex-row justify-content-center">
					<RegisterLink className="btn btn-primary">Get started</RegisterLink>
				</div>
			</>: <embed ref={setRegisterButton} src="/img/LandingBackground/svg-desktop/infographic.svg" className="w-100"/>}
		</Container>
	</div>);
};

/**
 * TODO This has been cut -- should it be reinstated??
 */
const AttentionIsValuableCard = () => {
	return (<div className="AttentionIsValuableCard">
		<h4>Time and attention online are valuable.</h4>
		<h4>Let's harness that value and use it for good.</h4>
		<p>
			Good-Loop will never force you to engage with an ad. 
			But, if you choose to give an advertiser some of your valuable time and attention, you get to give 50% of the advertisers' money to a relevant charitable cause.
		</p>
	</div>);
};


export default MyPage;
export {HowItWorksCard};
