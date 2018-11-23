/**
 * The core page of My-Loop
 */
import Cookies from 'js-cookie';
import React from 'react';
import { stopEvent, XId } from 'wwutils';
import Login from 'you-again';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import printer from '../base/utils/printer';
import Profiler, { getProfile, getProfilesNow } from '../base/Profiler';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import CardAccordion, { Card } from '../base/components/CardAccordion';
import { LoginLink, SocialSignInButton } from '../base/components/LoginWidget';
import DigitalMirrorCard from '../components/DigitalMirrorCard';
import Footer from '../components/Footer';
import ShareAnAd from '../components/ShareAnAd';
import { LoginToSee } from './Bits';
import ConsentWidget from './ConsentWidget';
import DonationCard from './DonationCard';
import C from '../C';
import { Server } from 'http';

const pagePath = ['widget', 'MyPage'];

window.DEBUG = true;

const fetcher = xid => DataStore.fetch(['data', 'Person', xid], () => {
	// Call analyzedata servlet to pull in user data from Twitter
	// Putting this here means that the DigitalMirror will refresh itself with the data
	// once the request has finished processing
	if( XId.service(xid) === 'twitter' ) return Profiler.requestAnalyzeData(xid);
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

	ServerIO.mixPanelTrack('Page rendered', {referrer: 'document.referrer'});

	// Attempt to find ad most recently watched by the user
	// Go through all @trk ids.
	// Expect that user should only ever have one @trk, but can't confirm that
	let userAdHistoryPV = DataStore.fetch(pagePath.concat('AdHistory'), () => {
		// Only interested in @trk ids. Other types won't have associated watch history
		const trkIds = xids.filter( xid => xid.slice(xid.length - 4) === '@trk');

		// No cookies registered, try using current session's cookie
		if( !trkIds || trkIds.length === 0 ) {
			return ServerIO.getAdHistory();
		}

		// Pull in data for each ID
		const PVs = trkIds.map( trkID => ServerIO.getAdHistory(trkID));
		// Pick the data with the most recent timestamp
		return Promise.all(PVs).then( values => values.reduce( (newestData, currentData) => {
			if( !newestData ) {
				return currentData;
			}
			return Date.parse(currentData.cargo.time) > Date.parse(newestData.cargo.time) ? currentData : newestData;
		}));
	});

	// display...
	return (
		<div className="page MyPage">
			<div className="container avoid-navbar">
				<CardAccordion widgetName="MyReport" multiple >

					<Card defaultOpen className="headerCard"><WelcomeCard xids={xids} /></Card>
					<CardRow3>
						<Card title="Our Achievements Together" className="StatisticsCard MiniCard" defaultOpen>
							<StatisticsCardMini allIds={allIds} />
						</Card>
						<Card title="How Good-Loop Ads Work" className="StatisticsCard MiniCard" defaultOpen>
							<OnboardingCardMini allIds={allIds} />
						</Card>								
						<Card title="Boost Your Impact" className="SocialMediaCard" defaultOpen>
							<SocialMediaCard allIds={xids} />
							{ userAdHistoryPV.resolved ? <ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} /> : null }
						</Card> 
					</CardRow3>

					<Card title="Your Charities" defaultOpen>
						<DonationCard xids={xids} />
					</Card>

					<Card title="Your Digital Mirror" defaultOpen>
						<DigitalMirrorCard xids={xids} />
						<SocialMediaCard allIds={xids} />						
					</Card> 

					<Card title="Consent Controls" defaultOpen>
						{Login.isLoggedIn() ? (
							<ConsentWidget xids={xids} />
						) : (
							<LoginToSee />
						)}
					</Card>

					<Card title="Get In Touch" defaultOpen>
						<ContactCard allIds={allIds} />
					</Card>
					
					<Card title="Linked Profiles" >
						<LinkedProfilesCard xids={xids} />
					</Card>
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
		<div className="mirror">
			<div className="row">
				<div className="col-md-6 main">
					<div className="row">
						<div className="col-md-8 header">
							Irina Preda
						</div>
					</div>
					<div className="row">
						<div className="col-md-8">
							<i className="fa fa-venus"></i>
							Female
						</div>
					</div>
					<div className="row">
						<div className="col-md-8">
							<i className="fa fa-globe"></i>
							London, UK
						</div>
					</div>
					<div className="row">
						<div className="col-md-8">
							<i className="fa fa-briefcase"></i>
							Software Developer
						</div>
					</div>
					<div className="row">
						<div className="col-md-8">
							<i className="fa fa-heart"></i>
							Unknown Relationship Status
						</div>
					</div>
				
				</div>
				<div className="col-md-5 map">
					<img src="https://image.ibb.co/fL2AWV/preview.jpg" />
				</div>
			</div>
		</div>
		<div className="pull-right info"><i className="fa fa-info-circle"></i> This data is from Twitter</div>
	</div>);
};

