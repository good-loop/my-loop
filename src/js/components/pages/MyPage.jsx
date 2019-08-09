import React, {useEffect, useRef} from 'react';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import {useLogsIfVisible} from '../../base/components/CustomHooks';
import { RegisterLink } from '../../base/components/LoginWidget';
import Counter from '../../base/components/Counter';

import ServerIO from '../../plumbing/ServerIO';
import {RedesignNavBar} from '../NavBar';
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
			<SignUpConnectCard className='flex-row' />
			<ShareAdCard />
			<ContactCard />
			<TimeAndAttentionCard />
			<Footer />
		</div>
	);
};

/*
M 60 120
a 60 60 0 0 0 -60 -60
*/

const SplashCard = () => {
	return (
		<>
			<div className='splash img-block' style={{}}>
				<RedesignNavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
				<img className="doing-good" src="/img/doinggoodfeelsgood.png" alt="" />
				<img className="little-flowers" src="/img/littleflowers.png" alt="" />
				<SignUpConnectCard className='' />
			</div>
		</>
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
						<p>Tell us what you think of this web-app.</p>
						<p>Are you interested in hosting Ads For Good on your blog or website?</p>
						<p>
							<a href="https://www.good-loop.com/book-a-call">Let us Know.</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const TimeAndAttentionCard = () => (
	<div>
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
	</div>
);

const OurMissionCard = () => (
	<div className='color-gl-red'>
		<div className='our-mission'>
			<GlLogoGenericSvg />
			<div>
				<div className='sub-header'>
					Our Mission
				</div>
				<div className='text-block'>
					At Good-Loop, we believe that your time and attention is valuable.

					Together, we want to harness that power and use it to make a positive difference.
				</div>
			</div>
		</div>
		<div className='sub-header'>
			Here are some of our recent campaigns
		</div>
	</div>
);


const HowItWorksCard = () => {
	// TODO I've somehow broken the background colour for the how-it-works curve. Sorry. ^DW
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
			</div>
		</div>
	);
};


let userAdHistoryPV;

const ShareAdCard = () => {
	let xids = DataStore.getValue(['data', 'Person', 'xids']);
	if (!xids) return <Misc.Loading />;

	// Only do this once! Try to find the user's most recently viewed advert.
	if (!userAdHistoryPV) {
		// Only interested in @trk ids. Other types won't have associated watch history
		let trkIds = xids.filter(xid => xid.match(/@trk$/));

		// Fetch ad-history for all known tracking IDs...
		// No trkids? Calling getAdHistory with null arg = try current cookie
		if (!trkIds.length) trkIds = [null];
		const pvs = trkIds.map(trkId => ServerIO.getAdHistory(trkId));

		// ... and evaluate result to find most recent view when all requests resolved
		userAdHistoryPV = Promise.all(pvs).then(vals => vals.reduce((newest, candidate) => {
			const candidateTime = Date.parse(candidate.cargo.time);
			if (candidateTime > newest.parsedTime) {
				// tack the UTC timestamp on the view object for simple comparison
				return {parsedTime: candidateTime, ...candidate.cargo};
			}
			return newest;
		}, {parsedTime: new Date(0).getTime()})); // fake adview object for reducer initial value
	}

	return <ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} className='top-pad1' mixPanelTag='ShareAnAd' />;
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
