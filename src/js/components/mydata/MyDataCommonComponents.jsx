import React, {useState} from 'react';
import { Container, Col, Row, Button } from 'reactstrap';
import BG from '../../base/components/BG';
import NGODescription from '../../base/components/NGODescription';
import CharityLogo from '../CharityLogo';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { savePersonSettings, setPersonSetting } from './MyDataUtil';
import { assert, assMatch } from '../../base/utils/assert';
import Login from '../../base/youagain';
import NGO from '../../base/data/NGO';
import { getId } from '../../base/data/DataClass';
import { space } from '../../base/utils/miscutils';

/**
 * A base component for the image, help, content card format that is common in MyData
 * @param {String|Component} img if string, will display automatically, but a custom component can be rendered instead
 * @param {String|Component} info to appear in the ? button popup
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
        <a className="more-info-btn" onClick={onMoreInfo}>?</a>
        {showInfo && <div className="more-info">
            {info}
        </div>}
        <div className="card-content">
            {children}
        </div>
    </div>
};

export const CharityCard = ({cid, item, onSelect}) => {

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
        setPersonSetting("charity", cid);
        savePersonSettings();
        onSelect && onSelect();
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
