import React from 'react';
import { PERSON_PATH, VERB_PATH } from '../../base/components/LoginWidget';
import { MyDataCard, SkipNextBtn } from './MyDataCommonComponents';
import UserClaimControl, { getEmailProp } from '../../base/components/PropControls/UserClaimControl';

import { countryListAlpha2 } from '../../base/data/CountryRegion';

const DetailsCard = ({title, prop, options, labels, ...props}) => {
	const path = PERSON_PATH;
	const emailProp = getEmailProp();

	const countryMap = new Map(Object.entries(countryListAlpha2));
	let countryOptions = Array.from(countryMap.keys());
	let countryLabels = Array.from(countryMap.values());

	return <MyDataCard
			{...props}
	>
			<h2>{title}</h2>
			<hr/>
			<UserClaimControl prop="name" type="text" label="Your Name"/>
			{emailProp && <>{emailProp}</>}
			<UserClaimControl prop="location-country" type="select" label="Country" options={countryOptions} labels={countryLabels} />
			<UserClaimControl prop="location-region" type="text" label="Region"/>
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
