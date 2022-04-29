import React, { useState } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { getPersonSetting, getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { MyDataCard, SkipNextBtn, ProfileCreationSteps } from './MyDataCommonComponents';
import BSCarousel from '../../base/components/BSCarousel';
import { countryListAlpha2 } from '../../base/data/CountryRegion';
import CharityLogo from '../CharityLogo';
import NGO from '../../base/data/NGO';
import { nextSignupPage } from './MyDataSignUp';

const FirstPage = ({onNext, ngo}) => {
	return <>
		<ProfileCreationSteps step={2}/>
		<h1>Profile Created!</h1>
		<p>Success, you're ready to help {NGO.displayName(ngo)}! Explore your profile in your bespoke Dashboard</p>
		<Button color="primary" onClick={onNext}>Let's go!</Button>
	</>;
}

const MyDataProfileCreated = () => {

	const pvCharity = getCharityObject();
	const ngo = pvCharity && (pvCharity.value || pvCharity.interim);

	const [firstPage, setFirstPage] = useState(true);

	const slidesItems = [
		<>
			<img src="/img/mydata/onboarding-1.png" className="onboarding-img"/>
			<h1>You're In Control</h1>
			<p>For every piece of data you've shared with us, you can control how it's used.</p>
		</>,
		<>
			<img src="/img/mydata/onboarding-2.png" className="onboarding-img"/>
			<h1>Share To Give</h1>
			<p>The more data you choose to share, the more you can give to {NGO.displayName(ngo)}</p>
		</>,
		<>
			<img src="/img/mydata/onboarding-3.png" className="onboarding-img"/>
			<h1>Data Made Easy</h1>
			<p>We've preset our recommended privacy settings but you can change them at any time</p>
		</>
	]

	const slides = slidesItems.map((content, i) => (
		<div key={i} className='profile-created-slides h-100'>
			{content}
		</div>
	));

	const NextButton = ({onClick, index, length}) => {
		const fullOnClick = () => {
			if (index === length - 1) {
				// nextSignupPage();
				window.location.href = '/account?tab=dashboard&dashboard=profile';
			} else {
				onClick();
			}
		}
		return <div className="d-flex flex-row justify-content-center align-items-center">
			<Button color="primary" onClick={fullOnClick}>Next</Button>
		</div>;
	};

	return <>
		{firstPage ? <FirstPage ngo={ngo} onNext={() => setFirstPage(false)}/>
		: <>
			<BSCarousel hasIndicators hideArrows NextButton={NextButton} noWrap>
				{slides}
			</BSCarousel>
		</>}
	</>;   

};

export default MyDataProfileCreated;