const WelcomeCard = ({xids}) => {
	const heroImage = 'https://image.ibb.co/eWpfwV/hero7.png';

	const content = Login.isLoggedIn() ? (
		<div>
			<div className="row">
				<div className="pull-right logged-in">
					<p>Hi { Login.getUser().name || Login.getUser().xid }</p>
					<small className="pull-right">
						<a className="logout-link" href="#my" onClick={e => stopEvent(e) && Login.logout()}>Log out</a>
					</small>
				</div>
			</div>
			<div className="row header">
				<div className="col-md-7 header-text">
					<p className="title frank-font">You're a champion!</p>
					<p className="subtitle">Find out below how to boost your contribution</p>
				</div>
				<div className="col-md-1 header-img">
					<img src={heroImage} alt="Superhero" />
				</div>
			</div>
		</div>
	) : (
		<div className="row header">
			<div className="row blank-row"></div>
			<div className="col-md-7 header-text frank-font">
				<p className="title"><span> Become a superhero </span> for the causes you care about</p>
				<LoginLink className='btn btn-lg btn-default btn-gl helvetica-font' verb='Sign Up' />			
			</div>
			<div className="col-md-1 header-img">
				<img src={heroImage} alt="Superhero" />
			</div>
		</div>
	);

	return (
		<div className="WelcomeCard">
			{ content }
		</div>
	);
};

/**
 * Convenience hack for 3-cards in a row
 */
