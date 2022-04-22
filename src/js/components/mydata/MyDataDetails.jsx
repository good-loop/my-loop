import React from 'react';
import PropControl from '../../base/components/PropControl';
import { PERSON_PATH, VERB_PATH } from '../../base/components/LoginWidget';
import { MyDataCard, Steps, SkipNextBtn } from './MyDataCommonComponents';
import UserClaimControl, { getPersonSetting } from '../../base/components/PropControls/UserClaimControl';

const DetailsCard = ({title, prop, options, labels, ...props}) => {
	const path = PERSON_PATH;

	return <MyDataCard
			{...props}
	>
			<h2>{title}</h2>
			<hr/>
			<UserClaimControl prop="name" type="text" label="Your Name"/>
			<UserClaimControl prop="email" type="text" label="Your Email"/>
			<UserClaimControl prop="location" type="select" label="Location" options={["uk", "us"]} labels={["United Kingdom", "United States"]} />
			<UserClaimControl prop="birthday" type="date" label="Your Birthday"/>
			<UserClaimControl prop="gender" type="select" label="Your Gender (Optional)" options={["male", "female", "others", "nottosay"]} labels={["Male", "Female", "Others", "Preferred not to say"]} />

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
