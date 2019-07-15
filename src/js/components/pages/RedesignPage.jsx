import React from 'react';
// 775 x 600
// This page is for experimenting with ideas for the upcoming My-Loop redesign
// Everything below should be considered scratch code: it will be reworked
const RedesignPage = () => {
	return (
		<div className='container-fluid RedesignPage'>
			<div className='row'>
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
					<div style={{position: 'relative'}}>
						<div
							className='img-block'
							style={{
								backgroundImage:"url('http://localmy.good-loop.com/img/wheat_fields.jpg')",
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
