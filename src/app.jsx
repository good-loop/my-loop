import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';

import MainDiv from './components/MainDiv';

ReactDOM.render(
	<MainDiv />,
	document.getElementById('mainDiv')
	);
