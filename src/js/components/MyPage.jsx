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
import DigitalMirrorCard from '../components/DigitalMirrorCard';
import Footer from '../components/Footer';
import ShareAnAd from '../components/ShareAnAd';
import { LoginToSee } from './Bits';
import ConsentWidget from './ConsentWidget';
import DonationCard from './DonationCard';
import C from '../C';
import { Server } from 'http';
import { assMatch } from 'sjtest';
import {withLogsIfVisible} from '../base/components/HigherOrderComponents';
import { SocialMediaGLFooterWidget } from './SocialLinksWidget';
import AccountMenu from '../base/components/AccountMenu';

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

	let glColor2 = '#f5aa57';
	let glColor3 = '#51808a';
	let splashPhotoStyle = { 
		padding: '0px'
		//width: unset;
	};
	// display...
	return (
		<div className="page MyPage">
			<CardAccordion widgetName="MyReport" multiple >	
				<Card defaultOpen className="headerCard" style={splashPhotoStyle}>
					<NavBarCard/>
					<SplashPhotoCard/>
				</Card>

				<Card defaultOpen className="introCard" >
					{/* <WelcomeCard xids={xids} /> */}
					<IntroCard/>
				</Card>

				<Card title="Our Achievements Together" className="StatisticsCard MiniCard" bgColor={glColor2} defaultOpen>
					<StatisticsCardMini allIds={allIds} />
				</Card>
				<Card title="How Good-Loop Ads Work" className="StatisticsCard MiniCard" bgColor={glColor3} defaultOpen>
					<OnboardingCardMini allIds={allIds} />
				</Card>							
				<Card title="Recent Campaigns" bgColor={glColor2} defaultOpen>
					<RecentCampaignsCard />
				</Card>	
				<Card title="Boost Your Impact" className="boostImpact" defaultOpen>
					<SocialMediaCard allIds={xids} className="socialConnect"/>
					<ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} />
				</Card> 

				<Card title="Your Charities" bgColor={glColor2} defaultOpen>
					<DonationCard xids={xids} />
				</Card>

				<Card title="Your Digital Mirror" bgColor={glColor3} defaultOpen>
					<DigitalMirrorCard xids={xids} className="digitalMirror"/>
					<SocialMediaCard allIds={xids} className="socialConnect"/>						
				</Card> 

				<Card title="Consent Controls" defaultOpen className="consentControls">
					{Login.isLoggedIn() ? (
						<ConsentWidget xids={xids} />
					) : (
						<LoginToSee />
					)}
				</Card>

				<Card title="Get In Touch" bgColor={glColor2} defaultOpen>
					<ContactCard allIds={allIds} />
				</Card>
				
				<Card title="Linked Profiles" bgColor={glColor3} className="linkedProfiles">
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
	const heroImage = 'https://image.ibb.co/eWpfwV/hero7.png';

	return (
		<div className="WelcomeCard">
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
	const heroImage = 'https://image.ibb.co/eWpfwV/hero7.png';
	return (
		<div className="WelcomeCard">
			{ 
				Login.isLoggedIn() ? (
					<div>
						<div className="row header">
							<div className="col-md-7 header-text post-login">
								<p className="title header-font">You're a champion!</p>
								<p className="subtitle">Find out below how to boost your contribution</p>
							</div>
							<div className="col-md-1 header-img">
								<img src={heroImage} alt="Superhero" />
							</div>
						</div>
					</div>
				) : (
					<div className="row header">
						<div className="col-md-12 header-text">
							<p className="title header-font">ADS FOR GOOD</p>
							<p className="subtitle subheader-font">Good-Loop ads reward the charity of your choice for every ad you watch</p>
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

const NavBarCard = () => {
	let glLogo = 'https://i.ibb.co/ZT8scH0/Good-Loop-Logos-Good-Loop-Alt-Logo-White-Resized.png';
	const content = Login.isLoggedIn() ? (
		<div className="pull-right logged-in">
			{/* <p>Hi { Login.getUser().name || Login.getUser().xid }</p>
			<small className="pull-right">
				<a className="logout-link" href="#my" onClick={e => stopEvent(e) && Login.logout()}>Log out</a>
			</small> */}
			<AccountMenu account={false} logoutLink={'#'} />
		</div>
	) : (
		<div className="pull-right">
			<LoginLink className='btn btn-lg btn-default btn-gl discrete-login' verb='Login' />		
		</div>
	);
	return (
		<div className="nav-bar">
			<div className='col-sm-6'>
				<div className="header-logos pull-left">
					<img className="gl-logo" alt='Good-Loop Logo' src={glLogo}/>
				</div>		
			</div>
			<div className='col-sm-6'>
				{ content }	
			</div>
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
		<div className="statistics-content">
			<div className="row">
				<h2 className="text-center">Thousands each month raised for charity</h2>
			</div>
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
		<div>
			<img className="statistics-image" src={statsImg}/>
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


const OnboardingCardMini = () => {
	const step1Img = 'https://image.ibb.co/nnGOgV/153970313184640369.png';
	const step2Img = 'https://image.ibb.co/jJm3Fq/153970315675413631.png';
	const step3Img = 'https://image.ibb.co/fMRQTA/153970316087031793.png';

	return (
		<section id="howitworks" className="how text-center">
			<div className="how-content container-fluid">
				<div className="row">
					<div className="col-md-4 how-step">
						<img className="how-img" src={step1Img} alt='banners in a web page' />
						<span className="how-text">You see one of our Ads For Good on a website</span>
					</div>
					<div className="col-md-4 how-step">
						<img className="how-img" src={step2Img} alt='banners in a web page' />
						<span className="how-text">A video ad plays for 15 seconds</span>
					</div>
					<div className="col-md-4 how-step">
						<img className="how-img" src={step3Img} alt='banners in a web page' />
						<span className="how-text">We donate half the ad revenue to your chosen charity</span>
					</div>
				</div>
				<div className="row">
					<center>
						<a className='btn btn-default' href='https://as.good-loop.com/?site=my.good-loop.com' target='_blank'>Watch an Ad For Good</a>
					</center>
				</div>
			</div>
		</section>
	);
};

const RecentCampaignsCard = () => {
	
	const vertisers = 
			[
				{
					"name": "KitKat",
					"adid": "xsINEuJV",
					"logo": "https://as.good-loop.com/uploads/anon/kithead1-8689246171902103163.png"
				},
				// {
				// 	"name": "Lynx",
				// 	"adid": "i2NidWgu",
				// 	"logo": "https://as.good-loop.com/uploads/anon/lynx-black-9012135637566843772.png"
				// },
				// {
				// 	"name": "Glasgow Credit Union",
				// 	"adid": "rfQVI7tc",
				// 	"logo": "https://as.good-loop.com/uploads/anon/gcu____white-5300781013619689576.png"
				// },
				// {
				// 	"name": "Love Beauty and Planet",
				// 	"adid": "dEQj33ir",
				// 	"logo": "https://as.good-loop.com/uploads/anon/lovebeautyplanet__horizontal-full-logo-2244424493762407107.jpg"
				// },
				// {
				// 	"name": "method",
				// 	"adid": "JvtlN3pk",
				// 	"logo": "https://as.good-loop.com/uploads/anon/methodlogo-1-6990657047366189851.png"
				// },
				{
					"name": "Persil",
					"adid": "2loo5PtL",
					"logo": "https://i.pinimg.com/originals/b7/dc/2e/b7dc2e499618bf9e345dcf4335eb408e.png"
				},
				{
					"name": "Linda McCartney",
					"adid": "qprjFW1H",
					"logo": "https://cookschool.club/wp-content/uploads/2018/09/imageedit_1_9636644754-300x200.png"
				},
				{
					"name": "Cappy",
					"adid": "2dsE6F5g",
					"logo": "https://as.good-loop.com/uploads/anon/kisspng-or871378622657345-8807730161052821806.png"
				},
				{
					"name": "Sunbites",
					"adid": "2ROGntyn",
					"logo": "https://as.good-loop.com/uploads/anon/sunbites-logo-1220401756647184148.png"
				},
				{
					"name": "Villa Plus",
					"adid": "lrOQ2Jq3",
					"logo": "https://www.spacecity.co.uk/wp-content/uploads/2018/03/Villa-Plus.png"
				}
				// {
				// 	"name": "Elf Pets",
				// 	"adid": "91NPl6ab",
				// 	"logo": "https://as.good-loop.com/uploads/anon/Screen_Shot_2018-11-19_at_10.12.02-8445321654427265690.png"
				// }
			];
	return (
		<div className="vertiser-row">
			{	vertisers.map(x => <a href={"//my.good-loop.com/#campaign/?gl.vert="+x.adid} target="_blank"><img src={x.logo} alt={x.name}/></a>)	}
		</div>		
	);
};


/**
 * Social CTAs: Share on social / connect
 */
const SocialMediaCard = ({allIds=[], className}) => {
	// TODO (31/10/18): move emailID in to ids after email signup code has been implemented
	const emailID = allIds.filter(id => XId.service(id)==='email')[0];

	const ids = {
		twitterID: allIds.filter(id => XId.service(id)==='twitter')[0],
		fbid: allIds.filter(id => XId.service(id)==='facebook')[0],
	};

	const fbpeep = getProfilesNow([ids.fbid])[0]; 
	return (
		<div className={className}>
			
			{	// Show text if ids contains an undefined value (user still hasn't connected one of their social media accounts)
				Object.values(ids).some( id => id === undefined || id === null) ? <p>Connect your social media - you can use this to boost the donations you generate!</p> : null
			}
			{emailID ? '' : '' /* <div> TODO: email capture </div> */	}
			{ids.twitterID ? (
				<div className='wrapper'>
					<p className="connected" ><i className="fa fa-handshake-o" /> Twitter id: <a href={'https://twitter.com/'+XId.id(ids.twitterID)} target='_blank'>
						{XId.id(ids.twitterID)}
					</a></p>
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

// Two-liner as withLogsIfVisible latches on to Component.displayName or Component.name in order to generate sensible-looking event tag in MixPanel
// Obviously will not work quite right if we were to use an anonymous function
let ContactCard = ({logsIfVisibleRef, bgColor}) => (
	<div style={{backgroundColor: bgColor}} ref={logsIfVisibleRef}>
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
