import React from 'react';
import { space } from '../../../base/utils/miscutils';
import C from '../../../C';
const A = C.A;

const GreenNavBar = ({active}) => {

	return <div id="green-navbar">
		<img className="logo" src="/img/logo-green-dashboard.svg" />
		<A className={space('nav-item', active === 'metrics' && 'active')} href="/greendash/metrics">
			<div className="green-nav-icon metrics-icon" /> Metrics
		</A>
		<A className={space('nav-item', active === 'optimisation' && 'active')} href="/greendash/optimisation">
			<div className="green-nav-icon optimisation-icon" /> Optimisation<br/>Tips
		</A>
		<A className={space('nav-item', active === 'impact' && 'active')} href="/greendash/impact">
			<div className="green-nav-icon impact-icon" /> Impact<br/>Overview
		</A>
		<A className={space('nav-item', active === 'profile' && 'active')} href="/greendash/profile">
			<div className="green-nav-icon profile-icon" /> Profile
		</A>
	</div>;
};

export default GreenNavBar;
