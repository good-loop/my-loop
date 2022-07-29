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
import { MyDataSignUpButton, MyDataSignUpModal } from '../mydata/MyDataSignUp';
import TickerTotal from '../TickerTotal';
import BG from '../../base/components/BG';
import { CollapseableCard } from '../mydata/MyDataCommonComponents';
import { LogoBanner } from './CommonComponents';
import { T4GSignUpButton, T4GSignUpLink } from '../T4GSignUp';
import { CharityPartner } from './GetInvolvedPage';

const ProductPageContainer = ({ className, children, ...props }) => <Container fluid="lg" className={space("product-container", className)} {...props}>{children}</Container>;

const LandingSection = () => {

  const scroll = e => {
    stopEvent(e);
    scrollTo("how-it-works");
  }

  return <div className="landing bg-gl-pale-orange">
    <img src="/img/mydata/product-page/tabs.png" className="w-100 d-md-none" />
    <img src="/img/curves/curve-white.svg" className="w-100 d-md-none" />
    <div className="landing-contents bg-gl-white">
      <Container fluid="lg">
        <Row>
          <Col className='d-none d-md-flex justify-content-center align-items-center' xs={12} md={6}>
            <img src="/img/mydata/product-page/tabs.png" className="w-100" />
          </Col>
          <Col xs={12} md={6} >
            <div className='d-flex d-md-none flex-column'>
              <h1>Tabs for Good</h1>
              <h3 className='my-3'>The desktop browser plugin that lets you do good, for free</h3>
              <p>Turn your desktop browsing into life saving vaccines, meals for children in need, preservation of habitats for endangered animals, plus many more good causes.</p>
              <T4GSignUpButton />
              <a onClick={scroll} className="mt-3 mx-auto">Find out more</a>
            </div>
            <div className='d-none d-md-flex flex-column justify-content-center align-items-start'>
              <h1>Tabs for Good</h1>
              <h3 className='text-left my-3'>The desktop browser plugin that lets you do good, for free</h3>
              <p className='px-0 text-left mb-3'>Turn your desktop browsing into life saving vaccines, meals for children in need, preservation of habitats for endangered animals, plus many more good causes.</p>
              <T4GSignUpButton />
              <a onClick={scroll} className="mt-4">Find out more</a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  </div>;
};

const BubblesHeader = ({ src, className }) => {
  return <div className={space("bubble-container", className)}>
    <img src={src} className="photo-bubbles" />
  </div>;
};

const CommunityImpact = () => {

  return <ProductPageContainer className="community-impact text-center">

    <BubblesHeader src="/img/mydata/product-page/photo-bubbles-data-two.png" className="d-md-none" />
    <BubblesHeader src="/img/mydata/product-page/lg-photo-bubbles-data-two.png" className="d-none d-md-inline-block" />

    <br />
    <h4 className="color-gl-dark-turquoise w-75 mx-auto">Add to our community impact with Tabs for Good</h4>

    <div className="position-relative">
      <h1><TickerTotal noPennies /></h1>
      <img src="/img/homepage/Stars.png" className="stars stars-left" />
      <img src="/img/homepage/Stars.png" className="stars stars-right" />
      <img src="/img/homepage/Stars.png" className="stars stars-faded-left" />
      <img src="/img/homepage/Stars.png" className="stars stars-faded-right" />
    </div>

    <h4 className="color-gl-red">Funding global causes</h4>
    <h5 className="miniheader">Raised by our ads, Tabs for Good and My.Data</h5>
  </ProductPageContainer>
};

