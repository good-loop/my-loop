import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';
import pivot from 'data-pivot';

import C from '../C';
import printer from '../base/utils/printer';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import ChartWidget from '../base/components/ChartWidget';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import CardAccordion, {Card} from '../base/components/CardAccordion';
import ActionMan from '../plumbing/ActionMan';
import SearchQuery from '../searchquery';
import md5 from 'md5';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import Login from 'you-again';
import {LoginLink, SocialSignInButton} from '../base/components/LoginWidget';
import ConsentWidget from './ConsentWidget';

const loginResponsePath = ['misc', 'login', 'response'];

const trkIdPath = ['misc', 'trkids'];

// TODO merge with MyPage??

// TODO document trkids
const MyPage = () => {
	const trkIdMatches = document.cookie.match('trkid=([^;]+)');
	const currentTrkId = trkIdMatches && trkIdMatches[1];

	let xid = Login.getId(); // NB: can be null

	// fetch profile
	let pvProfile = ActionMan.getProfile({xid});
	let peep = pvProfile.value || {};

	let trkIds = DataStore.getValue(trkIdPath);

	if ( ! trkIds) {
		// User is logged in but we haven't retrieved tracking IDs from shares yet		
		pvProfile.promise.then(res => {
			console.warn("store trkIds from ", res);
			// // do we need to add the current tracking id to the list?
			// if (currentTrkId && !trkIds.includes(currentTrkId)) {
			// 	ServerIO.putProfile({id: uid, [FIELDS.trackIds]: trkIds.concat(currentTrkId)});
			// }
			
		});
		// use the current one?
		if (currentTrkId) trkIds=[currentTrkId];
		// put them in datastore whether we've updated profile or not
		DataStore.setValue(trkIdPath, trkIds, false);
	}

	// all the users IDs
	let xids = trkIds || [];
	if (Login.getId()) xids.push(Login.getId());

	// linked IDs?
	let linkedIds = Person.linkedIds(peep);
	xids = xids.concat(linkedIds);

	if ( ! xids) xids=[];

	// TODO pass around lists and turn into strings later
	// "user:trkid1@trk OR user:trkid2@trk OR ..."
	const allIds = xids.map(trkid => 'user:' + trkid).join(' OR ');

	// display...
	return (
		<div className="page MyPage">
			<Misc.CardAccordion widgetName='MyReport' multiple >
	
				<Misc.Card defaultOpen>
					<WelcomeCard />
				</Misc.Card>

				<Misc.Card title='Our Achievements Together' defaultOpen><StatisticsCard allIds={allIds} /></Misc.Card>

				<Misc.Card title='How Good-Loop Ads Work' defaultOpen><OnboardingCard allIds={allIds} /></Misc.Card>				

				<Misc.Card title='Your Donations' defaultOpen><DonationCard allIds={allIds} /></Misc.Card>

				<Misc.Card title='Consent To Track' defaultOpen><ConsentWidget allIds={allIds} /></Misc.Card>
			
				<Misc.Card title='Email' defaultOpen><EmailCard allIds={xids} /></Misc.Card>

				<Misc.Card title='Facebook' defaultOpen><FBCard allIds={xids} /></Misc.Card>

				<Misc.Card title='Twitter' defaultOpen><TwitterCard allIds={xids} /></Misc.Card>
			
			</Misc.CardAccordion>
		</div>
	);
}; // ./MyPage


const WelcomeCard = () => {
	return (<div className="header">
		{Login.isLoggedIn()? 
			<div>
				<div className="pull-right logged-in">
					<p>Hi { Login.getUser().name || Login.getUser().xid }</p>
					<small className="pull-right"><a href="#my" onClick={e => stopEvent(e) && Login.logout()}>Log out</a></small>
				</div>
				<div className="header-text">
					<p className="title">TAKE CONTROL OF YOUR DATA</p>
					<p className="subtitle">You choose what data you give us<br/> and what we do with it.</p>
				</div>
			</div>
			:
			<div className="header-text">
				<p className="title">TAKE CONTROL OF YOUR DATA</p>
				<p className="subtitle">You choose what data you give us<br/> and what we do with it.</p>
				<LoginLink className='btn btn-lg btn-red' />				
			</div>
		}
	</div>);
};

