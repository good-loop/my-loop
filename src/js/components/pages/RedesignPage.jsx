import React from 'react';

// This page is for experimenting with ideas for the upcoming My-Loop redesign
// Everything below should be considered scratch code: it will be reworked
const RedesignPage = () => {
	return (
		<div>
			<SVG1 />
			<Sausages />
		</div>
	);
};

const SVG1 = () => (
	<>
		<div style={{position:'relative'}}>
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
			<div style={{position:'absolute', left: '1rem', top: '50%'}}>
				<div className='header' style={{display:'inline-block'}}>
					Here's how &nbsp;
				</div>
				<div className='header white' style={{display:'inline-block'}}>
					it works
				</div>
			</div>
		</div>
	</>
);

const Sausages = () => {
	return (
		<>
			<div 
				className='white bg-gl-red pad1'
				style={{
					borderRadius:'3%/50%',
					borderTopRightRadius:0,
					borderBottomRightRadius:0,
					margin:'1rem 0'
				}}
			>
				<div 
					className='header flex-vertical-align' 
					style={{
						border: '8px solid #fff', 
						borderRadius:'50%',
						width: '4rem',
						height: '4rem',
						textAlign: 'center',
						marginRight: '1rem',
						display: 'inline-flex'
					}}
				>
					<span> 
						1
					</span> 
				</div> 
				<span className='header'>WATCH</span> 
				<span className='sub-header'>&nbsp; a 15 second video </span>
			</div>
			<div 
				className='white bg-gl-red pad1'
				style={{
					borderRadius:'3%/50%',
					borderTopLeftRadius:0,
					borderBottomLeftRadius:0,
					margin:'1rem 0',
					textAlign: 'right'
				}}
			>
				<span className='header'>CHOOSE</span> 
				<span className='sub-header'>&nbsp; a charity to support </span>
				<div 
					className='header flex-vertical-align' 
					style={{
						border: '8px solid #fff', 
						borderRadius:'50%',
						width: '4rem',
						height: '4rem',
						textAlign: 'center',
						marginRight: '1rem',
						display: 'inline-flex'
					}}
				> 
					<span>
						2 
					</span>
				</div> 
			</div>
		</>
	);	
};

export default RedesignPage;
