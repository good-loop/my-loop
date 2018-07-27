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
			<CardAccordion widgetName='MyReport' multiple >
	
				<Card defaultOpen><WelcomeCard xids={xids} /></Card>

				<Card title='Our Achievements Together' defaultOpen><StatisticsCard allIds={allIds} /></Card>

				<Card title='How Good-Loop Ads Work' defaultOpen><OnboardingCard allIds={allIds} /></Card>				

				<Card title='Your Donations' defaultOpen><DonationCard xids={xids} /></Card>

				<Card title='Consent Controls' defaultOpen>{Login.isLoggedIn()? <ConsentWidget xids={xids} /> : <LoginToSee />}</Card>

				<Card title='Boost Your Impact' defaultOpen><SocialMediaCard allIds={xids} /></Card>

				<Card title='Get In Touch' defaultOpen><ContactCard allIds={allIds} /></Card>
			
			</CardAccordion>
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

const StatisticsCard = () => { 

	const pvSum = DataStore.fetch(['widget','stats','all-donations'], () => {
		return ServerIO.getDataFnData({});
	});
	if ( ! pvSum.resolved) {
		return <Misc.Loading text='...counting kittens...' />;
	}
	let ttl = pvSum.value && pvSum.value.total;
	let cnt = (pvSum.value && pvSum.value.count) || 100000;

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
										<div className="statistics-value-highlight"><span>{printer.prettyNumber(cnt)}</span></div>
										<strong className="statistics-subtext">people reached</strong>
									</div>
								</li>
								<li className="statistics-item statistics-item-central">
									<div className="statistics-value">
										<strong> </strong>
										<div className="statistics-value-highlight">
											<Misc.Money amount={ttl} maximumFractionDigits={0} maximumSignificantDigits={10} showCurrencySymbol={false} />										
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
