import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import SJTest, {assert} from 'sjtest';

import Misc from './base/components/Misc';
import MainDiv from './components/MainDiv';

window.$ = $; // HACK needed for youagain

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;

ReactDOM.render(
	<MainDiv />,
	document.getElementById('mainDiv')
);
