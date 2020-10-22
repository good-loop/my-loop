import React, { useEffect } from 'react';
import { Container, Button, Form, FormGroup, Label} from 'reactstrap';
// import PV from 'promise-value';
import {yessy} from '../../base/utils/miscutils';

import Profiler, {doRegisterEmail} from '../../base/Profiler';

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

window.DEBUG = false;

const MyPage = () => {
	ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

	// If we're currently in as.good-loop.com, and we have a glvert param defined, we shpuld redirect to campaign page
	useEffect(() => {
		const urlParams = DataStore.getValue(['location', 'params']);
		if (Object.keys(urlParams).includes('gl.vert')) {
			window.location.href = `/#campaign/?gl.vert=${urlParams['gl.vert']}`;
		}
	});

	// <ShareAdCard /> is buggy, so removed for now

	return (
		<div className='MyPage widepage'>
			<LandingSection />
			<HowItWorksCard />
			<SubscriptionBox />
		</div>
	);
};


const TestAd = () => {
	// see https://console.appnexus.com/placement?id=1610003
	if ( ! Roles.isDev()) return false;
	return (<div>
		<h4>Hello Dev. Yay! You've scrolled down here -- Let's see an ad and raise some money for charity :)</h4>
		<script src="http://ib.adnxs.com/ttj?id=17741445&size=300x250" type="text/javascript"></script>
	</div>);
};

const ctaFormPath = ['misc', 'ctaForm'];

const doEmailSignUp = e => {
	e.preventDefault();
	const formData = DataStore.getValue(ctaFormPath);
	if ( ! formData || ! formData.email) return; // quiet fail NB: we didnt like the disabled look for a CTA
	formData.notify = 'daniel@good-loop.com'; // HACK
	formData.useraction="Join My.Good-Loop";
	doRegisterEmail(formData);
	//@ts-ignore
	DataStore.setValue(['misc', 'hasSubmittedEmail'], true);
};

const SubscriptionBox = () => {
	//@ts-ignore
	const hasSubmittedEmail = DataStore.getValue(['misc', 'hasSubmittedEmail']) === true;
	const thankYouMessage = <h4>Thank you!</h4>;
	return (<div className="bg-gl-light-red flex-column align-items-center justify-content-center subscription-box">
		<h1>Subscribe to our monthly newsletter</h1>
		<br/><br/>
		{hasSubmittedEmail ? thankYouMessage :
			<Container>
				<Form inline className="flex-row align-items-stretch m-auto">
					<FormGroup className="mb-2 mr-sm-2 mb-sm-0 outer-form-group flex-grow-1 m-0 pr-3">
						<PropControl
							className="email-join-input w-100 h-100"
							prop="email"
							path={ctaFormPath}
							placeholder="Type your email address"
						/>
					</FormGroup>
					<Button onClick={doEmailSignUp} color="info" disabled={hasSubmittedEmail} className="flex-grow-0">
						Sign me up
					</Button>
				</Form>
			</Container>}
	</div>);
};

const ContactCard = () => {
	return (
		<div className='text-center'>
			<div className='sub-header top-p-1'>
				Get in touch
			</div>
			<div className='p-1'>
				<p>Tell us what you think: <a href="mailto:hello@good-loop.com?subject=My thoughts on My Good-Loop">hello@good-loop.com</a></p>
				<p>Interested in hosting Ads For Good on your blog or website? <a href="https://www.good-loop.com/contact">Let us know.</a></p>
			</div>
		</div>
	);
};


const HowItWorksCard = () => {
	return (<Container>
		{//<img src="/img/LandingBackground/infographic.svg" className="w-100"/>
		}
	</Container>);
};


/**
 * Stick some text in this to put it inside a thick circular border.
 * NB weird things will happen if used for more than 1-2 characters.
 */
const CircleChar = ({children, className, ...rest}) => (
	<div className={'number-circle header flex-vertical-align' + (className ? ' ' + className : '')} {...rest}>
		{children}
	</div>
);

export default MyPage;
