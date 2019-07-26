import React, {useEffect, useRef} from 'react';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import {useLogsIfVisible} from '../../base/components/CustomHooks';
import { RegisterLink } from '../../base/components/LoginWidget';

import ServerIO from '../../plumbing/ServerIO';
import {RedesignNavBar} from '../NavBar';
import Footer from '../Footer';

import ShareAnAd from '../cards/ShareAnAd';
import SocialMediaCard from '../cards/SocialMediaCard';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import {HowItWorksCurveSVG, GlLogoGenericSvg, LogoRibbonSVG, SplitColouredCircleSVG} from '../svg';


window.DEBUG = false;

// This page is for experimenting with ideas for the upcoming My-Loop redesign
// Everything below should be considered scratch code: it will be reworked
const RedesignPage = () => {
	ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

	return (
		<div className='flex-row'>
			<div className='RedesignPage'>
				<SplashCard />
				<OurMissionCard />
				<RecentCampaignsCard />
				<HowItWorksCard />
				<ContactCard />
				<TimeAndAttentionCard />
				<Footer />
			</div>
		</div>
	);
};

const SplashCard = () => {
	let xids = DataStore.getValue(['data', 'Person', 'xids']);
	if( !xids ) return <Misc.Loading />;

	return (
		<>
			<div className='img-block' style={{backgroundImage: `url('${ServerIO.MYLOOP_ENDPONT}/img/tulips.jpg')`, backgroundPosition: 'right'}}>
				<RedesignNavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
				<div className='flex-column'>
					<img 
						src={`${ServerIO.MYLOOP_ENDPONT}/img/doinggoodfeelsgood.png`} 
						style={{width: '40%', marginRight: 0}} 
					/>
					<img 
						src={`${ServerIO.MYLOOP_ENDPONT}/img/littleflowers.png`} 
						style={{width: '40%',  marginRight: 0}} 
					/>
				</div>
			</div>
			<SocialMediaCard allIds={xids} />		
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
				<div className='sub-header highlight font-bold'>
					Time and attention online are valuable
				</div>
				<div className='sub-header'>
					Let's harness that value and use it for good
				</div>
			</div>
			<div className='text-block pad1'>
				Good-Loop will never force you to engage with an ad. But, if you choose to give an adveritser some of your valuable time, attention and data, you get to give 50% of the advertisers' money to a relevant charitable cause.
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
	let xids = DataStore.getValue(['data', 'Person', 'xids']);

	if( !xids ) return <Misc.Loading />;

	// Attempt to find ad most recently watched by the user
	// Go through all @trk ids.
	// Expect that user should only ever have one @trk, but can't confirm that
	let userAdHistoryPV;
	useEffect(() => {
		// Only interested in @trk ids. Other types won't have associated watch history
		const trkIds = xids.filter( xid => xid.slice(xid.length - 4) === '@trk');

		// No cookies registered, try using current session's cookie
		if( !trkIds || trkIds.length === 0 ) {
			return ServerIO.getAdHistory();
		}

		// Pull in data for each ID
		const PVs = trkIds.map( trkID => ServerIO.getAdHistory(trkID));
		// Pick the data with the most recent timestamp
		userAdHistoryPV = Promise.all(PVs).then( values => values.reduce( (newestData, currentData) => {
			if( !newestData ) {
				return currentData;
			}
			return Date.parse(currentData.cargo.time) > Date.parse(newestData.cargo.time) ? currentData : newestData;
		}));
	}, []);
	
	return (
		<div>
			<div style={{padding: 0}}>
				<div style={{position: 'relative'}}>
					<HowItWorksCurveSVG />
					<div style={{position:'absolute', top: '50%', width: '100%'}}>
						<div className='header text-center' style={{display:'inline-block', width: '54%'}}>
							Here's
							<br />
							how
						</div>
						<div className='header white text-center' style={{display:'inline-block', width: '40%'}}>
							it 
							<br />
							works
						</div>
					</div>
				</div>
				<div 
					className='img-block' 
					style={{
						position: 'relative',
						backgroundImage:`url('${ServerIO.MYLOOP_ENDPONT}/img/wheat_fields.jpg')`,
						minHeight: '30rem',
					}}
				>
					<div className='white bg-gl-red pad1 sausage-container-right flex-row'>
						<CharacterInCircle character={1} />
						<div>
							<span className='header'>WATCH</span> 
							<span className='sub-header'>&nbsp; a 15 second video </span>
						</div>
					</div>
					<div className='white bg-gl-red pad1 sausage-container-left flex-row'>
						<div>
							<span className='header'>CHOOSE</span> 
							<span className='sub-header'>&nbsp; a charity to support </span>
						</div>
						<CharacterInCircle character={2} />					
					</div>
					<div className='color-gl-red flex-row'>
						<CharacterInCircle character={3} />
						<div
							style={{
								margin: 'unset',
								maxWidth: '25rem'
							}}
						>
							<div className='header'>
								DONATE
							</div>
							<div className='sub-header white'>
								50% of the cost of the advert will be donated to the charity of your choice
							</div>
						</div>
					</div>
				</div>
				<div className='img-block' style={{backgroundImage: `url('${ServerIO.MYLOOP_ENDPONT}/img/dew-grass.jpg')`, position: 'relative'}}>
					<LogoRibbonSVG />
					<SplitColouredCircleSVG />
					<div className="white impact-card-text">
						<div>
							<i> make an </i>
						</div>
						<div className='sub-header'> 
							IMPACT 
						</div>
						<div className='text-block'>
							In 2018, Good-Loopers raised more than £200,000 for charitble causes by signing up and watching adverts
						</div>
					</div>
				</div>
				<ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} className='top-pad1' mixPanelTag='ShareAnAd' />
			</div>
		</div>
	);
};

// Applies thick circular border to contents
const CharacterInCircle = ({character}) => (
	<div className='number-circle header flex-vertical-align'>
		<span>
			{character}
		</span>
	</div>
);

export default RedesignPage;
