import React from "react";
import { Container, Row, Col } from "reactstrap";
import BG from "../../base/components/BG";
import { isMobile, space } from "../../base/utils/miscutils";
import { ArrowLink, MyDataButton, NewsAwards, PageCard } from "./CommonComponents";
import { T4GHowItWorksButton, T4GSignUpButton } from "../T4GSignUp";
import { MyDataSignUpButton, MyDataSignUpModal } from "../mydata/MyDataSignUp";
import { SubscriptionForm } from "../cards/SubscriptionBox";
import { DiscoverMoreCard } from "./HomePage";
import GoodLoopUnit from '../../base/components/GoodLoopUnit';

const GetInvolvedSplash = () => {
  const styleBG = {
    backgroundImage:
      "url(img/getinvolved/" +
      (isMobile()
        ? "products-header-image.png"
        : "getinvolved-background.svg") +
      ")",
    backgroundSize: "cover",
    backgroundPosition: "top center",
    backgroundRepeat: "no-repeat",
    minHeight: "16em",
  };

  return (
    <div className="get-involved-splash">
      <div className="position-relative" style={styleBG}>
        <img
          className="d-none d-md-block"
          src="/img/getinvolved/getinvolved-overlay.png"
          style={{ zIndex: 1 }}
        />
        <img
          src={"/img/curves/curve-white.svg"}
          className="curve position-absolute w-100"
          style={{ bottom: 0, zIndex: 2 }}
        />
      </div>
      <Container className="text-center mb-5">
        <h1>Get Involved</h1>
        <h3>Sign Up For Our Products</h3>
        <p>
          Explore our free, simple ways to raise money for the cause you care
          about
        </p>
      </Container>
    </div>
  );
};

const ProductsCard = () => {
  const tabsForGood = {
    bgColour: "bg-gl-light-pink",
    title: "Tabs for Good",
    subtitle: "Support A Charity Of Your Choice For Free",
    description:
      "Convert your web browsing into a donations, simply by opening new tabs",
    image: "img/homepage/tabs-for-good-card.png",
    button: (
      <>
        <T4GSignUpButton className="w-100 mb-3" />{" "}
        <T4GHowItWorksButton className="w-100 color-gl-red" />
      </>
    ),
    linkTarget: "_blank",
    orderReverse: false,
  };
  const myData = {
    bgColour: "bg-gl-lighter-blue",
    title: "My.Data",
    subtitle: "How Many Cookies Have You Accepted Today?",
    description:
      "Don't just give your data away - control your data and convert it into charity donations with My.Data",
    image: "img/homepage/my-data-product.png",
    button: (
      <>
        <MyDataSignUpModal />
        <MyDataButton className="w-100" />{" "}
        <ArrowLink className="w-100 color-gl-red" link="/getmydata#howitworks">
          How it works
        </ArrowLink>
      </>
    ),
    linkTarget: "_blank",
    orderReverse: true,
  };

  return (
    <div className="products">
      {[].concat(tabsForGood, /*myData*/).map((product, i) => {
        const desktopTitleCard = (
          <Col
            className="d-none d-md-flex flex-column text-center justify-content-center align-items-center p-5"
            xs="0"
            md="6"
          >
            <h3>{product.title}</h3>
            <h5>{product.subtitle}</h5>
            <p>{product.description}</p>
            {product.button}
          </Col>
        );

        return (
          <div key={i} className={space(product.bgColour, "p-5")}>
            <Container>
              <Row>
                {product.orderReverse && desktopTitleCard}
                <Col
                  className="text-center d-flex flex-column justify-content-center align-items-center"
                  xs="12"
                  md="6"
                >
                  <h3 className="d-md-none">{product.title}</h3>
                  <img className="w-100" src={product.image} />
                  <p className="d-md-none">{product.description}</p>
                  <div className="d-md-none">{product.button}</div>
                </Col>
                {!product.orderReverse && desktopTitleCard}
              </Row>
            </Container>
          </div>
        );
      })}
    </div>
  );
};

