import React, { useEffect } from 'react';
// import PV from 'promise-value';
import {yessy} from '../../base/utils/miscutils';

import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import Counter from '../../base/components/Counter';

import ServerIO from '../../plumbing/ServerIO';
import MyLoopNavBar from '../MyLoopNavBar';
import Footer from '../Footer';
import ACard from '../cards/ACard';
import SignUpConnectCard from '../cards/SignUpConnectCard';
// TODO refactor so ImpactCard is the shared module, with other bits tucked away inside it
import RecentCampaignsCard from '../cards/RecentCampaignsCard';
import {GlLogoGenericSvg, glLogoDefaultSvg, splitColouredCircleSVG} from '../svg';
import Roles from '../../base/Roles';
import LandingSection from '../LandingSection';

window.DEBUG = false;

const MyPage = () => {
	ServerIO.mixPanelTrack({mixPanelTag: 'Page rendered', data:{referrer: 'document.referrer'}});

	// If we're currently in as.good-loop.com, and we have a glvert param defined, we shpuld redirect to campaign page
	useEffect(() => {
		const urlParams = DataStore.getValue(['location', 'params']);
		if (Object.keys(urlParams).includes('gl.vert')) {
			window.location.href = `/#campaign/?gl.vert=${urlParams['gl.vert']}`;
		}
	});

	// <ShareAdCard /> is buggy, so removed for now

	return (
		<div className='MyPage widepage'>
			<LandingSection />
			<OurMissionCard />
			<RecentCampaignsCard />
			<HowItWorksCard />
			<ContactCard />
			<TimeAndAttentionCard />
			<Footer />
			<TestAd />
		</div>
	);
};


const TestAd = () => {
	// see https://console.appnexus.com/placement?id=1610003
	if ( ! Roles.isDev()) return false;
	return (<div>
		<h4>Hello Dev. Yay! You've scrolled down here -- Let's see an ad and raise some money for charity :)</h4>
		<script src="http://ib.adnxs.com/ttj?id=17741445&size=300x250" type="text/javascript"></script>
	</div>);
};

const ContactCard = () => {
	return (
		<div className='text-center'>
			<div className='sub-header top-p-1'>
				Get in touch
			</div>
			<div className='p-1'>
				<p>Tell us what you think: <a href="mailto:hello@good-loop.com?subject=My thoughts on My Good-Loop">hello@good-loop.com</a></p>
				<p>Interested in hosting Ads For Good on your blog or website? <a href="https://www.good-loop.com/contact">Let us know.</a></p>
			</div>
		</div>
	);
};

const TimeAndAttentionCard = () => (
	// TODO We want two columns on desktop, one on mobile
	<ACard className='bg-gl-red'>
		<div className='bottom-text-container flex text-center white'>
			<div className='p-3'>
				<div className='sub-header font-bold text-left'>
					Time and attention online are valuable.
				</div>
				<div className='sub-header text-left'>
					Let's harness that value and use it for good.
				</div>
			</div>
			<div className='text-block p-3'>
				Good-Loop will never force you to engage with an ad. But, if you choose to give an advertiser some of your valuable time and attention, you get to give 50% of the advertisers' money to a relevant charitable cause.
			</div>
		</div>
	</ACard>
);

const OurMissionCard = () => (
	<ACard className='color-gl-red' name='our-mission'>
		<div className='our-mission'>
			<GlLogoGenericSvg />
			<div>
				<div className='sub-header'>
					What's Good-Loop?
				</div>
				<div className='text-block'>
					At Good-Loop, we raise money for charities using the power of advertising.<br />
					Every time you watch one of our ads, we'll use the advertisers' money to make a donation to a charity of your choice.
				</div>
			</div>
		</div>
		<div className='sub-header' style={{textAlign: 'center'}}>
			Here are some of our recent campaigns
		</div>
	</ACard>
);


const HowItWorksCard = () => {
	return (<>
		<ACard className="how-it-works" backgroundImage='/img/wheat_fields.jpg' name='how-it-works'>
			<div className="how-it-works-banner">
				<img src="img/heres-how-it-works-wide.svg" />
			</div>
			<div className='steps'>
				<div className='step-1 finger white bg-gl-red p-1'>
					<CircleChar>1</CircleChar>
					<div className="step-desc">
						<span className='header'>WATCH<span className="spacer">&nbsp;</span></span>
						<span className='sub-header'>a 15 second video</span>
					</div>
				</div>
				<div className='step-2 finger white bg-gl-red p-1'>
					<CircleChar>2</CircleChar>
					<div className="step-desc">
						<span className='header'>CHOOSE<span className="spacer">&nbsp;</span></span>
						<span className='sub-header'>a charity to support</span>
					</div>
				</div>
				<div className='step-3 finger white bg-gl-red p-1'>
					<CircleChar>3</CircleChar>
					<div className="step-desc">
						<span className='header'>DONATE</span><br />
						<div className="divider"></div>
						<span className='sub-header'>
							50% of the advert cost<span className="breaker"> </span>goes to the charity
						</span>
					</div>
				</div>
			</div>
		</ACard>
		<div className="logo-ribbon">
			<div className="container">{glLogoDefaultSvg}</div>
		</div>
		<div className='make-an-impact img-block'>
			{splitColouredCircleSVG}
			<div className="container">
				<div className="impact-girl accent" />
				<div className="impact-girl" />
				<div className="white impact-card-text">
					<div className="impact-card-header">
						<div className="quiet">make an</div>
						<div className='loud sub-header'>IMPACT</div>
					</div>
					<div className='text-block'>
						In 2020, Good-Loopers raised more than <strong><Counter currencySymbol='£' value={1000000} animationLength={1000} /></strong> for charitable causes by signing up and watching adverts.<br/>
						Help us achieve even more.
					</div>
				</div>
				<SignUpConnectCard />
			</div>
			
		</div>
	</>);
};


/**
 * Stick some text in this to put it inside a thick circular border.
 * NB weird things will happen if used for more than 1-2 characters.
 */
const CircleChar = ({children, className, ...rest}) => (
	<div className={'number-circle header flex-vertical-align' + (className ? ' ' + className : '')} {...rest}>
		{children}
	</div>
);

export default MyPage;
