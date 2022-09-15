/* global navigator */
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'reactstrap';
import BG from '../base/components/BG';
import MainDivBase from '../base/components/MainDivBase';
import { nonce } from '../base/data/DataClass';
// Plumbing
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import detectAdBlock from '../base/utils/DetectAdBlock';
import { lg } from '../base/plumbing/log';
import {
  encURI,
  stopEvent,
  getBrowserVendor,
  ellipsize,
  space,
} from '../base/utils/miscutils';
import Login from '../base/youagain';
import C from '../C';
import WhiteCircle from './campaignpage/WhiteCircle';
// Components
import CharityLogo from './CharityLogo';
import AccountMenu from '../base/components/AccountMenu';
import NewtabLoginWidget, {
  NewtabLoginLink,
  setShowTabLogin,
} from './NewtabLoginWidget';
// import RedesignPage from './pages/RedesignPage';
import NewtabTutorialCard, {
  openTutorial,
  TutorialComponent,
  TutorialHighlighter,
  PopupWindow,
} from './NewtabTutorialCard';
import { fetchCharity } from './pages/MyCharitiesPage';
import {
  getPVSelectedCharityId,
  getTabsOpened,
  getTabsOpened2,
  retrurnProfile,
  Search,
  setPersonSetting,
} from './pages/TabsForGoodSettings';
import TickerTotal from './TickerTotal';
import Person, { getProfile, getPVClaim, getClaimValue } from '../base/data/Person';
import Misc from '../base/components/Misc';
import Money from '../base/data/Money';
import NGO from '../base/data/NGO';
import Roles, { isTester } from '../base/Roles';
import Claim from '../base/data/Claim';
import { accountMenuItems } from './pages/CommonComponents';
import { getCharityObject, getPersonSetting } from '../base/components/PropControls/UserClaimControl';
import NGOImage from '../base/components/NGOImage';
import { hasRegisteredForMyData, ProfileCreationSteps } from './mydata/MyDataCommonComponents';
import {getThemeBackground} from './NewTabThemes'
import {getT4GLayout, getT4GTheme, getT4GThemeBackground} from './NewTabLayouts';
import {NewTabCustomise} from './NewTabCustomise'
// DataStore
C.setupDataStore();

ServerIO.USE_PROFILER = true;

// Actions

Login.dataspace = C.app.dataspace;

/**
 * NB: useEffect was triggering twice (perhaps cos of the login dance)
 */
let logOnceFlag;

/**
 * Same for trying to verify user once ^^
 */
let verifiedLoginOnceFlag;

/**
 * The main Tabs for Good page
 *
 */
