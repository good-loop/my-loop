import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import Icon from '../../../base/components/Icon';
import LinkOut from '../../../base/components/LinkOut';
import Logo from '../../../base/components/Logo';
import Campaign from '../../../base/data/Campaign';
import KStatus from '../../../base/data/KStatus';
import { getDataItem } from '../../../base/plumbing/Crud';

import { encURI, isMobile, space } from '../../../base/utils/miscutils';
import C from '../../../C';
import ServerIO from '../../../plumbing/ServerIO';
const A = C.A;

/**
 * 
 * @param {Object} p
 * @param {?string} p.active
 * @returns 
 */
const GreenNavBar = ({active}) => {
	if (isMobile()) {
		console.warn("TODO GreenNavBar layout on mobile");
		return null;
	}
	const [isOpen, setIsOpen] = useState(false)
	const toggle = () => setIsOpen(!isOpen);

	// HACK: a (master) campaign?
	let campaignId = DataStore.getUrlValue('campaign');
	const brandId = DataStore.getUrlValue('brand');	
	const agencyId = DataStore.getUrlValue('agency');
	if ( ! campaignId && (brandId || agencyId)) {
		const id = brandId || agencyId;
		const type = brandId? C.TYPES.Advertiser : C.TYPES.Agency;
		let pvThing = getDataItem({type, id, status:KStatus.PUB_OR_DRAFT, swallow:true});
		if (pvThing.value) {
			campaignId = pvThing.value.campaign;
		}
	}
	let pvCampaign = campaignId? getDataItem({type:C.TYPES.Campaign, id:campaignId,status:KStatus.PUB_OR_DRAFT, swallow:true}) : {};
	let impactUrl = pvCampaign.value? '/green/'+encURI(pvCampaign.value.id) : '/green';

	// We don't use the standard <Collapse> pattern here because that doesn't support an always-horizontal navbar

	return <Navbar dark expand="md" id="green-navbar" className={space('flex-column', 'justify-content-start', isOpen && 'mobile-open')}>
		<NavbarToggler onClick={toggle} />
		<Nav navbar vertical>
			<img className="logo" src="/img/logo-green-dashboard.svg" />
			<NavItem>
				<A className={active === 'metrics' ? 'active' : ''} href={window.location}>
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
				<A className={active === 'impact' ? 'active' : ''} href={impactUrl}>
					<div className="green-nav-icon impact-icon" /> Impact<br/>Overview
				</A>
			</NavItem>
			{/* <NavItem>
				<A className={active === 'profile' ? 'active' : ''} href="/greendash/profile">
					<div className="green-nav-icon profile-icon" /> Profile
				</A>
			</NavItem> */}
			<div className="navbar-bottom-decoration flex-column align-items-center w-100">
				<LinkOut href="https://scope3.com" className="text-center mb-2">
						<img src="/img/gl-logo/external/scope3-logo.wb.svg" className="mb-1" />
						Enhanced by Scope3 data
				</LinkOut>
				<div className="trees">
					<img className="tree-side" src="/img/green/tree-light.svg" />
					<img className="tree-centre" src="/img/green/tree-light.svg" />
					<img className="tree-side" src="/img/green/tree-light.svg" />
				</div>
			</div>
		</Nav>
	</Navbar>;
};

export default GreenNavBar;
