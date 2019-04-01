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
import LoginWidget, { LoginLink, SocialSignInButton } from '../base/components/LoginWidget';
import DigitalMirrorCard from './DigitalMirrorCard';
import Footer from './Footer';
import ShareAnAd from './ShareAnAd';
import { LoginToSee } from './Bits';
import ConsentWidget from './ConsentWidget';
import DonationCard from './DonationCard';
import C from '../C';
import { Server } from 'http';
import { assMatch } from 'sjtest';
import {withLogsIfVisible} from '../base/components/HigherOrderComponents';
import { SocialMediaGLFooterWidget } from './SocialLinksWidget';
import NavBar from './NavBar';
import OnboardingCardMini from './OnboardingCardMini';
import RecentCampaignsCard from './RecentCampaignsCard';
import SocialMediaCard from './SocialMediaCard';
import { RoundLogo } from './Image';

const pagePath = ['widget', 'MyPage'];

window.DEBUG = false;

const fetcher = xid => DataStore.fetch(['data', 'Person', xid], () => {
	assMatch(xid, String, "MyPage.jsx fetcher: xid is not a string "+xid);
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

	let splashPhotoStyle = { 
		padding: '0px'
		//width: unset;
	};
	// display...
	return (
		// TODO: refactor out the elements are the same as campaign page
		<div className="page MyPage">
			<CardAccordion widgetName="MyReport" multiple >	
				<Card defaultOpen className="fullCard" style={splashPhotoStyle}>
					<NavBar/>
					<SplashPhotoCard/>
				</Card>

				<Card defaultOpen className="introCard" >
					{/* <WelcomeCard xids={xids} /> */}
					<IntroCard/>
				</Card>

				<Card title="Our Achievements Together" className="StatisticsCard MiniCard background-dark-green" titleClassName='sub-header' defaultOpen>
					<StatisticsCardMini allIds={allIds} />
				</Card>
				<Card title="How Good-Loop Ads Work" className="StatisticsCard MiniCard background-dark-blue" titleClassName='sub-header' defaultOpen>
					<OnboardingCardMini allIds={allIds} />
				</Card>							
				<Card title="Recent Campaigns" className='background-dark-green' titleClassName='sub-header' defaultOpen>
					<RecentCampaignsCard />
				</Card>	
				<Card title="Boost Your Impact" className="boostImpact" titleClassName='sub-header' defaultOpen>
					<SocialMediaCard allIds={xids} className="socialConnect"/>
					<ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} />
				</Card> 

				<Card title="Your Charities" className='background-dark-green' titleClassName='sub-header' defaultOpen>
					<DonationCard xids={xids} />
				</Card>

				<Card title="Your Digital Mirror" className='background-dark-blue' titleClassName='sub-header' defaultOpen>
					<DigitalMirrorCard xids={xids} className="digitalMirror"/>
					<SocialMediaCard allIds={xids} className="socialConnect"/>						
				</Card> 

				<Card title="Consent Controls" defaultOpen titleClassName='sub-header' className="consentControls background-dark-green">
					{Login.isLoggedIn() ? (
						<ConsentWidget xids={xids} />
					) : (
						<LoginToSee />
					)}
				</Card>

				<Card title="Get In Touch" titleClassName='sub-header' defaultOpen>
					<ContactCard allIds={allIds} />
				</Card>
				
				<Card title="Linked Profiles" titleClassName='sub-header' className="linkedProfiles background-dark-blue">
					<LinkedProfilesCard xids={xids} />
				</Card>
			</CardAccordion>
			<div className='grid-tile bottom'>
				<div className='foot header-font center'>		
					<SocialMediaGLFooterWidget />
				</div>
			</div>
			<div>
				<Footer />
			</div>	
		</div>
	);
}; // ./MyPage

