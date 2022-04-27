import React from 'react';
import { Button } from 'reactstrap';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { Steps } from './MyDataCommonComponents';
import { nextSignupPage } from './MyDataSignUp';

const MyDataGetStarted = () => {

    const pvNgo = getCharityObject();
    let ngo = null;
    if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

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
