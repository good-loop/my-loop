import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import { useTransition, animated, useSpring } from 'react-spring';
import AccountMenu from '../../base/components/AccountMenu';
import Icon from '../../base/components/Icon';
import LinkOut from '../../base/components/LinkOut';
import DevOnly from '../../base/components/DevOnly';
import Logo from '../../base/components/Logo';
import Campaign from '../../base/data/Campaign';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import Roles from '../../base/Roles';

import { encURI, is, isMobile, space } from '../../base/utils/miscutils';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import { isPer1000 } from '../pages/greendash/GreenMetrics';
import { ShareDash } from '../pages/greendash/GreenNavBar';
const A = C.A;


const NavEntryCommon = ({name, pageKey, href, devOnly, urlFilters, doReload, opacity, active, top}) => {
	const activeClass = (active === pageKey) ? 'active' : '';
	if (!href) href = `/impact/${pageKey}${urlFilters}`;

	const item = top ? (
		<NavItem className={activeClass}>
			<A href={href} onClick={doReload}>
				<div className="impact-navbar-text">{name}</div>
			</A>
		</NavItem>
	) : (
		<NavItem>
			<A href={href} onClick={doReload}>
				<div className={space('navbar-link', activeClass)}>
					<div className={`impact-nav-icon ${pageKey}-icon`} />
					<animated.div className="impact-navbar-text" style={{opacity}}>{name}</animated.div>
				</div>
			</A>
		</NavItem>
	);

	return devOnly ? <DevOnly>{item}</DevOnly> : item;
};


const NavEntrySide = (props) => <NavEntryCommon {...props} />;
const NavEntryTop = (props) => <NavEntryCommon top {...props} />;


const navEntries = [
	{ pageKey: 'view', name: 'Overview' },
	{ pageKey: 'stories', name: 'Impact' },
	{pageKey: 'stat', name: 'Analysis', devOnly: true },
	{ pageKey: 'impact', name: 'Green Tags', href: `${ServerIO.PORTAL_ENDPOINT}/#green`, devOnly: true }
];


/**
 * Verical navbar found on wide sreens
 * 
 * @param {active} String className of active page
 * @param {isOpen} boolean is the navbar currently expanded or not?
 * @param {navToggleAnimation} AnimatedValue mapping of CSS style states that animations will move between - defined within NavBars
 * @param {function} toggle toggles the state of isOpen AND isNavbarOpen, a state used to mainain flow even with fixed navbars
 * @returns 
 */
const SideNavBar = ({urlFilters = '', active, isOpen, navToggleAnimation, toggle, doReload}) => {
	const { width, opacity, rotate: transform, alignSelf } = navToggleAnimation;
	const navProps = { opacity, urlFilters, doReload, active };

	return (
		<animated.div id="impact-overview-navbar-widescreen" className="navAnimationContainer" style={{width}}>
			<Navbar dark expand="md" id="impact-navbar" className={space('flex-column', 'justify-content-start', isOpen && 'mobile-open')} style={{width}}>
				<NavbarToggler onClick={toggle} />
				<Nav navbar vertical>
					<a href="https://good-loop.com/">
						<img className="logo flex-column" src="/img/logo-white.svg"/>
						<animated.p className="logo-name flex-column" style={{opacity: navToggleAnimation.opacity}}>GOOD-LOOP</animated.p>
					</a>
					<br/><br/>
					{navEntries.map((entryProps,i) => (
						<NavEntrySide key={i} {...entryProps} {...navProps} />
					))}
					{/* open/close draw toggle */}
					<div className="flex-column align items center w-100" id="toggle-impact-nav-container">
						<animated.button onClick={toggle} id="toggle-impact-nav" className={isOpen ? 'open' : 'closed'} style={{transform, alignSelf}} />
					</div>
				</Nav>
			</Navbar>
		</animated.div>
	);
};


/**
 * ??How does this interact with the ImpactFilterOptions navbar??
 * 
 * Horizontal navbar found on small (phones likely) screens.
 * 
 * ??can we refactor to share code with SideNavBar??
 * 
 * @param {active} String className of active page
 * @returns 
 */
const TopNavBar = ({urlFilters = '', active, doReload}) => {
	const navProps = {urlFilters, doReload, active };

	return (
		<Navbar dark expand="md" id="impact-overview-navbar-smallscreen" className="flex-column justify-content-start">
			<Nav horizontal="start">
				{navEntries.map((entryProps,i) => (
					<NavEntryTop key={i} {...entryProps} {...navProps} />
				))}
			</Nav>
		</Navbar>
	);
};


// Parameters passed to Spring to animate side navbar opening/closing
// sizing changed from rem to px to better handle tablets
const navAnimationState = isOpen => isOpen ? (
	{ width: '270px', display: 'inline-block', opacity: 1.0, rotate: 'rotate(-90deg)', alignSelf: 'end' }
) : (
	{ width: '90px', display: 'none', opacity: 0.0, rotate: 'rotate(90deg)', alignSelf: 'center' }
);


/**
 * refactor to unify with GreenNavBar??
 * @param {Object} p
 */
const NavBars = ({active, isNavbarOpen, setIsNavbarOpen, doReload}) => {
	const navToggleAnimation = useSpring(navAnimationState(isNavbarOpen));

	// Open/closed is stored back on ImpactPages because it also controls an in-flow spacer div which is used to push content out of the way
	const toggle = () => setIsNavbarOpen(!isNavbarOpen);

	// HACK what to put on the url to keep the same brand/time filter settings
	const urlFilters = window.location.pathname.replace(/\/impact\/\w+/, "") + window.location.search;

	const navBarProps = { active, isOpen: isNavbarOpen, toggle, navToggleAnimation, urlFilters, doReload };

	return <>
		<SideNavBar {...navBarProps} />
		<TopNavBar {...navBarProps} />
	</>;
};


export default NavBars;