const WelcomeCard = ({xids}) => {
	const heroImage = '/img/hero7.png';

	return (
		<div className="WelcomeCard container">
			{ 
				Login.isLoggedIn() ? (
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
								<p className="title">You're a champion!</p>
								<p className="subtitle">Find out below how to boost your contribution</p>
							</div>
							<div className="col-md-1 header-img">
								<img src={heroImage} alt="Superhero" />
							</div>
						</div>
					</div>
				) : (
					<div className="row header">
						<div className="col-md-7 header-text">
							<p className="title"><span> Become a superhero </span> for the causes you care about</p>
							<div onClick={() => ServerIO.mixPanelTrack("SignUpClicked")}>
								<LoginLink className='btn btn-lg btn-default btn-gl' verb='Sign Up' />			
							</div>
						</div>
						<div className="col-md-1 header-img">
							<img src={heroImage} alt="Superhero" />
						</div>
					</div>
				)
			}
		</div>
	);
};

// explain good-loop and join CTA
const IntroCard = () => {
	const heroImage = '/img/hero7.png';
	return (
		<div className="WelcomeCard container">
			{ 
				Login.isLoggedIn() ? (
					<div>
						<div className="row header">
							<div className="col-md-7 header-text post-login">
								<p className="title header"> You're a champion! </p>
								<p className="title sub-header"> Find out below how to boost your contribution </p>
							</div>
							<div className="col-md-5 header-img">
								<img src={heroImage} alt="Superhero" />
							</div>
						</div>
					</div>
				) : (
					<div className="row header">
						<div className="col-md-12 header-text">
							<p className="title header">ADS FOR GOOD</p>
							<p className="subtitle sub-header">Good-Loop ads reward the charity of your choice for every ad you watch</p>
							<div onClick={() => ServerIO.mixPanelTrack("SignUpClicked")}>
								<LoginLink className='btn btn-lg btn-default btn-gl' onClick={() => LoginWidget.changeVerb('register')} verb='Join us' />			
							</div>
						</div>				
					</div>
				)
			}
		</div>
	);
};

