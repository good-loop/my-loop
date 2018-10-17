import React from 'react';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';
import pivot from 'data-pivot';
import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import CardAccordion, {Card} from '../base/components/CardAccordion';
import ActionMan from '../plumbing/ActionMan';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import Login from 'you-again';
import {LoginLink, SocialSignInButton} from '../base/components/LoginWidget';
import {LoginToSee} from './Bits';
import {getProfile, getProfilesNow} from '../base/Profiler';
import ConsentWidget from './ConsentWidget';
import printer from '../base/utils/printer';
import DonationCard from './DonationCard';
import Footer from '../components/Footer';
import ShareAnAd from '../components/ShareAnAd';
import {DigitalMirrorCard} from '../components/DigitalMirrorCard';

const fetcher = xid => DataStore.fetch(['data', 'Person', xid], () => {
	return getProfile({xid});
});

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
	getAllXIds2(all, all);
	// de dupe
	all = Array.from(new Set(all));
	return all;
};
/**
 * @param all {String[]} all XIds -- modify this!
 * @param agendaXIds {String[]} XIds to investigate
 */
const getAllXIds2 = (all, agendaXIds) => {
	// ...fetch profiles from the agenda
	let pvsPeep = agendaXIds.map(fetcher);
	// races the fetches -- so the output can change as more data comes in!
	// It can be considered done when DataStore holds a profile for each xid
	pvsPeep.filter(pvp => pvp.value).forEach(pvp => {
		let peep = pvp.value;
		let linkedIds = Person.linkedIds(peep);	
		if ( ! linkedIds) return;
		// loop test and recurse
		linkedIds.filter(li => all.indexOf(li) === -1).forEach(li => {
			all.push(li);
			getAllXIds2(all, [li]);					
		});
	});
};

// for debug
window.getAllXIds = getAllXIds;

// TODO document trkids
const MyPage = () => {

	let xids = getAllXIds();

	// TODO pass around xids and turn into strings later
	// HACK DataLog query string: "user:trkid1@trk OR user:trkid2@trk OR ..."
	const allIds = xids.map(trkid => 'user:' + trkid).join(' OR ');

	const locn = ""+window.location;

	// display...
	return (
		<div className="page MyPage">
			<div className="container avoid-navbar">
				<CardAccordion widgetName='MyReport' multiple >

					<Card defaultOpen><WelcomeCard xids={xids} /></Card>

					<Card title='Our Achievements Together' defaultOpen><StatisticsCard allIds={allIds} /></Card>

					<Card title='How Good-Loop Ads Work' defaultOpen><OnboardingCard allIds={allIds} /></Card>								

					<Card title='Your Charities' defaultOpen><DonationCard xids={xids} /></Card>

					<Card title='Your Digital Mirror (design @Irina)' defaultOpen><DigitalMirrorCardDesign /></Card> 

					<Card title='Your Digital Mirror (functional @Mark & Dan W)' defaultOpen><DigitalMirrorCard xids={xids} /></Card> 

					<Card title='Boost Your Impact' defaultOpen><SocialMediaCard allIds={xids} /></Card> 

					<Card title='Consent Controls' defaultOpen>{Login.isLoggedIn()? <ConsentWidget xids={xids} /> : <LoginToSee />}</Card>

					<Card title='Get In Touch' defaultOpen><ContactCard allIds={allIds} /></Card>
					
					<Card title='Linked Profiles' defaultOpen><LinkedProfilesCard xids={xids} /></Card>
				</CardAccordion>
			</div>
			<Footer />
		</div>
	);
}; // ./MyPage

/**
 * TODO Assuming we have their Twitter profile and we're interrogated it to extract info...
 */
const DigitalMirrorCardDesign = () => {
	return (<div>
		TODO Assuming we have their Twitter profile and we're interrogated it to extract info...
	</div>);
};

const WelcomeCard = ({xids}) => {
	return (<div className="WelcomeCard">
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
				<LoginLink className='btn btn-lg btn-red' verb='Sign Up' />				
			</div>
		}
	</div>);
};

/**
 * Convenience hack for 3-items, bit-o-spacing-if-large-screen
 */
const Row3 = ({children}) => {
	return (<div className="row">
		<div className="col-md-4 col-lg-3 col-lg-offset-1">
			{children[0]}
		</div>
		<div className="col-md-4">
			{children[1]}
		</div>
		<div className="col-md-4 col-lg-3">
			{children[2]}
		</div>
</div>);
};

