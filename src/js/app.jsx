import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import SJTest from 'sjtest';

import ServerInfo from './base/plumbing/ServerInfo';

import Misc from './base/components/Misc';
import MainDiv from './components/MainDiv';

// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;
// global jquery for You-Again
window.$ = $;

// Return server info when requested
const currentURL = new URL(window.location.href);
if (currentURL.searchParams.get("get.server.info") === "true") {
	ReactDOM.render(
		<div id="json">
			{JSON.stringify(ServerInfo)}
		</div>,
		document.getElementById("mainDiv")
	);
} else {
	ReactDOM.render(
		<MainDiv />,
		document.getElementById('mainDiv')
	);
}
