import React from 'react';
import { Button } from 'reactstrap';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { ProfileCreationSteps, Steps } from './MyDataCommonComponents';
import { nextSignupPage } from './MyDataSignUp';

const MyDataGetStarted = () => {

	const pvNgo = getCharityObject();
	let ngo = null;
	if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

	return <>
		<ProfileCreationSteps step={0}/>
		<div className="profile-creation-step">
			{ngo && <NGOImage main bg className="circle w-50 mb-4 mx-auto" ratio={50} src="/img/mydata/charity-default-circle.png" ngo={ngo} />}
			<h1>Nice Choice!</h1>
			<p>Lets start building your data profile so you can begin raising money for {NGO.displayName(ngo)}.</p>
			<div className="button-container">
					<Button color="primary" onClick={nextSignupPage}>Build Profile</Button>
			</div>
		</div>
	</>;

};

export default MyDataGetStarted;
