import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import AccountMenu from '../../../base/components/AccountMenu';
import Icon from '../../../base/components/Icon';
import LinkOut from '../../../base/components/LinkOut';
import Logo from '../../../base/components/Logo';
import Campaign from '../../../base/data/Campaign';
import KStatus from '../../../base/data/KStatus';
import { getDataItem } from '../../../base/plumbing/Crud';
import Roles from '../../../base/Roles';
import DataStore from '../../../base/plumbing/DataStore';

import { encURI, isMobile, space, toTitleCase } from '../../../base/utils/miscutils';
import C from '../../../C';
import ServerIO from '../../../plumbing/ServerIO';
const A = C.A;


/**
 * Left hand nav bar + top-right account menu
 * 
 * @param {Object} p
 * @param {?string} p.active
 * @returns 
 */
const GreenNavBar = ({active}) => {
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

	const showShareables = DataStore.getUrlValue("shareables");
	const showFlags = DataStore.getUrlValue("debug") || DataStore.getUrlValue("gl.debug") || showShareables;

	// We don't use the standard <Collapse> pattern here because that doesn't support an always-horizontal navbar

	return (<>
		{(Roles.isDev() || showFlags) && <AccountMenu className="float-left" noNav/>}
	<Navbar dark expand="md" id="green-navbar" className={space('flex-column', 'justify-content-start', isOpen && 'mobile-open')}>
		<NavbarToggler onClick={toggle} />
		<Nav navbar vertical>
			<img className="logo" src="/img/logo-green-dashboard.svg" />
			<span className="boosted text-center">
				BOOSTED BY <img src="/img/gl-logo/external/scope3-logo.wb.svg" className="scope3-logo ml-1" />
			</span>
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
				<div className="trees">
					<img className="tree-side" src="/img/green/tree-light.svg" />
					<img className="tree-centre" src="/img/green/tree-light.svg" />
					<img className="tree-side" src="/img/green/tree-light.svg" />
				</div>
			</div>
		</Nav>
	</Navbar></>);
};

export default GreenNavBar;
