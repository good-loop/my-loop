import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// Make sure we load endpoint settings
import ServerIO from './plumbing/ServerIO';

// import Misc from './base/components/Misc';

// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';
import MainDivBase from './base/components/MainDivBase';

import CardPage from './CardPage';
import CardEditorPage from './CardEditorPage';

// global jquery for You-Again
window.$ = $;

const CardMainDiv = () => {
	const pageForPath = {
		card: CardPage,
		cardeditor: CardEditorPage
	};
	return <MainDivBase pageForPath={pageForPath}
		navbarPages={[]} defaultPage='card' />
};

ReactDOM.render(
	<CardMainDiv />,
	document.getElementById('mainDiv')
);
