import React, { useState } from 'react';
import { Container, Row, Col, Collapse, FormGroup} from 'reactstrap';
import { Help } from '../../base/components/PropControl';
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
			<a onClick={settingsToggle}> <div className="d-flex justify-content-between align-items-center">
				<h5>✓ {title}</h5> <span className='text-muted' style={{fontSize:'1.5rem'}}>{settingsOpen ? '˄' : '˅'}</span>
			</div></a>
			<Collapse isOpen={settingsOpen}>
				{children}
			</Collapse>
	</MyDataCard>)
}

const SettingItem = ({description, itemKey, type, emailPropControl, ...props}) => {
	let itemValue = getPersonSetting({key: itemKey});
	if (itemKey == 'email') { // Not allow user to change email
		itemValue = getEmail();
		emailPropControl = <>{itemValue && <FormGroup>
			<label className='mr-1'>Your Email</label>
			<Help>Email is set from your login. Let us know if you need to change it by contacting support@good-loop.com.</Help>
			<input type="text" name='email' className='form-control' value={itemValue || ''} readOnly/>
			</FormGroup>}</>
	} else if (itemKey == 'location-country') {
		itemValue = countryListAlpha2[itemValue];
	} 
	
	// Privacy Levels
	let privacyLevelMap = {"0": "Private Data", "1": "Default Privacy", "2": "Public Data"};
	const privacyKey = itemKey + '-privacy';
	const privacyLevel = privacyLevelMap[getPersonSetting({key: privacyKey})] || 'Default Privacy'; // No privacy level = default level;

	if (!type) type = 'text';

	const [editMode, setEditMode] = useState(false);

	const editModeToggle = () => setEditMode(!editMode);

	return(<>
	<div style={{height:'1px'}}></div>
	<hr />
	<div className="d-flex justify-content-between">
		<span style={{fontSize:'.8rem',textTransform:'uppercase'}}>{description}</span>
		<a onClick={editModeToggle}><span style={{fontSize:'.8rem'}}>{editMode ? 'DONE' : 'EDIT'}</span></a>
	</div>

	{!editMode ? (itemValue ? <span>{itemValue}</span> : <a onClick={editModeToggle}>Add+</a>) : 
	(emailPropControl ? emailPropControl : <UserClaimControl prop={itemKey} type={type} {...props} />)
	}

	{!editMode && 
	<div className="d-flex justify-content-between align-items-center">
		<span className='text-muted' style={{fontSize:'.8rem'}}>{privacyLevel}</span>
		<div className="d-flex">
			<img style={{height:'1.5rem'}} src="/img/mydata/padlock-opened.png" alt="" />
			<img style={{height:'1.5rem'}} src="/img/mydata/padlock-mid.png" alt="" />
			<img style={{height:'1.5rem'}} src="/img/mydata/padlock-locked.png" alt="" />
		</div>
	</div>
	}

	<Collapse isOpen={editMode}>
		<UserClaimControl prop={privacyKey} type="privacylevel" label="Privacy Level" {...props} />
	</Collapse>
 
	</>)
}

const DataProfile = () => {

	return (<>
		<CollapseSettings title="Personal Info" >
			<SettingItem description="Your name" itemKey="name"/>
			<SettingItem description="Your email" itemKey="email"/>
			<SettingItem description="Your date of birth" itemKey="birthday" type="date"/>
			<SettingItem description="Your gender" itemKey="gender" type="gender" />
		</CollapseSettings>

		<CollapseSettings title="Demographic Details" >
			<SettingItem description="Your country" itemKey="location-country" type="country" />
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