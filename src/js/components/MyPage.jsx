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
import Cookies from 'js-cookie';
import {getProfile, getProfilesNow} from '../base/Profiler';

/**
 * @returns String[] xids
 */
const getAllXIds = () => {
	let all =[]; // String[]
	// cookie tracker
	let trkid = Cookies.get("trkid");
	// const trkIdMatches = document.cookie.match('trkid=([^;]+)');
	// console.warn("trkIdMatches", trkIdMatches, "cookies", cookies);
	// const currentTrkId = trkIdMatches && trkIdMatches[1];
	if (trkid) all.push(trkid);
	// aliases
	let axids = null;
	if (Login.aliases) {
		axids = Login.aliases.map(a => a.xid);
		all = all.concat(axids);
	}
	// linked IDs?
	// ...fetch profiles
	const fetcher = xid => DataStore.fetch(['data', 'Person', xid], () => {
		return getProfile({xid});
	});
	let pvsPeep = all.map(fetcher);
	pvsPeep.filter(pvp => pvp.value).forEach(pvp => {
		let peep = pvp.value;
		let linkedIds = Person.linkedIds(peep);	
		if (linkedIds) linkedIds.forEach(li => all.push(li));
	});
	// de dupe
	all = Array.from(new Set(all));
	return all;
};
// for debug
window.getAllXIds = getAllXIds;

// TODO document trkids
const MyPage = () => {

	let xids = getAllXIds();

	// TODO pass around xids and turn into strings later
	// HACK DataLog query string: "user:trkid1@trk OR user:trkid2@trk OR ..."
	const allIds = xids.map(trkid => 'user:' + trkid).join(' OR ');

	// display...
	return (
		<div className="page MyPage">
			<Misc.CardAccordion widgetName='MyReport' multiple >
	
				<Misc.Card defaultOpen><WelcomeCard xids={xids} /></Misc.Card>

				<Misc.Card title='Our Achievements Together' defaultOpen><StatisticsCard allIds={allIds} /></Misc.Card>

				<Misc.Card title='How Good-Loop Ads Work' defaultOpen><OnboardingCard allIds={allIds} /></Misc.Card>				

				<Misc.Card title='Your Donations' defaultOpen><DonationCard xids={xids} allIds={allIds} /></Misc.Card>

				<Misc.Card title='Consent Controls' defaultOpen>{Login.isLoggedIn()? <ConsentWidget xids={xids} /> : <LoginToSee />}</Misc.Card>

				<Misc.Card title='Boost Your Impact' defaultOpen><SocialMediaCard allIds={xids} /></Misc.Card>

				<Misc.Card title='Get In Touch' defaultOpen><ContactCard allIds={allIds} /></Misc.Card>
			
			</Misc.CardAccordion>
		</div>
	);
}; // ./MyPage