const HowItWorks = () => {

  const Sections = [
    {
      i: 1,
      title: "Sign up today",
      subtitle: "Open a new tab",
      img: "img/mydata/padlock-careful.png",
      content: "We display a small unintrusive banner advert at the bottom of your page while you're busy browsing away."
    },
    {
      i: 2,
      title: "50% to your charity",
      subtitle: "Unlock a donation",
      img: "img/mydata/onboarding-3.png",
      content: "As a thank you for letting the advert appear on your page, you make a free donation to charity, funded by us. 50% of the advert money to be precise."
    },
    {
      i: 3,
      title: "Do good easily, for free",
      subtitle: "That's It",
      img: "img/mydata/profile-created.png",
      content: "You don't even have to click on the advert to make the donation happen. It really is that simple."
    },
  ]

  return <div id="how-it-works" className="mt-md-5">
    <ProductPageContainer>
      <div className="inner">
        <div className="control-your-data-small">
          <img src="/img/mydata/product-page/tabs-header.png" className="padlocks" />
          <br />
          <h4>Transform your web browsing</h4>
          <p className="miniheader">Do good for free</p>
          <img src="/img/homepage/Stars.png" className="star mx-auto" />
        </div>

        <h1>Here's how it works:</h1>
        <br />

        <Row className='mx-1 d-flex justify-content-center mt-3 mb-5'>
          {Sections.map(({ i, title, subtitle, img, content }) => {
            return <Col key={i} xs={12} lg={4} className="position-relative" style={{maxWidth:'400px'}} >
              <div className="position-absolute d-flex flex-column justify-content-center align-items-center"
                style={{ zIndex: 1, width: '75%', left: '50%', transform: 'translate(-50%,0)' }}>
                <img src={img} style={{height:'80px'}} />
                <span className="miniheader">{title}</span>
                <h2 style={{ fontSize: '1.25rem' }}>{subtitle}</h2>
                <span className='mt-1'>{content}</span>
              </div>
              <img src={"img/mydata/product-page/blob-" + i + ".svg"} alt="blob" className='position-relative user-select-none' 
              style={{ left: 0, top: 0, zIndex: 0, width:'370px', transform: 'translate(-50%,0)', left:'50%' }} />
            </Col>
          })}
        </Row>

        <T4GSignUpButton className="align-self-center mb-3" style={{ zIndex: 1 }} />
        <br />
        <h4 className="text-uppercase">Available on</h4>
        <img src="/img/mydata/product-page/logos-browsers.png" className="w-100 mx-auto" style={{ maxWidth: '358px' }} />
        <br />
      </div>
    </ProductPageContainer>
  </div>;
};

const ControlYourData = () => {

  return <div className="control-your-data bg-gl-pale-orange">
    <img src="/img/curves/curve-lighter-blue.svg" className="w-100" />
    <div className="under-curve bg-gl-lighter-blue color-gl-dark-turquoise">
      <ProductPageContainer className='position-relative'>
        <Row className="flex-md-row-reverse">
          <Col md={6} className="d-flex flex-column justify-content-center align-items-center align-items-md-start px-md-5 text-md-left">
            <h3 className="text-uppercase">It couldn't be easier to get started</h3>
            <p>Sign up for Tabs for Good and select the charity you want to support. Then start browsing with the Tabs for Good plugin and raise money for free.</p>
          </Col>
          <Col md={6}>
            <img src="/img/mydata/product-page/laptop-t4g.png" className="laptop-display" />
          </Col>
        </Row>
        <BG className="blob w-100 p-5 text-left" src="/img/mydata/product-page/testimonial-blob.svg" center size="contain" repeat="no-repeat">
          <br />
          <br />
          <br />
          <br />
          <p className='mx-auto position-relative' style={{ fontSize: "0.9rem", maxWidth: '420px' }}>
            <img src="/img/homepage/quote-blue.svg" className="position-absolute" style={{ maxWidth: '3rem', top: '-4em' }} />
            The potential impact of consumers downloading the Tabs for Good is significant. Based on the average number of browser tabs consumers open every week,
            <b> if just 1% of internet users in the UK and US downloaded the browser extension, it would generate £30m and $200m (£146.9m) a year </b>
            in donations to good causes in the UK and US respectively.
          </p>
          <div className="d-flex flex-row justify-content-center align-items-center">
            <img src="/img/mydata/product-page/logo-exchangewire.png" className="w-50" style={{ maxWidth: '260px' }} />
          </div>
          <br />
          <br />
        </BG>
        <br />
        <T4GSignUpButton />
        <br />
        <br />
        <img src="img/homepage/world-map.svg" className='position-absolute w-100' style={{ bottom: 0, left: 0, pointerEvents: 'none' }} />
      </ProductPageContainer>
    </div>
  </div>
};

