import React, { useState } from 'react';
import { Container, Row, Col, Collapse} from 'reactstrap';
import { ProfileDot } from './MyDataCommonComponents';
import UserClaimControl, { getCharityObject, getEmail, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import CharityLogo from '../CharityLogo';
import { MyDataCard } from './MyDataCommonComponents';
import { countryListAlpha2 } from '../../base/data/CountryRegion';


const SupportingCard = () => {
	const pvNgo = getCharityObject();
    let ngo = null;
    if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

	return (<Container className='text-center'>
		<h5>Your Data is Supporting</h5>
		{ngo && <CharityLogo charity={ngo} />}
	</Container>)
}

const CollapseSettings = ({title, children}) => {
	const [settingsOpen, setSettingsOpen] = useState(false);
	const settingsToggle = () => setSettingsOpen(!settingsOpen);

	return (
	<MyDataCard
		className="my-3"
		img="https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/spring-flowers-1613759017.jpg?crop=0.669xw:1.00xh;0.0635xw,0&resize=640:*"
		>
			<a onClick={settingsToggle}><h5>✓ {title}</h5></a>
			<Collapse isOpen={settingsOpen}>
				{children}
			</Collapse>
	</MyDataCard>)
}

const SettingItem = ({description, itemKey}) => {
	let itemValue = getPersonSetting({key: itemKey});
	if (itemKey == 'email') {
		itemValue = getEmail();
	} else if (itemKey == 'location-country') {
		itemValue = countryListAlpha2[itemValue];
	}

	const [editMode, setEditMode] = useState(false);

	const editModeToggle = () => setEditMode(!editMode);

	return(<>
	<hr/>
	<div className="d-flex justify-content-between">
		<p style={{fontSize:'.8rem'}}>{description}</p>
		<a onClick={editModeToggle}>{editMode ? 'Done' : 'Edit'}</a>
	</div>
	{editMode ? <UserClaimControl prop={itemKey} type="text"/> : (itemValue ? itemValue : "Add+")}
	</>)
}

const DataProfile = () => {

	return (<>
		<CollapseSettings title="Personal Info" >
			<br/>
			<SettingItem description="Your name" itemKey="name"/>
			<SettingItem description="Your email" itemKey="email"/>
			<SettingItem description="Your date of birth" itemKey="birthday"/>
			<SettingItem description="Your gender" itemKey="gender"/>
		</CollapseSettings>

		<CollapseSettings title="Demographic Details" >
			<br/>
			<SettingItem description="Your country" itemKey="location-country"/>
			<SettingItem description="Your region" itemKey="location-region"/>
		</CollapseSettings>

		<CollapseSettings title="Your interests" >
			<SettingItem description="Causes you're interested in" itemKey="causes"/>
			<SettingItem description="Types of Ads you'd like to see" itemKey="adstype"/>
		</CollapseSettings>

		<CollapseSettings title="Connect your social accounts">
			TODO
		</CollapseSettings>
</>)
}

const DashboardProfile = () => {

	return (<>
		<SupportingCard />
		<DataProfile />
	</>)
}

export default DashboardProfile;