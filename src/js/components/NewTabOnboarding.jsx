import React from 'react';
import Login from 'you-again';
import NavBar, { AccountMenu } from './MyLoopNavBar';

const NewTabOnboardingPage = () => {
    if (Login.isLoggedIn()) {
		window.location.href = "/newtab.html#webtop";
	}
	return <>
        <div className="onboarding">
            <h1>Welcome to Tabs-for-Good!</h1>
            <h2>Please sign in or register to continue.</h2>
            <AccountMenu/>
        </div>
    </>;
};

export default NewTabOnboardingPage;