const TransformYourData = () => {

  return <div className="transform-your-data">
    <br />
    <br />
    <ProductPageContainer className="px-3">
      <h3 className="text-left text-md-center">Transforming your data into charity donations</h3>
      <p className="miniheader mb-0 text-md-center">Your questions answered</p>
    </ProductPageContainer>
    <BubblesHeader src="/img/mydata/product-page/photo-bubbles-t4g-two.png" className="d-md-none" />
    <img src="img/mydata/product-page/lg-photo-bubbles-t4g-two.png" className="bubbles-header-lg d-none d-md-inline-block" />
    <div className="overlap-up">
      <img src="/img/curves/curve-pale-orange.svg" className="w-100" />
      <div className="faqs bg-gl-pale-orange">
        <br />
        <img src="/img/homepage/Stars.png" className="stars star-top" />
        <ProductPageContainer className="inner px-3">

          <p className="miniheader pt-5"><b>FAQS</b></p>

          <CollapseableCard
            title="1. What is Tabs for Good and how do I get it?"
            TitleTag="h1" className="w-100 faq faq-1"
            innerClassName="text-left px-md-5" arrowPosition="bottom">
            <br />
            <ul>
              <li>
                <b>Tabs for Good is a browser plugin that
                  transforms your internet browsing
                  into donations for a charity of your
                  choice</b>
              </li>
              <li>
                Tabs for Good is available if you use
                Chrome, Safari or Microsoft Edge on a
                PC or laptop (It's not currently available
                for mobile browsing)
              </li>
              <li>
                To start using Tabs for Good, tap the <T4GSignUpLink>'Get Tabs for Good'</T4GSignUpLink> button - you'll be
                quided through a simple set-up process
                that adds Tabs for Good to your
                browser and lets you select what
                charity you want to support.
              </li>
            </ul>
          </CollapseableCard>

          <CollapseableCard
            title="2. Can I choose what charity to support?"
            TitleTag="h1" className="w-100 faq faq-2"
            innerClassName="text-left px-md-5" arrowPosition="bottom">
            <br />
            <ul>
              <li>
                <b>You can choose any charity that's
                  registered and regulated In the UK.</b>
              </li>
              <li>
                We will be expanding this to include
                American 501(c) organisations soon.
              </li>
              <li>
                Meanwhile: If you can't find your
                charity - please drop us an <a href="mailto:hello@good-loop.com">email</a> and
                we'll add it for you
              </li>
            </ul>

            <div className="d-flex flex-row justify-content-center align-items-center">
              <C.A className="text-center" href="/charities" target="_blank">View our charity database →</C.A>
            </div>
          </CollapseableCard>

          <CollapseableCard
            title="3. How does Tabs for Good raise money?"
            TitleTag="h1" className="w-100 faq faq-3"
            innerClassName="text-left px-md-5" arrowPosition="bottom">
            <br />
            <ul>
              <li>
                <b>When you open a new tab, we display a
                  banner advert at the bottom of the
                  page. You don't have to engage with
                  the advert - simply in return for you
                  seeing the advert, the advertiser will
                  pay money.</b>
              </li>
              <li>
                We send 50% of the advert's revenue to
                charity, while the other 50% covers the
                costs of running Tabs For Good. (We
                don't make profit.)
              </li>
              <li>
                We've introduced Tabs for Good as an
                easy way for you to do good every day
                for free - it part of our product family
                and adds to our total community
                impact. We make most of our revenue
                and raise most charity donations via
                our <C.A href="/impactoverview">Ads for Good</C.A> adverts for brands
                that appear on premium publishers
                sites and are seen by millions of viewers
                - keep a look out for them while you
                browse the web!
              </li>
            </ul>
          </CollapseableCard>
        </ProductPageContainer>
        <br />
        <div className="d-flex flex-row justify-content-center align-items-center mt-md-5">
          <T4GSignUpButton />
        </div>
        <br />
        <div className="text-center my-3">
          <h4 className="text-uppercase">Available on</h4>
          <img src="/img/mydata/product-page/logos-browsers.png" className="w-100 mx-auto" style={{ maxWidth: '358px' }} />
        </div>
      </div>
    </div>
  </div>;
};

const PickACharity = () => {

  return <ProductPageContainer className="pick-a-charity">
    <Row>
      <Col xs={12} md={6} className='d-flex justify-content-center align-items-center'>
        <img src="/img/mydata/product-page/charity-cloud.png" className="w-100 my-5" />
      </Col>
      <Col xs={12} md={6} className='d-flex flex-column justify-content-center align-items-start'>
        <h3 className="text-left px-3">You pick the charity you want to support. We'll make it happen.</h3>
        <p className="px-3 my-3 color-gl-dark-turquoise">
          Clean the oceans from plastic, feed children in
          need, save endangered species, support women's
          education in developing countries - pick the
          charity you care about and we'll donate the cash
          you raise to help their cause.
        </p>
        <T4GSignUpButton className="align-self-center my-3" style={{ zIndex: 1 }} />
      </Col>
    </Row>
  </ProductPageContainer>;
}

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

const TabsForGoodProductPage = () => {

  useEffect(() => {
    setFooterClassName('bg-gl-white');
  }, []);

  setWindowTitle("Good-Loop: Tabs for Good");

  return (<>
    <LandingSection />
    <LogoBanner className="bg-gl-white" />
    <div className="blue-gradient">
      <CommunityImpact />
      <br />
      <br />
      <HowItWorks />
    </div>
    <ControlYourData />
    <br />
    <TransformYourData />
    <PickACharity />
    <CharityPartner />
    <DiscoverMore />
    <MyDataSignUpModal />
  </>);
};

export default TabsForGoodProductPage;
