import React from 'react';

const OnboardingCardMini = () => {
	return (
		<section id="howitworks" className="how text-center">
			<div className="how-content container-fluid">
				<div className="row">
					<div className="col-md-4 how-step">
						<img className="how-img" src='/img/step1.png' alt='banners in a web page' />
						<span className="how-text">You see one of our Ads For Good on a website</span>
					</div>
					<div className="col-md-4 how-step">
						<img className="how-img" src='/img/step2.png' alt='banners in a web page' />
						<span className="how-text">A video ad plays for 15 seconds</span>
					</div>
					<div className="col-md-4 how-step">
						<img className="how-img" src='/img/step3.png' alt='banners in a web page' />
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

export default OnboardingCardMini;
