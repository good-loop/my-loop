/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */ // So ESLint don't yell at us for having an img as a button
import React, { useState } from 'react';

import MyLoopNavBar from './MyLoopNavBar';
import BackgroundFader from './BackgroundFader';
import DataStore from '../base/plumbing/DataStore';
import AB from './AB';
import CSS from '../base/components/CSS';
import Money from '../base/data/Money';
import Ticker from './Ticker';
import ShareButton from './ShareButton';
import { isPortraitMobile } from '../base/utils/miscutils';

const springPageDown = (setY: Function): void => {
	const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	setY({
		y: vh,
		reset: true,
		from: { y: window.scrollY },
		onFrame: (props: { y: number }) => window.scroll(vh, props.y)
	});
};

const LandingSection = ({setY}: {setY: Function}): JSX.Element => {
	//const [, setY] = useSpring(() => ({ y: 0 }));

	const shareBtn = <ShareButton
		absolute={!isPortraitMobile()}
		className="btn-transparent fill"
		style={isPortraitMobile() ? null : {bottom: 30, left: 30}}
		title={"My-Loop"}
		image={"https://my.good-loop.com/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png"}
		description={"Using ads for good"}
		url={window.location.href}>
			Share
	</ShareButton>;

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
				{isPortraitMobile() ?
					null : shareBtn}
			</div>
			{isPortraitMobile() ?
			// separate share button off of landing section for mobile - no room
				<div className="bg-white pt-5 flex-row justify-content-center">
					{shareBtn}
				</div>: null}
		</>
	);
};

const LandingBackground = () => {
	const [selImg,] = useState(Math.floor(Math.random() * 4) + 1);
	return (<div className="background-image" >
		{isPortraitMobile() ?
			<img src={"/img/LandingBackground/back-" + selImg + ".png"} className="mobile-img"/>
			:<>
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
			</>}
	</div>);
}

const CtaBox: React.FC = () => {
	// NB: the total is higher -- but we need to clean up our donation tracker docs before we can reliably report it. March 2020
	const total = new Money("$1501885");
	//@ts-ignore
	return (
		<div className="title">
			<h1>Raise money for charity<br/>whilst you browse the web</h1>
			<p>Help us redirect 50% of ad money to tackle global issues.<br/>We've raised <Ticker amount={total} rate={0.1} centerText/> using ethical ads.</p>
		</div>
	);
};

export default LandingSection;
export { springPageDown };