const WebtopPage = () => {
  Login.app = 't4g.good-loop.com'; // Not My.GL!
  const pvCharityID = getPVSelectedCharityId();
  const charityID = pvCharityID && (pvCharityID.value || pvCharityID.interim);
  const loadingCharity = !pvCharityID || !pvCharityID.resolved;
  let [showPopup, setShowPopup] = useState(false);
  let person = undefined;

  // Yeh - a tab is opened -- let's log that (once only)
  if (!logOnceFlag && Login.isLoggedIn()) {
    let pvPerson = getProfile();
    pvPerson.promise.then((person) => {   // This is the problem, how do we get 'person' before this?
      // Hurrah - T4G is definitely installed
      if (!person) console.warn('no person?!');
      else Person.setHasApp(person, Login.app);

    });
    console.log("after pv", person)
    // NB: include a nonce, as otherwise identical events (you open a few tabs) within a 15 minute time bucket get treated as 1
    lg('tabopen', { nonce: nonce(6) });
    // Wait 1.5 seconds before logging ad view - 1 second for ad view profit + .5 to load
    setTimeout(() => {
      // Avoid race condition: don't log until we know we have charity ID
      pvCharityID.promise.then((cid) =>
        lg('tabadview', { nonce: nonce(6), cid })
      );
    }, 1500);
    logOnceFlag = true;
  }

  const checkIfOpened = () => {
    if (!window.localStorage.getItem('t4gOpenedB4')) {
      window.localStorage.setItem('t4gOpenedB4', true);
      openTutorial();
    }
    openTutorial();
  };

  if (!verifiedLoginOnceFlag) {
    // Popup login widget if not logged in
    // Login fail conditions from youagain.js
    Login.verify()
      .then((res) => {
        if (!res || !res.success) {
          setShowTabLogin(true);
        } else {
          checkIfOpened();
        }
      })
      .catch((res) => {
        setShowTabLogin(true);
      });
    verifiedLoginOnceFlag = true;
  }

  // iframe src change?
  // https://stackoverflow.com/posts/17316521/revisions

  // Background images on tab plugin sourced locally, but not on Safari

  const pvNgo = Login.isLoggedIn() ? getCharityObject() : null;
  const ngo = pvNgo && pvNgo.resolved && pvNgo.value;

  const [bookmarksData, setBookmarksData] = useState([]);

  const handleMessage = (event) => {
    if (
      event.origin.includes('chrome-extension://') &&
      typeof event.data === 'object'
    ) {
      setBookmarksData(event.data);
      // console.log("bookmarks loaded", event.data);
    }
  };

  const bookmarkRequest = () => {
    parent.postMessage('give-me-bookmarks', '*');
  };

  useEffect(() => {
    bookmarkRequest();

    window.addEventListener('message', (event) => handleMessage(event));
    return () => {
      window.removeEventListener('message', (event) => handleMessage(event));
    };
  }, []);

  let layout = getT4GLayout();
  let curTheme = getT4GTheme();
  let [customiseModalOpen, setCustomiseModalOpen] = useState(false)
  let {background, logo} = getT4GThemeBackground(curTheme);
  let customBG = background;
  let customLogo = logo;

  console.log("THEME??", curTheme);
  console.log("LAYOUT??", layout);
  console.log("CUSTOM BG?", customBG);
  console.log("CUSTOM LOGO?", customLogo);

  return (
    <div className={space('t4g', 'layout-' + layout)}>
      {!Roles.isDev() && <style>{'.MessageBar .alert {display: none;}'}</style>}
      {/* NB: Rendering background image here can avoid a flash of white before the BG get loaded */}
      <NGOImage
        bg
        ngo={ngo}
        backdrop
        src={customBG}
        fullscreen
        opacity={0.9}
        bottom={0}
        style={{ backgroundPosition: 'center' }}
        alwaysDisplayChildren
      >
        <NewTabCharityCard cid={charityID} loading={loadingCharity} />
        <TutorialHighlighter
          page={[4, 5]}
          className='position-fixed p-3'
          style={{ top: 0, left: 0, width: '100vw', zIndex: 1 }}
        >
          <div className='d-flex justify-content-end'>
            <TutorialComponent
              page={4}
              className='user-controls flex-row align-items-center'
            >
              <UserControls cid={charityID} />
            </TutorialComponent>
          </div>
        </TutorialHighlighter>
        <Container
          fluid
          className='flex-column justify-content-end align-items-center position-absolute unset-margins'
          style={{ top: 0, left: 0, width: '100vw', height: '99vh' }}
        >
          <Row className='h-100 w-100' noGutters>
            <Col sm={3} md={4} />
            <Col
              sm={6}
              md={4}
              className='h-100 flex-column justify-content-center align-items-center unset-margins mt-2'
            >
              {true && ( //! loadingCharity && ! charityID &&
                // Show the total raised across all charities, if the user hasn't selected one.
                <>
                    <TutorialComponent page={2} className='t4g-total'>
                        <h5
                            className='text-center together-we-ve-raised'
                            style={{ fontSize: '.8rem' }}
                        >
                            Together we've raised&nbsp;
                            <TickerTotal />
                        </h5>
                  </TutorialComponent>
                </>
              )}
              <NormalTabCenter style={{transform:'translate(0,-30%)'}} customLogo={customLogo} />
              <LinksDisplay bookmarksData={bookmarksData} style={{transform:'translate(0,-30%)'}} />
            </Col>
          </Row>
        </Container>
        {/* Tutorial highlight to cover adverts */}
      </NGOImage>
      <TutorialComponent
        page={3}
        className='position-absolute'
        style={{ bottom: 0, left: 0, right: 0, height: 110, width: '100vw' }}
      />
      <NewtabTutorialCard
        tutorialPages={tutorialPages}
        charityId={charityID}
        onClose={() => setShowPopup(true)}
      />
      {showPopup && <PopupWindow />}
      <NewtabLoginWidget
        onRegister={() => {
          checkIfOpened();
        }}
      />
      <ConnectionStatusPopup />
      <NewTabCustomise modalOpen={customiseModalOpen} setModalOpen={setCustomiseModalOpen} />
    </div>
  );
}; // ./WebTopPage

