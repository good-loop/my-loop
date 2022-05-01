import React, { useState } from 'react';
import { Container, Row, Col, Collapse, FormGroup, Progress } from 'reactstrap';
import { Help } from '../../base/components/PropControl';
import { isEmail } from './MyDataCommonComponents';
import UserClaimControl, { getCharityObject, getEmail, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import CharityLogo from '../CharityLogo';
import { MyDataCard } from './MyDataCommonComponents';
import { countryListAlpha2 } from '../../base/data/CountryRegion';
import PropControl from '../../base/components/PropControl';
import { getDataProgress } from './MyDataDashboard';

const HowItWordsGuide = () => {

	const PrivacyCard = ({iconIMG, title, content}) => {
		const [smallCardCollapse, setSmallCardCollapse] = useState(false);
		const smallCardToggle = () => setSmallCardCollapse(!smallCardCollapse);

		return (<div className="text-center privacy-card" onClick={smallCardToggle}>
			<hr/>
			<img src={iconIMG} className="logo mb-3" />
			<h5>{title}</h5>
			<span>{smallCardCollapse ? '˄' : '˅'}</span>
			<Collapse isOpen={smallCardCollapse}>
				<div className="small-card-content text-left p-3">{content}</div>
			</Collapse>
		</div>)
	}

	const [cardCollapse, setCardCollapse] = useState(false);
	const cardToggle = () => setCardCollapse(!cardCollapse);

	return (<Container>
		<div className="how-it-works-card">
			<div className="how-it-works-header text-center" onClick={cardToggle}>
				<img src="img/mydata/onboarding-1.png" className='w-50' />
				<p className='text-white font-weight-bold mb-0'>HOW IT WORKS {cardCollapse ? '˄' : '˅'}</p>
			</div>
				<Collapse isOpen={cardCollapse} className="how-it-works-overview text-center">
					<h2 className='pt-3'>You're in Control</h2>
					<p>For Every Piece Of Data You've Shared With Us, You Can Control How It's Used.</p>
					<PrivacyCard iconIMG="img/mydata/padlock-careful.png" title="Careful Use" 
					content="The data will not be shared. It will be used to select advertising campaigns, both within My.Good-Loop and via partners elsewhere on the internest - and this will rasied moeny for your charity. This data will be anonymous - your identity will be kept private." />
					<PrivacyCard iconIMG="img/mydata/padlock-shared.png" title="Shared" 
					content="The data can be shared with selected partners in return for donations to charity. This setting lets us raise the most money for your charity! You have the right to stop sharing any time. Any partners with a copy of this data would be contractually obliged to remove it at your request."/>
					<PrivacyCard iconIMG="img/mydata/padlock-private.png" title="Private" 
					content="This data will not be shared or used at all, except for displaying information to you wihtin MyData itself." />
				</Collapse>
		</div>
	</Container>)
};

const SupportingCard = () => {
	const pvNgo = getCharityObject();
	let ngo = null;
	if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

	return (<Container className='text-center'>
		<h5>Your Data is Supporting</h5>
		{ngo && <CharityLogo charity={ngo} />}
	</Container>)
}

const DataSharedProgressBar = () => {
	const sharedPercentage = getDataProgress();

	return  (
		<Progress className="data-shared-progress" value={sharedPercentage} />
	)
}

const CollapseSettings = ({title, defaultCollapse, headerIMG, children}) => {
	if (!defaultCollapse) defaultCollapse = false;
	const [settingsOpen, setSettingsOpen] = useState(defaultCollapse);
	const settingsToggle = () => setSettingsOpen(!settingsOpen);

	return (
	<MyDataCard
		className="my-3"
		img={headerIMG}
		>
			<a onClick={settingsToggle}> <div className="d-flex justify-content-between align-items-center">
				<h5>✓ {title}</h5> <span className='text-muted' style={{fontSize:'1.5rem'}}>{settingsOpen ? '˄' : '˅'}</span>
			</div></a>
			<Collapse isOpen={settingsOpen}>
				{children}
			</Collapse>
	</MyDataCard>)
}

/**
 * ?? How does this overlap with the questions during sign-up??
 * @param {Object} p
 * @returns 
 */
const SettingItem = ({description, itemKey, type, emailPropControl, ...props}) => {
	let itemValue = getPersonSetting({key: itemKey});
	if (itemKey == 'email') { // Not allow user to change email
		itemValue = getEmail();
		emailPropControl = <>{itemValue && <FormGroup style={{position:'relative'}}>
			<input type="text" name='email' className='form-control' value={itemValue || ''} readOnly/>
			<Help style={{position:'absolute',right:'.6rem',top:'.6rem'}}>Email is set from your login. Let us know if you need to change it by contacting support@good-loop.com.</Help>
			</FormGroup>}</>
	} else if (itemKey == 'location-country') {
		itemValue = countryListAlpha2[itemValue];
	}

	if (itemKey == 'gender' && itemValue) itemValue = itemValue.charAt(0).toUpperCase() + itemValue.slice(1);
	
	// Privacy Levels
	const privacyLevelMap = {"0": "Private Data", "1": "Default Privacy", "2": "Public Data"};
	const privacyLockMap = {"Private Data": "private", "Default Privacy": "careful", "Public Data": "shared"};
	const privacyKey = itemKey + '-privacy';
	const privacyLevel = privacyLevelMap[getPersonSetting({key: privacyKey})] || 'Default Privacy'; // No privacy level = default level;

	if (!type) type = 'text';

	const [editMode, setEditMode] = useState(false);

	const editModeToggle = () => setEditMode(!editMode);

	return(<>
	{/* HACK - Avoid bug with Collapse and hr */}
	<div style={{height:'1px'}}></div>
	<hr />
	<div className="d-flex justify-content-between">
		<span style={{fontSize:'.8rem',textTransform:'uppercase'}}>{description}</span>
		<a onClick={editModeToggle}><span style={{fontSize:'.8rem'}} className='pb-3 pl-3'>{editMode ? 'DONE' : 'EDIT'}</span></a>
	</div>

	{!editMode ? (itemValue ? <span>{itemValue}</span> : <a onClick={editModeToggle}>Add+</a>) : 
	(emailPropControl ? emailPropControl : <UserClaimControl prop={itemKey} type={type} {...props} />)
	}

	{!editMode && 
	<div className="d-flex justify-content-between align-items-center">
		<span className='text-muted' style={{fontSize:'.8rem'}}>{privacyLevel}</span>
		<img style={{height:'1.5rem',transform:'translate(0, -.5rem)'}} src={"/img/mydata/padlock-"+privacyLockMap[privacyLevel]+".png"} alt="" />
	</div>
	}

	<Collapse isOpen={editMode}>
		<UserClaimControl prop={privacyKey} type="privacylevel" label="Privacy Level" labelStyle={{fontSize:'.8rem',textTransform:'uppercase'}} {...props} />
	</Collapse>
 
	</>)
} // ./SettingItem


const DataProfile = () => {

	return (<Container>
		<DataSharedProgressBar />
		<CollapseSettings title="Personal Info" headerIMG="img/mydata/profile-personal.png" defaultCollapse={true}>
			<SettingItem description="Your name" itemKey="name"/>
			<SettingItem description="Your email" itemKey="email"/>
			<SettingItem description="Your date of birth" itemKey="birthday" type="date"/>
			<SettingItem description="Your gender" itemKey="gender" type="gender" />
		</CollapseSettings>

		<CollapseSettings title="Demographic Details" headerIMG="img/mydata/profile-demographic.png" >
			<SettingItem description="Your country" itemKey="country" type="country" />
			<SettingItem description="Your city or region" itemKey="location-region"/>
		</CollapseSettings>

		<CollapseSettings title="Your interests" headerIMG="img/mydata/profile-interests.png" >
			<SettingItem description="Causes you're interested in" itemKey="causes"/>
			<SettingItem description="Types of Ads you'd like to see" itemKey="adstype"/>
		</CollapseSettings>

		<CollapseSettings title="Connect your social accounts" headerIMG="img/mydata/profile-social.png">
			TODO
		</CollapseSettings>
</Container>)
}

const DashboardProfile = () => {

	return (<>
		<HowItWordsGuide />
		<SupportingCard />
		<DataProfile />
	</>)
}

export default DashboardProfile;