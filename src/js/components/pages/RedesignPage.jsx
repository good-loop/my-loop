import React from 'react';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';

import ServerIO from '../../plumbing/ServerIO';
import {RedesignNavBar} from '../NavBar';

import ShareAnAd from '../cards/ShareAnAd';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import RecentCampaignsCard from '../cards/RecentCampaignsCard';

const pagePath = ['widget', 'MyPage'];

window.DEBUG = false;

// 775 x 600
// This page is for experimenting with ideas for the upcoming My-Loop redesign
// Everything below should be considered scratch code: it will be reworked
const RedesignPage = () => {
	let xids = DataStore.getValue(['data', 'Person', 'xids']);

	if( !xids ) return <Misc.Loading />;

	// TODO pass around xids and turn into strings later
	// HACK DataLog query string: "user:trkid1@trk OR user:trkid2@trk OR ..."
	const allIds = xids.map(trkid => 'user:' + trkid).join(' OR ');

	ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

	// Attempt to find ad most recently watched by the user
	// Go through all @trk ids.
	// Expect that user should only ever have one @trk, but can't confirm that
	let userAdHistoryPV = DataStore.fetch(pagePath.concat('AdHistory'), () => {
		// Only interested in @trk ids. Other types won't have associated watch history
		const trkIds = xids.filter( xid => xid.slice(xid.length - 4) === '@trk');

		// No cookies registered, try using current session's cookie
		if( !trkIds || trkIds.length === 0 ) {
			return ServerIO.getAdHistory();
		}

		// Pull in data for each ID
		const PVs = trkIds.map( trkID => ServerIO.getAdHistory(trkID));
		// Pick the data with the most recent timestamp
		return Promise.all(PVs).then( values => values.reduce( (newestData, currentData) => {
			if( !newestData ) {
				return currentData;
			}
			return Date.parse(currentData.cargo.time) > Date.parse(newestData.cargo.time) ? currentData : newestData;
		}));
	});

	return (
		<div className='flex-row'>
			<div className='RedesignPage'>
				<div 
					className='splash img-block'
					style={{
						backgroundImage:`url('${ServerIO.MYLOOP_ENDPONT}/img/tropical-isle.jpg')`,
					}}
				>
					<RedesignNavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
					<TestContainerSVG />
				</div>
				<RecentCampaignsCard />
				<div>
					<div style={{padding: 0}}>
						<div style={{position: 'relative'}}>
							<BottomCurveSVG />
							<div style={{position:'absolute', left: '1rem', top: '50%', width: '100%'}}>
								<div className='header text-center' style={{display:'inline-block', width: '50%'}}>
									Here's how &nbsp;
								</div>
								<div className='header white text-center' style={{display:'inline-block', width: '50%'}}>
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
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const TestContainerSVG = () => (
	<svg
		viewBox="0 0 1062.992 850.39327"
		style={{
			position:'absolute',
			bottom: 0
		}}
		preserveAspectRatio="none"
	>
		<defs>
			<pattern id="image" x="0" y="0" height="1" width="1"
				viewBox="0 0 1000 666" preserveAspectRatio="xMidYMid slice"
			>
				<image 
					width="1000" 
					height="666" 
					xlinkHref={`${ServerIO.MYLOOP_ENDPONT}/img/tulips-temp.jpg`}
					preserveAspectRatio="xMidYMid slice" 
				/>
			</pattern>
		</defs>
		<path
			id="path3336"
			d="M 739.65309,24.273895 A 842.80831,1282.2272 75.325871 0 0 239.69389,88.203568 842.80831,1282.2272 75.325871 0 0 -762.10481,880.63285 l 1858.98731,0 0,-810.156975 A 842.80831,1282.2272 75.325871 0 0 739.65309,24.273895 Z"
			fill="url(#image)"
			style={{
				stroke: '#ffffff',
				strokeWidth: '10',
				strokeOpacity: '1'
			}}
		/>
	</svg>
);

const BottomCurveSVG = () => (
	<svg
		className='fill-gl-red'
		xmlns="http://www.w3.org/2000/svg"
		version="1.1"
		id="svg4230"
		viewBox="0 0 1470.4724 1006.2992"
		height="284mm"
		width="415mm"
		preserveAspectRatio="none"
		style={{
			width: '100%',
			height: '50vh',
			display: 'block',
			top: 0,
			left: 0
		}}
	>
		<defs id="defs4232" />
		<g
			transform="translate(0,-46.062988)"
			id="layer1"
		>
			<path
				id="path4778"
				d="m -0.2659911,45.285047 1474.2413911,0.25 0,1005.275253 C 562.73563,942.95245 779.43944,133.0991 -0.0498096,199.79129 Z"
				style={{
					fill:'#0000000', 
					fillOpacity: 1, 
					fillRule: 'evenodd', 
					strokeLinecap:'butt', 
					strokeLinejoin:'miter', 
				}}
			/>
		</g>
	</svg>
);

// Applies thick circular border to contents
const CharacterInCircle = ({character}) => (
	<div className='number-circle header flex-vertical-align'>
		<span>
			{character}
		</span>
	</div>
);

export default RedesignPage;