const PAGES = {
  newtab: WebtopPage,
};
const NewTabMainDiv = () => {
  return (
    <MainDivBase
      pageForPath={PAGES}
      defaultPage='newtab'
      navbar={false}
      className='newtab'
    />
  );
};

/**
 *
 * @param {Object} p
 * @param {string} p.cid Charity ID
 * @returns
 */
const UserControls = ({ cid }) => {
  const showMyloopLink = !Login.isLoggedIn() || !hasRegisteredForMyData();
  const charity = cid ? fetchCharity(cid) : null;
  const [showPopup, setShowPopup] = useState(false);
  const mydataRef = useRef();

  const mydataLink = ServerIO.MYLOOP_ENDPOINT + '/account?scrollMyData=true';

  useEffect(() => {
    const myDataElement = document.getElementById('myloop-link');
    if (myDataElement && myDataElement.getAttribute('listener') !== 'true') {
      myDataElement.addEventListener('mouseover', () => setShowPopup(true));
    }
    return () => {
      if (myDataElement) {
        myDataElement.addEventListener('mouseover', () => setShowPopup(true));
      }
    };
  }, [myloopLink]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupDiv]);

  const handleClickOutside = (e) => {
    if (!mydataRef.current) return;
    if (mydataRef.current.contains(e.target)) {
      return; // inside click
    }
    setShowPopup(false); // outside click
  };

  const myloopLink = (
    <>
      <div
        onClick={() => (top.location.href = mydataLink)}
        className='myloop-link'
        id='myloop-link'
        style={{ cursor: 'pointer' }}
      >
        My.Good-Loop &nbsp;
        <img
          src='/img/mydata/my_good-loop_RoundLogo.300w.png'
          className='heart-white-circle'
        />
      </div>
      &nbsp;&nbsp;&nbsp;
    </>
  );

  const popupDiv = (
    <div
      ref={mydataRef}
      className='mydata-t4g-popup bg-white shadow p-3 position-absolute
			d-flex flex-column justify-content-center align-items-center text-center'
      onClick={() => (top.location.href = mydataLink)}
    >
      <img src='/img/mydata/data-badge.png' className='logo' />
      <span className='my-3' style={{ fontSize: '.9rem' }}>
        Visit My.Good-Loop to earn your data badge and raise even more donations
        for {charity ? charity.displayName : 'charities'}!
      </span>
      {charity && <CharityLogo charity={charity} />}
    </div>
  );

  const T4GLogoutLink = () => <a href={'#'} className={"LogoutLink"} 
  onClick={() => top.location.href = ServerIO.MYLOOP_ENDPOINT + '/logout'}>
    Logout
  </a>;

  return (
    <>
      {showMyloopLink && myloopLink}
      {showPopup && popupDiv}
      <AccountMenu
        accountMenuItems={accountMenuItems}
        linkType='a'
        small
        logoutLink= {<T4GLogoutLink/>}
        customImg={"/img/logo/my-loop-logo-round.svg"}
        customLogin={() => (
          <NewtabLoginLink className='login-menu btn btn-transparent fill'>
            Register / Log in
          </NewtabLoginLink>
        )}
      />
    </>
  );
};

/**
 * @deprecated in August 2022
 * TODO: remove if applicable, last updated around Feb 2021
 */
