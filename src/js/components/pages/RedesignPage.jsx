import React, {useRef} from 'react';
import Login from 'you-again';
import { XId } from 'wwutils';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import { RegisterLink } from '../../base/components/LoginWidget';
import {useLogsIfVisible} from '../../base/components/CustomHooks';
import Counter from '../../base/components/Counter';

import ServerIO from '../../plumbing/ServerIO';
import Footer from '../Footer';
import {RedesignNavBar} from '../NavBar';
import ConsentWidget from '../ConsentWidget';
import {RoundLogo} from '../Image';

import ShareAnAd from '../cards/ShareAnAd';
import OnboardingCardMini from '../cards/OnboardingCardMini';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import {ImpactCard, ImpactImage} from '../cards/ImpactCard';
import SocialMediaCard from '../cards/SocialMediaCard';

const pagePath = ['widget', 'MyPage'];

window.DEBUG = false;

const TestContainerSVG = () => (
	<svg
		height="139mm"
		width="210mm"
		style={{
			position:'absolute',
			bottom: 0
		}}
	>
		<defs>
			<pattern id="image" x="0" y="0" patternUnits="userSpaceOnUse" height="800" width="800">
				<image x="0" y="0" xlinkHref="http://testmy.good-loop.com/img/tulips-temp.jpg" />
			</pattern>
		</defs>
		<g
			transform="translate(0,-559.8429)"
		>
			<ellipse
				transform="matrix(-0.97032509,0.24180408,-0.27684891,-0.96091346,0,0)"
				ry="231.3644"
				rx="371.87408"
				cy="-872.8985"
				cx="-135.81924"
				id="path3336"
				fill="url(#image)"
				style={{
					stroke: '#ffffff',
					strokeWidth: '10',
					strokeOpacity: '1'
				}}
			/>
		</g>
	</svg>
);

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
					className='img-block'
					style={{
						position: 'relative', 
						minHeight: '100vh',
						backgroundImage:"url('http://testmy.good-loop.com/img/tropical-isle.jpg')",
						marginBottom: '2rem'
					}}
				>
					<RedesignNavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
					{/* <TestContainerSVG /> */}
				</div>
				<div>
					<div style={{padding: 0}}>
						<div style={{position:'relative'}}>
							<TopCurveSVG />
							<div style={{position:'absolute', bottom: 0, right: 0, color: '#fff'}}>
								<div className='header'>
									Our
									<br />
									Mission.
								</div>
								<div className='text-block' style={{maxWidth: '12rem'}}>
									At Good-Loop, we believe that your time and attention online is valuable.
									<br />
									Together, we want to harness that power and use it to make a positive difference.
								</div>
							</div>
						</div>
						<div style={{position: 'relative'}}>
							<BottomCurveSVG />
							<div style={{position:'absolute', left: '1rem', top: '50%'}}>
								<div className='header' style={{display:'inline-block'}}>
									Here's how &nbsp;
								</div>
								<div className='header white' style={{display:'inline-block'}}>
									it works
								</div>
							</div>
						</div>
						<ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} mixPanelTag='ShareAnAd' />
						<div style={{position: 'relative'}}>
							<div
								className='img-block'
								style={{
									backgroundImage:"url('http://testmy.good-loop.com/img/wheat_fields.jpg')",
									minHeight: '30rem',
									position: 'absolute',
									zIndex: '-1'
								}}
							/>
							<div className='white bg-gl-red pad1 sausage-container-right'>
								<CharacterInCircle character={1} />
								<span className='header'>WATCH</span> 
								<span className='sub-header'>&nbsp; a 15 second video </span>
							</div>
							<div className='white bg-gl-red pad1 sausage-container-left'>
								<span className='header'>CHOOSE</span> 
								<span className='sub-header'>&nbsp; a charity to support </span>
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
									<div className='sub-header'>
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

const TopCurveSVG = () => (
	<svg
		className='fill-gl-red'
		xmlns="http://www.w3.org/2000/svg"
		version="1.1"
		id="svg2"
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
		<defs id="defs4" />
		<g
			transform="translate(0,-46.062992)"
			id="layer1"
		>
			<path
				id="path4176"
				d="M 1470.4983,49.399428 C 1330.7955,293.85243 370.47077,457.34523 -3.5406101,572.52452 l 4.5606053,480.84398 1469.5689048,0.01 z"				
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
