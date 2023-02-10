import React, { useEffect, useState } from 'react';
import {
	Button,
	Carousel,
	CarouselCaption, CarouselControl,
	CarouselIndicators, CarouselItem, Container
} from 'reactstrap';

import { uniq } from '../../base/utils/miscutils';

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
 * @param {Campaign} p.campaign
 * @param {Advert[]} p.ads filtered list of ads to show
 * @param {Advert[]} p.canonicalAds All ads, unfiltered by the filtering query parameter
 */
const AdvertsCatalogue = ({ campaign, ads, canonicalAds }) => {
	assert(canonicalAds);
	let ongoing = Campaign.isOngoing(campaign);

	// filter out any hidden ads
	// NB: done here as the hiding is a shallow cosmetic -- we still want the view and £ donation data included (or if not, there are other controls)
	let showAds = ads;
	if (campaign && campaign.hideAdverts) {
		showAds = ads.filter(ad => ! ad._hidden);
	}

	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	if (showAds.length === 1) {
		return (<Container>
			<AdvertCard
				ad={showAds[0]}
				active
			/>
		</Container>);
	}

	const carouselSlides = showAds.map((ad, i) =>
		<CarouselItem
			onExiting={() => setAnimating(true)}
			onExited={() => setAnimating(false)}
			key={i}
		>
			<AdvertCard
				ad={ad}
				active={activeIndex === i}
			/>
			<CarouselCaption captionText={<Misc.DateDuration startDate={ad.start} endDate={ad.end} />} />
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

	return (<>
		<Container className='ads-catalogue'>
			<Carousel
				activeIndex={activeIndex}
				next={next}
				previous={previous}
				interval={false}
			>
				<div className="d-block d-md-none">
					<CarouselIndicators items={carouselSlides} activeIndex={activeIndex} onClickHandler={goToIndex} cssModule={{ backgroundColor: "#000" }} />
				</div>
				{carouselSlides}
				<div className="d-none d-md-block">
					<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
					<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
				</div>
			</Carousel>
			<br />
			<br />
			<AdPreviewCarousel ads={showAds} setSelected={goToIndex} selectedIndex={activeIndex} />
		</Container>
	</>);
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

	const slidesNum = Math.ceil(ads.length / 6);

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

	let carouselSlides = [];
	for (let i = 0; i < slidesNum; i++) {
		const adIndex = i * 6;
		carouselSlides.push(
			<CarouselItem
				onExiting={() => setAnimating(true)}
				onExited={() => setAnimating(false)}
				key={i}
			>
				<div className="row justify-content-center mt-5">
					<AdvertPreviewCard
						key={adIndex}
						ad={ads[adIndex]}
						selected={selectedIndex == adIndex}
						handleClick={() => setSelected(adIndex)}
						active={activeIndex === i}
					/>
					<AdvertPreviewCard
						key={adIndex + 1}
						ad={ads[adIndex + 1]}
						selected={selectedIndex == adIndex + 1}
						handleClick={() => setSelected(adIndex + 1)}
						active={activeIndex === i}
					/>
					<AdvertPreviewCard
						key={adIndex + 2}
						ad={ads[adIndex + 2]}
						selected={selectedIndex === adIndex + 2}
						handleClick={() => setSelected(adIndex + 2)}
						active={activeIndex === i}
					/>
					<AdvertPreviewCard
						key={adIndex + 3}
						ad={ads[adIndex + 3]}
						selected={selectedIndex === adIndex + 3}
						handleClick={() => setSelected(adIndex + 3)}
						active={activeIndex === i}
					/>
					<AdvertPreviewCard
						key={adIndex + 4}
						ad={ads[adIndex + 4]}
						selected={selectedIndex === adIndex + 4}
						handleClick={() => setSelected(adIndex + 4)}
						active={activeIndex === i}
					/>
					<AdvertPreviewCard
						key={adIndex + 5}
						ad={ads[adIndex + 5]}
						selected={selectedIndex === adIndex + 5}
						handleClick={() => setSelected(adIndex + 5)}
						active={activeIndex === i}
					/>
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
const AdvertCard = ({ ad, active }) => {
	const social = ad.format === "social";
	let size = 'landscape';
	const [hasShown, setHasShown] = useState(false);
	const extraParams = {};
	if (social) {
		size = "portrait";
		extraParams.delivery = "app";
		extraParams.after = "vanish";
	}
	console.log("Extra Params", extraParams);

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
		<div className="position-relative main-ad" style={{ minHeight: "100px", maxHeight: "600px" }}>
			{/*<DevLink href={'https://portal.good-loop.com/#advert/' + escape(ad.id)} target="_portal" style={{ position: "absolute", zIndex: 999 }}>Advert Editor ({ad.id})</DevLink>*/}
			<div className="position-relative ad-unit-outer">
				{hasShown ? (
					<GoodLoopUnit vertId={ad.id} size={size} extraParams={extraParams} style={{zIndex:2, maxWidth:"50%", margin:"auto"}}/>
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
		console.warn("AdvertPreviewCard - NO ad?!");
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
				<div className="ad-prev shadow">
					{hasShown ? (
						<GoodLoopUnit vertId={ad.id} size={size} advert={ad} />
					) : (
						<div style={{ background: "black", width: "100%", height: "100%" }}></div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdvertsCatalogue;