const TabsOpenedCounter = () => {
  let pvTabsOpened = getTabsOpened();
  if (pvTabsOpened && pvTabsOpened.value) {
    return (
      <span className='pr-3 text-white font-weight-bold'>
        {pvTabsOpened.value} tabs opened
      </span>
    );
  }
  return null;
};

const ENGINES = {
  google: {
    title: 'Google',
    logo: 'https://my.good-loop.com/img/TabsForGood/google.png',
    size: { width: 30, height: 30 },
    url: 'https://google.com/search?q=',
  },
  ecosia: {
    title: 'Ecosia',
    logo: 'https://my.good-loop.com/img/TabsForGood/ecosia.png',
    size: { width: 30, height: 30 },
    url: 'https://ecosia.com/search?q=',
  },
  duckduckgo: {
    title: 'DuckDuckGo',
    logo: 'https://my.good-loop.com/img/TabsForGood/duckduckgo.png',
    size: { width: 30, height: 30 },
    url: 'https://duckduckgo.com?q=',
  },
  bing: {
    title: 'Bing',
    logo: 'https://my.good-loop.com/img/TabsForGood/bing.png',
    size: { width: 30, height: 30 },
    url: 'https://bing.com/search?q=',
  },
};

/**
 * Shows search + the charity + amount raised
 * @param {Object} p
 * @returns
 */
