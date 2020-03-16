/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { Button, Form, FormGroup, Label } from 'reactstrap';
import { useSpring } from 'react-spring';

import MyLoopNavBar from './MyLoopNavBar';
import BackgroundFader from './BackgroundFader';
import PropControl from '../base/components/PropControl';
import DataStore from '../base/plumbing/DataStore';

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


const CtaBox = () => {
	const thankYouMessage = <h4>Thank you!</h4>;
	const hasSubmitedEmail = DataStore.getValue(['misc', 'hasSubmittedEmail']) === true;

	const logEmailSubmission = e => {
		e.preventDefault();
		console.log('THIS HAS BEEEN EXECUTEEEED!');
		DataStore.setValue(['misc', 'hasSubmittedEmail'], true);
	};

	return (
		<div className="cta-box">
			<h2>Turn Advertising into a Force for Good</h2>
			<h3>Donate a few spare seconds to charity and see it add up.</h3>
			<h3>Together we've raised over £500,000</h3>
			{hasSubmitedEmail ? thankYouMessage :
				<Form inline>
					<FormGroup className="mb-2 mr-sm-2 mb-sm-0">
						<PropControl
							className="email-join-input"
							prop="email"
							path={['misc', 'ctaForm']}
							placeholder=" email address"
						/>
					</FormGroup>
					<Button onClick={logEmailSubmission} color="info">Join My.Good-Loop</Button> 
				</Form>}
		</div>
	);
};


export default LandingSection;
