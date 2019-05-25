/**
 * The core page of My-Loop
 */
import React from 'react';
import Login from 'you-again';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import { RegisterLink } from '../../base/components/LoginWidget';
import {withLogsIfVisible} from '../../base/components/HigherOrderComponents';

import ServerIO from '../../plumbing/ServerIO';
import Footer from '../Footer';
import ShareAnAd from '../cards/ShareAnAd';
import NavBar from '../NavBar';
import ConsentWidget from '../ConsentWidget';
import OnboardingCardMini from '../cards/OnboardingCardMini';
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import {ImpactImageNumber, ImpactImageText, ImpactHeaderText, ImpactHeaderNumber, ImpactCard} from '../cards/ImpactCard';
import SocialMediaCard from '../cards/SocialMediaCard';

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
			<div title="Welcome Card" className='header-card MiniCard'>
				<NavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
				<div className='triangle-gl-red' />
				<div className='flex-row pad3 background-gl-red'>
					<div className='header white text-left'>
						Good-Loop ads
						<br />
						reward the charity of your choice
						<br />
						every time you watch
					</div>
					<div className='flex-vertical-align'>
						<img className='logo-big' src='/img/logo-white2.png' />
					</div>
				</div>				
			</div>
			<div title="How Good-Loop Ads Work" className='StatisticsCard MiniCard'>
				<div>
					<OnboardingCardMini allIds={allIds} />
				</div>
				<div className='pad1'>
					{
						Login.isLoggedIn()
						|| (
							<>
								<div className='container-fluid'>
									<div className='row panel-title panel-heading sub-header pad1'> 
										Get Involved
									</div>
									<div className='row'>
										<IntroCard isVisible={DataStore.getValue(['widget', 'MyPage', 'IntroCardVisible'])} />
									</div>
									<div className='row' onClick={() => ServerIO.mixPanelTrack("SignUpClicked")}>
										<RegisterLink className='background-gl-red white sub-header btn btn-gl' verb='Sign-Up' />			
									</div>
								</div>
							</>						
						)
					}
				</div>
			</div>
			<div className='white' title='Boost your impact'>
				<div className='background-gl-red'>
					<div className='flex-column'>
						<div className='text-block'>
							Boost your impact by signing up or connecting with social media.
						</div>
						<SocialMediaCard allIds={xids} className='socialConnect margin1' />
					</div>
				</div>					
			</div>

			<div>
			{/* TODO refactor so this is data passed into ImpactCard */}
				<ImpactCard className='top-margin1 container-fluid'>
					<ImpactHeaderText amount={200000} className='background-gl-red row' headerText='Your impact 2018' subheaderText='Watching adverts and signing up has raised over ' />
					<div className='image-and-text container-fluid'>
						<div className='img-container'>
							<img className='impact-image' src='/img/stats1-cropped.jpg' />
						</div>
						<div className='impact-text pad1'>
						Advert donations enabled 68 vegetable growing kits! Poverty affects many cocoa-growing households in Côte d'Ivoire. In order help diversify their income, Nestlé and the International Cocoa Initiative engage women in vegetable growing, equipping them with skills, tools seedlings, and fertilizers to grow and market plantain, rice or peppers. Thanks for helping us make this possible!
						</div>
					</div>
				</ImpactCard>
				<ImpactCard className='top-margin1 container-fluid'>
					<div className='reversed-image-and-text container-fluid'>
						<div className='img-container'>
							<img className='impact-image' src='/img/stats3-cropped.jpg' />
						</div>
						<div className='impact-text pad1'>
							Advert donations have enabled 318 school kits! Some Nestlé Cocoa Plan farmers struggle to pay for books and school supplies for their children. Thanks to you, Nestlé and the International Cocoa Initiative will provide school kits so that more children can go to school. School kits contain exercise books, note books, pens, rulers, erasers, chalk and slates.
						</div>
					</div>
				</ImpactCard>
				<ImpactCard>
					<ImpactHeaderNumber className='bg-light-2' 
						amount={888}
						headerText='nights of accommodation' 
						subheaderText='Centrepoint supports more than 10,000 young homeless people in the UK each year.' logoSrc='/img/toms-shoes-logo-vector.png' 
					/>
					<ImpactImageNumber imageSrc='/img/call-center.jpg' logoSrc='/img/method-logo.png' 
						subheaderText='adverts enabled' 
						amount={1000}
						headerText='calls to the Mind mental health infoline' 
					/>
				</ImpactCard>
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

			<div className='white' title='Boost your impact'>
				<div className='triangle-gl-red' />
				<div className='background-gl-red'>
					<div className='flex-column'>
						<div className='sub-header'>
							Boost your impact
						</div>
						<div className='text-block pad1'>
							Boost your impact by signing up or connecting with social media.
						</div>
						<div className='flex-row flex-wrap'>
							<RegisterLink className='sub-header btn btn-gl' verb='Sign Up' />			
							<SocialMediaCard allIds={xids} className='socialConnect pad1' />
						</div>
					</div>
				</div>					
			</div>

			<div title="Consent Controls" className="consentControls container-fluid">
				<div className='row panel-title panel-heading sub-header pad1'> 
					Consent Controls
				</div>
				<div className='row pad1'> 
					{Login.isLoggedIn() ? (
						<ConsentWidget xids={xids} />
					) : (
						<Misc.LoginToSee />
					)}
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

			<div>
				<div className='triangle-gl-light-grey' />
				<div className='background-gl-light-grey flex-row flex-wrap'>
					<div className='flex-column pad1 width20'>
						<div className='sub-header gl-red highlight font-bold'>
							Time and attention online are valuable
						</div>
						<div className='sub-header'>
							Let's harness that value and use it for good
						</div>
					</div>
					<div className='text-block pad1'>
						Good-Loop will never force you to engage with an ad. But, if you choose to give an adveritser some of your valuable time, attention and data, you get to give 50% of the advertisers' money to a relevant charitable cause.
					</div>
				</div>
			</div>

			<Footer className='background-gl-red' />
		</div>
	);
}; // ./MyPage

const IntroCard = () => (
	<div title='Intro' className='container-fluid'>
		<div className='row pad1'>
			<div className='col-md-4 intro-item'>
				<i className='fa fa-pencil fa-3x pad1' />
				<div className='flex-row'>  
					<span className='text-block'>
						Sign Up. We will not share any of your information with third-parties
					</span>
				</div>
			</div>
			<div className='col-md-4 intro-item'>
				<i className='fa fa-mouse-pointer fa-3x pad1' />
				<div className='flex-row'>
					<span className='text-block'>				
						Browse online as normal. Targeted adverts generate more for your chosen charities.
					</span>		
				</div>				
			</div>
			<div className='col-md-4 intro-item'>
				<i className='fa fa-envelope fa-3x pad1' />
				<div className='flex-row'>
					<span className='text-block'> 
						Learn how much you and other Good-Loopers have raised for charity each month! 
					</span>
				</div>
			</div>
		</div>
	</div>
);

// Two-liner as withLogsIfVisible latches on to Component.displayName or Component.name in order to generate sensible-looking event tag in MixPanel
// Obviously will not work quite right if we were to use an anonymous function
let ContactCard = ({doesIfVisibleRef}) => (
	<div ref={doesIfVisibleRef}>
		<div>
			<p>Tell us what you think of this web-app.</p>
			<p>Are you interested in hosting Ads For Good on your blog or website?</p>
			<p>
				<a href="https://www.good-loop.com/book-a-call">Let us Know.</a>
			</p>
		</div>
	</div>
);
ContactCard = withLogsIfVisible(ContactCard);

export default MyPage;
