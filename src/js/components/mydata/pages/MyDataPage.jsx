import React from 'react';
import { Col, Row } from 'reactstrap';
import { addImageCredit } from '../../../base/components/AboutPage';
import Editor3ColLayout, { LeftSidebar, MainPane } from '../../../base/components/Editor3ColLayout';
import { LoginLink } from '../../../base/components/LoginWidget';
import Person, { getAllXIds, getEmail, getProfile, hasConsent, PURPOSES } from '../../../base/data/Person';
import DataStore from '../../../base/plumbing/DataStore';
import { lg } from '../../../base/plumbing/log';
import { space } from '../../../base/utils/miscutils';
import Login from '../../../base/youagain';
import C from '../../../C';
import SubscriptionBox from '../../cards/SubscriptionBox';
import ShareButton from '../../ShareButton';
import AccountSettings from '../../pages/AccountSettings';
import TabsForGoodSettings from '../../pages/TabsForGoodSettings'
import MyDataSignUpPage from './MyDataSignUpPage';

const label4tab = {
	home: "My Account",
	signup: "Sign Up",
	settings: "Settings",
	tabsForGood: "Tabs for Good"
};

const MyDataPage = () => {
	// handle the not-logged-in case
	if ( ! Login.isLoggedIn()) {
		DataStore.setUrlValue("tab", "signup");
	}
	// // NB: race conditions with Login and profile fetch (for linked IDs) mean all-xids should be refreshed.
	// let xids = getAllXIds();

	// Which tab? (default to account)
	const tab = DataStore.getUrlValue('tab') || 'home';

	return (<>
		<div className="AccountPage avoid-navbar">
			<Editor3ColLayout>
				<LeftSidebar>
					<div className="account-sidebar pl-3">
						<h5 className="p-2">My Good-Loop</h5>
						{Object.keys(label4tab).map(t => <SidebarTabLink key={t} tab={t} label={label4tab[t]} selected={t === tab} />)}
					</div>
				</LeftSidebar>
				<MainPane>
					<div className="pt-5">
						{tab === 'home' && null} 
						{tab === 'signup' && <MyDataSignUpPage />}
						{tab === 'settings' && <AccountSettings />}
						{tab === 'tabsForGood' && <TabsForGoodSettings />}
					</div>
				</MainPane>
			</Editor3ColLayout>
		</div>
	</>);
};

/**
 * 
 * @param {!string} tab The tab name
 * @param {boolean} selected
 */
const SidebarTabLink = ({ tab, label, selected }) => {
	let url = "/account?tab=" + escape(tab);
	if (tab === "tabsForGood") {
		// TODO detect whether T4G is installed on this specific browser.
		let pvPerson = getProfile();
		let hasT4G = Person.hasApp(pvPerson.value, "t4g.good-loop.com");
		if ( ! hasT4G) {
			// Detect whether we're on Chrome or not
			// TODO Edge too -- see T4GSignUp
			let isChrome = navigator && navigator.vendor === "Google Inc.";
			if ( ! isChrome) {
				url = "https://my.good-loop.com/tabsforgood"
				label = "About "+C.T4G;
			} else {
				url = "https://chrome.google.com/webstore/detail/good-loop-tabs-for-good/baifmdlpgkohekdoilaphabcbpnacgcm?hl=en&authuser=1"
				label = "Get "+C.T4G;
			}
		}
	}
	return <div className='my-2'><C.A href={url} className={space("account-tab p-2", selected && "active")}>{label || tab}</C.A></div>;
};

addImageCredit({ name: "add-user", author: "Icons8", url: "https://icons8.com/icons/set/add-user-male" });

export default MyDataPage;
