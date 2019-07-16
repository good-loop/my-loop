import React, {useEffect, useRef, useState} from 'react';
import NavBar from '../base/components/NavBar';
import AccountMenu from '../base/components/AccountMenu';
import C from '../C';

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

const LogoContainerSVG = ({parentRef}) => {
	// SVG needs to be sized to occupy 75% of the width of the screen
	// Base sizing on width of navbar which should always occupy 100% of the width
	if( !parentRef.current ) return '';

	// Resize SVG if container size changes
	const [calculatedWidth, setCalculatedWidth] = useState();

	useEffect(() => {
		// Set size on first render
		setCalculatedWidth( parentRef.current.clientWidth * 0.6);

		const eventListener = () => setCalculatedWidth(parentRef.current.clientWidth * 0.6);
		// Recalculate if size changes
		// NB: This may be called twice on some devices. Not ideal, but doesn't seem too important
		window.addEventListener('resize', eventListener);
		window.addEventListener('orientationchange', eventListener);		

		return () => {
			window.removeEventListener('resize', eventListener);
			window.removeEventListener('orientationchange', eventListener);
		};
	}, []);

	return (
		<svg
			viewBox="0 0 701.57477 708.66127"
			width={calculatedWidth}
			height={calculatedWidth * 0.99}
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


const RedesignNavBar = props => {
	const ref = useRef();

	return (
		<div ref={ref}>
			<NavBar 
				{...props} 
				pages={[]}
				render={({pageLinks, currentPage, style, logo}) => (
					<>
						<LogoContainerSVG parentRef={ref} />
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
};


export default MyLoopNavBar;
export {
	MyLoopNavBar,
	RedesignNavBar
};
