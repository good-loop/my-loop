import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';

import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import ActionMan from '../plumbing/ActionMan';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';

/**
 * @param person {Person} the user profile
 */
const ConsentWidget = ({person}) => {
	let path = ['widget', 'TODO'];

	// where is this info stored on Profiles?
	// how is it set in Profiler.js??

	return (
		<div>
			<p>Your data can really boost the money you raise for charity.</p>
			<p>Please can we:</p>
			
			<Misc.PropControl path={path} prop='personaliseAds' label='Pick ads that fit your profile' type='yesNo' />
			
			<Misc.PropControl path={path} prop='recordDonations' label='Record your charity donations' type='checkbox' />

			<Misc.PropControl path={path} prop='recordAdsBehaviour' label='Record which ads we show you and how you react to them (e.g. click / ignore / vomit)' 
				type='checkbox' />			

			Sell your data: Hell No

			<p>It's your data: You can change your mind at any time (just edit these settings). 
			You can see and control your profile data.
			For more details see our Privacy Manifesto.</p>

		</div>
	);
};

export default ConsentWidget;
