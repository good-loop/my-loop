import React, { useEffect, useState } from 'react';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import AccountMenu from '../../../base/components/AccountMenu';
import KStatus from '../../../base/data/KStatus';
import { getDataItem } from '../../../base/plumbing/Crud';
import Roles from '../../../base/Roles';
import DataStore from '../../../base/plumbing/DataStore';
import Login from '../../../base/youagain';

import { encURI, isMobile, space, toTitleCase } from '../../../base/utils/miscutils';
import C, { urlParamForType } from '../../../C';
import ServerIO from '../../../plumbing/ServerIO';

import { getFilterTypeId } from './dashUtils';
import ShareWidget, { shareThingId } from '../../../base/components/ShareWidget';
import { modifyPage } from '../../../base/plumbing/glrouter';

const A = C.A;

// ONLY SHOWS EMAIL LIST WITH "listemails" FLAG SET
// ONLY APPEARS WITH "shareables" OR DEBUG FLAG SET
const ShareDash = ({style, className}) => {
	// not-logged in cant share and pseudo users can't reshare
	if ( ! Login.getId() || Login.getId().endsWith("pseudo")) {
		return null;
	}
	// if ( ! Roles.isDev() && ! DataStore.getUrlValue("shareables") && ! DataStore.getUrlValue("debug") && ! DataStore.getUrlValue("gl.debug")) {
	// 	return null; // dev only for now TODO for all
	// }
	let {filterType, filterId} = getFilterTypeId();
	if ( ! filterType || ! filterId) {
		return null;
	}
	let shareId = shareThingId(filterType, filterId);
	let pvItem = getDataItem({type:filterType, id:filterId, status:KStatus.PUBLISHED});
	let shareName = urlParamForType(filterType)+" "+((pvItem.value && pvItem.value.name) || filterId);
	const showEmails = DataStore.getUrlValue("listemails");
	return <ShareWidget className={className} style={style} hasButton name={"Dashboard for "+shareName} 
		shareId={shareId} hasLink noEmails={!showEmails} />;
}

/**
 * Left hand nav bar + top-right account menu
 * 
 * @param {Object} p
 * @param {?string} p.active
 * @returns 
 */
const GreenNavBar = ({active}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [pseudoUser, setPseudoUser] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	useEffect(() => {
		const userId = Login.getId();
		if (userId && userId.endsWith('@pseudo')) setPseudoUser(true);
	}, [])

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
	let metricsUrl = modifyPage(["greendash", "metrics"], null, true);
	let recUrl = modifyPage(["greendash", "recommendation"], null, true);

	// We don't use the standard <Collapse> pattern here because that doesn't support an always-horizontal navbar
	return (<>
	{!pseudoUser && <AccountMenu className="float-left" noNav shareWidget={<ShareDash className='m-auto' />}/>}
	<Navbar dark expand="md" id="green-navbar" className={space('flex-column', 'justify-content-start', isOpen && 'mobile-open')}>
		<NavbarToggler onClick={toggle} />
		<Nav navbar vertical>
			<a href={pseudoUser ? 'https://www.good-loop.com' : '/greendash'}>
				<img className="logo" src="/img/logo-green-dashboard.svg" />
			</a>
			<NavItem>
				<A className={active === 'metrics' ? 'active' : ''} href={metricsUrl}>
					<div className="green-nav-icon metrics-icon" /> Metrics
				</A>
			</NavItem>
			<NavItem>
				<A className={active === 'tags' ? 'active' : ''} href={`${ServerIO.PORTAL_ENDPOINT}/#green`}>
					<div className="green-nav-icon tags-icon" /> Manage<br/>Tags
				</A>
			</NavItem>
			{Roles.isDev() && <NavItem>			
				<A className={space('nav-item', active === 'recommendation' && 'active')} href={recUrl}>
					<div className="green-nav-icon optimisation-icon" /> Reduce
				</A>
			</NavItem>}
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
