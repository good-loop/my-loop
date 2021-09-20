import React, { useState } from 'react';
import {
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

/**
 * List of adverts with some info about them (like views, dates)
 * @param {Object} p
 * @param {Campaign} p.campaign
 * @param {Advert[]} p.ads filtered list of ads to show
 * @param {Object} p.viewcount4campaign viewing data
 * @param {Money} p.donationTotal
 * @param {String} p.nvertiserName name of main advertiser/agency
 * @param {Number} p.totalViewCount
 * @param {Advertiser[]} p.vertisers associated advertisers of all ads
 * @param {Advert[]} p.canonicalAds all ads, unfiltered by the filtering query parameter
 */
const AdvertsCatalogue = ({ campaign, ads, donationTotal, nvertiserName, totalViewCount, vertisers, canonicalAds }) => {

	let ongoing = campaign.ongoing;

	// filter out any hidden ads
	// NB: done here as the hiding is a shallow cosmetic -- we still want the view and £ donation data included (or if not, there are other controls)
	if (campaign && campaign.hideAdverts) {
		ads = ads.filter(ad => !campaign.hideAdverts[ad.id]);
	}
	console.log("Ads for catalogue: ", ads, "Hiding: ", campaign && campaign.hideAdverts);
	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	let sampleAds = ads;

	// console.log("Sample ads: ", sampleAds.map(ad => ad.id));
	// console.log("ONGOING? ", ongoing);

	let views = printer.prettyNumber(totalViewCount);

	if (sampleAds.length === 1) {
		return (<Container className="py-5">
			<h2>Watch one of the <AdvertiserName name={nvertiserName} /> ads&nbsp;
				{ongoing ? "raising" : "that raised"} <Counter currencySymbol="£" noPennies amount={donationTotal} minimumFractionDigits={2} preserveSize /><br /> with {views} ad viewers</h2>
			<AdvertCard
				ad={ads[0]}
				viewCountProp={views}
				donationTotal={donationTotal}
				totalViewCount={totalViewCount}
				active={true}
			/>
			<AdvertFilters campaign={campaign} vertisers={vertisers} ads={sampleAds} canonicalAds={canonicalAds} />
		</Container>);
	}

	const carouselSlides = sampleAds.map((ad, i) =>
		<CarouselItem
			onExiting={() => setAnimating(true)}
			onExited={() => setAnimating(false)}
			key={i}
		>
			<AdvertCard
				ad={ad}
				viewCountProp={views}
				donationTotal={donationTotal}
				totalViewCount={totalViewCount}
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
		<Container className="py-5">
			<h2>Watch the <AdvertiserName name={nvertiserName} /> ads {ongoing ? "raising" : "that raised"} <Counter currencySymbol="£" noPennies amount={donationTotal} minimumFractionDigits={2} preserveSize /><br />with {views} ad viewers</h2>
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
			<AdvertFilters campaign={campaign} vertisers={vertisers} ads={sampleAds} canonicalAds={canonicalAds} />
			<AdPreviewCarousel ads={sampleAds} setSelected={goToIndex} selectedIndex={activeIndex} />
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

	const slidesNum = Math.ceil(ads.length / 3);

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
		const adIndex = i * 3;
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

// Support portrait ads
const IPhoneMockup = ({ size }) => {
	if (size == 'portrait') {
		return (
			<div>
				<img src="/img/LandingBackground/iphone-mockup-portrait.svg" className="w-100 invisible" />
				<img src="/img/LandingBackground/iphone-mockup-portrait.svg" className="position-absolute d-none d-md-block unit-shadow" style={{ left: "49.8%", width: "35%", top: "18%", zIndex: 2, pointerEvents: "none", transform: "translate(-50%, -50%)" }} />
			</div>
		);
	}
	return (
		<div>
			<img src="/img/LandingBackground/iphone-mockup-landscape.svg" className="w-100 invisible" />
			{/*<img src="/img/redcurve.svg" className="position-absolute tv-ad-player" style={{height: "80%"}} />*/}
			<img src="/img/LandingBackground/iphone-mockup-landscape.svg" className="position-absolute d-none d-md-block unit-shadow" style={{ left: "49.8%", width: "67%", top: "50%", zIndex: 2, pointerEvents: "none", transform: "translate(-50%, -50%)" }} />
		</div>
	);

};

// If social is null (not specific) or false, it will fall back to landscape ads
const AdvertCard = ({ ad, active }) => {
	const social = ad.format === "social";
	let size = 'landscape';
	const [hasShown, setHasShown] = useState(false);
	if (active && !hasShown) setHasShown(true);
	const extraParams = {};
	if (social) {
		size = "portrait";
		extraParams.delivery = "app";
		extraParams.after = "persist";
	}
	return (
		<div className="position-relative" style={{ minHeight: "100px", maxHeight: "750px" }}>
			<DevLink href={'https://portal.good-loop.com/#advert/' + escape(ad.id)} target="_portal" style={{ position: "absolute", zIndex: 999 }}>Advert Editor ({ad.id})</DevLink>
			<div className="position-relative ad-card">
				<IPhoneMockup size={size} />
				<div className={"position-absolute theunit-" + size} >
					{hasShown ? (
						<GoodLoopUnit vertId={ad.id} size={size} extraParams={extraParams} />
					) : (
						<div style={{ background: "black", width: "100%", height: "100%" }}></div>
					)}
				</div>
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
		<div className={"col-6 	" + (social ? "col-md-2" : "col-md-4")}>
			<div onClick={e => { e.preventDefault(); handleClick(); }} className={"d-flex justify-content-center pointer-wrapper" + (selected ? " selected" : "")}>
				<div className="ad-prev shadow">
					{hasShown ? (
						<GoodLoopUnit vertId={ad.id} size={size} advert={ad} />
					) : (
						<div style={{ background: "black", width: "100%", height: "100%" }}></div>
					)}
				</div>
			</div>
			<div>
				<Misc.DateDuration startDate={ad.start} endDate={ad.end} invisOnEmpty />
			</div>
		</div>
	);
};

/**
 * Advert filter buttons, via query
 * @param {Object} p
 * @param {Campaign} campaign the master campaign
 * @param {Advertiser[]} vertisers associated advertisers
 * @param {Advert[]} canonicalAds list of unfiltered ads
 */
const AdvertFilters = ({ campaign, vertisers, canonicalAds }) => {
	const adsVertisers = uniq(canonicalAds.map(ad => ad.vertiser));
	if (vertisers) vertisers = uniq(vertisers).filter(vertiser => adsVertisers.includes(vertiser.id));
	const filterButtons = campaign.filterButtons;
	const filterCount = filterButtons ? Object.keys(filterButtons).filter(key => filterButtons[key].length).length : 0;

	const customFilters = filterButtons && (
		Object.keys(filterButtons).map(category => (
			<AdvertFilterCategory category={category} filterButtons={filterButtons} />
		))
	);

	let containsNonNull = false;
	customFilters && customFilters.forEach(control => {
		if (control) containsNonNull = true;
	});
	if (!containsNonNull && !vertisers) return null;

	return <div className="position-relative ad-filters">
		{filterCount || campaign.showVertiserFilters ? <ClearFilters /> : null}
		{campaign.showVertiserFilters && <AdvertFilterCategory vertisers={vertisers} />}
		{customFilters}
	</div>;
};


/**
 * Display a filter category
 * @param {Advertiser[]} vertisers if set, generates a vertiser category
 */
const AdvertFilterCategory = ({ category, filterButtons, vertisers }) => {

	// Return null if there is no data, or if no queries are set
	if (!vertisers) {
		if (!category || !filterButtons || !filterButtons[category].length) return null;
		let noQueries = true
		for (let i = 0; i < category.length; i++) {
			if (filterButtons[category][i] && filterButtons[category][i].query) noQueries = false;
		}
		if (noQueries) {
			console.warn("Ad filter category " + category + " contains no set queries! Hiding.");
			return null;
		}
	}

	/**
	 * Legacy, for preventing collapse (categories no longer collapse)
	 */
	const containsSelectedButton = () => {
		const { 'query': dsQuery } = DataStore.getValue(['location', 'params']);
		if (!dsQuery) return false;
		if (filterButtons) {
			if (!filterButtons[category]) return false;
			let foundQuery = false;
			filterButtons[category].forEach(btn => {
				if (btn && btn.query === dsQuery) foundQuery = true;
			});
			return foundQuery;
		} else if (vertisers) {
			let foundQuery = false;
			vertisers.forEach(vertiser => {
				if (dsQuery === "vertiser:" + vertiser.id) foundQuery = true;
			});
			return foundQuery;
		}
	};

	console.log("FILTER Vertisers? ", vertisers);

	return <div className="ad-filter">
		<h5>Filter by {vertisers ? "advertiser" : category}</h5>
		<div className="ad-filter-list w-100 text-center d-flex flex-row justify-content-center">
			{vertisers ? (
				vertisers.map(vertiser => (
					<FilterButton key={vertiser.id} query={"vertiser:" + vertiser.id}>
						{vertiser.branding ? <img src={vertiser.branding.logo} className="w-75" />
							: <h3>{vertiser.name || vertiser.id}</h3>}
					</FilterButton>
				))
			) : (
				filterButtons[category].filter(x => x).map((filterBtn, i) => (
					<FilterButton key={i} query={filterBtn.query}>
						{filterBtn.imgUrl ? <img src={filterBtn.imgUrl} className="w-75" />
							: <h3>{filterBtn.displayName}</h3>}
					</FilterButton>
				))
			)}
		</div>
		<br />
	</div>;

};

const ClearFilters = ({ }) => {
	const clearable = !!DataStore.getValue(['location', 'params', 'query']);
	return <a
		onClick={() => clearable && DataStore.setValue(['location', 'params', 'query'], null)}
		style={{ position: "absolute", right: 10, bottom: -10, color: clearable ? "black" : "grey", cursor: clearable ? "pointer" : "default" }}>
		CLEAR FILTERS
	</a>;
};

const FilterButton = ({ query, children }) => {
	if (!query) return null;
	const { 'query': dsQuery } = DataStore.getValue(['location', 'params']);
	const selected = dsQuery === query;
	const setQuery = () => {
		DataStore.setValue(['location', 'params', 'query'], query);
	};
	return <div className={"ad-filter-btn d-inline-flex flex-row align-items-center justify-content-center " + (selected ? "selected" : "")} onClick={setQuery}>
		{children}
	</div>;
};

export default AdvertsCatalogue;
