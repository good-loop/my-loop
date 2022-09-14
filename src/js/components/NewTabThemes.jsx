/* global navigator */
import React from 'react';
import ServerIO from '../plumbing/ServerIO';
import Login from '../base/youagain';
import C from '../C';

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