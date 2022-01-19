import React from 'react';
import { space } from '../../../base/utils/miscutils';

const GreenNavBar = ({active}) => {

	return <div id="green-navbar">
		<img className="logo" src="/img/logo-green-dashboard.svg" />
		<a className={space('nav-item', active === 'metrics' && 'active')} href="#green/metrics">
			<div className="green-nav-icon metrics-icon" /> Metrics
		</a>
		<a className={space('nav-item', active === 'optimisation' && 'active')} href="#green/optimisation">
			<div className="green-nav-icon optimisation-icon" /> Optimisation<br/>Tips
		</a>
		<a className={space('nav-item', active === 'impact' && 'active')} href="#green/impact">
			<div className="green-nav-icon impact-icon" /> Impact<br/>Overview
		</a>
		<a className={space('nav-item', active === 'profile' && 'active')} href="#green/profile">
			<div className="green-nav-icon profile-icon" /> Profile
		</a>
	</div>;
};

export default GreenNavBar;
