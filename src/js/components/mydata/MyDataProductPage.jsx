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
import TickerTotal from '../TickerTotal';
import MyDataBadge from './MyDataBadge';
import BG from '../../base/components/BG';


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

    return <div className="control-your-data bg-gl-lighter-blue">
        <img src="/img/curves/curve-desat-blue.svg" className="w-100"/>
        <div className="bg-gl-desat-blue">
            <br/>
            <h3>Control your data</h3>
            <p>You have control over how your data is used and can choose what to make private and what to share</p>
            <img src="/img/mydata/product-page/phone-placeholder.svg" className="w-100"/>
        </div>
    </div>
};

const CommunityImpact = () => {

    return <div className="community-impact text-center">

        <div className="bubble-container">
            <img src="/img/mydata/product-page/photo-bubbles-data.png" className="photo-bubbles"/>
        </div>
        <br/>
        <h4 className="color-gl-dark-turquoise w-75 mx-auto">Add to our community impact with My.Data</h4>
        
        <div className="position-relative">
            <h1><TickerTotal noPennies/></h1>
            <img src="/img/homepage/Stars.png" className="stars stars-left"/>
            <img src="/img/homepage/Stars.png" className="stars stars-right"/>
            <img src="/img/homepage/Stars.png" className="stars stars-faded-left"/>
            <img src="/img/homepage/Stars.png" className="stars stars-faded-right"/>
        </div>

        <h4 className="color-gl-red">Funding global causes</h4>
        <p className="miniheader">Raised by our ads, tabs for good and My.Data</p>
    </div>
};

const HowItWorks = () => {

    const Section = ({i, title, subtitle, img, children}) => {

        return <BG src={"/img/mydata/product-page/blob-"+i+".svg"}>
            <br/>
            <img src={img} className="w-25 mb-2"/>
            <p className="miniheader mb-0">{i}. {title}</p>
            <h2>{subtitle}</h2>
            <br/>
            <p>
                {children}
            </p>
            <br/>
        </BG>;
    };

    return <div id="how-it-works">
        <div className="inner">
            <div className="control-your-data-small">
                <img src="/img/mydata/how-it-works.png" className="w-75"/>
                <br/>
                <h4>Control your data</h4>
                <p>Do good for free</p>
            </div>

            <h1>Here's how it works:</h1>

            <Section i={1} title="Heading" subtitle="Key point" img="/img/mydata/padlock-careful.png">
                Couple of lines of extra info.
                <br/>
                Couple of lines of extra info.
            </Section>

            <Section i={2} title="Heading" subtitle="Key point" img="/img/mydata/onboarding-3.png">
                Couple of lines of extra info.
                <br/>
                Couple of lines of extra info.
            </Section>

            <Section i={3} title="Heading" subtitle="Key point" img="/img/mydata/profile-created.png">
                Couple of lines of extra info.
                <br/>
                Couple of lines of extra info.
            </Section>

            <MyDataSignUpButton/>
            <br/>
        </div>
    </div>;
};

const EarnDataBadge = () => {

    return <div className="earn-data-badge p-3">
        <h4>Earn your data badge</h4>
        <p className="miniheader">It's quick and easy to start supporting the charity of your choice with your data!</p>
        <img src="/img/mydata/product-page/earn-badge.png" className="w-100"/>
        <br/>
        <br/>
        <div className="d-flex flex-row justify-content-center align-items-center">
            <MyDataSignUpButton/>
        </div>
        <br/>
    </div>
}

const MyDataProductPage = () => {

	useEffect(() => {
		setFooterClassName('bg-gl-pale-orange');
	}, []);

	return (<>
		<LandingSection/>
        <br/>
        <br/>
        <div className="blue-gradient">
            <CommunityImpact/>
            <br/>
            <br/>
            <HowItWorks/>
        </div>
        <ControlYourData/>
        <EarnDataBadge/>
        <MyDataSignUpModal/>
		{/*<TriCards />*/}
	</>);
};

export default MyDataProductPage;
