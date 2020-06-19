import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import SJTest, {assert} from 'sjtest';

import Misc from './base/components/Misc';
import MainDiv from './components/MainDiv';

// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';
// import 'bootstrap/dist/css/bootstrap.min.css'; TODO inline BS -- maybe into BS3.jsx and BS4.jsx??

window.$ = $; // HACK needed for youagain

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;

ReactDOM.render(
	<MainDiv />,
	document.getElementById('mainDiv')
);
