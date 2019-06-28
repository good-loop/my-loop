import React from 'react';
import RecentCampaignsCard from './RecentCampaignsCard';

const OnboardingCardMini = () => (
	<>
		<div className='flex-row flex-centre pad3'>
			<div className='flex-vertical-align width50pct'>
				<img className='width100pct' src='/img/gl-phone-preview.png' />
			</div>
			<div className='flex-vertical-align sub-header width50pct'>
				Watch to donate
			</div>
		</div>
		<div>
			<div className='triangle-gl-light-grey' />
			<div className='flex-row flex-centre bg-gl-light-grey pad1'>
				<div className='flex-row'>
					<div className='right-pad1'>
						<img className='logo-big' src='/img/15-second.svg' alt='fifteen-seconds' />
					</div>
					<div className='sub-header flex-vertical-align'> Watch a 15 second advert and decide which of three charities should receive 50% of the cost of the ad </div>
				</div>
			</div>
		</div>
		<div>
			<RecentCampaignsCard />
		</div>
		<div>
			<div>
				<div className='img-block' style={{backgroundImage: 'url(/img/let_s-use-ad-money_tfvhbb.png)'}}>
					<div className='pad10' />
					<div className='triangle-gl-dark-blue' />
				</div>
				<div className='header white bg-gl-dark-blue pad2'>
					Making online adverts
					<br />
					a better experience
				</div>
			</div>
		</div>
	</>
);

export default OnboardingCardMini;
