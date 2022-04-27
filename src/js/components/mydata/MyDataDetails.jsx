import React from 'react';
import { PERSON_PATH, VERB_PATH } from '../../base/components/LoginWidget';
import { MyDataCard, SkipNextBtn } from './MyDataCommonComponents';
import UserClaimControl, { getEmail } from '../../base/components/PropControls/UserClaimControl';
import { FormGroup } from 'reactstrap';
import { Help } from '../../base/components/PropControl';

const DetailsCard = ({title, prop, options, labels, ...props}) => {
	const path = PERSON_PATH;
	const email = getEmail();

	return <MyDataCard
			{...props}
	>
			<h2>{title}</h2>
			<hr/>
			<UserClaimControl prop="name" type="text" label="Your Name"/>
			{email && <FormGroup>
        <label className='mr-1'>Your Email</label>
        <Help>Email is set from your login. Let us know if you need to change it by contacting support@good-loop.com.</Help>
        <input type="text" name='email' className='form-control' value={email || ''} readOnly/>
    	</FormGroup>}
			<UserClaimControl prop="location-country" type="country" label="Country" />
			<UserClaimControl prop="location-region" type="text" label="Region"/>
			<UserClaimControl prop="birthday" type="date" label="Your Birthday"/>
			<UserClaimControl prop="gender" type="gender" label="Your Gender (Optional)" />

	</MyDataCard>;

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
