import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import SJTest from 'sjtest';

import Misc from './base/components/Misc';

// Import root LESS file so webpack finds & renders it out to main.css
import '../style/main.less';
import BG from './base/components/BG';
import { randomPick, encURI } from './base/utils/miscutils';
import { Form, Button, Card } from 'reactstrap';
import PropControl from './base/components/PropControl';
import DataStore from './base/plumbing/DataStore';
import DevLink from './components/campaignpage/DevLink';
import C from './C';
import Roles from './base/Roles';

// Pass font awesome version onto Misc, so it adds the appropiate class to the icons
Misc.FontAwesome = 5;
// global jquery for You-Again
window.$ = $;

/**
 * TODO Ecosia
 */
const google = () => {
	window.location = 'https://www.ecosia.org/search?q=' + encURI(DataStore.getValue('widget', 'search', 'q'));
};

// HACK!!!
Roles.isDev = () => true;

const NewTabMainDiv = () => {

	let bg = randomPick([
		{ src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1351&q=80' },
		{ src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1440&q=80' },
		{ src: 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80' },
		{ src: 'https://images.unsplash.com/photo-1582425312148-de9955e68e45?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2134&q=80' },
		{ src: 'https://images.unsplash.com/photo-1592755137605-f53768fd7931?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80' },
	]);

	let charities = ['wwf','save-the-children'];

	return (
		<BG src={bg.src} fullscreen opacity={0.9}>
			<div className='container'>
				<h2>Hello! Sadly this extension is not ready yet...</h2>

				{C.SERVER_TYPE !== 'local' ? <DevLink href='http://localmy.good-loop.com/newtab.html'>Local Version</DevLink> : null}
				{C.SERVER_TYPE !== 'test' ? <DevLink href='https://testmy.good-loop.com/newtab.html'>Test Version</DevLink> : null}
				{!C.isProduction() ? <DevLink href='https://my.good-loop.com/newtab.html'>Production Version</DevLink> : null}

				<Card body>TODO score / impact</Card>

				<Card body>
					<Form onSubmit={google} inline>
						<PropControl prop='q' path={['widget', 'search']} /><Button onClick={google}>Search</Button>
					</Form>
				</Card>

				<h3>TODO pick between a few charities</h3>
			{charities.map(c => <Card body>{c}</Card>)}
		<Card body>
			TODO an advert!
		</Card>
			</div>
		</BG>);
};

ReactDOM.render(
	<NewTabMainDiv />,
	document.getElementById('mainDiv')
);
