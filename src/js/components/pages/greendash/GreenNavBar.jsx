import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';

import { space } from '../../../base/utils/miscutils';
import C from '../../../C';
import ServerIO from '../../../plumbing/ServerIO';
const A = C.A;

const GreenNavBar = ({active}) => {
	const [isOpen, setIsOpen] = useState(false)
	const toggle = () => setIsOpen(!isOpen);

	// We don't use the standard <Collapse> pattern here because that doesn't support an always-horizontal navbar

	return <Navbar dark expand="md" id="green-navbar" className={space('flex-column', 'justify-content-start', isOpen && 'mobile-open')}>
		<NavbarToggler onClick={toggle} />
		<Nav navbar vertical>
			<img className="logo" src="/img/logo-green-dashboard.svg" />
			<NavItem>
				<A className={active === 'metrics' ? 'active' : ''} href="/greendash/metrics">
					<div className="green-nav-icon metrics-icon" /> Metrics
				</A>
			</NavItem>
			<NavItem>
				<A className={active === 'tags' ? 'active' : ''} href={`${ServerIO.PORTAL_ENDPOINT}/#green`}>
					<div className="green-nav-icon tags-icon" /> Manage<br/>Tags
				</A>
			</NavItem>
			{/*
			<NavItem>
				<A className={space('nav-item', active === 'optimisation' && 'active')} href="/greendash/optimisation">
					<div className="green-nav-icon optimisation-icon" /> Optimisation<br/>Tips
				</A>
			</NavItem>
			*/}
			<NavItem>
				<A className={active === 'impact' ? 'active' : ''} href="/green/impact">
					<div className="green-nav-icon impact-icon" /> Impact<br/>Overview
				</A>
			</NavItem>
			<NavItem>
				<A className={active === 'profile' ? 'active' : ''} href="/greendash/profile">
					<div className="green-nav-icon profile-icon" /> Profile
				</A>
			</NavItem>
			<div className="navbar-bottom-decoration">
				<img className="tree-side" src="/img/green/tree-light.svg" />
				<img className="tree-centre" src="/img/green/tree-light.svg" />
				<img className="tree-side" src="/img/green/tree-light.svg" />
			</div>
		</Nav>
	</Navbar>;
};

export default GreenNavBar;
