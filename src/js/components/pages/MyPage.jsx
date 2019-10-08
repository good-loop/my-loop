import React, { useRef } from 'react';
// import PV from 'promise-value';
import {yessy} from 'wwutils';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import {useLogsIfVisible} from '../../base/components/CustomHooks';
import Counter from '../../base/components/Counter';

import ServerIO from '../../plumbing/ServerIO';
import MyLoopNavBar from '../NavBar';
import Footer from '../Footer';

import ShareAnAd from '../cards/ShareAnAd';
import SignUpConnectCard from '../cards/SignUpConnectCard';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import {GlLogoGenericSvg, howItWorksCurveSVG, glLogoDefaultSvg, splitColouredCircleSVG} from '../svg';


window.DEBUG = false;

const MyPage = () => {
	ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

	return (
		<div className='MyPage'>
			<SplashCard />
			<OurMissionCard />
			<RecentCampaignsCard />
			<HowItWorksCard />
			<ShareAdCard />
			<ContactCard />
			<TimeAndAttentionCard />
			<Footer />
		</div>
	);
};


const SplashCard = () => {
	return (
		<div className='splash img-block' style={{}}>
			<MyLoopNavBar logo='/img/new-logo-with-text.svg' />
			<img className="doing-good" src="/img/doinggoodfeelsgood.png" alt="" />
			<img className="little-flowers" src="/img/littleflowers.png" alt="" />
			<SignUpConnectCard className='' />
		</div>
	);
};

const ContactCard = () => {
	let doesIfVisibleRef = useRef();
	useLogsIfVisible(doesIfVisibleRef, 'ContactCardVisible');

	return (
		<div className='text-center'>
			<div className='sub-header top-pad1'>
				Get in touch
			</div>
			<div className='pad1'>
				<div ref={doesIfVisibleRef}>
					<div>
						<p><a href="mailto:hello@good-loop.com?subject=My thoughts on My Good-Loop">Tell us what you think of My Good-Loop.</a></p>
						<p>Interested in hosting Ads For Good on your blog or website? <a href="https://www.good-loop.com/book-a-call">Let us know.</a></p>
					</div>
				</div>
			</div>
		</div>
	);
};

const TimeAndAttentionCard = () => (
	<div className='bg-gl-red flex-row flex-wrap text-center white'>
		<div className='flex-column pad1 width20'>
			<div className='sub-header font-bold'>
				Time and attention online are valuable.
			</div>
			<div className='sub-header'>
				Let's harness that value and use it for good.
			</div>
		</div>
		<div className='text-block pad1'>
			Good-Loop will never force you to engage with an ad. But, if you choose to give an advertiser some of your valuable time and attention, you get to give 50% of the advertisers' money to a relevant charitable cause.
		</div>
	</div>
);

const OurMissionCard = () => (
	<div className='color-gl-red'>
		<div className='our-mission'>
			<GlLogoGenericSvg />
			<div>
				<div className='sub-header'>
					What's Good-Loop?
				</div>
				<div className='text-block'>
					At Good-Loop, we raise money for charities using the power of advertising.<br />
					Every time you watch one of our ads, we'll use the advertisers' money to make a donation to a charity of your choice.
				</div>
			</div>
		</div>
		<div className='sub-header'>
			Here are some of our recent campaigns
		</div>
	</div>
);


const HowItWorksCard = () => {
	return (
		<div className="how-it-works">
			<div className="photo-bg">
				<div className="how-it-works-banner">
					{howItWorksCurveSVG}
					<div className="left header text-center">Here's<br />how</div>
					<div className="right header text-center">it<br />works</div>
				</div>
				<div className='steps'>
					<div className='step-1 finger to-left white bg-gl-red pad1'>
						<CircleChar>1</CircleChar>
						<div>
							<span className='header'>WATCH</span>
							<span className='sub-header'>&nbsp; a 15 second video </span>
						</div>
					</div>
					<div className='step-2 finger to-right white bg-gl-red pad1'>
						<CircleChar>2</CircleChar>
						<div>
							<span className='header'>CHOOSE</span>
							<span className='sub-header'>&nbsp; a charity to support </span>
						</div>
					</div>
					<div className='step-3 finger to-left white pad1'>
						<CircleChar>3</CircleChar>
						<div>
							<span className='header'>DONATE</span><br/>
							<span className='sub-header'>
								50% of the advert cost<br/>goes to the charity
							</span>
						</div>
					</div>
					
				</div>
			</div>{/* ./photo-bg */}
			<div className="logo-ribbon">{glLogoDefaultSvg}</div>
			<div className='make-an-impact img-block'>
				{splitColouredCircleSVG}
				<div className="impact-girl accent" />
				<div className="impact-girl" />
				<div className="white impact-card-text">
					<div className="impact-card-header">
						<div className="quiet">make an</div>
						<div className='loud sub-header'>IMPACT</div>
					</div>
					
					<div className='text-block'>
						In 2018, Good-Loopers raised more than <strong><Counter currencySymbol='£' value={200000} animationLength={1000} /></strong> for charitable causes by signing up and watching adverts.<br/>
						In 2019, we've already beaten that figure - and we're aiming for <strong>£1,000,000</strong>.
					</div>
				</div>
				<SignUpConnectCard />
			</div>
		</div>
	);
};


const ShareAdCard = () => {
	// ?? how is this populated??
	let xids = DataStore.getValue(['data', 'Person', 'xids']);
	// ??Only interested in @trk ids. Other types won't have associated watch history ??
	let trkIds = xids && xids.filter(xid => xid.match(/@trk$/));

	if ( ! yessy(trkIds)) {
		console.log("ShareAdCard - no trkIds = no ad??", xids);
		return <div className='top-pad1'><ShareAnAd /></div>;
	}

	// What was the last thing they watched? Actually, just anything (race)
	let pvLastAd = DataStore.fetch(['misc', 'lastAd', JSON.stringify(trkIds)], () => {
		// Fetch ad-history for all known tracking IDs...
		const pAds = trkIds.map(trkId => ServerIO.getLastAd(trkId));
		const pAd = Promise.race(pAds);
		// TODO pick the most ad?? (but oh well, I think picking an earlier ad is harmless)
		return pAd;
	});
	if ( ! pvLastAd.resolved) return <Misc.Loading />;
	const adid = pvLastAd.value && pvLastAd.value.id; // NB: the server might return an error, in which case adid is null	
	return <div className='top-pad1'><ShareAnAd adid={adid} /></div>;
};

/**
 * Stick some text in this to put it inside a thick circular border.
 * NB weird things will happen if used for more than 1-2 characters.
 */
const CircleChar = ({children, className, ...rest}) => (
	<div className={'number-circle header flex-vertical-align' + (className ? ' ' + className : '')} {...rest}>
		{children}
	</div>
);

export default MyPage;
