import React, {useState} from 'react';
import { Container, Col, Row, Button } from 'reactstrap';
import BG from '../../base/components/BG';
import NGODescription from '../../base/components/NGODescription';
import CharityLogo from '../CharityLogo';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { savePersonSettings, setPersonSetting } from './MyDataUtil';
import { assert } from '../../base/utils/assert';
import Login from '../../base/youagain';
import NGO from '../../base/data/NGO';
import { getId } from '../../base/data/DataClass';
import { space } from '../../base/utils/miscutils';

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

    const [showInfo, setShowInfo] = useState(false);

    const onMoreInfo = e => {
        e.preventDefault();
        setShowInfo(!showInfo);
    }

    return <div className="charity-card">
        <NGOImage bg main ratio={50} center className="w-100 position-relative" ngo={ngo}>
            <a className="more-info-btn" onClick={onMoreInfo}>?</a>
            {showInfo && <div className="more-info">
                <NGODescription extended ngo={ngo}/>
                {ngo.url && <a href={ngo.url}>Go to charity website</a>}
            </div>}
        </NGOImage>
        <CharityLogo charity={ngo}/>
        <NGODescription summarize ngo={ngo} />
        <Button color="secondary" onClick={onClick}>Select</Button>
    </div>

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
            {steps.map((e, i) => <StepCircle idx={i} active={step} key={e}/>)}
        </div>
        <div className="step-labels d-flex flex-row justify-content-between align-items-start">
            {steps.map((e, i) => <StepLabel idx={i} key={e}/>)}
        </div>
    </div>)
}
