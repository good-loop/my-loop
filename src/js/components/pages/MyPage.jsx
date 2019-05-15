/**
 * The core page of My-Loop
 */
import React from 'react';
import Login from 'you-again';
import {join} from 'wwutils';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import { RegisterLink } from '../../base/components/LoginWidget';
import {withLogsIfVisible} from '../../base/components/HigherOrderComponents';

import ServerIO from '../../plumbing/ServerIO';
import Footer from '../Footer';
import ShareAnAd from '../cards/ShareAnAd';
import DonationCard from '../cards/DonationCard';
import LoginWidget from '../LoginWidget';
import NavBar from '../NavBar';
import OnboardingCardMini from '../cards/OnboardingCardMini';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import {ImpactImageNumber, ImpactImageText, ImpactHeaderText, ImpactHeaderNumber, ImpactCard} from '../cards/ImpactCard';

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
			<div title="Welcome Card" className='StatisticsCard MiniCard flex-column'>
				<NavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
				<div className='triangle-gl-red' />
				<div className='flex-row pad3 background-gl-red'>
					<div className='sub-header white text-left margin-auto'>
						Good-Loop ads
						<br />
						reward the charity of your choice
						<br />
						every time you watch
					</div>
					<div className='flex-vertical-align margin-auto'>
						<img className='gl-logo-big' src='/img/logo-white2.png' />
					</div>
				</div>				
			</div>
			<div>
				<ImpactCard>
					<ImpactHeaderText amount={200000} className='background-gl-red' headerText='Your impact 2018' subheaderText='Watching adverts and signing-up has raised over' />
					<ImpactImageText imageSrc='/img/stats3-scaled.jpg' />
					<div className='text-block'>
						Advert donations have enabled 318 school kits! Some of Nestlé Cocoa Plan farmers struggle to pay for the books and school supplies for their children. Thanks to you, Nestlé and the International Cocoa Initiative will provide school kits so that more children can go to school. School kits contain exercise books, note books, pens, ruler, eraser, chalk and slate.
					</div>
				</ImpactCard>
				<ImpactCard>
					<ImpactHeaderNumber className='bg-light-2' headerText='Food for one year' subheaderText='for 80 families in poverty in the UK' logoSrc='http://localmy.good-loop.com/img/toms-shoes-logo-vector.png' />
					<ImpactImageNumber imageSrc='http://www.agricorner.com/wp-content/uploads/2010/11/kissan-call-center.jpg' logoSrc='http://www.stickpng.com/assets/images/5842a9fca6515b1e0ad75b06.png' subheaderText='adverts enabled' headerText='444 urgent calls to shelter helpline' />
				</ImpactCard>
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
										<RegisterLink className='btn btn-lg btn-default btn-gl sub-header' verb='Join us' />			
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

	return (<section className="statistics statistics-what text-center">
		<div className='container-fluid'>
			<div className='row mt-1'>
				<div className='header-block min-height-15'>
					<div className='img-block img-hero' style={{backgroundImage: 'url(/img/children-scaled.jpeg)', filter: 'brightness(0.5)', backgroundAttachment: 'unset'}} />
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
			<div className='row mt-1'>
				<div className='header-block min-height-15'>
					<div className='img-block img-hero' style={{backgroundImage: 'url(/img/plants-scaled.jpeg)', filter: 'brightness(0.5)', backgroundAttachment: 'unset'}} />			
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
