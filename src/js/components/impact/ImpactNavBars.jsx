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
 * Verical navbar found on wide sreens
 * 
 * @param {active} String className of active page
 * @param {isOpen} boolean is the navbar currently expanded or not?
 * @param {navToggleAnimation} AnimatedValue mapping of CSS style states that animations will move between - defined within NavBars
 * @param {function} toggle toggles the state of isOpen AND isNavbarOpen, a state used to mainain flow even with fixed navbars
 * @returns 
 */
const SideNavBar = ({active, isOpen, navToggleAnimation, toggle}) => {
	return (		
	<animated.div id='impact-overview-navbar-widescreen' className='navAnimationContainer' style = {{width: navToggleAnimation.width}}> 
		<Navbar dark expand="md" id="impact-navbar" className={space('flex-column', 'justify-content-start', isOpen && 'mobile-open')} style={{width: navToggleAnimation.width}}>
			<NavbarToggler onClick={toggle} />
			<Nav navbar vertical>
				<a href="https://good-loop.com/">
					<img crossorigin className="logo flex-column" src="/img/logo-white.svg"/>
					<animated.p className='logo-name flex-column' style={{opacity: navToggleAnimation.opacity}}>GOOD-LOOP</animated.p>
				</a>
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


/**
 * Horizontal navbar found on small (phones likely) screens
 * 
 * @param {active} String className of active page
 * @returns 
 */
const TopNavBar = ({active}) => {
	return (<>
		<Navbar dark expand="md" id="impact-overview-navbar-smallscreen" className={space('flex-column', 'justify-content-start')}>
			<Nav horizontal>
				<NavItem className={active === 'overview' ? 'active' : ''}>
					<A href={window.location}>
						<div class="impact-navbar-text">Overview</div> 
					</A>
				</NavItem>
				<NavItem className={active === 'impact' ? 'active' : ''}>
					<A href={`${ServerIO.PORTAL_ENDPOINT}/#green`}>
					<div class="impact-navbar-text">Impact</div> 
					</A>
				</NavItem>
				<NavItem className={active === 'analysis' ? 'active' : ''}>
					<A>
					<div class="impact-navbar-text">Analysis</div> 
					</A>
				</NavItem>
			</Nav>
		</Navbar></>)
}

const NavBars = ({active, isNavbarOpen, setIsNavbarOpen}) => {

	const [isOpen, setIsOpen] = useState(isNavbarOpen) // the navbar expanded or not?

	// on change of isOpen, these values define CSS animations
	const navToggleAnimation = useSpring({
		width : isOpen ? "15rem" : "5rem",	// shrink navbar
		display : isOpen ? "inline-block" : "none", // hide text
		opacity : isOpen ? 1.0 : 0.0,	// fade text out
		rotate : isOpen ? "rotate(-90deg)" : "rotate(90deg)", // rotate icon (negative to make it rotate counter clockwise from open -> closed)
		alignSelf : isOpen ? "end" : "center" // move toggle button from right when open to center when closed
	})

	const toggle = () => {
		setIsOpen(!isOpen)
		setIsNavbarOpen(!isOpen) // inFlow empty div used in main page content, required as fixed navbars can't affect flex when opening
	}

	return (
		<>
		<SideNavBar active={active} isOpen={isOpen} toggle={toggle} navToggleAnimation={navToggleAnimation}/>
		<TopNavBar active={active}/> 
		</>
	)
}
export default NavBars;
