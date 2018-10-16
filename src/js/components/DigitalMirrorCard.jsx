// Collection of controls for managing
// social media data linked by the user
import React from 'react';
import PropControl from '../base/components/PropControl';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Profiler from '../base/Profiler';

// @param dataFields: data that we would like to pull from corresponding social media site's API
// Just Twitter for the moment.
const socialMedia = [
	{
		service: 'twitter',
		idHandle: '@twitter',
		dataFields: ['location', 'relationship', 'job', 'gender'] // keys should match back-end/Datastore
	}
];

const appStatePath = ['data', 'widget', 'DigitalMirror'];


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
					? socialXIds.map( xidObj => <PermissionControls xidObj={xidObj} key={xidObj.xid} />)
					: 'You do not appear to have shared any social media data with us' 
			}
		</div>
	);
};

/** Checkboxes for all items in 'dataFields'
 *  Can also edit data field when 'edit mode' is enabled.
 */
const PermissionControls = ({xidObj}) => {
	if(!xidObj || !xidObj.xid || !xidObj.dataFields) return null;

	const {xid, dataFields} = xidObj;
	// User can select/deselect to enable/disable editing of data we hold on them
	const editMode = DataStore.getValue(appStatePath.concat('edit-mode'));
	const path = ['data', 'Person', xid];

	return (
		<div className="social-media-permissions">
			<PropControl type='checkbox' path={appStatePath} prop={'edit-mode'} label={'Toggle edit mode'} />
			<h5>Controls for {xidObj.service}</h5>
			{dataFields.map( field => <PropControl type="checkbox" path={path.concat('linkedDataPermissions')} prop={field} label={label({field, editMode, path})} key={field} saveFn={() => saveFn({xid})} />)}
			{/* Probably want some kind of input checking for this? Could also leave that up to the back-end */}
			{editMode ? <button className="btn btn-primary" type="button" onClick={() => saveFn({xid})}> Save changes </button> : null}
		</div>
	);
};

// This is just a proof of concept.
// If we end up going with this method, would want to use images that represent the relevant data field
const label = ({field, editMode, path}) => {
	// Taking std as being the canonical, most recent, set of user data
	const fieldValue = DataStore.getValue(path.concat(['std', field]));
	return (
		<div>
			<img style={{height: '200px', width: '200px'}} alt={field} src='https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/v1/722207/banner-illustration-publisher-no-hearts_lppr8a.jpg' />
			{
				editMode 
					? <PropControl type='text' path={path.concat('std')} prop={field} /> 
					: fieldValue || 'No data available'
			}
		</div>);
};

// Save updated parameters to user's Profiler space
// Note that this 
const saveFn = ({xid}) => {
	let data = DataStore.getValue(['data', 'Person', xid]);
	const doc = {...data};
	
	if(data.linkedDataPermissions) {
		// Want to put linkedDataPermissions into form of [{...}, {...}] before uploading
		// This is to deal with ES separately indexing each memeber of a JSON object
		const linkedDataPermissionsArray = 
			Object.keys(data.linkedDataPermissions)
				.map( permission => {
					return {[permission]: data.linkedDataPermissions[permission]};
				});
		doc.linkedDataPermissions = linkedDataPermissionsArray;
	}

	return Profiler.saveProfile(doc);
	// return ServerIO.post(`${ServerIO.PROFILER_ENDPOINT}/profile/${ServerIO.dataspace}/${encodeURIComponent(xid)}`, {doc: JSON.stringify(doc), action: 'put'});	
};

module.exports = {
	DigitalMirrorCard
};