const WelcomeCard = ({xids}) => {
	return (<div className="header">
		{Login.isLoggedIn()? 
			<div>
				<div className="pull-right logged-in">
					<p>Hi { Login.getUser().name || Login.getUser().xid }</p>
					<small className="pull-right"><a href="#my" onClick={e => stopEvent(e) && Login.logout()}>Log out</a></small>
					<div><small>{xids? xids.join(", ") : null}</small></div>
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
									<div className="statistics-value">                                
									</div>
								</li>
								<li className="statistics-item">
									<div className="statistics-value">
										<strong></strong>
										<div className="statistics-value-highlight">100,000 <span></span></div>
										<strong className="statistics-subtext">people reached</strong>
									</div>
								</li>
								<li className="statistics-item statistics-item-central">
									<div className="statistics-value">
										<strong> </strong>
										<div className="statistics-value-highlight">
											<Misc.Money amount={ttl} maximumFractionDigits={0} maximumSignificantDigits={3} showCurrencySymbol={false} />										
											<span></span>
										</div>
										<strong className="statistics-subtext">pounds raised</strong>
									</div>
								</li>
								<li className="statistics-item">
									<div className="statistics-value">
										<strong></strong>
										<div className="statistics-value-highlight"><div className="text-stat">No compromises</div></div>
										<strong className="statistics-subtext">on your privacy</strong>
									</div>
								</li>
								<li className="statistics-item">
									<div className="statistics-value">
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
	let step2Img = 'https://i.imgur.com/dwvVB2s.jpg';
	let step3Img = 'https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/v1/722207/banner-illustration-publisher_jp1obr.png';


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
											<img className="how-img" src={step2Img} alt='banners in a web page' />
										</span>
										<span className="how-text">A video ad plays for 15 seconds</span>
									</li>
									<li className="how-step">
										<span className="how-image">
											<img className="how-img" src={step3Img} alt='banners in a web page' />
										</span>
										<span className="how-text">We donate half the ad revenue to your chosen charity</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="row">
						<center>
							<a className='btn btn-default' href='https://as.good-loop.com/?site=my.good-loop.com'>Try it now: Watch an Ad-for-Good!</a>
						</center>
					</div>
				</div>
			</div>
		</section>
	</div>
	);
};


const DonationCard = ({xids, allIds}) => {
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

	let qAllIds = xids.map(xid => 'user:'+xid).join(' OR ');
	// NB: if xids changes (eg extra linking is added)	then this will reload
	const donationsPath = ['widget', 'MyReport', 'donations', qAllIds];
	// Get donations by user (including all registered tracking IDs)
	let start = '2018-05-01T00:00:00.000Z'; // ??is there a data issue if older??
	let pvDonationData = DataStore.fetch(donationsPath, () => {
		const donationReq = {
			dataspace: 'gl',
			q: `evt:donation AND (${qAllIds})`,
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

	// TODO fetch peeps, use Person.img, use Login.getUser(), use gravatar and Facebook standards to get an image
	let peeps = getProfilesNow(xids);
	console.warn("image", peeps, Login.getUser(), Login.aliases);
	let profileImg = (Login.getUser() && Login.getUser().img)
		// TODO a fallback image
		|| "http://scotlandjs.com/assets/speakers/irina-preda-e8f1d6ce56f84ecaf4b6c64be7312b56.jpg";

	// Display their charity + community donations
	return 	(<div className="content">
			<div className="partial-circle big top"><img src="https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,h_630,w_1200,f_auto,q_90/v1/722207/gl-logo-red-bkgrnd_qipkwt.jpg" /></div>
			<div className="partial-circle big bottom"><p className="stats"><span>£500,000</span></p></div>
			<div className="partial-circle2 small top">
				<img src={profileImg} />
			</div>
			<div className="partial-circle2 small bottom"><p className="stats">
				<Misc.Money amount={} />
			</p></div>
		</div>
	);
}; // ./DonationsCard


const LoginToSee = ({desc}) => <div>Please login to see {desc||'this'}. <LoginLink className='btn btn-default' /></div>;

const SocialMediaCard = ({allIds=[]}) => {
	let emailID = allIds.filter(id => XId.service(id)==='email')[0];
	let twitterID = allIds.filter(id => XId.service(id)==='twitter')[0];
	let fbid = allIds.filter(id => XId.service(id)==='facebook')[0];

	return (<div>
		{emailID ? 
			null
			: 
			<div> TODO: email capture </div>
		}
		{twitterID ? 
			<div>Twitter username: {XId.id(fbid)}</div> // TODO show some data about them from Twitter
			: 
			<div><SocialSignInButton service='twitter' verb='connect' /></div>
		}
		{fbid ? 
			<div>Facebook ID: {XId.id(fbid)}</div> // TODO show some data about them from FB
			: 
			<div><SocialSignInButton service='facebook' verb='connect' /></div>
		} 
	</div>
	);
};

const ContactCard = () => {
	return (<div>
		<div>
			<p>Let us know what you think of this site, and your ideas for improving it.</p>
			<p>Are you interested in hosting Ads For Good on your blog or website? <a href="https://www.good-loop.com/book-a-call">Let us know.</a></p>
		</div>
	</div>);
};

export default MyPage;