const RaiseMoneySection = () => {

  return (<>
    <div className="raise-money-section position-relative" style={{ minHeight: '30em' }}>
      <img className="position-absolute w-100" style={{ bottom: 0 }} src="img/getinvolved/back-wave-lg.svg" alt="" />
      <img className="position-absolute w-100" style={{ bottom: 0 }} src="img/getinvolved/front-wave-lg.svg" alt="" />
      <Container className="text-center position-relative">
        <div className="position-relative" style={{ zIndex: 1, maxWidth: '350px', left: '50%', transform: 'translate(-50%, 30%)' }}>
          <h3 className="color-gl-red" style={{ margin: '.8em', fontWeight: '600', fontSize: '1.25rem' }} >Do Good For Free</h3>
          <p>At My Good-Loop we're harnessing consumer power and advertising billions, donating 50% of ad spend to charity - connecting you with brands to fund the causes you care most about.</p>
        </div>
        <img src="img/getinvolved/raise-money-blob.svg" className="w-100 position-absolute"
          style={{ maxWidth: '512px', left: '50%', top: 0, transform: 'translate(-50%, 0)' }} alt="blob" />
      </Container>
      <img src="img/getinvolved/GirlUsingDevice.png" className="position-absolute" style={{ width: '200px', left: '50%', bottom: '2em' }} />
      <img src="img/getinvolved/bubble-raise-money.png" className="position-absolute" style={{ width: '10em', right: '55%', top: '-3em' }} />
    </div>
    <PageCard className='bg-gl-light-pink'>
      <div className="text-center position-relative" style={{ maxWidth: '500px', left: '50%', transform: 'translate(-50%, 0)' }}>
        <h5 className="text-uppercase color-gl-red">Let's keep in touch!</h5>
        <p className="text-capitalize color-gl-red mb-4">Join the ads for good movement</p>
        <p className="text-capitalize color-gl-dark-blue">Sign up to our newsletter (And plant a tree!)</p>
        <SubscriptionForm buttonText='SUBSCRIBE' buttomColor="primary" showTrees />
      </div>
      <div className="text-center position-relative d-flex flex-column justify-content-center mt-5" style={{ maxWidth: '768px', left: '50%', transform: 'translate(-50%, 0)' }}>
        <p className="color-gl-dark-blue">Follow Us @Goodloophq</p>
        <div className="d-flex justify-content-between position-relative" style={{ zIndex: 1, maxWidth: '200px', left: '50%', transform: 'translate(-50%, 0)' }}>
          <C.A href="https://twitter.com/goodloophq" target="_blank">
            <img src="img/getinvolved/twitter-round.png" className="w-75" />
          </C.A>
          <C.A href="https://www.facebook.com/the.good.loop/" target="_blank">
            <img src="img/getinvolved/facebook-round.png" className="w-75" />
          </C.A>
          <C.A href="https://www.instagram.com/goodloophq/" target="_blank">
            <img src="img/getinvolved/instagram-round.png" className="w-75" />
          </C.A>
          <C.A href="https://www.linkedin.com/company/good.loop?trk=biz-companies-cym" target="_blank">
            <img src="img/getinvolved/linkedin-round.png" className="w-75" />
          </C.A>
        </div>
        <img className='position-absolute w-100' src="img/getinvolved/hands-pointing.png" style={{ bottom: '.5em', pointerEvents: 'none' }} />
      </div>
    </PageCard>
  </>)
}

