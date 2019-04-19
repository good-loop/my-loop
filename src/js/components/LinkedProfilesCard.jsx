import React from 'react';
import Login from 'you-again';
import { XId } from 'wwutils';

import C from '../C';
import Person from '../base/data/Person';
import DataStore from '../base/plumbing/DataStore';


const LinkedProfilesCard = ({xids}) => {
	if ( ! xids) return null;
	let trackers = xids.filter(xid => XId.service(xid) === 'trk');
	let nonTrackers = xids.filter(xid => XId.service(xid) !== 'trk');
	let authd = Login.aliases? Login.aliases.filter( u => u.jwt).map(u => u.xid) : [];
	
	let peeps = xids.map(xid => DataStore.getData(C.KStatus.PUBLISHED, C.TYPES.Person, xid));
	peeps = peeps.filter(p => !!p);

	return (
		<div>
			<p>We all have multiple online identities -- e.g. emails, social media, and with retail companies. 
			Here are the IDs Good-Loop recognises as you:</p>
			<div className='word-wrap'>
				{ nonTrackers.map(xid => <div key={xid}>{XId.service(xid)+': '+XId.id(xid)}</div>) }
				Good-Loop cookies (random IDs, used by us to record your donations and avoid repeating ads): {trackers.map(xid => XId.id(xid)).join(", ")}<br/>
				Currently logged into Good-Loop via: {authd.map(xid => XId.service(xid)+': '+XId.id(xid)).join(", ")}<br/>
				Links: {peeps.map(peep => 
					<div key={Person.id(peep)}>{Person.id(peep)} -> {peep.links && peep.links.length? peep.links.map(link => link.v).join(", ") : 'no links'}</div>
				)}
			</div>
		</div>
	);
};

export default LinkedProfilesCard;
