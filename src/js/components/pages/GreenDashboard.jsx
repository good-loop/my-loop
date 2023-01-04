import React, { Fragment } from 'react';

import GreenNavBar from './greendash/GreenNavBar';
import GreenOptimisation from './greendash/GreenOptimisation';
import GreenProfile from './greendash/GreenProfile';
import GreenTable from './greendash/GreenTable';
import StyleBlock from '../../base/components/StyleBlock';
import GreenMetrics from './greendash/GreenMetrics';
import AccountMenu from '../../base/components/AccountMenu';

const subpages = {
	table: GreenTable, // NOT implemented yet
	metrics: GreenMetrics, // the new main dashboard
	optimisation: GreenOptimisation, // NOT implemented yet
	profile: GreenProfile, // NOT implemented yet
};


const GreenDashboard = ({}) => {
	let subpage = DataStore.getValue('location', 'path')[1];
	const Subpage = subpages[subpage] || GreenMetrics;

	return <>
		{/* Override rem for "normal" usage: consider a 14" 1920x1080 laptop with default 125% or 150% DPI scaling */}
		{/* ...But don't let text become too tiny on mobile */}
		<StyleBlock>{`html, body { font-size: 14px; } @media (max-width: 767px) { html, body { font-size: 18px; } }`}</StyleBlock>
		{Login.isLoggedIn() && <GreenNavBar active={subpage} />}
		<Subpage />
	</>;
};

export default GreenDashboard;
