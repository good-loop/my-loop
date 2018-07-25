
import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';

import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import ActionMan from '../plumbing/ActionMan';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import {getPermissions, setPermissions, saveProfile, getProfile} from '../base/Profiler';

/**
 */
const ConsentWidget = ({xids}) => {
	assert(xids.length, "ConsentWidget.jsx");
	let path = ['widget', 'TODO'];
	const fetcher = xid => DataStore.fetch(['data', 'Person', xid], () => {
		return getProfile({xid});
	});
	let pvsPeep = xids.map(fetcher);
	if ( ! pvsPeep[0].value) {
		return <Misc.Loading />;
	}
	
	// where is this info stored on Profiles?
	// how is it set in Profiler.js??
	
	const togglePerm = ({prop, value, ...x}) => {
		let dataspace = ServerIO.dataspace; // ??
		pvsPeep.forEach(pv => {
			if ( ! pv.value) return;
			let person = pv.value;
			let perms = getPermissions({person, dataspace});			
			if (value) {
				// add consent
				if (perms.indexOf(prop) === -1) perms = perms.concat(prop);
			} else {
				// remove consent
				perms = perms.filter(p => p !== prop);
			}
			setPermissions({person, dataspace, perms});
		});
	};

	return (
		<div>
			<p>Help us boost the money raised for charity using your data - without compromising your privacy.</p>
			<p>Please can we:</p>
			
			<Misc.PropControl path={path} prop='personaliseAds' label='Pick ads that fit your profile' type='yesNo' 
				saveFn={togglePerm}
			/>
			
			<Misc.PropControl path={path} prop='recordDonations' label='Record your charity donations' type='yesNo' saveFn={togglePerm} />

			<Misc.PropControl path={path} prop='recordAdsBehaviour' label='Record which ads we show you and how you react to them (e.g. click / ignore / vomit)' 
				type='yesNo' saveFn={togglePerm} />			

			Sell your data: Hell No

			<p>
				It's your data: You can change your mind at any time (just edit these settings). 
				You can see and control your profile data - we're working on easy-to-use online tools for that, 
				but in the meantime you can contact us, and our heroic support team will help.
				For more details see our <a href="https://www.good-loop.com/privacy-policy" target="_blank">Privacy Manifesto</a>.
			</p>
		</div>
	);
};

export default ConsentWidget;


// previous code

// import React from 'react';
// import ServerIO from '../plumbing/ServerIO';
// import DataStore from '../base/plumbing/DataStore';
// import ChartWidget from '../base/components/ChartWidget';
// import Misc from '../base/components/Misc';
// import {putProfile} from '../base/Profiler';

// const ConsentWidget = ({uid, allIds}) => {

// 	if (true) {
// 		return <div>Consent - what can be done with your data</div>;
// 	}

// 	const consentPath = ['widget', 'MyReport', 'consent'];
// 	// Get consent given/denied events
// 	let pConsentData = DataStore.fetch(consentPath, () => {
// 		const consentReq = {
// 			dataspace: 'gl',
// 			q: `(evt:consent-yes OR evt:consent-no) AND (${allIds})`,
// 		};
// 		return ServerIO.getDataLogData(consentReq, null, 'my-consent');
// 	});
// 	if ( ! pConsentData.resolved) {
// 		return <Misc.Loading text='Consent Settings' />;
// 	}

// 	let consentData = pConsentData.value;
// 	if ( ! consentData || ! consentData.examples) {
// 		// no data, or an error getting it
// 		consentData = {examples: []};
// 	}
// 	// possible values after reduction:
// 	// null (never answered)
// 	// 'consent-yes' (only ever said yes)
// 	// 'consent-no' (only ever said no)
// 	// 'mixed' (has said yes and no at different times)
// 	const consentGiven = (
// 		consentData.examples.reduce((soFar, {_source: val}) => {
// 			const trueFalse = {	'consent-yes': true, 'consent-no': false }[val.evt];
// 			if (soFar != null && trueFalse !== soFar) { return 'mixed'; }
// 			return trueFalse;
// 		}, null)
// 	);

// 	if ( ! uid) {
// 		return <ReadOnlyConsentWidget consentGiven={consentGiven} />;
// 	}

// 	const recordConsent = consentAnswer => putProfile({id: uid, 'gl.consent': consentAnswer});
// 	const consentMessage = {
// 		true: <ConsentGiven recordConsent={recordConsent} />,
// 		false: <ConsentDenied recordConsent={recordConsent} />,
// 		mixed: <ConsentMixed recordConsent={recordConsent} />,
// 		null: <ConsentNone recordConsent={recordConsent} />,
// 	};
// 	return (
// 		<div>
// 			<p>Good-Loop can track the ads you view on our network and use this information to show you more relevant ads.</p>
// 			<p>Targeted ads are more valuable - so you can boost the value of your donations without doing anything else.</p>
// 			{ consentMessage[consentGiven] }
// 			<p>You can change your mind and opt in or out at any time on this page.</p>
// 		</div>);
// }; // ConsentWidget


// const ConsentGiven = ({recordConsent}) => (
// 	<div>
// 		<p>You've said it's OK for us to use your tracking data.</p>
// 		<button onClick={() => recordConsent(false)}>
// 			I changed my mind - please don't.
// 		</button>
// 	</div>
// );

// const ConsentDenied = ({recordConsent}) => (
// 	<div>
// 		<p>You've said you prefer we didn't use your tracking data.</p>
// 		<button onClick={() => recordConsent(true)}>
// 			I changed my mind - you can use my tracking data.
// 		</button>
// 	</div>
// );

// const ConsentMixed = ({recordConsent}) => (
// 	<div>
// 		<p>You've previously given multiple different answers when we asked you if it's OK to use your tracking data. Would you like to clarify?</p>
// 		<button onClick={() => recordConsent(true)}>
// 			Yes, you can use my tracking data.
// 		</button>
// 		<button onClick={() => recordConsent(false)}>
// 			Please don't.
// 		</button>
// 	</div>
// );

// const ConsentNone = ({recordConsent}) => (
// 	<div>
// 		<p>Is it OK for us to use your tracking data?</p>
// 		<button onClick={() => recordConsent(true)}>
// 			Yes, this is OK.
// 		</button>
// 		<button onClick={() => recordConsent(false)}>
// 			Please don't.
// 		</button>
// 	</div>
// );


// const ReadOnlyConsentWidget = ({consentGiven}) => {
// 	const consentMessage = {
// 		true: <p>You've said it's OK for us to use your tracking data.</p>,
// 		false: <p>You've said you prefer we didn't use your tracking data.</p>,
// 		mixed: <p>You've given multiple different answers when we asked you if it's OK to use your tracking data.</p>,
// 		null: <p>You've never told us whether it's OK for us to use your tracking data.</p>,
// 	};
// 	return (
// 		<div>
// 			<p><b>Boost your contributions to your favourite causes by enabling targeted ads.</b></p>
// 			<p>Targeted ads are more valuable to advertisers - so you can boost the value of your donations without doing anything else.</p>
// 			{ consentMessage[consentGiven] }
// =======
