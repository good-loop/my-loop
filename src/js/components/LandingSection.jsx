/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { Button, Form, FormGroup, Label } from 'reactstrap';
import { useSpring } from 'react-spring';

import MyLoopNavBar from './MyLoopNavBar';
import BackgroundFader from './BackgroundFader';
import PropControl from '../base/components/PropControl';
import DataStore from '../base/plumbing/DataStore';
import Profiler, {doRegisterEmail} from '../base/Profiler';

const springPageDown = setY => {
	const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	setY({
		y: vh,
		reset: true,
		from: { y: window.scrollY },
		onFrame: props => window.scroll(vh, props.y)
	});
};

const LandingSection = () => {
	const [, setY] = useSpring(() => ({ y: 0 }));

	return (
		<>
			<MyLoopNavBar logo='/img/logo-in-pill.svg' backgroundColor='transparent' />
			<div className="landing-bg">
				<BackgroundFader />
				{/* <img className="background-image" src={ bgImages[0] } alt="background" /> */}
				<CtaBox />
				<img					
					className="scroll-down-button"
					src="/img/scroll-down.png"
					alt="scroll down"
					onClick={ () => springPageDown(setY) }
				/>
			</div>
		</>
	);
};


const ctaFormPath = ['misc', 'ctaForm'];

const CtaBox = () => {
	const thankYouMessage = <h4>Thank you!</h4>;
	const hasSubmittedEmail = DataStore.getValue(['misc', 'hasSubmittedEmail']) === true;

	return (
		<div className="cta-box">
			<h2>Turn Advertising into a Force for Good</h2>
			<h3>Your time, attention and data is valuable.</h3>
			<h3>Sign up and use this value for good.</h3>
			{hasSubmittedEmail ? thankYouMessage :
				<Form inline>
					<FormGroup className="mb-2 mr-sm-2 mb-sm-0">
						<PropControl
							className="email-join-input"
							prop="email"
							path={ctaFormPath}
							placeholder="email address"
							size='lg'
						/>
					</FormGroup>
					<Button onClick={doEmailSignUp} color="info" size='lg'
						disabled={hasSubmittedEmail || ! DataStore.getValue(ctaFormPath.concat('email'))}
					>
						Join My.Good-Loop
					</Button> 
				</Form>}
			<h4>Together we've raised over £700,000</h4>
		</div>
	);
};

const doEmailSignUp = e => {
	e.preventDefault();		
	let formData = DataStore.getValue(ctaFormPath);
	assert(formData.email);
	formData.notify = 'daniel@good-loop.com';
	formData.useraction="Join My.Good-Loop";
	doRegisterEmail(formData);
	DataStore.setValue(['misc', 'hasSubmittedEmail'], true);
}


export default LandingSection;
