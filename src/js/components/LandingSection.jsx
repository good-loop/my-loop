/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { Button } from 'reactstrap';
import { useSpring } from 'react-spring';

import MyLoopNavBar from './MyLoopNavBar';
import BackgroundFader from './BackgroundFader';

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
	return (
		<div className="cta-box">
			<h2>Turn Advertising into a Force for Good</h2>
			<h3>Donate a few spare seconds to charity and see it add up.</h3>
			<h3>Together we've raised over £500,000</h3>
			<div className="input-box">
				<input type="text" placeholder=" email address" className="email-input-text" />
				<Button color="info">Join My.Good-Loop</Button> 
			</div>
		</div>
	);
};


export default LandingSection;
