import React from 'react';
import ReactDOM from 'react-dom';
import Misc from './base/components/Misc';
// import 'bootstrap/dist/css/bootstrap.min.css'; TODO inline BS -- maybe into BS3.jsx and BS4.jsx??
import SJTest, {assert} from 'sjtest';

import MainDiv from './components/MainDiv';

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;

ReactDOM.render(
	<MainDiv />,
	document.getElementById('mainDiv')
);
