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
import { CollapseableCard } from './MyDataCommonComponents';


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
        <p>How many cookies have you accepted today? We give our data away all the time without even thinking about it. What if we could safely use our data to help fund good causes?</p>
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
            <img src="/img/mydata/product-page/phone-mydata.png" className="w-100"/>
        </div>
    </div>
};

const BubblesHeader = ({src, className}) => {
    return <div className={space("bubble-container", className)}>
        <img src={src} className="photo-bubbles"/>
    </div>;
};

const CommunityImpact = () => {

    return <div className="community-impact text-center">

        <BubblesHeader src="/img/mydata/product-page/photo-bubbles-data.png"/>

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
        <h5 className="miniheader">Raised by our ads, tabs for good and My.Data</h5>
    </div>
};

const HowItWorks = () => {

    const Section = ({i, title, subtitle, img, imgClassName, children}) => {

        return <BG src={"/img/mydata/product-page/blob-"+i+".svg"} center className="how-it-works-section">
            <br/>
            <img src={img} className={space("mb-2", imgClassName)}/>
            <p className="miniheader mb-0">{title}</p>
            <h2>{subtitle}</h2>
            <div className="px-3">
            {children}
            </div>
            {/* Extra whitespace padding at bottom, to make sure BG image stretches enough to cover text */}
            <br/>
            <br/>
            <br/>
        </BG>;
    };

    return <div id="how-it-works">
        <div className="inner">
            <div className="control-your-data-small">
                <img src="/img/mydata/how-it-works.png" className="w-75"/>
                <br/>
                <h4>Control your data</h4>
                <p className="miniheader">Do good for free</p>
                <p className="px-2">It feels like our data is everywhere these days but at Good-Loop we believe we should all control our own data. By running ads with global brands, we've also learnt just how valuable consumer data is to advertisers. We've decided to unite these concepts to do good…</p>
                <img src="/img/homepage/Stars.png" className="star mx-auto"/>
            </div>

            <h1>Here's how it works:</h1>
            <br/>

            <Section i={1} title="Your data in your hands" subtitle="Sign up securely" img="/img/mydata/padlock-careful.png" imgClassName="w-25">
                <img src="/img/mydata/product-page/bubble-kids.png" className="bubble bubble-right"/>
                <p>
                    Pick a charity you want to help and build a secure profile with us, selecting what data you want to provide.
                </p>
            </Section>
            <br/>
            <Section i={2} title="Turning your data into donations" subtitle="Harness your data" img="/img/mydata/onboarding-3.png" imgClassName="w-75">
                <img src="/img/mydata/product-page/bubble-chameleon.png" className="bubble bubble-left"/>
                <p>
                    We channel relevant online adverts based on your info, and 50% of the advert fee goes to your chosen charity.
                </p>
            </Section>
            <br/>
            <Section i={3} title="Your in control" subtitle="Share to give" img="/img/mydata/profile-created.png" imgClassName="w-50">
                <img src="/img/mydata/product-page/bubble-ocean.png" className="bubble bubble-right"/>
                <p>
                    The more data you choose to share, the more valuable it is to advertisers and the more you can raise for your charity!
                </p>
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
};

const TransformYourData = () => {
    
    return <div className="transform-your-data">
        <div className="px-3">
            <h3 className="text-left">Transforming your data into charity donations</h3>
            <p className="miniheader mb-0">Your questions answered</p>
        </div>
        <BubblesHeader src="/img/mydata/product-page/photo-bubbles-data-two.png"/>
        <div className="overlap-up">
            <img src="/img/curves/curve-desat-blue.svg" className="w-100"/>
            <div className="faqs bg-gl-desat-blue">
                <img src="/img/homepage/Stars.png" className="stars star-top"/>
                <div className="inner px-3">
                    
                    <br/>
                    <br/>
                    <p className="miniheader">FAQS</p>
                    
                    <CollapseableCard
                        title="1. What charities can I support with My Data?"
                        TitleTag="h1" className="w-100 faq faq-1"
                        innerClassName="text-left" arrowPosition="bottom">
                        <br/>
                        <ul>
                            <li>
                                <b>You can choose any charity that's registered and regulated in the UK.</b>
                            </li>
                            <li>
                                We will be expanding this to include American 501(c) organisations soon.
                            </li>
                            <li>
                                Meanwhile: If you can't find your charity - please drop us an email and we'll add it for you.
                            </li>
                        </ul>

                        <div className="d-flex flex-row justify-content-center align-items-center">
                            <a className="text-center" href="https://app.sogive.org" target="_blank">View our charity database →</a>
                        </div>
                    </CollapseableCard>

                    <CollapseableCard
                        title="2. How does My Data make money for my charity?"
                        TitleTag="h1" className="w-100 faq faq-2"
                        innerClassName="text-left" arrowPosition="bottom">
                        <br/>
                        <ul>
                            <li>
                                Most adverts are wasted - shown to the wrong person. Based on your information (but keeping it private), we can select adverts that match your profile.
                            </li>
                            <li>
                                <b>Because relevant ads are less wasteful, the advertiser will pay more. That extra money is how My Data raises money for your charity</b>
                            </li>
                        </ul>
                    </CollapseableCard>

                    <CollapseableCard
                        title="3. How do I control my data privacy?"
                        TitleTag="h1" className="w-100 faq faq-3"
                        innerClassName="text-left" arrowPosition="bottom">
                        <br/>
                        <ul>
                            <li>
                                <b>You are always in control here and can select your desired level of privacy for each piece of data you share with us. You can explore your profile any time, and asjust which bits of your info can and cannot be used.</b>
                            </li>
                            <li>
                                By default, we will not share or sell your data. We will use it carefully to help route relevant adverts your way - turning the extra payments from advertisers into charity funding.
                            </li>
                            <li>
                                If you want to maximise the money raised, you can choose to switch on data-sharing permissions for some of your info. We can then sell those bits of data on your behalf to raise extra donations.
                            </li>
                        </ul>
                    </CollapseableCard>
                </div>
                <br/>
                <div className="d-flex flex-row justify-content-center align-items-center">
                    <MyDataSignUpButton/>
                </div>
                <br/>
            </div>
        </div>
    </div>;
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
        <TransformYourData/>

        <MyDataSignUpModal/>
		{/*<TriCards />*/}
	</>);
};

export default MyDataProductPage;
