import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import SJTest from 'sjtest';

import Misc from './base/components/Misc';

// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';
import BG from './base/components/BG';
import { randomPick, encURI } from './base/utils/miscutils';
import { Form, Button } from 'reactstrap';
import PropControl from './base/components/PropControl';
import DataStore from './base/plumbing/DataStore';
import DevLink from './components/campaignpage/DevLink';
import C from './C';

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;
// global jquery for You-Again
window.$ = $;

/**
 * TODO Ecosia
 */
const google = () => {
	window.location = 'https://www.ecosia.org/search?q='+encURI(DataStore.getValue('widget','search','q'));
};

const NewTabMainDiv = () => {

	let bg = randomPick([

	]);

	return (<div className='container'>
		<BG src={bg} fullscreen />
		<h2>Hello! Sadly this extension is not ready yet...</h2>

		{C.SERVER_TYPE !== 'local'? <DevLink href='http://localmy.good-loop.com/newtab.html'>Local Version</DevLink> : null}
		{C.SERVER_TYPE !== 'test'? <DevLink href='https://testmy.good-loop.com/newtab.html'>Test Version</DevLink> : null}
		{ ! C.isProduction()? <DevLink href='https://my.good-loop.com/newtab.html'>Production Version</DevLink> : null}

		TODO score / impact

		<Form onSubmit={google} inline>
			<PropControl prop='q' path={['widget','search']} /><Button onClick={google}>Search</Button>
		</Form>

		TODO pick between a few charities

		TODO an advert!
		
		TODO replace font awesome with unicode &#x1f5d1; &#xf014;

	</div>);
};

ReactDOM.render(
	<NewTabMainDiv />,
	document.getElementById('mainDiv')
);
