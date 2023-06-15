import React, { useState } from 'react';
import { Card as CardCollapse } from '../../base/components/CardAccordion';
import { Container } from 'reactstrap';


/**
 * DEBUG OBJECTS
 */

import Login from '../../base/youagain';
import { ImpactStoriesPage } from './stories_components/ImpactStoriesPage';



export const ErrorDisplay = ({e}) => {
	const [showError, setShowError] = useState(false);

	let errorTitle = "Sorry, something went wrong :(";

	if (e.message?.includes("404: Not found")) errorTitle = "404: We couldn't find that!"
	if (e.message?.includes("Invalid URL")) errorTitle = "Sorry, that's not a valid page!"

	return <Container className='mt-5'>
		<h1>{errorTitle}</h1>
		<p>
			Check you have the correct URL. If you think this is a bug, please report it to support@good-loop.com
		</p>
		<CardCollapse title="Error" collapse={!showError} onHeaderClick={() => setShowError(!showError)}>
			<code>
				{e.message}
			</code>
		</CardCollapse>
	</Container>;
};