const StatisticsCard = () => { 
	const pvSum = DataStore.fetch(['widget','stats','all-donations'], () => {
		const name = "total-spend"; // dummy parameter: helps identify request in network tab
		return ServerIO.getAllSpend({name});
	});
	if ( ! pvSum.resolved) {
		return <Misc.Loading text='Loading donation data...' />;
	}
	let ttl = pvSum.value && pvSum.value.total;
	let cnt = ttl? Math.round(ttl / 0.12) : 100000; // HACK assume 12p per ad
	// TODO use a call to lg to get a count of minviews for cnt

	return (<section className="statistics statistics-what text-center">
		<div className="statistics-content">
			<div className="row">
				<h2 className="h2 text-center">Thousands each month raised for charity</h2>
				<div>&nbsp;</div>
			</div>
			<Row3>
				<div className="statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight"><span>{printer.prettyNumber(cnt)}</span></div>
						<strong className="statistics-subtext">people reached</strong>
					</div>
				</div>
				<div className="statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight">
							<Misc.Money amount={ttl} maximumFractionDigits={0} maximumSignificantDigits={10} showCurrencySymbol={false} />										
						</div>
						<strong className="statistics-subtext">pounds raised</strong>
					</div>
				</div>
				<div className="statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight"><div className="text-stat">No compromises</div></div>
						<strong className="statistics-subtext">on your privacy</strong>
					</div>
				</div>
			</Row3>
		</div>
	</section>);
};

const OnboardingCard = ({allIds}) => {
	let step1Img = 'https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/v1/722207/banner-illustration-publisher-no-hearts_lppr8a.jpg';
	let step2Img = 'https://i.imgur.com/dwvVB2s.jpg';
	let step3Img = 'https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/v1/722207/banner-illustration-publisher_jp1obr.png';

	return 	(<section id="howitworks" className="how text-center">
		<div className="how-content container-fluid">
			<Row3>
				<div className="how-step">
					<img className="how-img" src={step1Img} alt='banners in a web page' />
					<span className="how-text">You see one of our Ads For Good on a website</span>
				</div>
				<div className="how-step">
					<img className="how-img" src={step2Img} alt='banners in a web page' />
					<span className="how-text">A video ad plays for 15 seconds</span>
				</div>
				<div className="how-step">
					<img className="how-img" src={step3Img} alt='banners in a web page' />
					<span className="how-text">We donate half the ad revenue to your chosen charity</span>
				</div>
			</Row3>
			<div className="row">
				<center>
					<a className='btn btn-default' href='https://as.good-loop.com/?site=my.good-loop.com'>Try it now: Watch an Ad-for-Good!</a>
				</center>
			</div>
		</div>
	</section>);
};

const SocialMediaCard = ({allIds=[]}) => {
	let emailID = allIds.filter(id => XId.service(id)==='email')[0];
	let twitterID = allIds.filter(id => XId.service(id)==='twitter')[0];
	let fbid = allIds.filter(id => XId.service(id)==='facebook')[0];
	let fbpeep = getProfilesNow([fbid])[0];	

	return (<div>
		<p>Connect your social media - you can use this to boost the donations you generate!</p>
		{emailID ? 
			null
			: 
			null // <div> TODO: email capture </div>
		}
		{twitterID ? 
			<div className='wrapper'>
				<div>Twitter username: {XId.id(twitterID)}</div>
				<button className='btn btn-default' onClick={ e => ServerIO.load(ServerIO.PROFILER_ENDPOINT + '/analyze-data/' + escape(twitterID))}>Refresh</button>
			</div>
			: 
			<div><SocialSignInButton service='twitter' verb='connect' /></div>
		}
		{fbid ? 
			<div> 
				Facebook ID: {XId.id(fbid)} {fbpeep? fbpeep.name : null}</div> // TODO show some data about them from FB
			: 
			<div><SocialSignInButton service='facebook' verb='connect' /></div>
		}
		<ShareAnAd />
	</div>
	);
};

const ContactCard = () => {
	return (<div>
		<div>
			<p>Let us know what you think of this web-app, and your ideas for improving it.</p>
			<p>Are you interested in hosting Ads For Good on your blog or website?</p>
			<p><a href="https://www.good-loop.com/book-a-call">Let us know.</a></p>
		</div>
	</div>);
};

const LinkedProfilesCard = ({xids}) => {
	if ( ! xids) return null;
	let trackers = xids.filter(xid => XId.service(xid) === 'trk');
	let nonTrackers = xids.filter(xid => XId.service(xid) !== 'trk');
	let authd = Login.aliases? Login.aliases.filter( u => u.jwt).map(u => u.xid) : [];
	return (<div>
		<p>We all have multiple online identities -- e.g. emails, social media, and with retail companies. 
		Here are the IDs Good-Loop recognises as you:</p>
		{ nonTrackers.map(xid => <div key={xid}>{XId.service(xid)+': '+XId.id(xid)}</div>) }
		Good-Loop cookies (random IDs, used by us to record your donations and avoid repeating ads): {trackers.map(xid => XId.id(xid)).join(", ")}<br/>
		Currently logged into Good-Loop via: {authd.map(xid => XId.service(xid)+': '+XId.id(xid)).join(", ")}<br/>
	</div>);
};

export default MyPage;
