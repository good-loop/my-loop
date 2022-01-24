import React, { useState } from 'react';
import { RegisterLink, setLoginVerb, setShowLogin } from '../base/components/LoginWidget';

const MyLandingSection = () => {

	return (
		<>
			<div className="landing-bg bg-white mt-5">
				<div className="container-fluid d-flex justify-content-center">
					<div className="row mb-3">
						<div className="col col-md-6 landing-left">
							<div className="title mt-5"> 
								<h1>Turn Your Web Browsing Into Charity Donations. For Free. </h1>
								<p> Get our Tabs for Good browser plugin today and start rasing money for good cause - just by browsing the internet. </p>
							</div>
							<div className="cta-buttons pt-3">
								<RegisterLink className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
									Sign up for the Tabs For Good
								</RegisterLink>
								<button id="newsletter-btn" className="btn btn-newsletter w-100 d-flex align-items-center justify-content-center mt-3">
									Sign up for newsletter
								</button>
							</div>
						</div>
					</div>
				</div>
				
			</div>
		</>
	);
};

export default MyLandingSection;
