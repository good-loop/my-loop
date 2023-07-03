import React, { useEffect, useState } from 'react';
import {
	Carousel,
	CarouselCaption, CarouselControl,
	CarouselIndicators, CarouselItem, Container
} from 'reactstrap';

import { space, stopEvent } from '../../base/utils/miscutils';
import Misc from '../../base/components/Misc';
import Advert from '../../base/data/Advert';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import DevLink from './DevLink';
import { assert } from '../../base/utils/assert';
import { range } from 'lodash';

import '../../../style/AdvertsCatalogue.less';

// Ads per page on the mini preview row
// TODO Do an initial render with just 1 and measure available size
const PAGE_SIZE = 4;


/**
 * A carousel allowing a user to flip between ad previews & see some basic information about them (run dates etc)
 * @param {Object} p
 * @param {Advert[]} p.ads
 * @param {?Boolean} p.noPreviews remove preview carousel
 */
const AdvertsCatalogue = ({ ads, noPreviews, className, captions = true }) => {
	assert(ads);

	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	const slideProps = { onExiting: () => setAnimating(true), onExited: () => setAnimating(false), className: 'advert-slide' };
	const carouselSlides = ads.map((ad, i) =>
		<CarouselItem key={i} {...slideProps} >
			<AdCard ad={ad} active={activeIndex === i} isMain />
			{captions && <CarouselCaption captionText={<Misc.DateDuration startDate={ad.start} endDate={ad.end} />} />}
		</CarouselItem>
	);

	// Nav functions
	const goToIndex = (i) => {
		if (animating) return;
		i = i % ads.length;
		if (i < 0) i += ads.length;
		setActiveIndex(i);
	};
	const next = () => goToIndex(activeIndex + 1);
	const previous = () => goToIndex(activeIndex - 1);

	// Multiple ads, previews OK = show preview row
	const multiple = ads.length > 1;
	const showPreviews = multiple && !noPreviews;
	// If preview carousel is being rendered, conditionally hide the individual-ad indicator buttons.
	const indicatorClasses = showPreviews && 'd-flex d-md-none';

	return (
		<div className={space('ads-catalogue', showPreviews && 'has-previews', multiple && 'multiple', className)}>
			<Carousel
				className="main-carousel"
				activeIndex={activeIndex}
				next={next}
				previous={previous}
				interval={false}
			>
				{multiple && <CarouselIndicators
					className={space('single-ad-indicators', indicatorClasses)}
					items={carouselSlides}
					activeIndex={activeIndex}
					onClickHandler={goToIndex}
					cssModule={{ backgroundColor: "#000" }}
				/>}
				{carouselSlides}
				{multiple && <>
						<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
						<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
				</>}
			</Carousel>
			{showPreviews && <AdPreviewCarousel ads={ads} setSelected={goToIndex} selectedIndex={activeIndex} />}
		</div>
	);
};


/**
 * Secondary carousel, showing multiple ads at a glance.
 */
const AdPreviewCarousel = ({ ads, selectedIndex, setSelected }) => {
	const [page, setPage] = useState(0);
	const [animating, setAnimating] = useState(false);



	// Keep previews page synced with selected advert (eg if user uses upper arrows to go off end of page)
	useEffect(() => {
		const pageForSelected = Math.floor(selectedIndex / PAGE_SIZE);
		if (pageForSelected !== page) goToPage(pageForSelected);
	}, [selectedIndex]);

	// Generate an AdvertPreviewCard for each ad...
	const adPreviews = ads.map((ad, i) => (
		<AdCard
			key={i} ad={ad}
			selected={selectedIndex === i}
			onClick={() => setSelected(i)} 
			active={page === Math.floor(i / PAGE_SIZE)}
		/>
	));

	// ...and distribute them across the pages.
	const pageProps = { onExiting: () => setAnimating(true), onExited: () => setAnimating(false), className: 'preview-page' };
	const carouselSlides = range(0, ads.length, PAGE_SIZE).map(pageStart => (
		<CarouselItem key={pageStart} {...pageProps}>
				<div className="preview-card-positioner">
					{adPreviews.slice(pageStart, pageStart + PAGE_SIZE)}
				</div>
		</CarouselItem>
	));

	// How many pages, after processing all ads?
	const pages = carouselSlides.length;
	// Leave out controls if there's only one page.
	const multiple = pages > 1;

	// Back/forward functions
	const goToPage = (newPage) => {
		if (animating) return;
		newPage = newPage % pages;
		if (newPage < 0) newPage += pages;
		setPage(newPage);
	};
	const next = () => goToPage(page + 1);
	const previous = () => goToPage(page - 1);

	return (
		<Carousel
			className="preview-carousel d-md-block d-none"
			activeIndex={page}
			next={next}
			previous={previous}
			interval={false}
		>
			{multiple && <CarouselIndicators
				className="ad-page-indicators"
				items={carouselSlides}
				activeIndex={page}
				onClickHandler={goToPage}
				cssModule={{ backgroundColor: "#000" }}
			/>}
			{carouselSlides}
			{multiple && <>
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
				<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
			</>}
		</Carousel>
	);
}