const CardRow3 = ({children}) => {
	return (<div className="row">
		<div className="col-md-4">
			{children[0]}
		</div>
		<div className="col-md-4">
			{children[1]}
		</div>
		<div className="col-md-4">
			{children[2]}
		</div>
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

// const StatisticsCard = () => { 
// 	const pvSum = DataStore.fetch(['widget','stats','all-donations'], () => {
// 		const name = "total-spend"; // dummy parameter: helps identify request in network tab
// 		return ServerIO.getAllSpend({name});
// 	});
// 	if ( ! pvSum.resolved) {
// 		return <Misc.Loading text='Loading donation data...' />;
// 	}
// 	let ttl = pvSum.value && pvSum.value.total;
// 	let cnt = ttl? Math.round(ttl / 0.12) : 100000; // HACK assume 12p per ad
// 	// TODO use a call to lg to get a count of minviews for cnt

// 	return (<section className="statistics statistics-what text-center">
// 		<div className="statistics-content">
// 			<div className="row">
// 				<h2 className="h2 text-center helvetica-font">Thousands each month raised for charity</h2>
// 				<div>&nbsp;</div>
// 			</div>
// 			<Row3>
// 				<div className="statistics-item">
// 					<div className="statistics-value">
// 						<div className="statistics-value-highlight"><span>{printer.prettyNumber(cnt)}</span></div>
// 						<strong className="statistics-subtext">people reached</strong>
// 					</div>
// 				</div>
// 				<div className="statistics-item">
// 					<div className="statistics-value">
// 						<div className="statistics-value-highlight">
// 							<Misc.Money amount={ttl} maximumFractionDigits={0} maximumSignificantDigits={10} showCurrencySymbol={false} />										
// 						</div>
// 						<strong className="statistics-subtext">pounds raised</strong>
// 					</div>
// 				</div>
// 				<div className="statistics-item">
// 					<div className="statistics-value">
// 						<div className="statistics-value-highlight"><div className="text-stat">No compromises</div></div>
// 						<strong className="statistics-subtext">on your privacy</strong>
// 					</div>
// 				</div>
// 			</Row3>
// 		</div>
// 	</section>);
// };

const StatisticsCardMini = () => { 
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
				<h2 className="h2 text-center helvetica-font">Thousands each month raised for charity</h2>
			</div>
			<div className="row statistics-item">
				<div className="statistics-value">
					<div className="statistics-value-highlight"><span>{printer.prettyNumber(cnt)}</span></div>
					<strong className="statistics-subtext">people reached</strong>
				</div>
			</div>
			<div className="row statistics-item">
				<div className="statistics-value">
					<div className="statistics-value-highlight">
						<Misc.Money amount={ttl} maximumFractionDigits={0} maximumSignificantDigits={10} showCurrencySymbol={false} />										
					</div>
					<strong className="statistics-subtext">pounds raised</strong>
				</div>
			</div>
			<div className="row statistics-item">
				<div className="statistics-value">
					<div className="statistics-value-highlight"><div className="text-stat">No compromises</div></div>
					<strong className="statistics-subtext">on your privacy</strong>
				</div>
			</div>
		</div>
	</section>);
};

// const OnboardingCard = ({allIds}) => {
// 	let step1Img = 'https://image.ibb.co/nnGOgV/153970313184640369.png';
// 	let step2Img = 'https://image.ibb.co/jJm3Fq/153970315675413631.png';
// 	let step3Img = 'https://image.ibb.co/fMRQTA/153970316087031793.png';

// 	return 	(<section id="howitworks" className="how text-center">
// 		<div className="how-content container-fluid">
// 			<Row3>
// 				<div className="how-step">
// 					<img className="how-img" src={step1Img} alt='banners in a web page' />
// 					<span className="how-text">You see one of our Ads For Good on a website</span>
// 				</div>
// 				<div className="how-step">
// 					<img className="how-img" src={step2Img} alt='banners in a web page' />
// 					<span className="how-text">A video ad plays for 15 seconds</span>
// 				</div>
// 				<div className="how-step">
// 					<img className="how-img" src={step3Img} alt='banners in a web page' />
// 					<span className="how-text">We donate half the ad revenue to your chosen charity</span>
// 				</div>
// 			</Row3>
// 			<div className="row">
// 				<center>
// 					<a className='btn btn-default' href='https://as.good-loop.com/?site=my.good-loop.com'>Try it now: Watch an Ad-for-Good!</a>
// 				</center>
// 			</div>
// 		</div>
// 	</section>);
// };


const OnboardingCardMini = () => {
	const step1Img = 'https://image.ibb.co/nnGOgV/153970313184640369.png';
	const step2Img = 'https://image.ibb.co/jJm3Fq/153970315675413631.png';
	const step3Img = 'https://image.ibb.co/fMRQTA/153970316087031793.png';

	return (
		<section id="howitworks" className="how text-center">
			<div className="how-content container-fluid">
				<div className="row how-step">
					<img className="how-img" src={step1Img} alt='banners in a web page' />
					<span className="how-text">You see one of our Ads For Good on a website</span>
				</div>
				<div className="row how-step">
					<img className="how-img" src={step2Img} alt='banners in a web page' />
					<span className="how-text">A video ad plays for 15 seconds</span>
				</div>
				<div className="row how-step">
					<img className="how-img" src={step3Img} alt='banners in a web page' />
					<span className="how-text">We donate half the ad revenue to your chosen charity</span>
				</div>
				<div className="row">
					<center>
						<a className='btn btn-default' href='https://as.good-loop.com/?site=my.good-loop.com' target='_blank'>Try it now: Watch an Ad For Good!</a>
					</center>
				</div>
			</div>
		</section>
	);
};


/**
 * Social CTAs: Share on social / connect
 */
const SocialMediaCard = ({allIds=[]}) => {
	// TODO (31/10/18): move emailID in to ids after email signup code has been implemented
	const emailID = allIds.filter(id => XId.service(id)==='email')[0];

	const ids = {
		twitterID: allIds.filter(id => XId.service(id)==='twitter')[0],
		fbid: allIds.filter(id => XId.service(id)==='facebook')[0],
	};

	const fbpeep = getProfilesNow([ids.fbid])[0]; 
	return (
		<div>
			
			{	// Show text if ids contains an undefined value (user still hasn't connected one of their social media accounts)
				Object.values(ids).some( id => id === undefined || id === null) ? <p>Connect your social media - you can use this to boost the donations you generate!</p> : null
			}
			{emailID ? '' : '' /* <div> TODO: email capture </div> */	}
			{ids.twitterID ? (
				<div className='wrapper'>
					<p className="connected" ><i className="fa fa-handshake-o" /> Twitter id: {XId.id(ids.twitterID)}</p>
				</div>
				) : (
				<div>
					<SocialSignInButton service='twitter' verb='connect' />
				</div>
			)}
			{ids.fbid ? (
				// TODO show some data about them from FB
				<div>Facebook ID: {XId.id(ids.fbid)} {fbpeep? fbpeep.name : ''}</div>
			) : (
				<div>
					<div><SocialSignInButton service='facebook' verb='connect' /></div>
				</div>	
			)}
		</div>
	);
};

const ContactCard = () => {
	return (
		<div>
			<div>
				<p>Let us know what you think of this web-app, and your ideas for improving it.</p>
				<p>Are you interested in hosting Ads For Good on your blog or website?</p>
				<p><a href="https://www.good-loop.com/book-a-call">Let us know.</a></p>
			</div>
		</div>
	);
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
