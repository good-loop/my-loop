import React, { Fragment } from 'react';

import GreenNavBar from './greendash/GreenNavBar';
import GreenMetrics from './greendash/GreenMetrics';
import GreenOptimisation from './greendash/GreenOptimisation';
import GreenProfile from './greendash/GreenProfile';
import GreenTable from './greendash/GreenTable';

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
		{Login.isLoggedIn() && <GreenNavBar active={subpage} />}
		<Subpage />
	</>;
};

export default GreenDashboard;
