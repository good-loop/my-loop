import React from 'react';

import GreenNavBar from './greendash/GreenNavBar';
import GreenMetrics from './greendash/GreenMetrics';
import GreenOptimisation from './greendash/GreenOptimisation';
import GreenImpact from './greendash/GreenImpact';
import GreenProfile from './greendash/GreenProfile';
import GreenTable from './greendash/GreenTable';

const subpages = {
	table: GreenTable,
	metrics: GreenMetrics,
	optimisation: GreenOptimisation,
	impact: GreenImpact,
	profile: GreenProfile,
};


const GreenDashboard = ({}) => {
	let subpage = DataStore.getValue('location', 'path')[1];
	const Subpage = subpages[subpage] || GreenMetrics;


	return <div id="green-dashboard">
		<GreenNavBar active={subpage} />
		<Subpage />
	</div>;
};

export default GreenDashboard;
