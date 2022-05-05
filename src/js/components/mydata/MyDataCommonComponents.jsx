import React, {useState} from 'react';
import { Container, Col, Row, Button } from 'reactstrap';
import BG from '../../base/components/BG';
import NGODescription from '../../base/components/NGODescription';
import { Help } from '../../base/components/PropControl'; 
import CharityLogo from '../CharityLogo';
import { getDataItem, getDataList } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import UserClaimControl, { setPersonSetting, getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { assert, assMatch } from '../../base/utils/assert';
import Login from '../../base/youagain';
import NGO from '../../base/data/NGO';
import { getId } from '../../base/data/DataClass';
import { space } from '../../base/utils/miscutils';
import { nextSignupPage } from './MyDataSignUp';
import SearchQuery from '../../base/searchquery';
import { getDataLogData } from '../../base/plumbing/DataLog';
import KStatus from '../../base/data/KStatus';
import { getProfile } from '../../base/data/Person';


/**
 * A base component for the image, help, content card format that is common in MyData
 * @param {String|Component} img if string, will display automatically, but a custom component can be rendered instead
 * @param {String|Component} info to appear in the ? button popup. If not set, will not show the button.
 * @param {?String} className
 * @returns 
 */
export const MyDataCard = ({img, info, className, children}) => {
    //assMatch(img, "String|Function");
    let imgComponent = _.isString(img) && <BG src={img} className="w-100" ratio={30} center/>;
    if (!imgComponent) imgComponent = img; // && _.isFunction(img)) ImgComponent = img; 

    return <div className={space("mydata-card", className)}>
        {imgComponent}
        {info && <Help className="more-info-btn" icon="?" children={info} />}
        <div className="card-content">
            {children}
        </div>
    </div>
};


export const CharitySelectCard = ({cid, item}) => {
    let ngo = item;

    if (!ngo) {
        let pvCharity = getDataItem({ type: 'NGO', id: cid });
        if (!pvCharity.resolved) {
            return null;
        }
        ngo = pvCharity.value;
    }

    assert(getId(ngo), ngo);

    if (!cid) cid = getId(ngo);

    const onClick = () => {
        assert(Login.isLoggedIn());
        const pvPerson = getProfile();
        Person.setHasApp(pvPerson.value || pvPerson.interim, "my.data");
        setPersonSetting({key: "charity", value: cid, callback:nextSignupPage});
    }

    return <MyDataCard className="mydata-card charity-card"
                img={<NGOImage bg header ratio={30} center className="w-100" ngo={ngo} src="/img/mydata/charity-default.png" />}
                info={<NGODescription extended ngo={ngo}/>}
            >
        <CharityLogo charity={ngo}/>
        <NGODescription summarize ngo={ngo} />
        <div className="button-container">
            <Button color="primary" onClick={onClick}>Select</Button>
        </div>
    </MyDataCard>

};

/**
 * A circle steps progression widget
 * @param {Number} step
 * @param {Component[]} steps 
 * @returns 
 */
export const Steps = ({step, steps}) => {

    assert(steps);

    const StepCircle = ({idx, active}) => <>
        <div className={space("step-circle", active==idx && "step-circle-active", active > idx && "step-circle-completed")}/>
        {idx != steps.length - 1 && <div className={space("step-circle-connector", active > idx && "step-circle-connector-completed")} />}
    </>;

    const StepLabel = ({idx, active}) => <>
        <span className={space("step-label", active==idx && "step-label-active")}>{steps[idx]}</span>
        {idx != steps.length - 1 && <div className="step-label-spacer"/>}
    </>;

    return (<div className="steps-graphic">
        <div className="step-circles d-flex flex-row justify-content-between align-items-center">
            {steps.map((e, i) => <StepCircle idx={i} active={step} key={i}/>)}
        </div>
        <div className="step-labels d-flex flex-row justify-content-between align-items-start">
            {steps.map((e, i) => <StepLabel idx={i} active={step} key={i}/>)}
        </div>
    </div>)
};

/**
 * A specialized version of the Steps component, used in multiple cards
 * @param {Number} step 
 * @returns 
 */
export const ProfileCreationSteps = ({step}) => {
    const pvNgo = getCharityObject();
    let ngo = null;
    if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

    const steps = [
        <>
            <span>You selected</span>
            {ngo && <CharityLogo charity={ngo} className="charity-logo-sm"/>}
        </>,
        "Build your profile",
        <>
            <span>Ready to help</span>
            {ngo && <CharityLogo charity={ngo} className="charity-logo-sm"/>}
        </>
    ];

    return <Steps step={step} steps={steps}/>;
};

export const ProfileDotRow = ({className, children}) => {
    return <Row className={space(className, "align-items-stretch profile-dot-row")}>
        {children}
    </Row>
};

export const ProfileDot = ({className, imgUrl, children}) => {
    if (!imgUrl) imgUrl = "/img/mydata/supporting.png"
    const dotSize = '2rem';
    return (
        <Col md={4} className={space(className, 'd-flex align-items-center mb-3 mb-md-0')}>
            <img src={imgUrl} className="mr-2" style={{width:dotSize}}/>
            {children}
        </Col>
    )
};

export const SkipNextBtn = ({skip}) => {
    return (
        <Row className='my-3'>
            <Col xs={6}>
            </Col>
            <Col xs={6} className="d-flex align-items-center justify-content-around p-0">
                {skip && <a className='skip-btn' style={{textDecoration:'underline'}} onClick={nextSignupPage}>Skip</a>}
                <a className='btn btn-primary next-btn' onClick={nextSignupPage}>Next</a>
            </Col>
        </Row>
    )
}

/**
 * Check if a string is an email address
 * @param {String} email 
 * @returns {Boolean} true if it is an email address
 */
export const isEmail = (email) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
}


