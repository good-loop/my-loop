import React, { useEffect, useState } from 'react';
import {
	Carousel,
	CarouselCaption, CarouselControl,
	CarouselIndicators, CarouselItem, Container
} from 'reactstrap';

import { uniq, space } from '../../base/utils/miscutils';

import Misc from '../../base/components/Misc';
import Advert from '../../base/data/Advert';
import Campaign from '../../base/data/Campaign';
import Money from '../../base/data/Money';
import Counter from '../../base/components/Counter';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import DevLink from './DevLink';
import DataStore from '../../base/plumbing/DataStore';
import printer from '../../base/utils/printer';
import { assert } from '../../base/utils/assert';

/**
 * List of adverts with some info about them (like views, dates)
 * @param {Object} p
 * @param {Advert[]} p.ads
 * @param {?Boolean} p.noPreviews remove preview carousel
 */
const AdvertsCatalogue = ({ ads, noPreviews, className, captions=true, unwrap, ...props}) => {
	assert(ads);

	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	if (ads.length === 1) {
		return (<Container>
			<AdvertCard
				ad={ads[0]}
				active
			/>
		</Container>);
	}

	const carouselSlides = ads.map((ad, i) =>
		<CarouselItem
			onExiting={() => setAnimating(true)}
			onExited={() => setAnimating(false)}
			key={i}
		>
			<AdvertCard
				ad={ad}
				active={activeIndex === i}
			/>
			{captions && <CarouselCaption captionText={<Misc.DateDuration startDate={ad.start} endDate={ad.end} />} />}
		</CarouselItem>
	);

	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === carouselSlides.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	};

	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? carouselSlides.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	};

	const goToIndex = (newIndex) => {
		if (animating) return;
		setActiveIndex(newIndex);
	};

	const contents = (<>
		<Carousel
			activeIndex={activeIndex}
			next={next}
			previous={previous}
			interval={false}
		>
			<CarouselIndicators className="d-block d-md-none" items={carouselSlides} activeIndex={activeIndex} onClickHandler={goToIndex} cssModule={{ backgroundColor: "#000" }} />
			{carouselSlides}
			<div className="d-none d-md-block">
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
				<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
			</div>
		</Carousel>
		{!noPreviews && <>
			{/* <br /><br /> reduce the whitespace - Dan, Jun 2023 */}
			<AdPreviewCarousel ads={ads} setSelected={goToIndex} selectedIndex={activeIndex} />
		</>}
	</>);

	return unwrap ? <>{contents}</> : <Container className={space('ads-catalogue', className)}>{contents}</Container>;
};

/**
 * NB: wrapped in span x2 to allow custom css to target it. e.g.
 * 
 * 
 */
const AdvertiserName = ({ name }) => <span className="advertiser-name"><span>{name}</span></span>;

const AdPreviewCarousel = ({ ads, selectedIndex, setSelected }) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	const slidesNum = Math.ceil(ads.length / 4);

	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === carouselSlides.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	};

	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? carouselSlides.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	};

	const goToIndex = (newIndex) => {
		if (animating) return;
		setActiveIndex(newIndex);
	};

	const carouselSlides = [];
	for (let i = 0; i < slidesNum; i++) {
		const adIndex = i * 4;

		const previews = [0, 1, 2, 3].map(j => {
			const offsetIndex = adIndex + j;
			if (offsetIndex > ads.length - 1) return null;
			return <AdvertPreviewCard
				key={offsetIndex}
				ad={ads[offsetIndex]}
				selected={selectedIndex == offsetIndex}
				handleClick={() => setSelected(offsetIndex)}
				active={activeIndex === i}
			/>;
		}).filter(a => !!a);

		carouselSlides.push(
			<CarouselItem onExiting={() => setAnimating(true)} onExited={() => setAnimating(false)} key={i} >
				<div className="row justify-content-center mt-5">
					{previews}
				</div>
			</CarouselItem>
		);
	}

	return <div className="d-md-block d-none">
		<Carousel
			activeIndex={activeIndex}
			next={next}
			previous={previous}
			interval={false}
			className="preview-carousel"
		>
			<CarouselIndicators items={carouselSlides} activeIndex={activeIndex} onClickHandler={goToIndex} cssModule={{ backgroundColor: "#000" }} />
			{carouselSlides}
			<div className="wide-controls">
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
				<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
			</div>
		</Carousel>
	</div>;
}

// If social is null (not specific) or false, it will fall back to landscape ads
const AdvertCard = ({ ad, active, decoration }) => {
	const social = ad.format === "social";
	let size = 'landscape';
	const [hasShown, setHasShown] = useState(false);
	const extraParams = {};
	if (social) {
		size = "portrait";
		extraParams.delivery = "app";
		extraParams.after = "vanish";
	}

	useEffect(() => { // activate ad unit once
		if (active && !hasShown) setHasShown(true);
	}, [active]);

	const reloadAdUnit = () => {
		setHasShown(false);
		setTimeout(() => {
			setHasShown(true);
		}, 100);
	}

	return (
		<div className="position-relative main-ad" style={{ minHeight: "100px", maxWidth:"2000px", margin:"auto" }}>
			<DevLink href={'https://portal.good-loop.com/#advert/' + escape(ad.id)} target="_portal" style={{ position: "absolute", zIndex: 999 }}>Advert Editor ({ad.id})</DevLink>
			<div className="position-relative ad-unit-outer">
				{hasShown ? (
					<GoodLoopUnit vertId={ad.id} size={size} extraParams={extraParams} play="onclick" 
						style={{zIndex:2, maxWidth:"90%", margin:"auto"}} shouldDebug={false} />
				) : (
					<div style={{ background: "black", width: "100%", height: "100%" }}></div>
				)}
			</div>
			{/*<span className="position-absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 0 }}>If you're seeing this, you likely have ad-blocker enabled. Please disable ad-blocker to see the demo!</span>*/}
		</div>
	);
};

/**
 * How does this relate to AdvertCard?? Could they share code??
 * @param {Object} p
 * @param {Advert} p.ad
 * @returns
 */
const AdvertPreviewCard = ({ ad, handleClick, selected = false, active }) => {
	if (!ad) {
		//console.warn("AdvertPreviewCard - NO ad?!");
		return null;
	}
	const social = ad.format === "social";
	let size = 'landscape';
	if (social) { size = "portrait"; }
	const [hasShown, setHasShown] = useState(false);
	if (active && !hasShown) setHasShown(true);

	return (
		<div className={"col-6 col-md-2"}>
			<div onClick={e => { e.preventDefault(); handleClick(); }} className={"d-flex justify-content-center pointer-wrapper" + (selected ? " selected" : "")}>
				<div className="ad-prev shadow" style={{pointerEvents:"none"}}>
					{hasShown ? (
						<GoodLoopUnit vertId={ad.id} size={size} advert={ad} play="onclick" shouldDebug={false} />
					) : (
						<div style={{ background: "black", width: "100%", height: "100%" }}></div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdvertsCatalogue;
