/**
 * The core page of My-Loop
 */
import React from 'react';
import { XId } from 'wwutils';
import Login from 'you-again';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import printer from '../base/utils/printer';
import Profiler, { getProfile } from '../base/Profiler';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import LoginWidget, { LoginLink } from '../base/components/LoginWidget';
import Footer from './Footer';
import ShareAnAd from './ShareAnAd';
import DonationCard from './DonationCard';
import C from '../C';
import { assMatch } from 'sjtest';
import {withLogsIfVisible, withDoesIfVisible} from '../base/components/HigherOrderComponents';
import NavBar from './NavBar';
import OnboardingCardMini from './OnboardingCardMini';
import RecentCampaignsCard from './RecentCampaignsCard';

const pagePath = ['widget', 'MyPage'];

window.DEBUG = false;

// TODO document trkids
const MyPage = () => {
	let xids = DataStore.getValue(['data', 'Person', 'xids']);

	if( !xids ) return <Misc.Loading />;

	// TODO pass around xids and turn into strings later
	// HACK DataLog query string: "user:trkid1@trk OR user:trkid2@trk OR ..."
	const allIds = xids.map(trkid => 'user:' + trkid).join(' OR ');

	ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

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
		// TODO: refactor out the elements are the same as campaign page
		<div className="page MyPage">
			<div title="Welcome Card" className='StatisticsCard MiniCard background-gl-red vh-100 flex-column'>
				<NavBar />
				<TitleCard />
				<div className='flex-fill'>
					<div className='white-triangle-left' />
					<div className='white-triangle-right' />
				</div>
			</div>

			<div title="How Good-Loop Ads Work" className='StatisticsCard MiniCard container-fluid top-pad3'>
				<div className='row panel-title panel-heading sub-header pad1'> 
					How Good-Loop works
				</div>
				<div className='row pad1'>
					<OnboardingCardMini allIds={allIds} />
				</div>

				<div className='row pad1'>
					{
						Login.isLoggedIn()
						|| (
							<div className='container-fluid'>
								<div className='row background-gl-red white sub-header pad1'>
									Your data has value! Registering increases the value of your donations
								</div>
								<div className='row panel-title panel-heading sub-header pad1'> 
									Get Involved
								</div>
								<div className='row'>
									<IntroCard isVisible={DataStore.getValue(['widget', 'MyPage', 'IntroCardVisible'])} />
								</div>
								<div className='row' onClick={() => ServerIO.mixPanelTrack("SignUpClicked")}>
									<LoginLink className='btn btn-lg btn-default btn-gl sub-header' onClick={() => LoginWidget.changeVerb('register')} verb='Join us' />			
								</div>
							</div>						
						)
					}
				</div>
			</div>

			<div title="Our Achievements Together" className='StatisticsCard MiniCard container-fluid top-pad3'>
				<div className='row panel-title panel-heading sub-header pad1'> 
					Our Achievements Together
				</div>
				<div className='row pad1'>
					<StatisticsCardMini allIds={allIds} />
				</div>
			</div>

			<div title="Recent Campaigns" className='boostImpact container-fluid'>
				<div className='row panel-title panel-heading sub-header pad1'> 
					Recent Campaigns
				</div>
				<div className='row pad1'>
					<RecentCampaignsCard />
				</div>
				{/* <div className='row pad1'>
					<SocialMediaCard allIds={xids} className="socialConnect" />
				</div> */}
				<div className='row pad1'>
					<div className='col-md-3' />
					<div className='col-md-6 col-xs-12'>
						<ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} mixPanelTag='ShareAnAd' xids={xids} />
					</div>
					<div className='col-md-3' />
				</div>
			</div>

			<div title="Boost Your Impact" className='boostImpact container-fluid'>
				{/* <div className='row pad1'>
					<SocialMediaCard allIds={xids} className="socialConnect" />
				</div> */}

			</div>

			<div title="Your Charities" className='container-fluid'>
				<div className='row panel-title panel-heading sub-header pad1'> 
					Your Charities
				</div>
				<div className='row pad1'>
					<DonationCard xids={xids} />
				</div>
			</div>

			<div title="Get In Touch" className='container-fluid'>
				<div className='row panel-title panel-heading sub-header pad1'> 
					Get in touch
				</div>
				<div className='row pad1'> 
					<ContactCard allIds={allIds} mixPanelTag='ContactCard' />
				</div>
			</div>

			<Footer className='background-gl-red' />
		</div>
	);
}; // ./MyPage

// explain good-loop and join CTA
const TitleCard = () => (
	<div className="WelcomeCard container-fluid flex-vertical-align flex-fill">
		<div className="row header">
			<div className="col header-text post-login">
				<div className="title header white"> 
					<div className='bottom-pad1'>Good-Loop ads</div> 
					<div className='bottom-pad1'>reward the charity of your choice</div> 
					<div> every time you watch </div>
				</div>
			</div>
		</div>
	</div>
);

