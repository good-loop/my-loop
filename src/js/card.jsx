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
import AboutPage, { addImageCredit } from './base/components/AboutPage';

// global jquery for You-Again
window.$ = $;

addImageCredit({url:"https://icons8.com/icons/set/coronavirus", name:"Coronavirus icon", author:"Icons8" });

const CardMainDiv = () => {
	const pageForPath = {
		card: CardPage,
		cardeditor: CardEditorPage,
		about: AboutPage
	};
	return <MainDivBase pageForPath={pageForPath}
		navbarPages={[]} defaultPage="card" />
};

ReactDOM.render(
	<CardMainDiv />,
	document.getElementById('mainDiv')
);
