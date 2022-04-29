import React from 'react';
import { PERSON_PATH, VERB_PATH } from '../../base/components/LoginWidget';
import { MyDataCard, ProfileCreationSteps, SkipNextBtn } from './MyDataCommonComponents';
import UserClaimControl, { getEmail } from '../../base/components/PropControls/UserClaimControl';
import { FormGroup } from 'reactstrap';
import { Help } from '../../base/components/PropControl';

const DetailsCard = ({title, prop, options, labels, ...props}) => {
	const path = PERSON_PATH;
	const email = getEmail();

	return <>
		<ProfileCreationSteps step={1}/>
		<MyDataCard
			{...props}
	>
			<h2>{title}</h2>
			<hr/>
			<UserClaimControl prop="name" type="text" label="Your Name" 
				help="Just so we can call you by name :) Not shared with anyone (unless you explicitly tell us to)."/>
			{email && <FormGroup>
        <label className='mr-1'>Your Email</label>
        <Help>Email is set from your login. Let us know if you need to change it by contacting support@good-loop.com.</Help>
        <input type="text" name='email' className='form-control' value={email || ''} readOnly/>
    	</FormGroup>}
			<UserClaimControl prop="location-country" type="country" label="Country" 
				help="Used to show adverts that are valid for your country." />
			<UserClaimControl prop="location-region" type="text" label="Region" 
				help="Used to pick local charities and local adverts. Not shared with anyone (unless you explicitly tell us to)." />
			<UserClaimControl prop="dob" type="date" label="Date of birth" 
				help='Used for your approximate age, which affects what adverts you see (e.g. drinks ads can only be shown to over 18s). Not shared  with anyone (unless you explicitly tell us to).' />
			<UserClaimControl prop="gender" type="gender" label="Gender" 
				help="Used to pick relevant adverts. Not shared with anyone (unless you explicitly tell us to). Since many ads request male or female, this raises more money for your charity." />

		</MyDataCard>
	</>;

};

const MyDataDetails = ({}) => {

    return <>
        <DetailsCard
            title="About you"
        />
        <SkipNextBtn />
    </>;

};

export default MyDataDetails;
