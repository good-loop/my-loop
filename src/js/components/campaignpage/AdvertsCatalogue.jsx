import React, {useState} from 'react';
import { space, yessy } from '../../base/utils/miscutils';
import {
	Alert,
	Carousel,
	CarouselCaption, CarouselControl,
	CarouselIndicators, CarouselItem, Col, Container, Row
} from 'reactstrap';
import Misc from '../../base/components/Misc';
import Advert from '../../base/data/Advert';
import Campaign from '../../base/data/Campaign';
import Money from '../../base/data/Money';
import Counter from '../../base/components/Counter';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import DevLink from './DevLink';

const tomsCampaigns = /(josh|sara|ella)/; // For matching TOMS campaign names needing special treatment
/**
 * HACK fix campaign name changes to clean up historical campaigns
 * @param {Object} viewcount4campaign
 * @param {!Advert} ad
 * @returns {Number}
 */
const viewCount = (viewcount4campaign, ad) => {
	if (!ad.campaign) return null;

	// HACK TOMS?? ella / josh / sara
	// Don't crunch down TOMS ads that aren't in the sara/ella/josh campaign group
	if (ad.vertiser === 'bPe6TXq8' && ad.campaign.match(tomsCampaigns)) {
		let keyword = 'josh';
		if (ad.campaign.includes('sara')) keyword = 'sara';
		if (ad.campaign.includes('ella')) keyword = 'ella';
		// Total views across all ads for this influencer
		return Object.keys(viewcount4campaign).reduce((acc, cname) => {
			return cname.includes(keyword) ? acc + viewcount4campaign[cname] : acc;
		}, 0);
	}


	let vc = viewcount4campaign[ad.campaign];
	if (vc) return vc;
	return null;
};

/**
 * @param {!Advert} ad 
 * @returns {!string} Can be "unknown" to fill in for no-campaign odd data items
 */
const campaignNameForAd = ad => {
	if (!ad.campaign) return "unknown";
	// HACK FOR TOMS 2019 The normal code returns 5 campaigns where there are 3 synthetic campaign groups
	// Dedupe on "only the first josh/sara/ella campaign" instead
	if (ad.vertiser === 'bPe6TXq8' && ad.campaign && ad.campaign.match(tomsCampaigns)) {
		let cname = ad.campaign.match(tomsCampaigns)[0];
		return cname;
	}
	return ad.campaign;
};

/**
 * List of adverts with some info about them (like views, dates)
 * @param {*} param0 
 */
const AdvertsCatalogue = ({ ads, viewcount4campaign, donationTotal, nvertiserName, totalViewCount }) => {

	console.log("Ads for catalogue: ", ads);
	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	/** Picks one Ad (with a video) from each campaign to display as a sample.  */
	let sampleAd4Campaign = {};
	ads.forEach(ad => {
		let cname = campaignNameForAd(ad);
		if (sampleAd4Campaign[cname]) {
			let showcase = ad.campaignPage && ad.campaignPage.showcase;
			// Prioritise ads with a start and end time attached
			let startProvided = !sampleAd4Campaign[cname].start && ad.start;
			let endProvided = !sampleAd4Campaign[cname].end && ad.end;
			// If the ad cannot provide a new value for start or end, skip it
			if (!startProvided && !endProvided && !showcase) {
				return;
			}
		}
		//if (!ad.videos || !ad.videos[0].url) return;
		sampleAd4Campaign[cname] = ad;
	});

	const sampleAds = Object.values(sampleAd4Campaign);

	console.log("Sample ads: ", sampleAds);

	let views = viewCount(viewcount4campaign, sampleAds[0]);
	if (sampleAds.length > 1) {
		views = totalViewCount;
	}
	views = printer.prettyNumber(views);

	if (ads.length == 1) {
		return <Container className="py-5">
			<h2>Watch the {nvertiserName} ad that raised <Counter currencySymbol="£" sigFigs={4} amount={donationTotal} minimumFractionDigits={2} preserveSize /><br />with {views} ad viewers</h2>
			<AdvertCard
				ad={ads[0]}
				viewCountProp={views}
				donationTotal={donationTotal}
				totalViewCount={totalViewCount}
			/>
		</Container>
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
			/>
			<CarouselCaption captionText={<Misc.DateDuration startDate={ad.start} endDate={ad.end} />}/>
		</CarouselItem>
	);
	
	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === carouselSlides.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	}

	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? carouselSlides.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	}

	const goToIndex = (newIndex) => {
		if (animating) return;
		setActiveIndex(newIndex);
	}

	return (<>
		<Container className="py-5">
			<h2>Watch the {nvertiserName} ads that raised <Counter currencySymbol="£" sigFigs={4} amount={donationTotal} minimumFractionDigits={2} preserveSize /><br />with {views} ad viewers</h2>
			<Carousel
				activeIndex={activeIndex}
				next={next}
				previous={previous}
			>
				<div className="d-block d-md-none">
					<CarouselIndicators items={carouselSlides} activeIndex={activeIndex} onClickHandler={goToIndex} cssModule={{backgroundColor:"#000"}}/>
				</div>
				{carouselSlides}
				<div className="d-none d-md-block">
					<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous}/>
					<CarouselControl direction="next" directionText="Next" onClickHandler={next}/>
				</div>
			</Carousel>
			<AdPreviewCarousel ads={sampleAds} setSelected={goToIndex} selectedIndex={activeIndex}/>
		</Container>
	</>);
};