const SplashPhotoCard = () => {
	return (
		<div className="splashPhoto">			
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


const StatisticsCardMini = () => { 
	const statsImg = 'https://as.good-loop.com/uploads/marvinirinapreda.meemail/stats__card__v7-158228810410788570.png';
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
		<div className="statistics-content container">
			<div className="row">
				<h2 className="text-center">Thousands each month raised for charity</h2>
			</div>
			<div className='row'>
				<div className="col-md-4 statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight"><span>{printer.prettyNumber(cnt)}</span></div>
						<strong className="statistics-subtext">people reached</strong>
					</div>
				</div>
				<div className="col-md-4 statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight">
							<Misc.Money amount={ttl} maximumFractionDigits={0} maximumSignificantDigits={10} showCurrencySymbol={false} />										
						</div>
						<strong className="statistics-subtext">pounds raised</strong>
					</div>
				</div>
				<div className="col-md-4 statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight"><div className="text-stat">No compromises</div></div>
						<strong className="statistics-subtext">on your privacy</strong>
					</div>
				</div>
			</div>
		</div>
		<div className='container-fluid'>
			<div className='row sub-header bottom-pad1'> 
				IN 2018, GOOD-LOOP'S ETHICAL ADVERTISING RAISED OVER <br /> 
				<span className='header'> £200,000 </span> <br/> 
				FOR CHARITABLE CAUSES <br /> 
				THAT'S ENOUGH TO FUND... 
			</div>
			<div className='row flex-row flex-centre bottom-pad1'>
				<div className='col-lg-4 col-md-6'>
					<div className='row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<RoundLogo alt='centre-point' className='col-md-6' url='/img/centre-point.png' />
							<span className='sub-header'> 888 NIGHTS </span>
							<span> 
								of accommodation <br /> 
								for young homeless people in the UK 
							</span>
						</div>
					</div>
				</div>
				<div className='col-lg-4' />
				<div className='col-lg-4 col-md-6'>
					<div className='row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<RoundLogo alt='centre-point' className='col-md-6' url='/img/mind-logo.png' />
							<span className='sub-header'> 1000 CALLS </span>
							<span> 
								to the Mind mental health info line <br /> 
								which offers support and resources 
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className='row flex-row flex-centre bottom-pad1'>
				<div className='col-lg-4 col-md-6'>
					<div className='row flex-row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<RoundLogo alt='centre-point' className='col-md-6' url='/img/save-the-children.png' />
							<span className='sub-header'> FOOD FOR ONE YEAR </span>
							<span> for 80 families in poverty in the UK </span>
							<span className='sub-header'> 180 VACCINATIONS </span>
							<span> to protect children against measles </span>
						</div>
					</div>
				</div>
				<div className='col-lg-4' />
				<div className='col-lg-4 col-md-6'>
					<div className='row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<RoundLogo alt='centre-point' className='col-md-6' url='/img/cocoa-plan-logo-scaled.png' />
							<span className='sub-header'> 318 SCHOOL KITS </span>
							<span> including stantionary and exercise books </span>
							<span className='sub-header'> 183 SOLAR CHARGERS </span>
							<span> in community centres </span>
						</div>
					</div>
				</div>
			</div>
			<div className='row'>
				As well as 800 workshops for kids at the Sheffield Children's Hospital, 11,500 text reminders to check for breast cancer from Coppafeel, 135 one-to-one mentoring sessions with the Prince's Trust, 72 cervical stitch surgeries from Tommy's, 1,100 support sessions from Ditch The Label, 23 vaccinations for stray cats and much more.
			</div>
		</div>
	</section>);
};

const StatisticsCard = () => { 
	const statsImg = './img/stats_card_v7.png';
	return(
		<div>
			<img className="statistics-image" src={statsImg}/>
		</div>
	);
};

// Two-liner as withLogsIfVisible latches on to Component.displayName or Component.name in order to generate sensible-looking event tag in MixPanel
// Obviously will not work quite right if we were to use an anonymous function
let ContactCard = ({logsIfVisibleRef}) => (
	<div ref={logsIfVisibleRef}>
		<div>
			<p>Let us know what you think of this web-app, and your ideas for improving it.</p>
			<p>Are you interested in hosting Ads For Good on your blog or website?</p>
			<p><a href="https://www.good-loop.com/book-a-call">Let us know.</a></p>
		</div>
	</div>
);
ContactCard = withLogsIfVisible(ContactCard);

/**
 * This is mostly for our debugging
 * @param {String[]} xids 
 */
const LinkedProfilesCard = ({xids}) => {
	if ( ! xids) return null;
	let trackers = xids.filter(xid => XId.service(xid) === 'trk');
	let nonTrackers = xids.filter(xid => XId.service(xid) !== 'trk');
	let authd = Login.aliases? Login.aliases.filter( u => u.jwt).map(u => u.xid) : [];
	
	let peeps = xids.map(xid => DataStore.getData(C.KStatus.PUBLISHED, C.TYPES.Person, xid));
	peeps = peeps.filter(p => !!p);

	return (<div>
		<p>We all have multiple online identities -- e.g. emails, social media, and with retail companies. 
		Here are the IDs Good-Loop recognises as you:</p>
		{ nonTrackers.map(xid => <div key={xid}>{XId.service(xid)+': '+XId.id(xid)}</div>) }
		Good-Loop cookies (random IDs, used by us to record your donations and avoid repeating ads): {trackers.map(xid => XId.id(xid)).join(", ")}<br/>
		Currently logged into Good-Loop via: {authd.map(xid => XId.service(xid)+': '+XId.id(xid)).join(", ")}<br/>
		Links: {peeps.map(peep => 
			<div key={Person.id(peep)}>{Person.id(peep)} -> {peep.links && peep.links.length? peep.links.map(link => link.v).join(", ") : 'no links'}</div>
		)}
	</div>);
};

export default MyPage;
