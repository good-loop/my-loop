import React from 'react';

const OnboardingCardMini = () => (
	<>
		<div className='flex-row flex-centre pad3'>
			<div className='flex-vertical-align width50pct'>
				<img className='width100pct' src='/img/gl-phone-preview.webp' />
			</div>
			<div className='flex-vertical-align sub-header width50pct'>
				Watch to donate
			</div>
		</div>
		<div>
			<div className='triangle-gl-light-grey' />
			<div className='flex-row flex-centre background-gl-light-grey pad1'>
				<div className='flex-row'>
					<div className='right-pad1'>
						<img className='logo-big' src='/img/low-res-15-second.png' alt='fifteen-seconds' />
					</div>
					<div className='compact-text-block flex-vertical-align'> Watch a 15 second advert and decide which of three charities should receive 50% of the cost of the ad </div>
				</div>
			</div>
		</div>
		<div>
			<div>
				<div className='img-block' style={{backgroundImage: 'url(/img/let_s-use-ad-money_tfvhbb.webp)'}}>
					<div className='pad10' />
					<div className='triangle-gl-dark-blue' />
				</div>
				<div className='header white background-gl-dark-blue'>
					Making online adverts
					<br />
					a better experience
				</div>
			</div>
		</div>
	</>
);

export default OnboardingCardMini;
