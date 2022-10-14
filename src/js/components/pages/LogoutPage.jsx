import React, { useEffect } from 'react';
import Login from '../../base/youagain';
import Misc from '../../base/components/Misc';

/**
 * A url to directly log you out. This is a hack to logout in T4G without HTTPS. Do not use this page in other use cases. 
 */
const LogoutPage = () => {
	const loggedinPV = Login.isLoggedIn(); // This will load after youagain loaded

	if (!loggedinPV) {
		window.location.href = "/home";
	}
	Login.logout();

  return <>
		<Misc.Loading text={"Logging out"} />
	</>;
};

export default LogoutPage;
