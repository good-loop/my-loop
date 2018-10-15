// Collection of controls for managing
// social media data linked by the user
import React from 'react';
import Misc from '../base/components/Misc';

// @param dataFields: data that we would like to pull from corresponding social media site's API
// Just Twitter for the moment.
const socialMedia = [
	{
		service: 'twitter',
		idHandle: '@twitter',
		dataFields: ['location', 'relationship', 'job', 'gender']
	}
];

/** Checkboxes for all items in 'dataFields' */
const PermissionSwitches = ({xidObj}) => {
	if(!xidObj || !xidObj.xid || !xidObj.dataFields) return null;

	const {xid, dataFields} = xidObj;
	const permissionPath = ['data', 'Person', xid, 'linkedDataPermissions'];

	return (
		<div>
			<h5>Controls for {xidObj.service}</h5>
			{dataFields.map( field => <Misc.PropControl type="checkbox" path={permissionPath} prop={field} label={field} key={field} />)}
		</div>
	);
};

const DigitalMirrorCard = ({xids}) => {
	if(!xids) return null;

	// array of all relevant linked social media xids available
	// combined with blob of data from "socialMedia"
	// e.g [{xid: 'fakeuser@twitter', service: 'twitter', idHandle: '@twitter', dataFields:['location', 'relationship', 'job', 'gender']}]
	const socialXIds = socialMedia.reduce( (out, socialMediaService) => {
		// @email, @twitter, @facebook ...
		const {idHandle} = socialMediaService;
		// implicitly assuming that there is only going to be one xid per social media service
		const xid = xids.find( id => id.slice(id.length - idHandle.length) === idHandle);
		
		if(!xid) return out;

		return out.concat({xid, ...socialMediaService});
	}, []);

	return (
		<div>
			{
				socialXIds && socialXIds.length > 0
					? socialXIds.map( xidObj => <PermissionSwitches xidObj={xidObj} key={xidObj.xid} />)
					: 'You do not appear to have shared any social media data with us' 
			}
		</div>
	);
};

module.exports = {
	DigitalMirrorCard
};
