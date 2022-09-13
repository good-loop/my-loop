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
 * Same for trying to verify usCer once ^^
 */
let verifiedLoginOnceFlag;

export const getThemeBackground = (theme) => {
  switch(theme) {
    // user has chosen one of our custom themes
    case '.dark':
      return {background: '/img/newtab/solid/dark.jpg', 
              logo: '/img/newtab/logo/white.png'}
    case '.light':
      return {background: '/img/newtab/solid/light.jpg', 
              logo: '/img/newtab/logo/black.png'}

    // user has chosen to view charity specific theme - check if charity has one
    case('dogs-trust') :
      return {background: '/img/newtab/charity/dogstrust/background1.jpg', 
              logo: '/img/newtab/logo/black.png'}

    // user has chosen default or no themes
    default:
      return {background:'/img/newtab/default/gl-bg' + (Math.round(Math.random() * 10) + 1) + '.jpg',
              logo: '/img/newtab/logo/white.png'};
  }
}  