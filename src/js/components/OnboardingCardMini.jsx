import React from 'react';

const OnboardingCardMini = () => {
	return (
		<section id="howitworks" className="how text-center">
			<div className="how-content container-fluid">
				<div className="row">
					<div className="col-md-4">
						<i className='fa fa-handshake-o fa-3x margin-auto' />
						<span className="how-text"> With Good-Loop, advertisers agree to donate 50% of the cost of each ad to charitable causes </span>
					</div>
					<div className="col-md-4">
						<i className='fa fa-eye fa-3x margin-auto' />
						<span className="how-text"> After watching a 15 second video, the viewer decides which of three charities should receive a donation </span>
					</div>
					<div className="col-md-4">
						<i className='fa fa-thumbs-up fa-3x margin-auto' />
						<span className="how-text"> That's it! Good-Loop aims to use advertising for good </span>
					</div>
				</div>
			</div>
		</section>
	);
};

export default OnboardingCardMini;
