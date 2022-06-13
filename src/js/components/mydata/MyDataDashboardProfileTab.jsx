import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Collapse, FormGroup, Progress } from 'reactstrap';
import { Help } from '../../base/components/PropControl';
import { CollapseableCard, isEmail } from './MyDataCommonComponents';
import UserClaimControl, { getCharityObject, getEmail, causesMap, adstypeMap, setPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import CharityLogo from '../CharityLogo';
import { MyDataCard } from './MyDataCommonComponents';
import { countryListAlpha2 } from '../../base/data/CountryRegion';
import PropControl from '../../base/components/PropControl';
import { hasRegisteredForMyData } from './MyDataCommonComponents';
import { getDataProgress } from './MyDataDashboardPage';
import { toTitleCase } from '../../base/utils/miscutils';
import Claim, { DEFAULT_CONSENT } from '../../base/data/Claim';
import { getPVClaim } from '../../base/data/Person';
import Login from '../../base/youagain';
import { modifyPage } from '../../base/plumbing/glrouter';
import { CompleteDataCTA } from './MyDataDashboardPage';
import C from '../../C';
// Prase list of strings into individual spans if the input is a list of strings
const parseList = (value) => {
	const valueMap = {...causesMap, ...adstypeMap};

	if (!value) return null;
	if (typeof value === 'string' && !value.startsWith('[') && !value.endsWith(']')) return <span>{value}</span>;
	try {
		const value2 = JSON.parse(value);
		if (Array.isArray(value2)) {
			return value2.map((item, i) => <span key={i}>{valueMap[item]}</span>);
		}
		return null;
	} catch (e) {
		console.error("Error while parsing user claim value:", e);
		return null;
	}
}


const HowItWordsGuide = () => {

	const PrivacyCard = ({ iconIMG, title, content }) => {
		const [smallCardCollapse, setSmallCardCollapse] = useState(false);
		const smallCardToggle = () => setSmallCardCollapse(!smallCardCollapse);

		return (<div className="text-center privacy-card" onClick={smallCardToggle}>
			<hr />
			<img src={iconIMG} className="logo mb-3" />
			<h5>{title}</h5>
			<span><img style={{width:"2rem",height:"2rem"}} src={"img/mydata/arrow-"+(smallCardCollapse ? "down" : "up")+".svg"} /></span>
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
				<img src="img/mydata/how-it-works.png" className='w-50' />
				<p className='text-white font-weight-bold mb-0 d-flex justify-content-center align-items-end'>
					HOW IT WORKS <img style={{width:"2rem",height:"2rem"}} src={"img/mydata/arrow-"+(cardCollapse ? "down" : "up")+"-white.svg"} />
				</p>
			</div>
			<Collapse isOpen={cardCollapse} className="how-it-works-overview text-center">
				<h1 className='pt-3'>You're in Control</h1>
				<p>All of your data is in your hands, so you control how we use it.</p>
				<PrivacyCard iconIMG="img/mydata/padlock-careful.png" title="Careful Use"
					content="To put it simply, we won’t share your data and your identity will be kept private. Instead, we’ll show you advertising campaigns based on your interests on My-Good-Loop and via our online partners. By letting us show you these ads, you will raise money for your chosen charity." />
				<PrivacyCard iconIMG="img/mydata/padlock-public.png" title="Shared"
					content="This means our data can be shared with selected partners in return for donations to your chosen charity, allowing you to raise the most money possible. Of course, you can stop sharing your data at any time and we will make sure our partners remove it from their databases." />
				<PrivacyCard iconIMG="img/mydata/padlock-private.png" title="Private"
					content="This means your data will not be shared or used to raise money for charity. We will only use it to display your info within My.Data." />
			</Collapse>
		</div>
	</Container>)
};

const SupportingCard = () => {
	const pvNgo = getCharityObject();
	let ngo = null;
	if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

	return (<Container className='text-center'>
		<hr/>
		<h1>Your Profile</h1>

		{ngo 
			? <>
				<p style={{color:'#3F7991',fontWeight:'bold'}}>Your Data is Supporting</p>
				{ngo && <CharityLogo className='mb-3' charity={ngo} />}
				<DataSharedProgressBar />
			  </>
			: <>
				<CompleteDataCTA ngo={ngo} link={<C.A href="/account?tab=tabsForGood"><p className="leader-text m-0">Get started by selecting the charity you'd like to support</p></C.A>} />
			  </>		
		}	
		
		<hr/>
	</Container>)
}

const DataSharedProgressBar = () => {
	const sharedPercentage = getDataProgress();

	return (<div className='data-shared-progress-section'>
		<Progress className="data-shared-progress" value={100*sharedPercentage} title="How complete is your profile? Fill in and use more data to achieve more." />
		{sharedPercentage > 0 && <img src='img/icons/Heart_single.png' className='progress-heart' style={{left:`${100*sharedPercentage}%`, minHeight: "120%"}}/>}
		</div>
	)
}

const CollapseSettings = ({ children, title, ...props }) => {

	let progress = null;
	switch (title) {
		case "Personal Info":
			progress = getDataProgress(["name", "dob"]);
			break;
		case "Demographic Details":
			progress = getDataProgress(["age-approx", "gender", "country", "location-region"]);
			break;
		case "Your interests":
			progress = getDataProgress(["causes", "adstype"]);
		default:
			break;
	}

	const fullTick = () => {
		if (progress >= 1) return true;
		else return false;
	}

	const tickTitle = <><img style={{height:'2rem'}} src={"img/mydata/circle-"+(fullTick() ? "tick.svg" : "no-tick.svg")} /> {title}</>;

	return <CollapseableCard title={tickTitle} {...props}>
		{children}
	</CollapseableCard>;
}

/**
 * ?? How does this overlap with the questions during sign-up??
 * @param {Object} p
 * @returns 
 */
const SettingItem = ({ description, itemKey, type = "text", ...props }) => {
	let pvClaim = getPVClaim({key: itemKey});
	let itemValue = Claim.value(pvClaim);
	let emailPropControl;
	if (itemKey == 'email') { // Not allow user to change email
		itemValue = getEmail();
		emailPropControl = <>{itemValue && <FormGroup style={{ position: 'relative' }}>
			<input type="text" name='email' className='form-control' value={itemValue || ''} readOnly />
			<Help style={{ position: 'absolute', right: '.6rem', top: '.6rem' }}>Email is set from your login. Let us know if you need to change it by contacting support@good-loop.com.</Help>
		</FormGroup>}</>
	}

	const [editMode, setEditMode] = useState(false);
	const editModeToggle = () => setEditMode(!editMode);
	// Privacy Levels
	const privacyOptions = ["careful", "private","public"]; // NB: see Consents.java 
	const privacyLabels = ["Careful Use", "Private","Shared"]; // NB: see Consents.java 
	let privacyLevel = Claim.consent(pvClaim.value) || "careful"; // default to careful, set first label as careful to match
	if (privacyLevel===DEFAULT_CONSENT || privacyLevel==="controller") privacyLevel = "careful";
	const privacyLabel = privacyLabels[privacyOptions.indexOf(privacyLevel)] || "Other";

	// HACK adjust some of the display for niceness
	let displayValue = itemValue;
	if (displayValue === "[]") displayValue = null; // Catch empty array
	if (itemKey == 'gender' && itemValue) displayValue = toTitleCase(itemValue);
	else if (itemKey == 'country' && itemValue) displayValue = countryListAlpha2[itemValue];
	let valueExists = displayValue;

	// Show adtypes / causes as pills - but only these.
	if (!editMode) {
		if (displayValue) {
			console.log("ATTEMPTING TO PARSE LIST:",displayValue);
			displayValue = parseList(displayValue);
		}
		else 
			displayValue = <a onClick={editModeToggle}>Add+</a>;
		
		if (itemKey == "adstype" || itemKey == "causes") 
			displayValue = <><div className="pill-container">{displayValue}</div></>
	}


	return (<>
		{/* HACK - Avoid bug with Collapse and hr */}
		<div style={{ height: '1px' }}></div>
		<hr />
		<div className="d-flex justify-content-between">
			<span style={{ fontSize: '.8rem', textTransform: 'uppercase' }}>{description}</span>
			<a onClick={editModeToggle}><span style={{ fontSize: '.8rem' }} className='pb-3 pl-3'>{editMode ? 'DONE' : 'EDIT'}</span></a>
		</div>
		{!editMode && <>
			{displayValue}
			<div className="d-flex justify-content-between align-items-center">
				<span className='text-muted' style={{ fontSize: '.8rem' }}>{privacyLabel}</span>
				<img style={{ height: '1.5rem', transform: 'translate(0, -.5rem)' }} src={"/img/mydata/padlock-"+privacyLevel+ ".png"} alt="padlock logo" />
			</div>
		</>}
		{editMode && <>
			{emailPropControl}
			<UserClaimControl prop={itemKey} type={type} {...props} privacyOptions={privacyOptions} privacyLabels={privacyLabels} privacyDefault="careful" privacyOnly={!!emailPropControl}/>
		</>}
	</>)
} // ./SettingItem


const DataProfile = () => {

	const email = getEmail();

	useEffect(() => {
		if (email) {
			// Add email as a claim - it is uneditable, but it can store a privacy value
			let pvClaim = getPVClaim({key: "email"});
			let itemValue = Claim.value(pvClaim);
			if (pvClaim.resolved && !itemValue) {
				setPersonSetting({key:"email", value:email})
			}
		}
	}, [email]);

	// NB see https://www.pickfu.com/demographic-segmentation
	return (<Container>
		<CollapseSettings title="Personal Info" headerIMG="img/mydata/profile-personal.png" defaultCollapse={true}>
			<SettingItem description="Your name" itemKey="name" />
			<SettingItem description="Your email" itemKey="email" />
			<SettingItem description="Your date of birth" itemKey="dob" type="date" />
		</CollapseSettings>

		<CollapseSettings title="Demographic Details" headerIMG="img/mydata/profile-demographic.png" >
			<SettingItem description="Approximate age" itemKey="age-approx" type="select"
				options={["Under 13", "Under 18", "18 to 24", "25 to 34", "35 to 44", "45 to 54", "55 to 64", "65 and older"]} />
			<SettingItem description="Your gender" itemKey="gender" type="gender" />
			<SettingItem description="Your country" itemKey="country" type="country" />
			<SettingItem description="Your city or region" itemKey="location-region" />
		</CollapseSettings>

		<CollapseSettings title="Your interests" headerIMG="img/mydata/profile-interests.png" >
			<SettingItem description="Causes you're interested in" itemKey="causes" type="checkboxes" />
			<SettingItem description="Types of Ads you'd prefer to see" itemKey="adstype" type="checkboxes" />
		</CollapseSettings>

		{false && <CollapseSettings title="Connect your social accounts" headerIMG="img/mydata/profile-social.png">
			TODO
		</CollapseSettings>}
	</Container>)
}

const MyDataDashboardProfileTab = () => {
	// Redirect to the home tab is they haven't yet signed up for MyData
	if (!hasRegisteredForMyData()) {
		modifyPage(["account"], {tab:"dashboard"});
		return null;
	}

	return (<>
		<br/>
		<HowItWordsGuide />
		<SupportingCard />
		<DataProfile />
	</>)
}

export default MyDataDashboardProfileTab;