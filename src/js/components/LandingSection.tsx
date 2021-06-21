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
import TickerTotal from './TickerTotal';
import { RegisterLink, setLoginVerb, setShowLogin } from '../base/components/LoginWidget';

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
			<div className="landing-bg bg-white pt-5">
				{/* 
				//@ts-ignore */}
				<div className="container-fluid pt-5 px-md-5 mt-5">
					<div className="row mb-3 px-0 px-md-5">
						<div className="col-md d-flex flex-column justify-content-center">
							<div className="row title my-0"> 
								<h1>Raise money for<br/>charities simply by<br/>browsing the web</h1>
								<p> With your help we are redirecting ad money to tackle global issues. </p>
							</div>
							<div className="row cta-buttons">
								<div className="col col-xl-4">
								<RegisterLink className="btn btn-primary h-100 d-flex align-items-center justify-content-center">Get started</RegisterLink>
								</div>
								<div className="col col-xl-6">
									<RegisterLink className="btn btn-newsletter h-100 d-flex align-items-center justify-content-center">Sign up for newsletter</RegisterLink>
								</div>
							</div>
						</div>
						<div className="col d-flex flex-column align-items-center justify-content-center">
							<img src="/img/LandingBackground/Good-Loop_YinYang.gif" className="w-100" alt="Good-Loop" />
						</div>
					</div>
				</div>

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

export default LandingSection;
export { springPageDown };