const OurAdsSection = () => {

  return (<>
    <PageCard className='our-ads-section'>
      <Row>
        <Col xs={12} md={6} className='p-3 position-relative'>
          <GoodLoopUnit className='rounded' style={{ border: '8px solid #286984' }} vertId='ko3s6fUOdq' size="landscape" useScreenshot="landscape" />
          <img src="img/mydata/fireworks-single.png" className="logo position-absolute" style={{ top: '-1em', right: '3em' }} />
          <img src="img/mydata/fireworks-single.png" className="logo position-absolute" style={{ bottom: '-1em', left: '3em' }} />
        </Col>
        <Col xs={12} md={6} className='text-capitalize d-flex flex-column justify-content-center'>
          <h3 style={{ fontWeight: 600 }}>Look Out For Our Ads</h3>
          <p className="color-gl-dark-blue">If you see one of our shiny Good-Loop ads online, remember to engage with it to unlock your charity donations - It's how we raise most money for charity, all thanks to brands and you!</p>
          <ArrowLink link="/impactoverview" className='color-gl-red font-weight-bold'>
            View our ad case studies
          </ArrowLink>
        </Col>
      </Row>
      <Container className="text-center position-relative mt-5" style={{ minHeight: '32em' }}>
        <div className="position-relative" style={{ zIndex: 1, maxWidth: '350px', left: '50%', transform: 'translate(-50%, 10%)' }}>
          <img src='img/homepage/quote-blue.svg' className="logo position-relative" style={{ left: '-10em' }} />
          <div style={{ fontSize: '.9rem' }}>
            <p className="color-gl-dark-blue font-weight-bold">
              Thanks to (Good-Loop) and their viewers, over £20,000 has been raised for our organisation
            </p>
            <p className="color-gl-dark-blue ">
              Funds such as these help us to stand up for bees and other insects, work with farmers, organisations and landowners to manage their land in wildlife-friendly ways, and support our work to secure better protection for our precious marine mammals.
            </p>
            <p className="text-left" style={{ fontSize: '.8rem' }}>LAENNE MANCHESTER <br /> DIGITAL MARKETING MANAGER, THE WILDLIFE TRUSTS</p>
          </div>
          <img src='img/homepage/TWT_LOGO.png' className="w-25" />
          <br />
          <img src="img/homepage/bubble-wildlife.png" className="position-absolute w-50" style={{ right: '-3em' }} />
        </div>
        <img src="img/homepage/testimonial-blob-long.svg" className="position-absolute"
          style={{ maxWidth: '512px', left: '50%', top: 0, transform: 'translate(-50%, 0)', width: '120%' }} alt="blob" />
      </Container>
    </PageCard>
  </>)
}

export const CharityPartner = () => {

  return (<div className="position-relative">
    <img src="img/mydata/fireworks-single.png" className="logo position-absolute" style={{ top: '-1em', left: '50%', transform: 'translate(-50%, 0)' }} />
    <PageCard className='bg-gl-light-blue text-white text-center'>
      <h5>Interested In Becoming A Charity Partner?</h5>
      <p>Get In Touch To Discover How Your Organisation Can Benefit From Our Products</p>
      <button className="btn btn-secondary mb-5 position-relative" style={{ zIndex: 1 }}
        onClick={() => window.location.href = "https://good-loop.com/contact"} >
        Get In Touch
      </button>
    </PageCard>
    <img src="img/getinvolved/hand-globe.png" className="position-absolute" style={{ width: '8em', bottom: 0, left: 0 }} />
  </div>)
}

const GetInvolvedPage = () => {
  return (
    <>
      <GetInvolvedSplash />
      <ProductsCard />
      <NewsAwards nostars className="mb-5">
        <h3 style={{ fontWeight: "600" }}>As Featured In</h3>
      </NewsAwards>
      <RaiseMoneySection />
      <OurAdsSection />
      <CharityPartner />
      <DiscoverMoreCard title="Transform Your Browsing" subtitle="Let's make the internet a more positive place together!"
        discoverContents={[
          {
            img: 'img/mydata/product-page/links-t4g.png',
            span: 'Sign Up',
            linkTitle: 'Tabs for Good',
            href: '/tabsforgood'
          },
          /*{
            img: 'img/mydata/product-page/links-our-impact.png',
            span: 'Sign Up',
            linkTitle: 'My.Data',
            href: '/getmydata'
          },*/
          {
            img: 'img/mydata/product-page/links-our-story.png',
            span: 'Explore',
            linkTitle: 'Our Impact',
            href: '/ourimpact'
          },
        ]} />
    </>
  );
};

export default GetInvolvedPage;
