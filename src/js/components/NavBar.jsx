import React, {useEffect, useRef, useState} from 'react';
import NavBar from '../base/components/NavBar';
import AccountMenu from '../base/components/AccountMenu';
import C from '../C';
import {useDoOnResize} from '../base/components/CustomHooks';

const Contents = ({pageLinks, currentPage, style, logo}) => (
	<div className='container-fluid' style={style}>
		<div className="navbar-header" title="Dashboard">
			<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
				<span className="sr-only">Toggle navigation</span>
				<span className="icon-bar" /><span className="icon-bar" /><span className="icon-bar" />
			</button>
			<a className="navbar-brand" href='/'>
				<img alt={C.app.name} src={logo || C.app.homeLogo || C.app.logo} />
			</a>
		</div>
		<div id="navbar" className="navbar-collapse collapse">
			<ul className="nav navbar-nav">
				{pageLinks}
			</ul>
			<div>
				<AccountMenu active={currentPage === 'account'} logoutLink='#my' />
			</div>
		</div>
	</div>
);

const MyLoopNavBar = props => <NavBar {...props} pages={[]} render={Contents} />;	

const LogoContainerSVG = () => {
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


const RedesignNavBar = props => (
	<div>
		<NavBar 
			{...props} 
			pages={[]}
			render={({pageLinks, currentPage, style, logo}) => (
				<>
					<LogoContainerSVG />
					<div style={style}>
						<div className="navbar-header" title="Dashboard">
							<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
								<span className="sr-only">Toggle navigation</span>
								<span className="icon-bar" /><span className="icon-bar" /><span className="icon-bar" />
							</button>
							<a className="navbar-brand" href='/'>
								<img alt={C.app.name} src={logo || C.app.homeLogo || C.app.logo} />
							</a>
						</div>
						<div id="navbar" className="navbar-collapse collapse">
							<ul className="nav navbar-nav">
								{pageLinks}
							</ul>
							<div>
								<AccountMenu active={currentPage === 'account'} logoutLink='#my' />
							</div>
						</div>
					</div>
				</>
			)} 
		/>
	</div>
);


export default MyLoopNavBar;
export {
	MyLoopNavBar,
	RedesignNavBar
};
