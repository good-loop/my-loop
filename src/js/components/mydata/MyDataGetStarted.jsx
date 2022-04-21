import React from 'react';
import { Button } from 'reactstrap';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { Steps } from './MyDataCommonComponents';
import { nextSignupPage } from './MyDataSignUp';

const MyDataGetStarted = () => {

    const cid = getPersonSetting({key:"charity"});
    let pvCharity = getDataItem({ type: 'NGO', id: cid });
    if (!pvCharity.resolved) {
        return null;
    }
    const ngo = pvCharity.value;

    const steps = [
        <>
            <p>You selected</p>
            <CharityLogo charity={ngo} className="w-100"/>
        </>,
        "Build your profile",
        <>
            <p>Ready to help</p>
            <CharityLogo charity={ngo} className="w-100"/>
        </>
    ];

    return <>
        <Steps step={1} steps={steps}/>
        <NGOImage main bg className="circle w-100" ratio={100} ngo={ngo}/>
        <h1>Nice Choice!</h1>
        <p className="leader-text">We'll help you build your profile so you can start raising money for {NGO.displayName(ngo)} with your data</p>
        <div className="d-flex flex-row align-items-center justify-content-center">
            <Button color="primary" onClick={nextSignupPage}>Build your profile</Button>
        </div>
        <br/>
        <br/>
    </>;

};

export default MyDataGetStarted;
