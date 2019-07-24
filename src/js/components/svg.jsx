// Collection of all inline svgs used throughout My-Loop
import React, {useRef, useState} from 'react';

import ServerIO from '../plumbing/ServerIO';
import {useDoOnResize} from '../base/components/CustomHooks';

const MyPageHeaderOvalSVG = () => (
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

const HowItWorksCurveSVG = () => (
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

const NavBarLogoContainerSVG = () => {
	const ref = useRef();
	const [width, setWidth] = useState();
	const [height, setHeight] = useState();

	const resizeFn = () => {
		if( !ref.current ) {
			return;
		}

		const {width: parentWidth} = ref.current.parentElement.getBoundingClientRect();
		
		setWidth(parentWidth * 0.6);
		setHeight(parentWidth * 0.6 * 0.99);			
	};

	// Resize SVG if parent size changes
	useDoOnResize({resizeFn});

	return (
		<svg id='LogoContainerSVG'
			ref={ref}
			viewBox="0 0 701.57477 708.66127"
			width={width}
			height={height}
			// height={calculatedWidth * 0.99}
			style={{
				position: 'absolute',
				zIndex: '-1',
				top: 0,
				left: 0
			}}
		>
			<g
				transform="translate(-10,0)"
			>
				<path
					d="M 0,0 0,707.88564 C 96.461052,230.64218 665.81805,291.87867 701.44004,0.03496744 Z"
					style={{
						fill:'#fdf4f3', 
						strokeWidth: '1px',
						fillOpacity: 1, 
						fillRule: 'evenodd', 
						strokeLinecap:'butt', 
						strokeLinejoin:'miter', 
					}}
				/>
			</g>
		</svg>
	);
};

export {
	MyPageHeaderOvalSVG,
	HowItWorksCurveSVG,
	NavBarLogoContainerSVG
};