const NormalTabCenter = ({style, customLogo}) => {
  let pvSE = getPVClaim({ xid: Login.getId(), key: 'searchEngine' });
  let searchEngine = Claim.value(pvSE) || 'google';
  const engineData = ENGINES[searchEngine];

  return (
    <>
      <div className='flex-column unset-margins align-items-center tab-center mb-1' style={style}>
        <TutorialComponent page={5} className='py-3 t4g-logo'>
          <a href='https://my.good-loop.com'>
            <img
              className='tab-center-logo'
              src={customLogo}
              alt='logo'
            />
          </a>
        </TutorialComponent>
        <div className='w-100'>
          <div className='tab-search-container mx-auto'>
            <Search
              onSubmit={(e) => doSearch(e, searchEngine)}
              placeholder={'Search with ' + engineData.title}
              icon={
                <C.A
                  href='/?tab=tabsForGood'
                  title='click here to change the search engine'
                >
                  <img
                    src={engineData.logo}
                    alt='search icon'
                    style={{
                      width: engineData.size.width,
                      height: engineData.size.height,
                    }}
                  />
                </C.A>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * *New*
 * Fetch total donation of charity from Monday (on ElasticSearch)
 * @param {Object} charity
 * @returns
 */
const fetchDonationTotalMonday = ({ charity }) => {
  if (!charity) return null;
  let pvTotalForCharityMonday = DataStore.fetch(
    ['misc', 'donations-monday'],
    () =>
      ServerIO.load(
        'https://lg.good-loop.com/data?dataspace=gl&q=evt:dntnmon AND time:' +
          new Date().toISOString().substring(0, 10)
      )
  );
  if (pvTotalForCharityMonday && pvTotalForCharityMonday.value) {
    if (pvTotalForCharityMonday.value.examples.length === 0) return null;
    const arrayTotal = pvTotalForCharityMonday.value.examples[0]._source.props;
    const mapTotal = arrayTotal.reduce((map, obj) => {
      map[obj.k] = obj.n;
      return map;
    });
    const donationMonday = mapTotal[charity.id] || mapTotal[charity.name];
    return donationMonday / 100;
  }
};

const NewTabCharityCard = ({ cid, loading }) => {
  const charity = cid ? fetchCharity(cid) : null;
  const isInTutorialHighlight =
    DataStore.getValue(['widget', 'TutorialCard', 'open']) &&
    DataStore.getValue(['widget', 'TutorialCard', 'page']) === 1;
  const returnLink = encURI('/newtab.html#webtop?tutOpen=true&tutPage=2');
  //const params = isInTutorialHighlight ? "&task=return&link=" + returnLink : "";

  let pvTotalForCharity = cid
    ? DataStore.fetch(['misc', 'donations', cid], () =>
        ServerIO.getDonationsData({ q: 'cid:' + cid })
      )
    : {};

  const donationTotalMonday = charity && fetchDonationTotalMonday({ charity });

  // HACK we want to show the total going up as tabs are opened. But we only reconcile on a quarterly basis.
  // SO: take 1 month of data, which will usually be an under-estimate, and combine it with an underestimate of CPM
  // to give a counter that ticks up about right.
  let pvNumTabsOpenedEveryone = getTabsOpened2({ start: 0, cid }); // 1 month's data -- which is alsmost certainly not included in the total

  // Aug 2022 Not showing totalMoney on front end anymore
  // let totalMoney;
  // if (isTester() && pvTotalForCharity.value && pvNumTabsOpenedEveryone.value) {
  // 	// TODO other currencies e.g. USD
  // 	const tabEst = new Money(pvNumTabsOpenedEveryone.value* 2/1000); // $/£2 CPM as a low estimate
  // 	totalMoney = Money.add(pvTotalForCharity.value.total, tabEst);

  // 	// New: If donations from Monday is found, use that instead of the tab estimate
  // 	if (donationTotalMonday) totalMoney = donationTotalMonday;
  // }

  // Use top.location.href instead of C.A to advoid CORS issues.
  const charityLink =
    (charity && charity.url) ||
    ServerIO.MYLOOP_ENDPOINT + '/account?tab=tabsForGood';

  return (
    <TutorialComponent page={1} className="NewTabCharityCard">
        <div className='text-center'>
        {/*<div onClick={() => top.location.href = charityLink}> */}
        <a href={charityLink} target='_blank' rel='noopener noreferrer' className='charity-cta'>
            {/* <WhiteCircle className="mx-auto m-3 tab-charity color-gl-light-red font-weight-bold text-center" circleCrop={charity ? charity.circleCrop : null}> */}
            {charity && <CharityLogo charity={charity} />}
            {!charity && loading && <p className='my-auto'>Loading...</p>}
            {!charity && !loading && <p className='my-auto'>Select a charity</p>}
            {/* </WhiteCircle> */}
        </a>
        </div>
    </TutorialComponent>
  );
};

const LinksDisplay = ({ bookmarksData, style }) => {
  const CircleLink = ({ bg, url, children, title }) => {
    if (!url) url = '#';
    return (
      <Col
        onClick={() => (parent.location.href = url)}
        title={title}
        className='bookmark-item d-flex flex-column align-items-center'
      >
        <BG
          src={bg}
          className='bookmark-box shadow mb-1'
          center
          style={{ backgroundSize: '1.5rem', backgroundRepeat: 'no-repeat' }}
        />
        {/* <span className="text-white text-center" style={{userSelect:"none",padding:'0 .5rem',paddingTop:'.3rem',borderRadius:'10px',backgroundColor:'rgb(0 0 0 / 10%)'}}>
				{children}
			</span> */}
      </Col>
    );
  };

  // Check width of the image from url
  const checkWidth = (url, callback) => {
    let img = new Image();
    img.src = url;
    img.onload = () => {
      callback(img.width);
    };
  };

  const getFavIcon = (domain) => {
    let favIcon = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;
    return favIcon;
  };

  // To allow sites like mail.google.com get fetch app specific favicons, at the same time advoid 404 favicons
  const favSubdomainKeywords = ['google'];

  const maxBookmarks = 5; // max number of bookmarks to display

  if (bookmarksData.length >= 1) {
    // console.log("bookmarksData loaded", bookmarksData);
    return (
      <Row className='bookmark-flexbox' style={style}>
        {bookmarksData.slice(0, maxBookmarks).map((bookmark, i) => {
          if (bookmark.url) {
            // Catch bookmarks folder that do not have url
            const url = bookmark.url;
            let domain = url.match('(?<=://)(.*?)(?=/)')[0];
            if (
              domain.split('.').length >= 3 &&
              !domain.includes(favSubdomainKeywords)
            ) {
              domain = domain.split('.').slice(1).join('.');
            }
            const title = ellipsize(bookmark.title, 10);
            return (
              <CircleLink
                key={i}
                url={url}
                title={bookmark.title}
                bg={getFavIcon(domain)}
              >
                {/* {title} */}
              </CircleLink>
            );
          }
        })}
      </Row>
    );
  }

  return (
    <Row className='bookmark-flexbox'>
      {/* {Array.apply(null, Array(10)).map((v, i) => <CircleLink key={i}>{i}</CircleLink>)} */}
    </Row>
  );
};

const CharityCustomContent = ({ content, className }) => {
  return <div className='charity-custom-content'>{content}</div>;
};

// Checks for internet connection and any adblock interference
const ConnectionStatusPopup = () => {
  let [popup, setPopup] = useState(true);
  let [timedout, setTimedout] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setTimedout(true);
    }, 10000);
  }, []);

  const pvHasAdBlock = detectAdBlock();
  const hasAdBlock = pvHasAdBlock.value;
  const isOffline = !navigator.onLine; // pvHasAdBlock.error;
  const determining =
    !(pvHasAdBlock.resolved || pvHasAdBlock.error) && timedout;
  const showPopup = (hasAdBlock || isOffline || determining) && popup;

  return showPopup ? (
    <div
      style={{
        background: 'white',
        borderRadius: 10,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        zIndex: 99999,
      }}
      className='shadow position-absolute text-center p-3 pt-4'
    >
      {hasAdBlock && !isOffline && !determining && (
        <>
          <h3 className='text-dark'>It looks like you have AdBlock enabled</h3>
          <p>
            We can't raise money for charity without displaying ads. Please{' '}
            <a href='https://my.good-loop.com/allowlist'>
              disable your adblocker
            </a>{' '}
            so Tabs for Good can work!
          </p>
        </>
      )}
      {isOffline && !determining && (
        <>
          <h3 className='text-dark'>We can't find the internet :(</h3>
          <p>
            We couldn't load your Tabs for Good page. Check your connection.
          </p>
          <small>
            If your internet is working, contact support@good-loop.com!
          </small>
        </>
      )}
      {determining && (
        <>
          <h3 className='text-dark'>We're having trouble connecting</h3>
          <p>One moment...</p>
        </>
      )}
      <b
        style={{ position: 'absolute', top: 10, right: 20, cursor: 'pointer' }}
        onClick={() => setPopup(false)}
        role='button'
      >
        X
      </b>
    </div>
  ) : null;
};