const StatisticsCard = ({allIds}) => {
	// ??Oh - What's tx-content? ^Dan W
	// This upsets react - see https://reactjs.org/warnings/unknown-prop.html

	const pvSum = DataStore.fetch(['widget','stats','all-donations'], () => {
		return ServerIO.getDataFnData({});
	});
	if ( ! pvSum.resolved) {
		return <Misc.Loading text='...counting kittens...' />;
	}
	let ttl = pvSum.value && pvSum.value.total;

	return (<div>
		<section className="statistics statistics-what section-half section-padding text-center">
			<div className="statistics-content">
				<div>
					<div className="row">
						<div>
							<h2 className="h2 text-center">Thousands each month raised for charity</h2>
							<div className="statistics-item statistics-item-central hidden-desktop">
							</div>
							<ul className="statistics-list">
								<li className="statistics-item">
									<div className="statistics-value" tx-content="exclude">                                  </div>
								</li>
								<li className="statistics-item">
									<div className="statistics-value" tx-content="exclude">
										<strong tx-content="include">over</strong>
										<b className="statistics-value-highlight">100,000 <span tx-content="include"></span></b>
										<strong className="statistics-subtext" tx-content="include">people reached</strong>
									</div>
								</li>
								<li className="statistics-item statistics-item-central">
									<div className="statistics-value" tx-content="exclude">
										<strong tx-content="include">over</strong>
										<div className="statistics-value-highlight">
											<Misc.Money amount={ttl} />										
											<span tx-content="include"></span>
										</div>
										<strong className="statistics-subtext" tx-content="include">pounds raised</strong>
									</div>
								</li>
								<li className="statistics-item">
									<div className="statistics-value" tx-content="exclude">
										<strong tx-content="include"> over </strong>
										<b className="statistics-value-highlight">10 ??show some logos instead</b>
										<strong className="statistics-subtext" tx-content="include">charities donated towards</strong>
									</div>
								</li>
								<li className="statistics-item">
									<div className="statistics-value" tx-content="exclude">
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>);
};

const OnboardingCard = ({allIds}) => {
	let step1Img = 'https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/v1/722207/banner-illustration-publisher-no-hearts_lppr8a.jpg';
	return 	(<div id="howitworks">
		<section className="how text-center section-padding section-scrolled-to section-half">
			<div className="how-content">
				<div className="container-fluid">
					<div className="row">
						<div className="offset-xl-2 col-xl-8">
							<div className="how-list">
								<ul className="how-steps js-how-steps">
									<li className="how-step">
										<span className="how-image">
											<img className="how-img" src={step1Img} alt='banners in a web page' />
										</span>
										<span className="how-text">You click on one of our Ads For Good banners</span>
									</li>
									<li className="how-step">
										<span className="how-image">
											<img className="how-img" src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5a2e64c6c8408508dc743520/0x0.png"/>
										</span>
										<span className="how-text">A video ad plays for 15 seconds</span>
									</li>
									<li className="how-step">
										<span className="how-image"><img className="how-img" src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5a2e64c6c8408508dc743520/0x0.png"/></span>
										<span className="how-text">We donate half the revenue from the ad to your chosen charity</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
	);
};


