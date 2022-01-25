import React, { useState } from 'react';
import { RegisterLink, setLoginVerb, setShowLogin } from '../base/components/LoginWidget';

const MyLandingSection = () => {

	return (
		<>
			<div className="landing-bg bg-white">
				<div className="container-fluid d-flex justify-content-center">
					<div className="row mb-3 mt-5">
						<div className="col col-md-6 landing-left">
							<div className="title mt-5"> 
								<h1>Turn Your Web Browsing Into Charity Donations. For Free. </h1>
								<p> Get our Tabs for Good browser plugin today and start rasing money for good cause - just by browsing the internet. </p>
							</div>
							<div className="cta-buttons text-uppercase mt-5">
								<RegisterLink className="btn btn-primary w-100">
									Sign up for Tabs For Good
								</RegisterLink>
								<button id="newsletter-btn" className="btn btn-newsletter w-100 text-uppercase mt-3">
									See how it works
								</button>
							</div>
						</div>
					</div>
				</div>				
			</div>
			<div className="container charity-icons mb-5">
					<div className="row text-center">
						<div className="col-2"><img className='circle-arrow' src="img/homepage/left-arrow.png" alt="" /></div>
						<div className="col row icons">
							<div className="col"><img src="img/homepage/safethechildren_circle.png" alt="" /></div>
							<div className="col"><img src="img/homepage/circle-image-1.png" alt="" /></div>
							<div className="col"><img src="img/homepage/wwf-circle.png" alt="" /></div>
							<div className="col"><img src="img/homepage/circle-image-2.png" alt="" /></div>
							<div className="col"><img src="img/homepage/nspcc_circle.png" alt="" /></div>
						</div>
						<div className="col-2"><img className='circle-arrow' src="img/homepage/right-arrow.png" alt="" /></div>
					</div>
				</div>
		</>
	);
};

export default MyLandingSection;
