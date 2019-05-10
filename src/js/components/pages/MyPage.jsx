/**
 * The core page of My-Loop
 */
import React from 'react';
import Login from 'you-again';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import { LoginLink } from '../../base/components/LoginWidget';
import {withLogsIfVisible} from '../../base/components/HigherOrderComponents';

import ServerIO from '../../plumbing/ServerIO';
import Footer from '../Footer';
import ShareAnAd from '../cards/ShareAnAd';
import DonationCard from '../cards/DonationCard';
import LoginWidget from '../LoginWidget';
import NavBar from '../NavBar';
import OnboardingCardMini from '../cards/OnboardingCardMini';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';

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
							<>
								<div className='row background-gl-red white sub-header pad1'>
									Your data has value! Registering increases the value of your donations
								</div>
								<div className='container-fluid'>
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
							</>						
						)
					}
				</div>
			</div>

			<div title="Our Achievements Together" className='StatisticsCard MiniCard container-fluid top-pad3'>
				<div className='row'>
					<StatisticsCardMini allIds={allIds} />
				</div>
			</div>

			<div title="Recent Campaigns" className='boostImpact container-fluid'>
				<div className='row pad1'>
					<RecentCampaignsCard />
				</div>
				<div className='row pad1'>
					<div className='col-md-3' />
					<div className='col-md-6 col-xs-12'>
						<ShareAnAd adHistory={userAdHistoryPV && userAdHistoryPV.value} mixPanelTag='ShareAnAd' xids={xids} />
					</div>
					<div className='col-md-3' />
				</div>
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

const IntroCard = () => (
	<div title='Intro' className='container-fluid'>
		<div className='row pad1'>
			<div className='col-md-4 intro-item'>
				<i className='fa fa-pencil fa-3x margin-auto pad1' />
				<div className='flex-row'>  
					<span className='margin-auto text-block'>
						Sign Up. We will not share any of your information with third-parties
					</span>
				</div>
			</div>
			<div className='col-md-4 intro-item'>
				<i className='fa fa-mouse-pointer fa-3x margin-auto pad1' />
				<div className='flex-row'>
					<span className='margin-auto text-block'>				
						Browse online as normal. Targetted adverts generate more for your chosen charities.
					</span>		
				</div>				
			</div>
			<div className='col-md-4 intro-item'>
				<i className='fa fa-envelope fa-3x margin-auto pad1' />
				<div className='flex-row'>
					<span className='margin-auto text-block'> 
						Learn how much you and other Good-Loopers have raised for charity each month! 
					</span>
				</div>
			</div>
		</div>
	</div>
);

const StatisticsCardMini = () => { 
	const pvSum = DataStore.fetch(['widget','stats','all-donations'], () => {
		const name = "total-spend"; // dummy parameter: helps identify request in network tab
		return ServerIO.getAllSpend({name});
	});
	if ( ! pvSum.resolved) {
		return <Misc.Loading text='Loading donation data...' />;
	}
	let ttl = pvSum.value && pvSum.value.total;

	return (<section className="statistics statistics-what text-center">
		<div className='container-fluid white'>

			<NumberImpactCard headline="To date, Good-Loop's ethical advertising has raised" 
				number={ttl} type='Money' description="That's enough to fund..." />

			<div className='row mt-1'>
				<div className='header-block min-height-15'>
					<div className='img-block' style={{backgroundImage: 'url(/img/children-scaled.jpeg)', filter: 'brightness(0.5)', backgroundAttachment: 'unset'}} />
					<div className='col-md-1' />					
					<div className='col-md-5 col-sm-5 flex-row'>
						<div className='flex-column pad1 text-block'>
							<span className='header white bottom-pad1'> 
								318 school kits
							</span>
							<span> 
								While primary school is free in Côte d'Ivoire, some farmers struggle to pay for their children's school supplies. Nestlé and the International Cocoa Initiative will provide exercise-books, note-books, pens, rulers, erasers, chalk and slate so that more children can go to school.
							</span>
						</div>
					</div>
					<div className='col-md-6' />
				</div>
			</div>

			<NumberImpactCard number={888} unit="nights of accommodation" 
				description="Centrepoint supports more than 10,000 young homeless people in the UK each year." 
				textColor='light-1' bgColor='dark-1' />

			<div className='row mt-1'>
				<div className='header-block min-height-15'>
					<div className='img-block' style={{backgroundImage: 'url(/img/plants-scaled.jpeg)', filter: 'brightness(0.5)', backgroundAttachment: 'unset'}} />			
					<div className='col-md-1' />
					<div className='col-md-5 col-sm-5 flex-row'>
						<div className='flex-column pad1 text-block'>
							<span className='header white bottom-pad1'>
								68 vegetable growing kits									
							</span>
							<span> 
								Overreliance on cocoa means some Côte d'Ivoire farmers are vulnerable to price fluctuations. Nestlé and the International Cocoa Initiative ran workshops to give women the tools, seedlings, fertilisers and skills needed to grow and sell plantain, rice or peppers.  
							</span>
						</div>
					</div>
				</div>
				<div className='col-md-6' />
			</div>

		</div>
		<div className='sub-header text-center mt-1'>
			{/* TODO: Have this point to some sort of record of Good-Loop's achievements */}
			{/* <a href='/'> */}
				And much more...
			{/* </a> */}
		</div>
	</section>);
};

const NumberImpactCard = ({headline, number, unit, type, description, textColor='dark-0', bgColor='light-0'}) => {
// 	<div className='img-block' 
// 	style={{backgroundImage: 'url(' + ServerIO.MY_ENDPOINT + '/img/the-room.jpeg' + ')', filter: 'brightness(0.5)', backgroundAttachment: 'unset'}} 
// />
	return (<div className={join('row mt-1','text-'+textColor,'bg-'+bgColor)}>
		<div className='header-block min-height-15'>
			<div className='col-md-1' />					
			<div className='col-md-5 col-sm-5 flex-row'>
				{headline? <h3>{headline}</h3> : null}
				<div className='flex-column pad1 text-block'>
					<span className='header white bottom-pad1'> 
						{type==='Money'? <Misc.Money amount={number} maximumFractionDigits={0} maximumSignificantDigits={10} showCurrencySymbol={true} /> 
							: <span>{number} {unit}</span>}
					</span>
					<span> 
						{description}
					</span>
				</div>
			</div>
			<div className='col-md-6' />
		</div>
	</div>);
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

export default MyPage;
