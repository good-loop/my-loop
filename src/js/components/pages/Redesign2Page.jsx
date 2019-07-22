import React from 'react';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';

import ServerIO from '../../plumbing/ServerIO';

import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import { TopRightBulge, TopLeftCornerSwerve } from '../ShapedCard';

// This page is for experimenting with ideas for the upcoming My-Loop redesign
// Everything below should be considered scratch code: it will be reworked
const MyCardsPage = () => {

	return (
		<div className='container'>
			<SplashCard />
			<RecentCampaignsCard />
			<HowItWorksCard />
		</div>
	);
};


const HowItWorksCard = () => {
	return (
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
		</div>);
};

/**
 * Welcome to Good-Loop :)
 */
const SplashCard = () => {
	return (
		<div className=''>
			<TopLeftCornerSwerve>

			</TopLeftCornerSwerve>
			<div style={{
				backgroundImage:`url('${ServerIO.MYLOOP_ENDPONT}/img/tropical-isle.jpg')`,
			}}> GL </div>
			<TopRightBulge background='img/tulips-temp.jpg'>
				Doing Good feels Good
			</TopRightBulge>
		</div>);
};

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

export default MyCardsPage;
