import React, {useState} from 'react';
import { Container, Col, Row, Button } from 'reactstrap';
import BG from '../../base/components/BG';
import NGODescription from '../../base/components/NGODescription';
import CharityLogo from '../CharityLogo';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import UserClaimControl, { setPersonSetting, getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { assert, assMatch } from '../../base/utils/assert';
import Login from '../../base/youagain';
import NGO from '../../base/data/NGO';
import { getId } from '../../base/data/DataClass';
import { space } from '../../base/utils/miscutils';
import { nextSignupPage } from './MyDataSignUp';

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

    const [showInfo, setShowInfo] = useState(false);

    const onMoreInfo = e => {
        e.preventDefault();
        setShowInfo(!showInfo);
    }

    return <div className={space("mydata-card", className)}>
        {imgComponent}
        {info && <a className="more-info-btn" onClick={onMoreInfo}>?</a>}
        {showInfo && <div className="more-info">
            {info}
        </div>}
        <div className="card-content">
            {children}
        </div>
    </div>
};

export const CharityCard = ({cid, item}) => {

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
        setPersonSetting({key: "charity", value: cid, callback:nextSignupPage});
    }

    return <MyDataCard
        className="charity-card"
        img = {<NGOImage bg main ratio={30} center className="w-100" ngo={ngo}/>}
        info={<NGODescription extended ngo={ngo}/>}
    >
        <CharityLogo charity={ngo}/>
        <NGODescription summarize ngo={ngo} />
        <Button color="secondary" onClick={onClick}>Select</Button>
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
        <div className={space("step-circle", active==idx && "step-circle-active")}/>
        {idx != steps.length - 1 && <div className="step-circle-connector"/>}
    </>;

    const StepLabel = ({idx}) => <>
        <span className="step-label">{steps[idx]}</span>
        {idx != steps.length - 1 && <div className="step-label-spacer"/>}
    </>;

    return (<div className="steps-graphic">
        <div className="step-circles d-flex flex-row justify-content-between align-items-center">
            {steps.map((e, i) => <StepCircle idx={i} active={step} key={i}/>)}
        </div>
        <div className="step-labels d-flex flex-row justify-content-between align-items-start">
            {steps.map((e, i) => <StepLabel idx={i} key={i}/>)}
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
            <p>You selected</p>
            {ngo && <CharityLogo charity={ngo} className="w-100"/>}
        </>,
        "Build your profile",
        <>
            <p>Ready to help</p>
            {ngo && <CharityLogo charity={ngo} className="w-100"/>}
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
    if (!imgUrl) imgUrl = "/img/placeholder-circle.png"
    return (
        <Col md={4} className={space(className, 'd-flex align-items-center mb-3 mb-md-0')}>
            <img src={imgUrl} style={{width:'2rem',height:'2rem',marginRight:'1rem'}} />
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