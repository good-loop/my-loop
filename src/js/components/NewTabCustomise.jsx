/* global navigator */
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
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
import { T4GLayoutSelector, T4GThemePicker } from './NewTabLayouts';

// DataStore
C.setupDataStore();

ServerIO.USE_PROFILER = true;

// Actions

Login.dataspace = C.app.dataspace;



export const NewTabCustomise = ({ modalOpen, setModalOpen }) => {
  return (
  <>
  <Modal className='customise-modal' isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} fade={true} size="lg">
    <ModalBody className="customise-modal-body">
      <Container>
        <h1> Select a Theme </h1>
        <T4GThemePicker />
        <br />
        <h1> Select a layout </h1>
        <T4GLayoutSelector />
        <br />
      </Container>
    </ModalBody>
  </Modal>

  <Button className='t4g-customise-button' onClick={(e) => {setModalOpen(true);console.log("yeehaw")}}><img class='customise-btn-img'src='../img/icons/edit-icon.svg'/></Button>
  </>
  )
}