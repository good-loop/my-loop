import React, { Fragment } from 'react';

import GreenNavBar from './greendash/GreenNavBar';
import GreenMetrics from './greendash/GreenMetrics';
import GreenOptimisation from './greendash/GreenOptimisation';
import GreenProfile from './greendash/GreenProfile';
import GreenTable from './greendash/GreenTable';
import StyleBlock from '../../base/components/StyleBlock';

const subpages = {
	table: GreenTable, // NOT implemented yet
	metrics: GreenMetrics, // the main dashboard
	optimisation: GreenOptimisation,  // NOT implemented yet
	profile: GreenProfile,  // NOT implemented yet
};


const GreenDashboard = ({}) => {
	let subpage = DataStore.getValue('location', 'path')[1];
	const Subpage = subpages[subpage] || GreenMetrics;


	return <>
		{/* Override rem for "normal" usage: consider a 14" 1920x1080 laptop with default 125% or 150% DPI scaling */}
		<StyleBlock>{`html, body { font-size: 14px; }`}</StyleBlock>
		{Login.isLoggedIn() && <GreenNavBar active={subpage} />}
		<Subpage />
	</>;
};

export default GreenDashboard;