/**
 * Fetch the ad of the week from ScheduledContent (my.ads) in the Portal
 * Returns null while fetching the ID, then a promise value representing the ad
 * @returns {PromiseValue} advert
 */
 export const getThisWeeksAd = () => {
	// load ad from scheduledcontent
	// TODO filter by start, end
	let pvMyAds = getDataList({type:"ScheduledContent", status:KStatus.PUBLISHED, domain:ServerIO.PORTAL_ENDPOINT});		
	let schedcon = pvMyAds.value && List.first(pvMyAds.value);
	let adid = schedcon && schedcon.adid;

    if (!adid) return null;

    // Check ad exists as published
    let pvAd = getDataItem({type: "Advert", status: KStatus.PUBLISHED, swallow:true, id:adid});
    return pvAd;

    // if ( TODO ! adid) {
	// 	return <p>No ad available.</p>
	// }
	// query datalog for evt:minview vert:adid BUT need the adunit here to log your user id!
    //return adid;
}

/**
 * Check whether or not a user has watched the ad of the week.
 * NB: This currently returns true if an ad of the week isn't set - meaning the user will see the "you've already watched" screen
 * @param {String} adid 
 * @returns {Boolean}
 */
export const hasWatchedThisWeeksAd = (adid) => {
    if (!adid) {
        const pvAd = getThisWeeksAd();
        adid = pvAd && pvAd.resolved && pvAd.value && pvAd.value.id;
    }
    //const adid = id || getThisWeeksAd();
    //console.log("AD ID????", adid);
    if (!adid) return true;

	let sq = new SearchQuery("evt:minview");
	sq = SearchQuery.setProp(sq, "vert", adid);
	sq = SearchQuery.setProp(sq, "user", Login.getId());
	let q = sq.query;
	const pvData = getDataLogData({dataspace:"gl",q, start:"3 months ago",end:"now",name:"watched-this-weeks",});
	
    return !!(pvData.value && pvData.value.allCount);
}


export const hasRegisteredForMyData = () => {
	const pvPerson = getProfile();
	const hasMyData = Person.hasApp(pvPerson.value || pvPerson.interim, "my.data");
    console.log("HAS MY DATA??", hasMyData);

	return hasMyData;
};
