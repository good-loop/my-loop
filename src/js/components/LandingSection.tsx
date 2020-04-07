/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */ // So ESLint don't yell at us for having an img as a button
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

const springPageDown = (setY: Function): void => {
	const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	setY({
		y: vh,
		reset: true,
		from: { y: window.scrollY },
		onFrame: (props: { y: number }) => window.scroll(vh, props.y)
	});
};

const LandingSection = (): JSX.Element => {
	const [, setY] = useSpring(() => ({ y: 0 }));

	return (
		<>
			{/* 
			//@ts-ignore */}
			<MyLoopNavBar logo='/img/logo-in-pill.svg' backgroundColor='transparent' />
			<div className="landing-bg">
				{/* 
				//@ts-ignore */}
				<BackgroundFader />
				{/* <img className="background-image" src={ bgImages[0] } alt="background" /> */}
				<CtaBox />
				<img
					className="scroll-down-button"
					src="/img/scroll-down.png"
					alt="scroll down"
					onClick={ (): void => springPageDown(setY) }
				/>
			</div>
		</>
	);
};

const ctaFormPath = ['misc', 'ctaForm'];

const doEmailSignUp = (e: { preventDefault: () => void }): void => {
	e.preventDefault();
	const formData: any = DataStore.getValue(ctaFormPath);
	if ( ! formData || ! formData.email) return; // quiet fail NB: we didnt like the disabled look for a CTA
	formData.notify = 'daniel@good-loop.com'; // HACK
	formData.useraction="Join My.Good-Loop";
	doRegisterEmail(formData);
	//@ts-ignore
	DataStore.setValue(['misc', 'hasSubmittedEmail'], true);
};

const CtaBox: React.FC = () => {
	const thankYouMessage = <h4>Thank you!</h4>;
	//@ts-ignore
	const hasSubmittedEmail = DataStore.getValue(['misc', 'hasSubmittedEmail']) === true;
	// NB: the total is higher -- but we need to clean up our donation tracker docs before we can reliably report it. March 2020
	const total = new Money("£500000");
	//@ts-ignore
	return (
		<div className="cta-box">
			{/* 
			//@ts-ignore */}
			<AB label='ctatext'>
				<>
					<h2>Turn Advertising into a Force for Good</h2>
					<h4>Your time, attention, &amp; data is valuable.</h4>
					<h4>Sign up and use this value for good.</h4>
				</>
				<>
					<h2>Turn Advertising into a Force for Good</h2>
					<h4>Donate a few spare seconds to charity and see it add up.</h4>
					{/* 
					//@ts-ignore */}
					<h4 className="donation-raised-counter">Together we've raised over <Counter amount={total} initial={100000} /></h4>
				</>
			</AB>
			{hasSubmittedEmail ? thankYouMessage :
				<Form inline>
					<FormGroup className="mb-2 mr-sm-2 mb-sm-0 outer-form-group">
						<PropControl
							className="email-join-input"
							prop="email"
							path={ctaFormPath}
							placeholder="email address"
						/>
					</FormGroup>
					<Button onClick={doEmailSignUp} color="info" disabled={hasSubmittedEmail}>
						Join us
					</Button>
				</Form>}
			{/* 
			//@ts-ignore */}
			<AB label='ctatext'>
				{/* 
				//@ts-ignore */}
				<h4>Together we've raised over <Counter amount={total} initial={100000} /></h4>
				<></>
			</AB>
		</div>
	);
};

export default LandingSection;
