import React, { useState, useEffect } from 'react';
import { Carousel, CarouselControl, CarouselIndicators, CarouselItem } from 'reactstrap';
import { Col, Container, Row } from 'reactstrap';
import { space } from '../../base/utils/miscutils';
import { PageCard } from './CommonComponents';

export const SafariPage = () => {

	// Not using BSCarousel here becasue of too many customised parts
	const SafariCarousel = ({className, hasIndicators, light, children, nextButton}) => {
		const [animating, setAnimating] = useState(false);
		const [index, setIndex] = useState(0);

		// no nulls
		children = children.filter(x => x);

		const next = () => {
			if (animating) return;
			const nextIndex = index === children.length - 1 ? 0 : index + 1;
			setIndex(nextIndex);
		}

		const previous = () => {
			if (animating) return;
			const nextIndex = index === 0 ? children.length - 1 : index - 1;
			setIndex(nextIndex);
		}

		// For Dots/Indicators
		const goToIndex = (newIndex) => {
			if (animating) return;
			setIndex(newIndex);
		};

		const Steps = ({step}) => {
			let circle1 = step == 0 ? "circle circle-active" : "circle";
			let circle2 = step == 1 ? "circle circle-active" : "circle";
			let circle3 = step == 2 ? "circle circle-active" : "circle";
			let circle4 = step == 3 ? "circle circle-active" : "circle";
			let circle5 = step == 4 ? "circle circle-active" : "circle";
			let circle6 = step == 5 ? "circle circle-active" : "circle";
			let circle7 = step == 6 ? "circle circle-active" : "circle";


			return (<>
				<div onClick={() => goToIndex(0)} className={circle1}></div>
				<div onClick={() => goToIndex(1)} className={circle2}></div>
				<div onClick={() => goToIndex(2)} className={circle3}></div>
				<div onClick={() => goToIndex(3)} className={circle4}></div>
				<div onClick={() => goToIndex(4)} className={circle5}></div>
				<div onClick={() => goToIndex(5)} className={circle6}></div>
				<div onClick={() => goToIndex(6)} className={circle7}></div>
				<span id="circle-step-1">Step 1</span>
				<span id="circle-step-2">Step 2</span>
				<span id="circle-step-3">Step 3</span>
				<span id="circle-step-4">Step 4</span>
				<span id="circle-step-5">Step 5</span>
				<span id="circle-step-6">Step 6</span>
				<span id="circle-step-7">All Done</span>
			</>)
		}

		return (<Carousel className={space(className,'BSCarousel')}
			activeIndex={index}
			next={next}
			previous={previous}
			interval={false}
		>
			{nextButton && <>
			<a className="btn btn-secondary btn-next-carousel" onClick={next} >{index != children.length -1 ? 'Next Step' : 'Start Again'}</a>
			<div className="steps-graphic d-none d-md-block">
				<Steps step={index}/> 
			</div></>}
			{children.map((content, i) =>
				<CarouselItem
					key={i}
					onExiting={() => setAnimating(true)}
					onExited={() => setAnimating(false)}
				>
					{content}
				</CarouselItem>
			)}
			{hasIndicators && <div className="d-block">
				<CarouselIndicators items={children} activeIndex={index} onClickHandler={goToIndex} />
			</div>}

			{!nextButton && 
			<div className={light&&"text-dark"}>
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
				<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
			</div>}
		</Carousel>)
	};

	const SlideItems = [
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/preferences.png" className="w-75" alt="" />
				<img src="/img/safari-preference/dropdown-preferences.png" className="dropdown-preferences" alt="" />
			</div>
			<p>In the Safari app on your Mac, choose Safari Preferences.</p>
		</>,
		<>
			<img src="/img/safari-preference/safari-final.png" className="w-75" alt="" />
			<p>Click General tab (first tab) in your Safari Preferences.</p>
		</>,
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/safari-final.png" className="w-75" alt="" />
				<img src="/img/safari-preference/new-window.png" className="new-window" alt="" />
			</div>
		<p>Make sure your Safari opens with "A new window".</p>
	</>,
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/safari-final.png" className="w-75" alt="" />
				<img src="/img/safari-preference/homepage.png" className="set-homepage" alt="" />
			</div>
			<p>Click the “New windows open with” pop-up menu, then choose Homepage.</p>
		</>,
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/safari-final.png" className="w-75" alt="" />
				<img src="/img/safari-preference/homepage.png" className="set-homepage-2" alt="" />
			</div>
			<p>Click the “New tabs open with” pop-up menu, then choose Homepage.</p>
		</>,
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/safari-final.png" className="w-75" alt="" />
				<img src="/img/safari-preference/safari-paste.png" className="safari-paste" alt="" />
			</div>
			<p style={{position:"relative",top:"-1rem"}}>In the Homepage field, enter the Tabs For Good address: <br/> <code>https://my.good-loop.com/newtab.html</code> <button onClick={() => {navigator.clipboard.writeText('https://my.good-loop.com/newtab.html')}} 
					className="btn btn-primary ml-3">Copy To Clipboard</button></p>
		</>,
		<>
			<img src="/img/safari-preference/safari-final.png" className="w-75" alt="" />
			<p>Now, all that's left to do is to open a new tab, and you're ready to start raising money for the causes you care most about - just by browsing the internet.</p>
		</>
	];

	const slides = SlideItems.map((content, i) => (
		<div key={i} className="mt-1 mx-5 mb-5 text-center safari-slideshow">
			{content}
		</div>
	));

	return (<>
	<PageCard className="SafariPage widepage text-center pt-0">
		{/* <img className="w-50 mb-1" src="img/gl-logo/TabsForGood/TabsForGoodLogo.svg" alt="" /> */}
		<h1>Using Tabs For Good in Safari on Mac</h1>
		<SafariCarousel className="mt-5 rounded" nextButton>
			{slides}
		</SafariCarousel>
	</PageCard>
	</>)
}

export default SafariPage;
