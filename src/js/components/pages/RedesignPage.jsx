import React, {useEffect} from 'react';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';

import ServerIO from '../../plumbing/ServerIO';
import {RedesignNavBar} from '../NavBar';

import ShareAnAd from '../cards/ShareAnAd';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import {MyPageHeaderOvalSVG, HowItWorksCurveSVG, GlLogoGenericSvg, LogoRibbonSVG} from '../svg';

window.DEBUG = false;

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
					<div style={{position:'absolute', left: '1rem', top: '50%', width: '100%'}}>
						<div className='header text-center' style={{display:'inline-block', width: '48%'}}>
							Here's how &nbsp;
						</div>
						<div className='header white text-center' style={{display:'inline-block', width: '48%'}}>
							it works
						</div>
					</div>
				</div>
				<ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} mixPanelTag='ShareAnAd' />
				<div style={{position: 'relative'}}>
					<div
						className='img-block'
						style={{
							backgroundImage:`url('${ServerIO.MYLOOP_ENDPONT}/img/wheat_fields.jpg')`,
							minHeight: '30rem',
							position: 'absolute',
							zIndex: '-1'
						}}
					/>
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
					<LogoRibbonSVG />
					<div className="white">
						<div>
							<i> make an </i>
						</div>
						<div className='header'> 
							IMPACT 
						</div>
						<div className='text-block'>
							In 2018, Good-Loopers raised more than £200,000 for charitble causes by signing up and watching adverts
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// 775 x 600
// This page is for experimenting with ideas for the upcoming My-Loop redesign
// Everything below should be considered scratch code: it will be reworked
const RedesignPage = () => {
	ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

	return (
		<div className='flex-row'>
			<div className='RedesignPage'>
				<div className='img-block' style={{backgroundImage: `url('${ServerIO.MYLOOP_ENDPONT}/img/tulips.jpg')`, backgroundPosition: 'right'}}>
					<RedesignNavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
					<div className='flex-column'>
						<img 
							src={`${ServerIO.MYLOOP_ENDPONT}/img/doinggoodfeelsgood.png`} 
							style={{width: '45%', marginRight: 0}} 
						/>
						<img 
							src={`${ServerIO.MYLOOP_ENDPONT}/img/littleflowers.png`} 
							style={{width: '45%',  marginRight: 0}} 
						/>
					</div>
				</div>
				<OurMissionCard />
				<RecentCampaignsCard />
				<HowItWorksCard />
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
