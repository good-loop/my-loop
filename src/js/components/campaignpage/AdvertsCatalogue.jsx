import React, {useState, useRef} from 'react';
import { space, yessy, uniq } from '../../base/utils/miscutils';
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
const AdvertsCatalogue = ({campaign, ads, viewcount4campaign, donationTotal, nvertiserName, totalViewCount, showNonServed, ongoing, vertisers, canonicalAds }) => {

    let {nosample} = DataStore.getValue(['location', 'params']) || {};

	// filter out any hidden ads
	// NB: done here as the hiding is a shallow cosmetic -- we still want the view and £ donation data included (or if not, there are other controls)
	if (campaign && campaign.hideAdverts) {
		ads = ads.filter(ad => ! campaign.hideAdverts[ad.id]);
	}
	console.log("Ads for catalogue: ", ads, "Hiding: ",campaign && campaign.hideAdverts);
	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

    let sampleAds = ads;

    if (!nosample) {
        /** Picks one Ad (with a video) from each campaign to display as a sample.  */
        let sampleAd4Campaign = {};
        ads.forEach(ad => {
            // Skip never-served ads
            if (!ad.hasServed && !ad.serving && !showNonServed) return;
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

        sampleAds = Object.values(sampleAd4Campaign);
        if (!sampleAds.length) sampleAds = ads;
    }

	console.log("Sample ads: ", sampleAds);

	let views = sampleAds.length ? viewCount(viewcount4campaign, sampleAds[0]) : 0;
	if (sampleAds.length > 1) {
		views = totalViewCount;
	}
	views = printer.prettyNumber(views);

    console.log("ONGOING? ", ongoing);

	if (sampleAds.length == 1) {
		return <Container className="py-5">
			<h2>Watch the <AdvertiserName name={nvertiserName} /> ad&nbsp;
            {ongoing ? "raising" : "that raised"} <Counter currencySymbol="£" sigFigs={4} amount={donationTotal} minimumFractionDigits={2} preserveSize /><br />from a campaign with {views} ad viewers</h2>
			<AdvertCard
				ad={ads[0]}
				viewCountProp={views}
				donationTotal={donationTotal}
                totalViewCount={totalViewCount}
                active={true}
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
                active={activeIndex === i}
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
			<h2>Watch the <AdvertiserName name={nvertiserName} /> ads that raised <Counter currencySymbol="£" sigFigs={4} amount={donationTotal} minimumFractionDigits={2} preserveSize /><br />with {views} ad viewers</h2>
			<Carousel
				activeIndex={activeIndex}
				next={next}
                previous={previous}
                interval={false}
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
            <AdvertFilters vertisers={vertisers} ads={sampleAds} canonicalAds={canonicalAds}/>
			<AdPreviewCarousel ads={sampleAds} setSelected={goToIndex} selectedIndex={activeIndex}/>
		</Container>
	</>);
};

/**
 * NB: wrapped in span x2 to allow custom css to target it. e.g.
 * 
 * 
 */
const AdvertiserName = ({name}) => <span className="advertiser-name"><span>{name}</span></span>

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
						selected={selectedIndex == adIndex + 2}
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
			<CarouselIndicators items={carouselSlides} activeIndex={activeIndex} onClickHandler={goToIndex} cssModule={{backgroundColor:"#000"}}/>
			{carouselSlides}
			<div className="wide-controls">
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous}/>
				<CarouselControl direction="next" directionText="Next" onClickHandler={next}/>
			</div>
		</Carousel>
	</div>;
}

const AdvertCard = ({ ad, active }) => {
    const size = 'landscape';
    const [hasShown, setHasShown] = useState(false);
    if (active && !hasShown) setHasShown(true);
	return (
		<div className="position-relative" style={{ minHeight: "100px", maxHeight: "750px" }}>
			<DevLink href={'https://portal.good-loop.com/#advert/' + escape(ad.id)} target="_portal" style={{position:"absolute", zIndex:999}}>Advert Editor ({ad.id})</DevLink>
			<div className="position-relative ad-card">
				<img src="/img/LandingBackground/white_iphone.png" className="w-100 invisible" />
				{/*<img src="/img/redcurve.svg" className="position-absolute tv-ad-player" style={{height: "80%"}} />*/}
				<img src="/img/LandingBackground/white_iphone.png" className="position-absolute d-none d-md-block unit-shadow" style={{ left: "50%", width: "80%", top: "50%", zIndex: 2, pointerEvents: "none", transform: "translate(-50%, -50%)" }} />
				<div className="position-absolute theunit">
					{hasShown ? <GoodLoopUnit vertId={ad.id} size={size} />
                    : <div style={{background:"black", width:"100%", height:"100%"}}></div>}
				</div>
			</div>
			{/*<span className="position-absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 0 }}>If you're seeing this, you likely have ad-blocker enabled. Please disable ad-blocker to see the demo!</span>*/}
		</div>
	);
};

const AdvertPreviewCard = ({ ad, handleClick, selected = false, active }) => {
	if ( ! ad) {
		console.warn("AdvertPreviewCard - NO ad?!");
		return null;
	}
	let size = 'landscape';
    const [hasShown, setHasShown] = useState(false);
    if (active && !hasShown) setHasShown(true);

	return (
		<div className="col-md-4 col-6">
			<div onClick={e => { e.preventDefault(); handleClick(); }} className={"pointer-wrapper" + (selected ? " selected" : "")}>
				<div className="ad-prev shadow">
					{hasShown ? <GoodLoopUnit vertId={ad.id} size={size} />
                    : <div style={{background:"black", width:"100%", height:"100%"}}></div>}
				</div>
			</div>
			<div>
				<Misc.DateDuration startDate={ad.start} endDate={ad.end} invisOnEmpty/>
			</div>
		</div>
	);
};

const AdvertFilters = ({vertisers, ads, canonicalAds}) => {
    const adsVertisers = uniq(canonicalAds.map(ad => ad.vertiser));
    if (vertisers) vertisers = uniq(vertisers).filter(vertiser => adsVertisers.includes(vertiser.id));
    console.log(vertisers);
    return <>
    <div className="position-relative">
        <h5>Filter by Advertiser</h5>
        <ClearFilters/>
    </div>
    <hr/>
    <Row className="ad-filters w-100 text-center" noGutters>
        {vertisers && vertisers.map(vertiser => <FilterButton key={vertiser.id} query={"vertiser:" + vertiser.id}>
            {vertiser.branding ? <img src={vertiser.branding.logo} className="w-75"/>
            : <h3>{vertiser.name || vertiser.id}</h3>}
        </FilterButton>)}
    </Row></>;
};

const ClearFilters = ({}) => {
    const clearable = !!DataStore.getValue(['location', 'params', 'query']);
    return <a
            onClick={() => DataStore.setValue(['location', 'params', 'query'], null)}
            style={{position:"absolute", right:10, bottom: -10, color: clearable ? "black" : "grey"}}>
                CLEAR FILTERS
    </a>;
}

const FilterButton = ({query, children}) => {
    const {'query':dsQuery} = DataStore.getValue(['location', 'params']);
    const selected = dsQuery === query;
    const setQuery = () => {
        DataStore.setValue(['location', 'params', 'query'], query);
    };
    return <Col size={3} className={"ad-filter-btn d-flex flex-row align-items-center justify-content-center " + (selected ? "selected" : "")} onClick={setQuery}>
        {children}
    </Col>;
}

export default AdvertsCatalogue;