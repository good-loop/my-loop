import React, { useState } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { getPersonSetting, getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { MyDataCard, SkipNextBtn, ProfileCreationSteps } from './MyDataCommonComponents';
import BSCarousel from '../../base/components/BSCarousel';
import { countryListAlpha2 } from '../../base/data/CountryRegion';
import CharityLogo from '../CharityLogo';
import NGO from '../../base/data/NGO';
import { nextSignupPage } from './MyDataSignUp';

const MyDataProfileCreated = () => {
	let pvCharity = getCharityObject();
	let ngo = pvCharity && pvCharity.value;
	return <>
		<ProfileCreationSteps step={2}/>
		<div className="profile-creation-step">
			<img src="/img/mydata/profile-created.png" className="w-100" />
			<h1>Profile Created!</h1>
			<p>You're now ready to help {NGO.displayName(ngo)}. Tap below to explore your profile dashboard.</p>
			<div className="button-container">
				<Button color="primary" onClick={nextSignupPage}>Let's go!</Button>
			</div>
		</div>
	</>;
}

const PrivacyOnboardingSteps = ({step}) => {
	return (
		<div className="privacy-onboarding-steps">
			<span className={step == 1 ? "active" : ""}></span>
			<span className={step == 2 ? "active" : ""}></span>
			<span className={step == 3 ? "active" : ""}></span>
		</div>
	)
}


const ExplainPrivacy1 = () => {
	return <>
		<div className="profile-creation-step">
			<img src="/img/mydata/onboarding-1.png" className="w-100"/>
			<h1>You're In Control</h1>
			<p>All of your data is in your hands, so you control how we use it.</p>
			<PrivacyOnboardingSteps step={1} />
			<div className="button-container">
				<Button color="primary" onClick={nextSignupPage}>Next</Button>
			</div>
		</div>
	</>;
};

const ExplainPrivacy2 = () => {
	let pvCharity = getCharityObject();
	let ngo = pvCharity && pvCharity.value;
	return <>
		<div className="profile-creation-step">
			<img src="/img/mydata/onboarding-2.png" className="w-100"/>
			<h1>Share To Give</h1>
			<p>TThe more data you choose to share, the more money you'll donate to {NGO.displayName(ngo)}.</p>
			<PrivacyOnboardingSteps step={2} />
			<div className="button-container">
				<Button color="primary" onClick={nextSignupPage}>Next</Button>
			</div>
		</div>
	</>;
};

const ExplainPrivacy3 = () => {
	return <>
		<div className="profile-creation-step">
			<img src="/img/mydata/onboarding-3.png" className="w-100"/>
			<h1>Data Made Easy</h1>
			<p>We've set you up with  our recommended privacy settings but you can change them any time to suit you.</p>
			<PrivacyOnboardingSteps step={3} />
			<div className="button-container">
				<Button color="primary" onClick={nextSignupPage}>Next</Button>
			</div>
		</div>
	</>;
};

export const ExplainPrivacyPages = [ExplainPrivacy1, ExplainPrivacy2, ExplainPrivacy3];

export default MyDataProfileCreated;
