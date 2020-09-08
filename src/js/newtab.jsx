import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import SJTest from 'sjtest';

import Misc from './base/components/Misc';

// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';
import NewTabMainDiv from './components/NewTabMainDiv';

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;
// global jquery for You-Again
window.$ = $;

ReactDOM.render(
	<NewTabMainDiv />,
	document.getElementById('mainDiv')
);
