import React, { useEffect } from 'react';
import Login from '../../base/youagain';

/**
 * A url to directly log you out. This is a hack to logout in T4G without HTTPS. Do not use this page in other use cases. 
 */
const LogoutPage = () => {
	useEffect(() => {
		if (Login.isLoggedIn()) Login.logout();
		window.location.href = "/home";
		}, []);

  return <></>;
};

export default LogoutPage;