/**
 * redirect to Ecosia
 */
const doSearch = (e, engine) => {
  stopEvent(e);
  // NB: use window.parent to break out of the newtab iframe, otherwise ecosia objects
  const search = DataStore.getValue('widget', 'search', 'q');
  // Cancel search if empty
  // DONT use !search - if user searches a string that can evaluate falsy, like '0', it will cause a false positive
  if (search == null || search === '') {
    return;
  }
  (window.parent || window.parent).location =
    ENGINES[engine].url + encURI(search);
};

const tutorialPages = [
  <>
    <h2>Success!</h2>
    <p>
      Thanks for signing up to Tabs for Good!
      <br />
      You are now raising money for your favourite charity every time you open a
      new tab.
    </p>
  </>,
  <>
    <h2>It's your choice</h2>
    <p>
      You can choose the charity you want to support. We will send them 50% of
      the money from brands for their ads on Tabs for Good.
    </p>
  </>,
  <>
    <h2>Check our progress</h2>
    <p>See how much money we've raised so far! &#128578;</p>
  </>,
  <>
    <h2>Where the money comes from</h2>
    <p>
      We generate money by displaying ads at the bottom of each Tabs for Good
      window. You don't need to click on them for it to work.
    </p>
  </>,
  <>
    <h2>Your account</h2>
    <p>
      Change your <b>charity</b> and <b>search engine</b> here, under Tabs for
      Good. You can also see your account details, and explore My.Data!
    </p>
  </>,
  <>
    <h2>Explore the Loop</h2>
    <p>
      Find out more about Good-Loop and what more you can do for good at
      My-Loop.
    </p>
  </>,
  <>
    <h2>Customize your page</h2>
    <p>
        Make your Tabs For Good page yours! Change themes and layouts in here.
    </p>
</>,
];

export default NewTabMainDiv;
