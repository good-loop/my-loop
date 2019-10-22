import React from 'react';
import ReactDOM from 'react-dom';
// import 'bootstrap/dist/css/bootstrap.min.css'; TODO inline BS -- maybe into BS3.jsx and BS4.jsx??
import SJTest, {assert} from 'sjtest';

import MainDiv from './components/MainDiv';

ReactDOM.render(
	<MainDiv />,
	document.getElementById('mainDiv')
);