const DonationCard = ({allIds}) => {
	if ( ! Login.isLoggedIn()) {
		return <LoginToSee />;
	}
	if ( ! Login.getUser().jwt) {
		DataStore.fetch(['transient','jwt',Login.getId()], () => {
			return Login.verify();
		});
		return <Misc.Loading text='Clearing security' />;
	}
	// No IDs?
	let dnt = null;
	try {
		if (navigator.doNotTrack == "1") dnt = true;
		if (navigator.doNotTrack == "0") dnt = false;
	} catch (err) {
		console.warn("DNT check failed", err);
	}

	if ( ! allIds) {
		if (dnt) {
			return <div>No tracking IDs to check - You have Do-Not-Track switched on, so we're not tracking you!</div>;	
		}
		return <div>No tracking IDs to check {dnt===null? " - Do you have Do-Not-Track switched on?" : null}</div>;
	}

	const donationsPath = ['widget', 'MyReport', 'donations'];
	// Get donations by user (including all registered tracking IDs)
	let start = '2018-05-01T00:00:00.000Z'; // ??is there a data issue if older??
	let pvDonationData = DataStore.fetch(donationsPath, () => {
		const donationReq = {
			dataspace: 'gl',
			q: `evt:donation AND (${allIds})`,
			breakdown: ['cid{"count": "sum"}'],
			start
		};
		return ServerIO.getDataLogData(donationReq, null, 'my-donations').then(res => res.cargo);
	});	

	if ( ! pvDonationData.resolved) {
		return <Misc.Loading text='Donations data' />;
	}

	// unwrap the ES aggregation format
	let donationsByCharity = pivot(pvDonationData.value.by_cid.buckets, "$bi.{key, count.sum.$n}", "$key.$n");

	// no user donations?
	if ( ! yessy(donationsByCharity)) {
		if (dnt) {
			return <div>No charity data... You have Do-Not-Track switched on, so we're not tracking you!</div>;
		}
		return <p>No charity data for {allIds}. </p>;
	}

	// whats their main charity?
	const topCharityValue = {cid:null, v:0};
	Object.keys(donationsByCharity).forEach(cid => {
		let dv = donationsByCharity[cid];
		if (dv <= topCharityValue.v) return;
		topCharityValue.cid = cid;
		topCharityValue.v = dv;
	});
	
	if ( ! topCharityValue.cid) {
		return <p>No top charity</p>;
	}

	// load the community total for this charity
	let pvCommunityCharityTotal = DataStore.fetch(['widget','DonationCard','community'], () => {
		const donationReq = {
			dataspace: 'gl',
			q: 'evt:donation AND cid:'+topCharityValue.cid,
			breakdown: ['cid{"count": "sum"}'],
			start
		};
		return ServerIO.getDataLogData(donationReq, null, 'community-donations').then(res => res.cargo);
	});	

	
	// load charity info from SoGive
	// NB: can 404
	let pvTopCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:topCharityValue.cid, status:C.KStatus.PUBLISHED, swallow:true});
	console.log(pvTopCharity);

	// Display their charity + community donations
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
}; // ./DonationsCard


const LoginToSee = ({desc}) => <div>Please login to see {desc||'this'}. <LoginLink className='btn btn-default' /></div>;


const EmailCard = ({allIds=[]}) => {
	let fbid = allIds.filter(id => XId.service(id)==='email')[0];
	if (fbid) {
		// verified??
		return null;
	}
	return <div>TODO email capture</div>;	
};


/**
 * Facebook card
 */
const FBCard = ({allIds=[]}) => {
	let fbid = allIds.filter(id => XId.service(id)==='facebook')[0];
	if ( ! fbid) {
		return <div><SocialSignInButton service='facebook' verb='connect' /></div>;
	}
	return <div>Facebook ID: {XId.id(fbid)}</div>; // TODO show some data about them from FB
};


const TwitterCard = ({allIds=[]}) => {
	let fbid = allIds.filter(id => XId.service(id)==='twitter')[0];
	if ( ! fbid) {
		return <div><SocialSignInButton service='twitter' verb='connect' /></div>;
	}
	return <div>Twitter username: {XId.id(fbid)}</div>; // TODO show some data about them from FB
};

export default MyPage;