/**
 * 
 * @param {isVisible} Icons will fade in to view the first time that this card becomes completely visible on the user's screen  
 */
let IntroCard = ({isVisible, doesIfVisibleRef}) => { 
	const visibleClass = isVisible ? ' fade-in ' : '';

	return (
		<div title='Intro' className='container-fluid background-white' ref={doesIfVisibleRef}>
			<div className='row pad1'>
				<div className={'col-md-4 flex-vertical-align intro-item' + visibleClass}>
					<i className='fa fa-pencil fa-3x margin-auto' />
					<div className='margin-auto intro-item-text text-left'> 
						Sign Up. We will not share any of your information with third-parties
					</div>
				</div>
				{/* <div className={'col-md-3 flex-vertical-align intro-item' + visibleClass}>
					<i className='fa fa-check-circle fa-4x margin-auto' />
					<div className='margin-auto intro-item-text'> 
						Set your data preferences 
					</div>
				</div> */}
				<div className={'col-md-4 flex-vertical-align intro-item' + visibleClass}>
					<i className='fa fa-mouse-pointer fa-3x margin-auto' />
					<div className='margin-auto intro-item-text text-left'> 
						Browse online as normal 
					</div>
				</div>
				<div className={'col-md-4 flex-vertical-align intro-item' + visibleClass}>
					<i className='fa fa-envelope fa-3x margin-auto' />
					<div className='margin-auto intro-item-text text-left'> 
						Learn how much you and other Good-Loopers have raised for charity each month! 
					</div>
				</div>
			</div>
		</div>
	);
};
IntroCard = withDoesIfVisible(IntroCard, () => DataStore.setValue(['widget', 'MyPage', 'IntroCardVisible'], true));

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
		<div className="statistics-content container-fluid">
			<div className='row bottom-pad1'>
				<div className="col-md-6 statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight"><span>{printer.prettyNumber(cnt)}</span></div>
						<strong className="statistics-subtext">people reached</strong>
					</div>
				</div>
				<div className="col-md-6 statistics-item">
					<div className="statistics-value">
						<div className="statistics-value-highlight">
							<Misc.Money amount={ttl} maximumFractionDigits={0} maximumSignificantDigits={10} showCurrencySymbol={false} />										
						</div>
						<strong className="statistics-subtext">pounds raised</strong>
					</div>
				</div>
			</div>
		</div>
		<div className='container-fluid'>
			<div className='row bottom-pad1'> 
				<span className='sub-header'> 
					IN 2018, GOOD-LOOP'S ETHICAL ADVERTISING RAISED OVER <br /> 
					<span className='header'> £200,000 </span> <br /> 
				</span> 
				<br /> 
				That's enough to fund... 
			</div>
			<div className='row'>
				<div className='col-md-6'>
					<div className='row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<span className='sub-header bottom-padP5'>
								888 NIGHTS
							</span>
							<span className='text-justify'> 
								of accommodation for young <br /> 
								homeless people in the UK 
							</span>
						</div>
					</div>
				</div>
				<div className='col-md-6'>
					<div className='row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<span className='sub-header bottom-padP5'> 
								1000 CALLS 
							</span>
							<span className='text-justify'> 
								to the Mind mental health info line <br /> 
								which offers support and resources 
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className='row bottom-pad1'>
				<div className='col-md-6'>
					<div className='row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<span className='sub-header bottom-padP5'> 
								180 VACCINATIONS 
							</span>
							<span className='text-justify'> to protect children against measles </span>
						</div>
					</div>
				</div>
				<div className='col-md-6'>
					<div className='row bottom-pad1'>
						<div className='flex-column flex-centre'>
							<span className='sub-header bottom-padP5'> 
								318 SCHOOL KITS
							</span>
							<span className='text-justify'> including stantionary and text-books </span>
						</div>
					</div>
				</div>
			</div>
			<div className='row text-center'>
				{/* TODO: Have this point to some sort of record of Good-Loop's achievements */}
				{/* <a href='/'> */}
					And much more...
				{/* </a> */}
			</div>
		</div>
	</section>);
};

const FadingIcon = (Icon) => {
	return <Icon />;
};

// Two-liner as withLogsIfVisible latches on to Component.displayName or Component.name in order to generate sensible-looking event tag in MixPanel
// Obviously will not work quite right if we were to use an anonymous function
let ContactCard = ({doesIfVisibleRef}) => (
	<div ref={doesIfVisibleRef}>
		<div>
			<p>Let us know what you think of this web-app, and your ideas for improving it.</p>
			<p>Are you interested in hosting Ads For Good on your blog or website?</p>
			<p>
				<a href="https://www.good-loop.com/book-a-call">Let us know.</a>
			</p>
		</div>
	</div>
);
ContactCard = withLogsIfVisible(ContactCard);

/**
 * This is mostly for our debugging
 * @param {String[]} xids 
 */


export default MyPage;
