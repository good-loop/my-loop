// Collection of all inline svgs used throughout My-Loop
import React, {useRef, useState} from 'react';

import ServerIO from '../plumbing/ServerIO';
import {useDoOnResize} from '../base/components/CustomHooks';

// Not currently in use
const MyPageHeaderOvalSVG = () => (
	<svg
		viewBox="0 0 1062.992 850.39327"
		preserveAspectRatio="none"
	>
		<defs>
			<pattern id="image" x="0" y="0" height="1" width="1"
				viewBox="0 0 1200 795" preserveAspectRatio="xMidYMid slice"
			>
				<image 
					width="1200" 
					height="795" 
					xlinkHref={`${ServerIO.MYLOOP_ENDPONT}/img/tulips.jpg`}
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
		<image 
			width="500"
			height="500"
			x="550"
			y="150"
			xlinkHref={`${ServerIO.MYLOOP_ENDPONT}/img/doinggoodfeelsgood.png`} 
		/>
		<image 
			width="500"
			height="500"
			x="550"
			y="440"
			xlinkHref={`${ServerIO.MYLOOP_ENDPONT}/img/littleflowers.png`} 
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
		// preserveAspectRatio="none"
		style={{
			width: '100%',
			height: 'auto',
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
				d="m -0.2659911,45.285047 1474.2413911,0.25 0,1005.275253 C 632.23582,1116.7029 793.62274,194.27165 -0.0498096,225.50558 Z"
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
		
		setWidth(parentWidth * 0.4);
		setHeight(parentWidth * 0.4 * 0.99);			
	};

	// Resize SVG if parent size changes
	useDoOnResize({resizeFn});

	return (
		<svg id='LogoContainerSVG'
			ref={ref}
			viewBox="0 0 701.57477 708.66127"
			width={width}
			height={height}
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

// Stolen from adunit.
// Thanks Roscoe!
const GlLogoGenericSvg = ({outline, colour1 = '#770f00', colour2 = '#af2009', colourBg = '#fff'}) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.45 75" className="gl-logo-svg">
		{ outline ? '' : <ellipse cx="37.5" cy="37.5" rx="37.4" ry="37.4" fill={colourBg} /> }
		<g fill={outline ? undefined : colour1}>
			<path d="M48.342 27.82a47.782 47.782 0 0 0 2.177-2.781c2.798-3.899 4.574-8.043 4.65-12.934.033-2.251-.435-5.785-2.358-6.691a3.052 3.052 0 0 0-2.756.256c-.083.04-.156.097-.236.143-4.226 2.389-4.693 9.618-4.783 13.766-.036 1.6.019 3.216.138 4.83a2.22 2.22 0 0 0 .025.43 45.588 45.588 0 0 0 1.593 9.12 66.642 66.642 0 0 0 2.34-2.74q-.475-1.678-.793-3.4" />
			<path d="M32.58 46.989q-.677-.478-1.366-.942c.948-1.08 1.904-2.133 2.829-3.123 1.745-1.867 3.569-3.683 5.398-5.497.168.512.343 1.015.531 1.514.166.442.352.881.538 1.32.74-.7 1.495-1.42 2.27-2.17a54.918 54.918 0 0 1-2.572-12.288c-.64-6.218-.488-13.093 2.241-18.787a13.93 13.93 0 0 1 3.993-4.913 11.47 11.47 0 0 1 1.175-.792A37.756 37.756 0 0 0 0 37.5a37.435 37.435 0 0 0 18.677 32.363c-2.835-5.21-.448-12.458 3.62-16.39.184-.18.68-.63.68-.63A20.303 20.303 0 0 1 25.2 54.46a68.622 68.622 0 0 1 1.819-1.812 66.45 66.45 0 0 0-4.071-2.974c-1.863-1.248-3.829-2.521-5.292-4.244-4.554-5.369-5.135-14.163-.676-19.757a12.765 12.765 0 0 1 1.274-1.399 10.5 10.5 0 0 1 7.507-2.984c3.892.088 7.671 2.392 10.045 6.106a2.278 2.278 0 0 1-.875 3.338 2.952 2.952 0 0 1-.906.344 2.439 2.439 0 0 1-2.62-1.127c-2.033-3.182-5.372-4.47-8.238-2.963a7.107 7.107 0 0 0-2.363 2.07c-.085.111-.156.231-.235.346-2.584 3.818-1.879 9.368 1.007 12.797 2.417 2.878 5.785 4.771 8.862 6.949.064.046.122.102.186.15.73-.663 1.49-1.349 2.288-2.067-.113-.08-.22-.165-.332-.245" />
		</g>
		<g fill={outline ? undefined : colour2}>
			<path d="M60.078 7.292c1.16 5.378-.621 12.31-2.588 16.176a43.169 43.169 0 0 1-5.406 7.997A71.805 71.805 0 0 1 50 33.855a31.208 31.208 0 0 1-.863-2.637 68.5 68.5 0 0 1-2.342 2.741 29.507 29.507 0 0 0 1.473 4.003c1.001 2.177 2.78 6.147 5.418 6.747.992.227 1.886-.39 2.485-2.41a14.655 14.655 0 0 0 .42-1.953 2 2 0 0 1 2.33-1.806 2.934 2.934 0 0 1 .867.214 2.712 2.712 0 0 1 1.716 2.938 11.793 11.793 0 0 1-1.737 4.758c-1.927 2.923-5.058 4.134-8.233 2.99a10.277 10.277 0 0 1-3.923-2.663c-2.091-2.202-3.474-5.026-4.533-7.836-.105-.28-.199-.566-.297-.85-.777.75-1.531 1.472-2.272 2.172.32.755.656 1.508 1.035 2.24-.728.726-1.459 1.45-2.16 2.178a131.127 131.127 0 0 0-4.102 4.421 30.182 30.182 0 0 0-2.369-1.87c-.798.72-1.558 1.404-2.288 2.066a19.745 19.745 0 0 1 5.524 6.232 15.34 15.34 0 0 1 1.259 2.846c1.9 5.93-.134 13.803-6.345 16.027a38.067 38.067 0 0 0 6.669.596A37.456 37.456 0 0 0 60.077 7.29" />
			<path d="M25.202 54.462a12.544 12.544 0 0 1 1.626 1.6c.073.089-1.844 2.066-2.036 2.305a10.06 10.06 0 0 0-1.921 3.814c-.648 2.61-.128 6.164 2.497 7.546 4.016 2.118 7.822-2.769 7.69-6.688-.115-3.424-1.385-6.58-3.99-8.745a91.993 91.993 0 0 0-2.049-1.648 64.944 64.944 0 0 0-1.818 1.812" />
		</g>
	</svg>
);

const LogoRibbonSVG = () => (
	<svg
		height="22mm"
		width="92mm"
		viewBox="0 0 325.98406 77.952715"
		preserveAspectRatio="none"
		style={{
			width: '100%',
			height: 'auto',
			position: 'absolute',
			top: '-4.15rem',
			zIndex: 1
		}}
	>
		<g
			transform="translate(0,-974.40984)"
			id="layer1"
		>
			<path
				d="m -10.101562,1017.1855 339.507812,0 -339.507812,0 z"
				id="path4976"
				style={{
					fill: 'none',
					fillRule: 'evenodd',
					stroke: '#ffffff',
					strokeWidth: '20',
					strokeLinecap: 'butt',
					strokeLinejoin: 'miter',
					strokeMiterlimit: 4,
					strokeDasharray: 'none',
					strokeOpacity: 1
				}}
				xlinkHref="#path4864" 
			/>
			<path
				id="path4864"
				d="m -10.101525,1017.1851 339.507615,0"
				style={{
					fill: 'none',
					fillRule: 'evenodd',
					stroke: '#8c0a00',
					strokeWidth: '15',
					strokeLinecap: 'butt',
					strokeLinejoin: 'miter',
					strokeMiterlimit: 4,
					strokeDasharray: 'none',
					strokeOpacity: 1
				}} 
			/>
			<g
				viewBox="0 0 75.45 75"
				transform="translate(205.02149,975.95281)"
				id="g5556"
			>
				<circle
					style={{fill:"#ffffff"}}					
					r="37.400002"
					cx="37.5"
					cy="37.5"
					id="ellipse5536" 
				/>
				<g
					style={{fill:"#770f00"}}
					id="g5538"
				>
					<path
						d="M48.342 27.82a47.782 47.782 0 0 0 2.177-2.781c2.798-3.899 4.574-8.043 4.65-12.934.033-2.251-.435-5.785-2.358-6.691a3.052 3.052 0 0 0-2.756.256c-.083.04-.156.097-.236.143-4.226 2.389-4.693 9.618-4.783 13.766-.036 1.6.019 3.216.138 4.83a2.22 2.22 0 0 0 .025.43 45.588 45.588 0 0 0 1.593 9.12 66.642 66.642 0 0 0 2.34-2.74q-.475-1.678-.793-3.4"
						id="path5540" 
					/>
					<path 
						d="M32.58 46.989q-.677-.478-1.366-.942c.948-1.08 1.904-2.133 2.829-3.123 1.745-1.867 3.569-3.683 5.398-5.497.168.512.343 1.015.531 1.514.166.442.352.881.538 1.32.74-.7 1.495-1.42 2.27-2.17a54.918 54.918 0 0 1-2.572-12.288c-.64-6.218-.488-13.093 2.241-18.787a13.93 13.93 0 0 1 3.993-4.913 11.47 11.47 0 0 1 1.175-.792A37.756 37.756 0 0 0 0 37.5a37.435 37.435 0 0 0 18.677 32.363c-2.835-5.21-.448-12.458 3.62-16.39.184-.18.68-.63.68-.63A20.303 20.303 0 0 1 25.2 54.46a68.622 68.622 0 0 1 1.819-1.812 66.45 66.45 0 0 0-4.071-2.974c-1.863-1.248-3.829-2.521-5.292-4.244-4.554-5.369-5.135-14.163-.676-19.757a12.765 12.765 0 0 1 1.274-1.399 10.5 10.5 0 0 1 7.507-2.984c3.892.088 7.671 2.392 10.045 6.106a2.278 2.278 0 0 1-.875 3.338 2.952 2.952 0 0 1-.906.344 2.439 2.439 0 0 1-2.62-1.127c-2.033-3.182-5.372-4.47-8.238-2.963a7.107 7.107 0 0 0-2.363 2.07c-.085.111-.156.231-.235.346-2.584 3.818-1.879 9.368 1.007 12.797 2.417 2.878 5.785 4.771 8.862 6.949.064.046.122.102.186.15.73-.663 1.49-1.349 2.288-2.067-.113-.08-.22-.165-.332-.245" 
					/>
				</g>
				<g
					style={{
						fill:"#af2009"
					}}
				>
					<path
						d="M60.078 7.292c1.16 5.378-.621 12.31-2.588 16.176a43.169 43.169 0 0 1-5.406 7.997A71.805 71.805 0 0 1 50 33.855a31.208 31.208 0 0 1-.863-2.637 68.5 68.5 0 0 1-2.342 2.741 29.507 29.507 0 0 0 1.473 4.003c1.001 2.177 2.78 6.147 5.418 6.747.992.227 1.886-.39 2.485-2.41a14.655 14.655 0 0 0 .42-1.953 2 2 0 0 1 2.33-1.806 2.934 2.934 0 0 1 .867.214 2.712 2.712 0 0 1 1.716 2.938 11.793 11.793 0 0 1-1.737 4.758c-1.927 2.923-5.058 4.134-8.233 2.99a10.277 10.277 0 0 1-3.923-2.663c-2.091-2.202-3.474-5.026-4.533-7.836-.105-.28-.199-.566-.297-.85-.777.75-1.531 1.472-2.272 2.172.32.755.656 1.508 1.035 2.24-.728.726-1.459 1.45-2.16 2.178a131.127 131.127 0 0 0-4.102 4.421 30.182 30.182 0 0 0-2.369-1.87c-.798.72-1.558 1.404-2.288 2.066a19.745 19.745 0 0 1 5.524 6.232 15.34 15.34 0 0 1 1.259 2.846c1.9 5.93-.134 13.803-6.345 16.027a38.067 38.067 0 0 0 6.669.596A37.456 37.456 0 0 0 60.077 7.29"
						id="path5542" 
					/>
					<path 
						d="M25.202 54.462a12.544 12.544 0 0 1 1.626 1.6c.073.089-1.844 2.066-2.036 2.305a10.06 10.06 0 0 0-1.921 3.814c-.648 2.61-.128 6.164 2.497 7.546 4.016 2.118 7.822-2.769 7.69-6.688-.115-3.424-1.385-6.58-3.99-8.745a91.993 91.993 0 0 0-2.049-1.648 64.944 64.944 0 0 0-1.818 1.812" 
					/>
				</g>
			</g>
		</g>
	</svg>
);

const SplitColouredCircleSVG = () => (
	<svg
		width="61mm"
		height="45mm"
		viewBox="0 0 216.1416 159.44868"
		style={{
			position: "relative",
			top: 0,
			left: '15%',
			width: '85%',
			height: 'auto'
		}}
	>
		<g
			transform="translate(0,-892.91307)"
		>
			<path
				id="path4276"
				d="M 83.291596,1021.4188 C 55.611432,1005.3559 34.374187,985.46701 19.686213,961.85153 7.0128327,941.47514 0.19079179,918.44508 0.19079179,896.03827 l 0,-4.34662 107.99624821,0 107.99626,0 -3.26501,5.03111 c -5.46475,8.42067 -8.68836,14.50886 -16.4579,31.08261 -8.6747,18.50467 -11.49659,23.9324 -16.78977,32.29411 -15.06645,23.80068 -35.7483,40.75662 -67.18543,55.08182 -4.36168,1.9875 -22.928889,9.3896 -23.541681,9.3853 -0.126431,0 -2.66984,-1.4175 -5.651913,-3.1478 z"
				style={{
					opacity: 1,
					fill: "#a41b00",
					fillOpacity: 1,
					stroke: "none",
					strokeWidth: 1,
					strokeMiterlimit: 4,
					strokeDasharray: "none",
					strokeOpacity: 1
				}}
			/>
			<path
				id="path4280"
				d="m 71.240762,1014.1131 c -6.350163,-4.2357 -12.855506,-9.1529 -18.609518,-14.0665 -15.727441,-13.43013 -28.355468,-28.77243 -37.273529,-45.2851 -1.142686,-2.11579 -2.260954,-4.32085 -3.200541,-6.31097 -0.183492,-0.38865 -0.353103,-0.74501 -0.376914,-0.79192 -0.02924,-0.0575 -0.01362,-0.0853 0.04817,-0.0853 0.06253,0 0.315084,0.46626 0.798505,1.47419 6.560641,13.67878 16.061165,27.15375 27.5992,39.14504 4.702946,4.8877 9.521019,9.34068 15.080554,13.93772 1.534756,1.2692 6.151107,4.8665 7.905854,6.161 2.687315,1.9823 5.080262,3.6692 7.65264,5.3948 0.724007,0.4856 1.401061,0.94 1.504542,1.0095 0.164555,0.1109 0.172431,0.1269 0.0627,0.1277 -0.07223,6e-4 -0.578077,-0.3009 -1.191694,-0.7101 z"
				style={{
					opacity: 1,
					fill: "#a41b00",
					fillOpacity: 1,
					stroke: "none",
					strokeWidth: 1,
					strokeMiterlimit: 4,
					strokeDasharray: "none",
					strokeOpacity: 1
				}}
			/>
			<path
				id="path4282"
				d="m 197.2504,1052.8001 c -8.29761,-0.3409 -21.64806,-1.6934 -30.79965,-3.1203 -12.38852,-1.9316 -28.64816,-5.776 -40.16048,-9.4952 -10.96877,-3.5438 -23.59517,-8.6417 -33.59694,-13.5651 l -4.225632,-2.0799 5.428871,-1.9959 c 36.652541,-13.4753 63.212151,-31.69353 80.199811,-55.01217 7.17517,-9.84926 12.05903,-18.70646 21.73718,-39.42187 5.82528,-12.46859 8.89061,-18.56869 12.39844,-24.67312 2.3616,-4.10975 7.40266,-11.89094 8.02798,-12.39171 0.19955,-0.15979 0.32705,31.35649 0.32705,80.8424 l 0,81.10447 -8.60391,-0.053 c -4.73216,-0.029 -9.56187,-0.092 -10.73272,-0.1394 z"
				style={{
					opacity: 1,
					fill: "#ab2d15",
					fillOpacity: 1,
					stroke: "none",
					strokeWidth: 1,
					strokeMiterlimit: 4,
					strokeDasharray: "none",
					strokeOpacity: 1
				}}
			/>
			<image
				y="909.27618"
				x="1.2285635"
				id="image4393"
				style={{
					imageRendering: "optimizeQuality"
				}}
				preserveAspectRatio="none"
				height="154.02847"
				width="86.399948" 
				xlinkHref={`${ServerIO.MYLOOP_ENDPONT}/img/my-loop-girl.png`} 
			/>
		</g>
	</svg>
);

export {
	MyPageHeaderOvalSVG,
	HowItWorksCurveSVG,
	NavBarLogoContainerSVG,
	GlLogoGenericSvg,
	LogoRibbonSVG,
	SplitColouredCircleSVG
};
