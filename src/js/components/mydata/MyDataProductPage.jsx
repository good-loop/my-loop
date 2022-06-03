import React, { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { modifyPage } from '../../base/plumbing/glrouter';
import C from '../../C';
import { space, stopEvent, scrollTo } from '../../base/utils/miscutils';
import CharityLogo from '../CharityLogo';
import { setFooterClassName } from '../Footer';
import { T4GSignUpButton } from '../T4GSignUp';
import { WhatIsTabsForGood, HowTabsForGoodWorks, TabsForGoodSlideSection, CurvePageCard, MyLandingSection, PageCard, PositivePlaceSection, CornerHummingbird } from '../pages/CommonComponents';
import { MyDataSignUpButton, MyDataSignUpModal } from './MyDataSignUp';


const LandingSection = () => {

    const scroll = e => {
        stopEvent(e);
        scrollTo("how-it-works");
    }

    return <div className="landing">
        <div className="mydata-topimg">
            <img src="/img/curves/curve-white.svg" className="topimg-curve"/>
            <img src="/img/mydata/mydata-product-top.png" className="w-100 topimg-graphic"/>
        </div>
        <h1>My.Data</h1>
        <h3>Harness your data to fund your favourite charity. For free</h3>
        <br/>
        <p>How many cookies have you accepted today? We give our data away all the time without even thinking about it. What if we could use our data to help fund good causes?</p>
        <br/>
        <div className="d-flex flex-column justify-content-center align-items-center">
            <MyDataSignUpButton/>
            <br/>
            <a onClick={scroll}>Find out more</a>
        </div>
    </div>;
};

const ControlYourData = () => {
    
    return <div className="control-your-data">
        <img src="/img/mydata/how-it-works.png" className="w-75"/>
        <h4>Control your data</h4>
        <p>Do good for free</p>
    </div>;
};

const HowItWorks = () => {

    return <div id="how-it-works">
        <div className="inner">
            <h1>Here's how it works:</h1>

            <br/>
            <img src="/img/mydata/padlock-careful.png" className="w-25 mb-2"/>
            <p className="miniheader mb-0">1. Heading</p>
            <h2>Key point</h2>
            <br/>
            <p>
                Couple of lines of extra info.
                <br/>
                Couple of lines of extra info.
            </p>

            <br/>
            <img src="/img/mydata/onboarding-3.png" className="w-75 mb-2"/>
            <p className="miniheader mb-0">2. Heading</p>
            <h2>Key point</h2>
            <br/>
            <p>
                Couple of lines of extra info.
                <br/>
                Couple of lines of extra info.
            </p>

            <br/>
            <img src="/img/mydata/profile-created.png" className="w-50 mb-2"/>
            <p className="miniheader mb-0">3. Heading</p>
            <h2>Key point</h2>
            <br/>
            <p>
                Couple of lines of extra info.
                <br/>
                Couple of lines of extra info.
            </p>
        </div>
    </div>;
};

const MyDataProductPage = () => {

	useEffect(() => {
		setFooterClassName('bg-gl-pale-orange');
	}, []);

	return (<>
		<LandingSection/>
        <br/>
        <br/>
        <ControlYourData/>
        <br/>
        <HowItWorks/>
        <MyDataSignUpModal/>
		{/*<TriCards />*/}
	</>);
};

export default MyDataProductPage;
