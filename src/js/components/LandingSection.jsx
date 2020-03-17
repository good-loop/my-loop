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
import AB from './AB';
import CSS from '../base/components/CSS';
import Money from '../base/data/Money';
import Counter from '../base/components/Counter';

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
	let total = new Money("£700000");
	return (
		<div className="cta-box">
			<AB label='ctatext'>
				<>
					<h2>Turn Advertising into a Force for Good</h2>
					<h4>Your time, attention, &amp; data is valuable.</h4>
					<h4>Sign up and use this value for good.</h4>
				</>
				<>
					<h2>Turn Advertising into a Force for Good</h2>
					<h4>Donate a few spare seconds to charity and see it add up.</h4>
					<h4>Together we've raised over <Counter amount={total} initial={100000} /></h4>
				</>
			</AB>
			{hasSubmittedEmail ? thankYouMessage :
				<Form inline>
					<FormGroup className="mb-2 mr-sm-2 mb-sm-0">
						<PropControl
							className="email-join-input"
							prop="email"
							path={ctaFormPath}
							placeholder="email address"
						/>
					</FormGroup>
					<Button onClick={doEmailSignUp} color="info" disabled={hasSubmittedEmail} >
						Join us
					</Button> 
				</Form>}
			<AB label='ctatext'>
				<h4>Together we've raised over <Counter amount={total} initial={100000} /></h4>
				<></>
			</AB>
		</div>
	);
};

const doEmailSignUp = e => {
	e.preventDefault();		
	let formData = DataStore.getValue(ctaFormPath);
	if ( ! formData || ! formData.email) return;  // quiet fail NB: we didnt like the disabled look for a CTA
	formData.notify = 'daniel@good-loop.com';
	formData.useraction="Join My.Good-Loop";
	doRegisterEmail(formData);
	DataStore.setValue(['misc', 'hasSubmittedEmail'], true);
};


export default LandingSection;