const AdPreviewCarousel = ({ads, selectedIndex, setSelected}) => {

	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	const slidesNum = Math.ceil(ads.length / 3);
	
	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === carouselSlides.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	}

	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? carouselSlides.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	}

	const goToIndex = (newIndex) => {
		if (animating) return;
		setActiveIndex(newIndex);
	}
	
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
					/>
					<AdvertPreviewCard
						key={adIndex + 1}
						ad={ads[adIndex + 1]}
						selected={selectedIndex == adIndex + 1}
						handleClick={() => setSelected(adIndex + 1)}
					/>
					<AdvertPreviewCard
						key={adIndex + 2}
						ad={ads[adIndex + 2]}
						selected={selectedIndex == adIndex + 2}
						handleClick={() => setSelected(adIndex + 2)}
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
			<CarouselIndicators items={carouselSlides} activeIndex={activeIndex} onClickHandler={goToIndex} cssModule={{backgroundColor:"#000"}}/>
			{carouselSlides}
			<div className="wide-controls">
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous}/>
				<CarouselControl direction="next" directionText="Next" onClickHandler={next}/>
			</div>
		</Carousel>
	</div>;
}

const AdvertCard = ({ ad }) => {
	const size = 'landscape';
	return (
		<div className="position-relative" style={{ minHeight: "100px", maxHeight: "750px" }}>
			{Roles.isDev() ? <DevLink href={'https://portal.good-loop.com/#advert/' + escape(ad.id)} target="_portal" style={{position:"absolute", zIndex:999}}>Portal Editor</DevLink> : null}
			<div className="position-relative ad-card">
				<img src="/img/LandingBackground/white_iphone.png" className="w-100 invisible" />
				{/*<img src="/img/redcurve.svg" className="position-absolute tv-ad-player" style={{height: "80%"}} />*/}
				<img src="/img/LandingBackground/white_iphone.png" className="position-absolute d-none d-md-block unit-shadow" style={{ left: "50%", width: "80%", top: "50%", zIndex: 2, pointerEvents: "none", transform: "translate(-50%, -50%)" }} />
				<div className="position-absolute theunit">
					<GoodLoopUnit vertId={ad.id} size={size} />
				</div>
			</div>
			{/*<span className="position-absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 0 }}>If you're seeing this, you likely have ad-blocker enabled. Please disable ad-blocker to see the demo!</span>*/}
		</div>
	);
};

const AdvertPreviewCard = ({ ad, handleClick, selected = false }) => {
	if ( ! ad) {
		console.warn("AdvertPreviewCard - NO ad?!");
		return null;
	}
	let size = 'landscape';

	return (
		<div className="col-md-4 col-6">
			<div onClick={e => { e.preventDefault(); handleClick(); }} className={"pointer-wrapper" + (selected ? " selected" : "")}>
				<div className="ad-prev shadow">
					<GoodLoopUnit vertId={ad.id} size={size} />
				</div>
			</div>
			<div>
				<Misc.DateDuration startDate={ad.start} endDate={ad.end} invisOnEmpty/>
			</div>
		</div>
	);
};

export default AdvertsCatalogue;