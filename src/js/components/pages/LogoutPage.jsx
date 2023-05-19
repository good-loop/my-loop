import React from "react";
import Login from "../../base/youagain";
import Misc from "../../base/components/Misc";

/**
 * A url to directly log you out. This is a hack to logout in T4G without HTTPS. Do not use this page in other use cases.
 */
const LogoutPage = () => {
	const user = Login.getUser();

	if (user === null) {
		window.location.href = "/home";
	}

	if (user && user.auth) {
		Login.logout();
	}

	return (
		<>
			<Misc.Loading text={"Logging out"} />
		</>
	);
};

export default LogoutPage;
