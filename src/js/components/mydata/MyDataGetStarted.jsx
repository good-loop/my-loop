import React from 'react';
import { Button } from 'reactstrap';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { ProfileCreationSteps, Steps } from './MyDataCommonComponents';
import { nextSignupPage } from './MyDataSignUp';

const MyDataGetStarted = () => {

    const pvNgo = getCharityObject();
    let ngo = null;
    if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

    return <>
        <ProfileCreationSteps step={0}/>
        {ngo && <NGOImage main bg className="circle w-100 mb-4" ratio={100} ngo={ngo}/>}
        <h1 className="mb-4">Nice Choice!</h1>
        <p className="leader-text m-0 text-center mb-4">We'll help you build your profile so you can start raising money for {NGO.displayName(ngo)} with your data</p>
        <div className="d-flex flex-row align-items-center justify-content-center">
            <Button color="primary" onClick={nextSignupPage}>Build your profile</Button>
        </div>
        <br/>
        <br/>
    </>;

};

export default MyDataGetStarted;
