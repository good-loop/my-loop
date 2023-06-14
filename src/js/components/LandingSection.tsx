/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */ // So ESLint don't yell at us for having an img as a button
import React from 'react';

import { RegisterLink } from '../base/components/LoginWidget';

const springPageDown = (setY: Function): void => {
	const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	setY({
		y: vh,
		reset: true,
		from: { y: window.scrollY },
		onFrame: (props: { y: number }) => window.scroll(vh, props.y)
	});
};

function LandingSection({setY}: {setY: Function}): JSX.Element {
	//const [, setY] = useSpring(() => ({ y: 0 }));

	const scrolltoNewsletter = () => {
		document.getElementById("subscription-box")!.scrollIntoView({behavior: "smooth"});
	};

	return (
		<div className="landing-bg bg-white pt-5">
			<div className="container-fluid d-flex justify-content-center">
				<div className="row mb-3">
					<div className="col-md d-flex flex-column justify-content-center">
						<div className="row title m-0"> 
							<h1>Raise money for<br/>charities simply by<br/>browsing the web</h1>
							<p> With your help we are redirecting ad<br/>money to tackle global issues. </p>
						</div>
						<div className="row cta-buttons justify-content-center">
							<div className="col col-xl-5">
								<RegisterLink className="btn btn-primary h-100 d-flex align-items-center justify-content-center">Get started</RegisterLink>
							</div>
							<div className="col col-xl-7">
								<button id="newsletter-btn" onClick={scrolltoNewsletter} className="btn btn-newsletter h-100 d-flex align-items-center justify-content-center">Sign up for newsletter</button>
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
				onClick={() => springPageDown(setY)}
			/>
		</div>
	);
}


export default LandingSection;
export { springPageDown };
