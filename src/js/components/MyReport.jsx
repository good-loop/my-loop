import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI } from 'wwutils';
import pivot from 'data-pivot';

import C from '../C';
import printer from '../base/utils/printer';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import ChartWidget from '../base/components/ChartWidget';
import Misc from '../base/components/Misc';
import SearchQuery from '../searchquery';
import md5 from 'md5';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import Login from 'you-again';
import {LoginLink, SocialSignInButton} from '../base/components/LoginWidget';

// TODO merge with MyPage??

// TODO document trkids
const MyReport = ({uid, trkIds}) => {
	if ( ! trkIds) trkIds=[];
	// paths for storing data
	const basePath = ['widget', 'MyReport'];

	// TODO pass around lists and turn into strings later
	// "user:trkid1@trk OR user:trkid2@trk OR ..."
	const allIds = trkIds.map(trkid => 'user:' + trkid).join(' OR ');

	// display...
	return (
		<div>
			<Misc.CardAccordion widgetName='MyReport' multiple >
	
				<Misc.Card title='Consent To Track' defaultOpen><ConsentWidget allIds={allIds} /></Misc.Card>

				<Misc.Card title='Donations' defaultOpen><DonationCardUpdated allIds={allIds} /></Misc.Card>
			
				<Misc.Card defaultOpen><FBCard allIds={trkIds} /></Misc.Card>

				<Misc.Card defaultOpen><TwitterCard allIds={trkIds} /></Misc.Card>
			
			</Misc.CardAccordion>
		</div>
	);
}; // ./TrafficReport



const DonationCard = ({allIds}) => {
	if ( ! Login.isLoggedIn()) {
		return <LoginToSee />;
	}
	if ( ! allIds) {
		return <div>No tracking IDs to check -- Do you have Do-Not-Track switched on?</div>;
	}
	const donationsPath = ['widget', 'MyReport', 'donations'];

	// Get donations by user (including all registered tracking IDs)
	let pDonationData = DataStore.fetch(donationsPath, () => {
		const donationReq = {
			dataspace: 'gl',
			q: `evt:donation AND (${allIds})`,
			breakdown: ['cid{"count": "sum"}'],
			start: '2018-05-01T00:00:00.000Z'
		};
		return ServerIO.getDataLogData(donationReq, null, 'my-donations').then(res => res.cargo);
	});

	if ( ! pDonationData.resolved) {
		return <Misc.Loading text='Charity Donations' />;
	}

	const donationData = pDonationData.value;
	window.pivot = pivot; // for debug
	const donationsByCharity = donationData && donationData.by_cid ? (
		pivot(donationData.by_cid.buckets, "$bi.{key, count.sum.$n}", "$key.$n")
	) : null;

	return <BreakdownWidget data={donationsByCharity} param={'Charity ID'} />;
};

const DonationCardUpdated = ({allIds}) => {
	if ( ! Login.isLoggedIn()) {
		return <LoginToSee />;
	}
	if ( ! allIds) {
		let dnt = null;
		try {
			if (navigator.doNotTrack == "1") dnt = true;
			if (navigator.doNotTrack == "0") dnt = false;
		} catch (err) {
			console.warn("DNT check failed", err);
		}
		if (dnt) {
			return <div>No tracking IDs to check - You have Do-Not-Track switched on, so we're not tracking you!</div>;	
		}
		return <div>No tracking IDs to check {dnt===null? " - Do you have Do-Not-Track switched on?" : null}</div>;
	}
	
	return 	(<div className='content'>
		<div className='spinner_wrapper'>
			<div className='spinner'>
				<div className='inner_spin'></div>
				<span className='fullie'>
					<img src='http://www.eie-invest.com/wp-content/uploads/2017/12/good-loop.png' />
				</span>
			</div>
			<div className='spinner'>
				<div className='inner_spin'></div>
				<span className='fullie'>
					<img src='https://i.imgur.com/wo32xfk.png' />
				</span>
			</div>
		</div>
	</div>
	);
};

const LoginToSee = ({desc}) => <div>Please login to see {desc||'this'}. <LoginLink className='btn btn-default' /></div>;

