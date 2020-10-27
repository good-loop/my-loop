/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */ // So ESLint don't yell at us for having an img as a button
import React from 'react';
import { useSpring } from 'react-spring';

import MyLoopNavBar from './MyLoopNavBar';
import BackgroundFader from './BackgroundFader';
import DataStore from '../base/plumbing/DataStore';
import AB from './AB';
import CSS from '../base/components/CSS';
import Money from '../base/data/Money';
import Counter from '../base/components/Counter';
import ShareButton from './ShareButton';

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
			<div className="landing-bg">
				{/* 
				//@ts-ignore */}
				<LandingBackground />
				<CtaBox />
				<img
					className="scroll-down-button"
					src="/img/LandingBackground/arrow.png"
					alt="scroll down"
					onClick={ (): void => springPageDown(setY) }
				/>
				<ShareButton
					absolute
					className="btn-transparent fill"
					style={{bottom: 30, left: 30}}
					title={"My-Loop"}
					image={"/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png"}
					description={"Using ads for good"}
					url={window.location.href}>
						Share
				</ShareButton>
			</div>
		</>
	);
};

const LandingBackground = () => {
	return (<div className="background-image" >
		<div className="hover-expand-image">
			<img src="/img/LandingBackground/back-1.png"/>
		</div>
		<div className="hover-expand-image">
			<img src="/img/LandingBackground/back-2.png"/>
		</div>
		<div className="hover-expand-image">
			<img src="/img/LandingBackground/back-3.png"/>
		</div>
		<div className="hover-expand-image">
			<img src="/img/LandingBackground/back-4.png"/>
		</div>
	</div>);
}

const CtaBox: React.FC = () => {
	// NB: the total is higher -- but we need to clean up our donation tracker docs before we can reliably report it. March 2020
	const total = new Money("£1000000");
	//@ts-ignore
	return (
		<div className="title">
			<h1>We've raised over<br/><Counter amount={total} centerText preservePennies={false} /><br/>using ethical ads</h1>
		</div>
	);
};

export default LandingSection;
