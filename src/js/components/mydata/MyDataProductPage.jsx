import React, { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem, setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { modifyPage } from '../../base/plumbing/glrouter';
import C from '../../C';
import { space, stopEvent, scrollTo, isPortraitMobile } from '../../base/utils/miscutils';
import { setFooterClassName } from '../Footer';
import { MyDataSignUpButton, MyDataSignUpModal } from './MyDataSignUp';
import TickerTotal from '../TickerTotal';
import BG from '../../base/components/BG';
import { CollapseableCard } from './MyDataCommonComponents';
import { LogoBanner } from '../pages/CommonComponents';

const ProductPageContainer = ({ className, children, ...props }) => <Container fluid="lg" className={space("product-container", className)} {...props}>{children}</Container>;

const LandingSection = () => {

  const scroll = e => {
    stopEvent(e);
    scrollTo("how-it-works");
  }

  return <div className="landing">
    <div className="mydata-topimg d-md-none">
      <img src="/img/curves/curve-white.svg" className="topimg-curve" />
      <img src="/img/mydata/product-page/onboarding.png" className="w-100 topimg-graphic" />
    </div>
    <div className="landing-contents">
      <Container fluid="lg" className='d-flex flex-column align-items-center'>
        <h1>My.Data</h1>
        <h3 className='my-3'>Harness your data to fund your favourite charity. For free</h3>
        <p className="subtext w-75">How many cookies have you accepted today? We give our data away all the time without even thinking about it. What if we could safely use our data to help fund good causes?</p>
        <MyDataSignUpButton className='my-3' />
        <a onClick={scroll} className="mb-3">Find out more</a>
        <img src="/img/mydata/product-page/left-coins-padlocks.png" className="padlocks padlock-left d-none d-md-inline-block" />
        <img src="/img/mydata/product-page/right-coins-padlocks.png" className="padlocks padlock-right d-none d-md-inline-block" />
      </Container>
    </div>
    <LogoBanner />
  </div>;
};

const BubblesHeader = ({ src, className }) => {
  return <div className={space("bubble-container", className)}>
    <img src={src} className="photo-bubbles" />
  </div>;
};

const CommunityImpact = () => {

  return <ProductPageContainer className="community-impact text-center">

    <BubblesHeader src="/img/mydata/product-page/photo-bubbles-data.png" className="d-md-none" />
    <BubblesHeader src="/img/mydata/product-page/lg-photo-bubbles-data.png" className="d-none d-md-inline-block" />

    <br />
    <h4 className="color-gl-dark-turquoise w-75 mx-auto">Add to our community impact with My.Data</h4>

    <div className="position-relative">
      <h1><TickerTotal noPennies /></h1>
      <img src="/img/homepage/Stars.png" className="stars stars-left" />
      <img src="/img/homepage/Stars.png" className="stars stars-right" />
      <img src="/img/homepage/Stars.png" className="stars stars-faded-left" />
      <img src="/img/homepage/Stars.png" className="stars stars-faded-right" />
    </div>

    <h4 className="color-gl-red">Funding global causes</h4>
    <h5 className="miniheader">Raised by our ads, tabs for good and My.Data</h5>
  </ProductPageContainer>
};

const HowItWorks = () => {

  const Sections = [
    {
      i: 1,
      title: "Your data in your hands",
      subtitle: "Sign Up Securely",
      img: "/img/mydata/padlock-careful.png",
      content: "Pick a charity you want to help and build a secure profile with us, selecting what data you want to provide."
    },
    {
      i: 2,
      title: "Turning your data into donations",
      subtitle: "Harness Your Data          ",
      img: "img/mydata/onboarding-3.png",
      content: "We channel relevant online adverts based on your info, and 50% of the advert fee goes to your chosen charity."
    },
    {
      i: 3,
      title: "You are in control",
      subtitle: "Share To Give",
      img: "img/mydata/profile-created.png",
      content: "The more data you choose to share, the more valuable it is to advertisers and the more you can raise for your charity!"
    },
  ]

  return <div id="how-it-works" className="mt-md-5">
    <ProductPageContainer className='position-relative'>
      <div className="inner">
        <div className="control-your-data-small">
          <img src="/img/mydata/how-it-works.png" className="padlocks" />
          <br />
          <h4>Control your data</h4>
          <p className="miniheader">Do good for free</p>
          <p className="px-2 subtext">It feels like our data is everywhere these days but at Good-Loop we believe we should all control our own data. By running ads with global brands, we've also learnt just how valuable consumer data is to advertisers. We've decided to unite these concepts to do good…</p>
          <img src="/img/homepage/Stars.png" className="star mx-auto" />
        </div>

        <h1 className='mb-3'>Here's how it works:</h1>

        <Row className='mx-1 d-flex justify-content-center mt-3 mb-5'>
          {Sections.map(({ i, title, subtitle, img, content }) => {
            return <Col key={i} xs={12} lg={4} className="position-relative" style={{ maxWidth: '400px' }} >
              <div className="position-absolute d-flex flex-column justify-content-center align-items-center"
                style={{ zIndex: 1, width: '75%', left: '50%', transform: 'translate(-50%,0)' }}>
                <img src={img} style={{ height: '80px' }} />
                <span className="miniheader">{title}</span>
                <h2 style={{ fontSize: '1.25rem' }}>{subtitle}</h2>
                <span className='mt-1'>{content}</span>
              </div>
              <img src={"img/mydata/product-page/blob-" + i + ".svg"} alt="blob" className='position-relative user-select-none'
                style={{ left: 0, top: 0, zIndex: 0, width: '370px', transform: 'translate(-50%,0)', left: '50%' }} />
            </Col>
          })}
        </Row>

        <MyDataSignUpButton className="align-self-center mb-5" style={{ zIndex: 1 }} />
      </div>
      <img className='position-absolute' style={{width:'200px', left:'-8em', top:'20em'}} src="/img/mydata/bubble-chameleon.png" />
      <img className='position-absolute' style={{width:'200px', right:'-8em', top:'-5em'}} src="/img/mydata/bubble-kids.png" />
      <img className='position-absolute' style={{width:'200px', right:'-8em', bottom:'4em'}} src="/img/mydata/bubble-ocean.png" />
    </ProductPageContainer>
  </div>;
};

const ControlYourData = () => {

  return <div className="control-your-data bg-gl-lighter-blue">
    <img src="/img/curves/curve-desat-blue.svg" className="w-100" />
    <div className="under-curve bg-gl-desat-blue color-gl-white">
      <ProductPageContainer>
        <Row className="flex-md-row-reverse">
          <Col md={6} className="d-flex flex-column justify-content-center align-items-center align-items-md-start px-md-5 text-md-left">
            <h3 className="color-gl-white">Control your data</h3>
            <p>You have control over how your data is used and can choose what to make private and what to share</p>
          </Col>
          <Col md={6}>
            <img src="/img/mydata/product-page/phone-mydata-lg.png" className="phone-display" />
          </Col>
        </Row>
      </ProductPageContainer>
    </div>
  </div>
};

const EarnDataBadge = () => {

  return <div className="earn-data-badge">
    <ProductPageContainer className="px-2">
      <h4 className="text-md-center align-self-start align-self-md-center">Earn your data badge</h4>
      <p className="miniheader text-md-center">It's quick and easy to start supporting the charity of your choice with your data!</p>
      <img src="/img/mydata/product-page/earn-badge.png" className="data-badge" />
      <br />
      <br />
      <div className="d-flex flex-row justify-content-center align-items-center">
        <MyDataSignUpButton />
      </div>
      <br />
    </ProductPageContainer>
    <br />
  </div>;
};

const TransformYourData = () => {

  return <div className="transform-your-data bg-gl-pale-orange">
    <br />
    <br />
    <ProductPageContainer className="px-3">
      <h3 className="text-left text-md-center">Transforming your data into charity donations</h3>
      <p className="miniheader mb-0 text-md-center">Your questions answered</p>
    </ProductPageContainer>
    <BubblesHeader src="/img/mydata/product-page/photo-bubbles-data-two.png" className="d-md-none" />
    <img src="/img/mydata/product-page/lg-photo-bubbles-data-two.png" className="bubbles-header-lg d-none d-md-inline-block" />
    <div className="overlap-up">
      <img src="/img/curves/curve-desat-blue.svg" className="w-100" />
      <div className="faqs bg-gl-desat-blue">
        <img src="/img/homepage/Stars.png" className="stars star-top" />
        <ProductPageContainer className="inner px-3">

          <br />
          <br />
          <p className="miniheader pt-5"><b>FAQS</b></p>

          <CollapseableCard
            title="1. What charities can I support with My Data?"
            TitleTag="h1" className="w-100 faq faq-1"
            innerClassName="text-left px-md-5" arrowPosition="bottom">
            <br />
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
              <C.A className="text-center" href="/charities" target="_blank">View our charity database →</C.A>
            </div>
          </CollapseableCard>

          <CollapseableCard
            title="2. How does My Data make money for my charity?"
            TitleTag="h1" className="w-100 faq faq-2"
            innerClassName="text-left px-md-5" arrowPosition="bottom">
            <br />
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
            innerClassName="text-left px-md-5" arrowPosition="bottom">
            <br />
            <ul>
              <li>
                <b>You are always in control here and can select your desired level of privacy for each piece of data you share with us. You can explore your profile any time, and adjust which bits of your info can and cannot be used.</b>
              </li>
              <li>
                By default, we will not share or sell your data. We will use it carefully to help route relevant adverts your way - turning the extra payments from advertisers into charity funding.
              </li>
              <li>
                If you want to maximise the money raised, you can choose to switch on data-sharing permissions for some of your info. We can then sell those bits of data on your behalf to raise extra donations.
              </li>
            </ul>
          </CollapseableCard>
        </ProductPageContainer>
        <br />
        <div className="d-flex flex-row justify-content-center align-items-center mt-md-5">
          <MyDataSignUpButton />
        </div>
        <br />
      </div>
    </div>
  </div>;
};

const DiscoverMore = () => {

  return <ProductPageContainer className="discover-more">
    <br />
    <h2 className="w-100 text-md-center">Discover more</h2>
    <br />
    <Row>
      <Col xs={4} className="d-flex flex-column align-items-center justify-content-center">
        <img src="/img/mydata/product-page/links-t4g.png" className="link-circle" />
        <br />
        <p>Install</p>
        <C.A href="/tabsforgood">Tabs for Good</C.A>
      </Col>
      <Col xs={4} className="d-flex flex-column align-items-center justify-content-center">
        <img src="/img/mydata/product-page/links-our-impact.png" className="link-circle" />
        <br />
        <p>Explore</p>
        <C.A href="/impactoverview">Our Impact</C.A>
      </Col>
      <Col xs={4} className="d-flex flex-column align-items-center justify-content-center">
        <img src="/img/mydata/product-page/links-our-story.png" className="link-circle" />
        <br />
        <p>Read</p>
        <C.A href="/ourstory">Our Story</C.A>
      </Col>
    </Row>
    <br />
  </ProductPageContainer>
};

const MyDataProductPage = () => {

  useEffect(() => {
    setFooterClassName('bg-gl-white');
  }, []);

  setWindowTitle("Good-Loop: My.Data");

  return (<>
    <LandingSection />
    <div className="blue-gradient">
      <CommunityImpact />
      <br />
      <br />
      <HowItWorks />
    </div>
    <ControlYourData />
    <br />
    <EarnDataBadge />
    <TransformYourData />
    <DiscoverMore />
    <MyDataSignUpModal />
  </>);
};

export default MyDataProductPage;
