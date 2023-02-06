import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import { useTransition, animated, useSpring } from 'react-spring';
import AccountMenu from '../../base/components/AccountMenu';
import Icon from '../../base/components/Icon';
import LinkOut from '../../base/components/LinkOut';
import Logo from '../../base/components/Logo';
import Campaign from '../../base/data/Campaign';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import Roles from '../../base/Roles';

import { encURI, is, isMobile, space } from '../../base/utils/miscutils';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import { isPer1000 } from '../pages/greendash/GreenMetrics';
const A = C.A;


/**
 * Left hand nav bar + top-right account menu
 * 
 * @param {Object} p
 * @param {?string} p.active
 * @returns 
 */
const SideNavBar = ({active, isOpen, navToggleAnimation, toggle}) => {

	console.log("!!!", active)
	return (		
	<animated.div id='impact-overview-navbar-widescreen' className='navAnimationContainer' style = {{width: navToggleAnimation.width}}> 
		<Navbar dark expand="md" id="impact-navbar" className={space('flex-column', 'justify-content-start', isOpen && 'mobile-open')} style={{width: navToggleAnimation.width}}>
			<NavbarToggler onClick={toggle} />
			<Nav navbar vertical>
				<img className="logo flex-column" src="/img/logo-white.svg" />
				<animated.p className='logo-name flex-column' style={{opacity: navToggleAnimation.opacity}}>GOOD-LOOP</animated.p>
				<br/><br/>
				<NavItem>
					<A href={window.location}>
						<div className={active === 'overview' ? 'active navbar-link' : 'navbar-link'}> 
							<div className="impact-nav-icon overview-icon" /><animated.div class="impact-navbar-text" style={{opacity: navToggleAnimation.opacity}}>Overview</animated.div> 
						</div>
					</A>
				</NavItem>
				<NavItem>
					<A href={`${ServerIO.PORTAL_ENDPOINT}/#green`}>
						<div className={active === 'impact' ? 'active navbar-link' : 'navbar-link'}> 
							<div className="impact-nav-icon impact-icon" /> <animated.div class="impact-navbar-text" style={{opacity: navToggleAnimation.opacity}}>Impact</animated.div> 
						</div>
					</A>
				</NavItem>
				<NavItem>
					<A>
						<div className={active === 'analysis' ? 'active navbar-link' : 'navbar-link'}> 
							<div className="impact-nav-icon analysis-icon" /> <animated.div class="impact-navbar-text" style={{opacity: navToggleAnimation.opacity}}>Analysis</animated.div> 
						</div>
					</A>
				</NavItem>
				<div className='flex-column align items center w-100' id="toggle-impact-nav-container">
					<animated.button onClick={toggle} id="toggle-impact-nav" className={isOpen ? "open" : "closed"} style={{transform: navToggleAnimation.rotate, alignSelf: navToggleAnimation.alignSelf}}></animated.button>
				</div> 
			</Nav>
		</Navbar>
	</animated.div>);
};

const TopNavBar = ({active}) => {
	return (<>

		<Navbar dark expand="md" id="impact-overview-navbar-smallscreen" className={space('flex-column', 'justify-content-start')}>
			<Nav horizontal>
				<NavItem>
					<A className={active === 'metrics' ? 'active' : ''} href={window.location}>
						<div class="impact-navbar-text">Overview</div> 
					</A>
				</NavItem>
				<NavItem>
					<A className={active === 'tags' ? 'active' : ''} href={`${ServerIO.PORTAL_ENDPOINT}/#green`}>
					<div class="impact-navbar-text">Impact</div> 
					</A>
				</NavItem>
				<NavItem>
					<A className={active === 'impact' ? 'active' : ''}>
					<div class="impact-navbar-text">Analysis</div> 
					</A>
				</NavItem>
			</Nav>
		</Navbar></>)
}

const NavBars = ({active}) => {

	const [isOpen, setIsOpen] = useState(true)

	const navToggleAnimation = useSpring({
		width : isOpen ? "15rem" : "5rem",	// shrink navbar
		display : isOpen ? "inline-block" : "none", // hide text
		opacity : isOpen ? 1.0 : 0.0,	// fade text out
		rotate : isOpen ? "rotate(-90deg)" : "rotate(90deg)", // rotate icon (negative to make it rotate counter clockwise from open -> closed)
		alignSelf : isOpen ? "end" : "center" // move toggle button from right when open to center when closed
	})

	const toggle = () => {
		setIsOpen(!isOpen)
	}

	return (
		// animating the NavBar would throw errors, I believe due to NavBar loading after 'animated' expects an object
		// wrapping the navbar in an overall div that we can animate fixed the issue
		<>
		<SideNavBar active={active} isOpen={isOpen} toggle={toggle} navToggleAnimation={navToggleAnimation}/>
		<TopNavBar /> 
		</>
	)
}
export default NavBars;