/** Display instead of ad cards that haven't scrolled into view yet */
const placeholder = <div className="ad-placeholder" />;


/** Link to the portal page for an ad */
const AdPortalLink = ({ad}) => (
	<DevLink href={`https://portal.good-loop.com/#advert/${escape(ad.id)}`} target="_portal">
		Advert Editor ({ad.id})
	</DevLink>
);


/**
 * A single ad in either of the carousels
 * @param {Object} p
 * @param {Advert} p.ad Advert to show in this card
 * @param {boolean} [active] True if currently on-screen and the ad should render
 * @param {boolean} [isMain] True for big main-carousel ads, falsy for mini previews
 * @param {function} [onClick] Generally "jump to this item"
 * @param {boolean} [selected] This is a preview for the ad currently shown in the main view
 * @returns
 */
const AdCard = ({ ad, active, isMain, onClick: _onClick, selected = false }) => {
	if (!ad) return null; // Weird but not a showstopper
	const [keepLive, setKeepLive] = useState(false);
	const [sizer, setSizer] = useState(); // Outer div ref
	const [maxAspect, setMaxAspect] = useState(); // The sizer's aspect ratio at 100% width and height

	// Record the aspect ratio of the maximum available size
	useEffect(() => {
		if (!active) return; // Inactive items have contents hidden, don't try to measure
		if (!sizer) {
			if (maxAspect) setMaxAspect(null); // sizer changed, invalidate previous measurement
			return;
		}
		const { width, height } = sizer.getBoundingClientRect();
		setMaxAspect(width / height);
	}, [sizer, keepLive]);

	// Main cards revert to placeholders when they become inactive, so running ads get stopped
	// Preview cards stick, so they don't have to reload again on every scroll
	useEffect(() => {
		if (active || isMain) setKeepLive(active);
	}, [active]);

	// Set up props for GoodLoopUnit
	const social = (ad.format === 'social');
	const size = social ? 'portrait' : 'landscape';
	const extraParams = social ? { delivery: 'app', after: 'vanish' } : null;
	const unitProps = { vertId: ad.id, size, extraParams, play: 'onclick', shouldDebug: false };

	const onClick = (!selected && _onClick) ? (e => { stopEvent(e); _onClick(e); }) : null;
	const sizerClasses = [isMain ? 'main-ad' : 'preview-ad', selected && 'selected'];

	// Fix either width or height, depending on whether the ad aspect is wider or taller than the maximum envelope.
	if (maxAspect) {
		const adAspect = { landscape: 16/9, portrait: 9/16 }[size];
		sizerClasses.push((adAspect > maxAspect) ? 'fix-width' : 'fix-height');
		sizerClasses.push(unitProps.size);
	} else {
		sizerClasses.push('hide-contents'); // Not probed available size yet
	}

	return <div className={space('ad-sizer', ...sizerClasses)} onClick={onClick} ref={setSizer}>
		{isMain ? <AdPortalLink ad={ad} /> : null}
		{keepLive ? <GoodLoopUnit {...unitProps} /> : placeholder}
		{/* onClick && <div className="click-catcher" onClick={e => {stopEvent(e); onClick(e);}} /> */}
	</div>;
};

export default AdvertsCatalogue;