const ConsentWidget = ({uid, allIds}) => {
	const consentPath = ['widget', 'MyReport', 'consent'];
	// Get consent given/denied events
	let pConsentData = DataStore.fetch(consentPath, () => {
		const consentReq = {
			dataspace: 'gl',
			q: `(evt:consent-yes OR evt:consent-no) AND (${allIds})`,
		};
		return ServerIO.getDataLogData(consentReq, null, 'my-consent');
	});
	if ( ! pConsentData.resolved) {
		return <Misc.Loading text='Consent Settings' />;
	}

	let consentData = pConsentData.value;
	if ( ! consentData || ! consentData.examples) {
		// no data, or an error getting it
		consentData = {examples: []};
	}
	// possible values after reduction:
	// null (never answered)
	// 'consent-yes' (only ever said yes)
	// 'consent-no' (only ever said no)
	// 'mixed' (has said yes and no at different times)
	const consentGiven = (
		consentData.examples.reduce((soFar, {_source: val}) => {
			const trueFalse = {	'consent-yes': true, 'consent-no': false }[val.evt];
			if (soFar != null && trueFalse !== soFar) { return 'mixed'; }
			return trueFalse;
		}, null)
	);

	if ( ! uid) {
		return <ReadOnlyConsentWidget consentGiven={consentGiven} />;
	}

	const recordConsent = (consentAnswer) => ServerIO.putProfile({id: uid, 'gl.consent': consentAnswer});
	const consentMessage = {
		true: <ConsentGiven recordConsent={recordConsent} />,
		false: <ConsentDenied recordConsent={recordConsent} />,
		mixed: <ConsentMixed recordConsent={recordConsent} />,
		null: <ConsentNone recordConsent={recordConsent} />,
	};
	return (
		<div>
			<p>Good-Loop can track the ads you view on our network and use this information to show you more relevant ads.</p>
			<p>Targeted ads are more valuable - so you can boost the value of your donations without doing anything else.</p>
			{ consentMessage[consentGiven] }
			<p>You can change your mind and opt in or out at any time on this page.</p>
		</div>);
};

const ConsentGiven = ({recordConsent}) => (
	<div>
		<p>You've said it's OK for us to use your tracking data.</p>
		<button onClick={() => recordConsent(false)}>
			I changed my mind - please don't.
		</button>
	</div>
);

const ConsentDenied = ({recordConsent}) => (
	<div>
		<p>You've said you prefer we didn't use your tracking data.</p>
		<button onClick={() => recordConsent(true)}>
			I changed my mind - you can use my tracking data.
		</button>
	</div>
);

const ConsentMixed = ({recordConsent}) => (
	<div>
		<p>You've previously given multiple different answers when we asked you if it's OK to use your tracking data. Would you like to clarify?</p>
		<button onClick={() => recordConsent(true)}>
			Yes, you can use my tracking data.
		</button>
		<button onClick={() => recordConsent(false)}>
			Please don't.
		</button>
	</div>
);

const ConsentNone = ({recordConsent}) => (
	<div>
		<p>Is it OK for us to use your tracking data?</p>
		<button onClick={() => recordConsent(true)}>
			Yes, this is OK.
		</button>
		<button onClick={() => recordConsent(false)}>
			Please don't.
		</button>
	</div>
);


const ReadOnlyConsentWidget = ({consentGiven}) => {
	const consentMessage = {
		true: <p>You've said it's OK for us to use your tracking data.</p>,
		false: <p>You've said you prefer we didn't use your tracking data.</p>,
		mixed: <p>You've given multiple different answers when we asked you if it's OK to use your tracking data.</p>,
		null: <p>You've never told us whether it's OK for us to use your tracking data.</p>,
	};
	return (
		<div>
			<p><b>Boost your contributions to your favourite causes by enabling targeted ads.</b></p>
			<p>Targeted ads are more valuable to advertisers - so you can boost the value of your donations without doing anything else.</p>
			{ consentMessage[consentGiven] }
		</div>
	);
};


/**
 * 
 * @param {data: key -> Number}
 * @param {param: String} The breakdown-by parameter, e.g. "list by publisher".
 */
const BreakdownWidget = ({data, param}) => {
	assMatch(param, String);
	if ( ! data) return null;

	let columns = [
		{
			Header: C.TYPES.Charity,
			accessor: 'key',
			Cell: k => {
				let nk = k;
				let item = DataStore.getValue('data', C.TYPES.Charity, k);
				if (item) nk = item.name || k;
				return nk;
			}
		},
		{
			Header: 'Amount',
			accessor: 'value',
			Cell: displayValue
		}
	];
	return <div><SimpleTable columns={columns} dataObject={data} addTotalRow csv /></div>;
};

/**
 * nice looking numbers
 * @param {*} v
 */
const displayValue = (v) => {
	if (_.isNumber(v)) {
		// 1 decimal place
		v = Math.round(v*10)/10;
		// commas
		v = printer.prettyNumber(v, 10);
	}
	return v;
};

/**
 * Facebook card
 */
const FBCard = ({allIds=[]}) => {
	let fbid = allIds.filter(id => XId.service(id)==='facebook')[0];
	if ( ! fbid) {
		return <div><SocialSignInButton service='facebook' verb='connect' /></div>;
	}
	return <div>Facebook ID: {XId.name(fbid)}</div>; // TODO show some data about them from FB
};


const TwitterCard = ({allIds=[]}) => {
	let fbid = allIds.filter(id => XId.service(id)==='twitter')[0];
	if ( ! fbid) {
		return <div><SocialSignInButton service='twitter' verb='connect' /></div>;
	}
	return <div>Twitter username: {XId.name(fbid)}</div>; // TODO show some data about them from FB
};

export default MyReport;
