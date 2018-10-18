// Collection of controls for managing
// social media data linked by the user
import React from 'react';
import PropControl from '../base/components/PropControl';
import DataStore from '../base/plumbing/DataStore';
import {createClaim, saveProfile, saveProfileClaims} from '../base/Profiler';
import {assMatch} from 'sjtest';
import _ from 'lodash';

// @param dataFields: data that we would like to pull from corresponding social media site's API
// Just Twitter for the moment.
const socialMedia = [
	{
		service: 'twitter',
		idHandle: '@twitter',
		dataFields: ['location', 'relationship', 'job', 'gender', 'desc'] // keys should match back-end/Datastore
	}
];

const appStatePath = ['widget', 'DigitalMirror'];
const userdataPath = ['widget', 'DigitalMirror', 'userdata'];

const DigitalMirrorCard = ({xids}) => {
	if(!xids) return null;

	/** HACK: Grab data from [data, Person, xid] (which we treat as read-only),
	 *  process, and put in to state
	 *  Assumes that a fetch request has already been made to put the data in to the above location
	 *  Want to avoid making a second, unnecessary, request for data
	*/
	xids.forEach( xid => {
		assMatch(xid, "String", "DigitalMirrorCard.jsx, pullInXIdData -- xid is not a string");

		const readPath = ['data', 'Person', xid];
		
		const writePath = userdataPath.concat(xid);

		const data = DataStore.getValue(writePath);

		if( !data ) {
			const {std, custom} = DataStore.getValue(readPath) || {std: null, custom: null};
			let writeData = null;//std && custom ? Object.assign(std, custom) : null;

			// Nothing in std or custom, try to pull from Claims instead
			if( !writeData ) writeData = getClaimsForXId(xid);

			DataStore.setValue(writePath, writeData , false);
		}
	});

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
	const path = userdataPath.concat(xid);

	return (
		<div className="social-media-permissions">
			<PropControl type='checkbox' path={appStatePath} prop={'edit-mode'} label={'Toggle edit mode'} />
			<h5>Controls for {xidObj.service}</h5>
			{
				dataFields.map( field => {
					return <PropControl type="checkbox" path={path.concat(field)} prop={'permission'} label={label({field, editMode, path})} key={field} saveFn={() => saveFn(xid, field)} />;
				})
			}
			{/* Probably want some kind of input checking for this? Could also leave that up to the back-end */}
			{editMode ? <button className="btn btn-primary" type="button" onClick={() => saveFn(xid, dataFields)}> Save changes </button> : null}
		</div>
	);
};

// This is just a proof of concept.
// If we end up going with this method, would want to use images that represent the relevant data field
const label = ({field, editMode, path}) => {
	const objPath = path.concat([field]);	
	const fieldValue = DataStore.getValue(objPath.concat('value'));

	return (
		<div>
			<img style={{height: '200px', width: '200px'}} alt={field} src='https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/v1/722207/banner-illustration-publisher-no-hearts_lppr8a.jpg' />
			{
				editMode 
					? <PropControl type='text' path={objPath} prop={'value'} /> 
					: fieldValue || 'No data available'
			}
		</div>);
};

// Save updated parameters to user's Profiler space
// Note that this 
// Want to deal be a able to deal with an array of fields
// Important for editing data held where we use a "Save" button
const saveFn = (xid, fields) => {
	if(_.isString(fields)) fields = [fields];

	// let claims = [];

	// TODO: Set this back to sending an array of claims up to the back-end
	// Appears that it currently can only process one claim at a time
	fields.forEach( field => {
		const data = DataStore.getValue(userdataPath.concat([xid, field]));

		if( ! data ) return;
	
		const {value, permission} = data;
	
		const claim = createClaim({key: field, value, from: xid, p: permission});
		// claims = claims.concat(claim);

		saveProfileClaims(xid, [claim]);
	});

	// saveProfileClaims(xid, claims);
};

/** 
 * @param xid the xid that the claim will be registered to
 * Change to return object of all unique key:value pairs for the given xid?
 * @returns {gender: {value: 'male', permission: 'private'}, locaton: {value: 'who_knows', permission: 'public'}}
 * Example of Claims object as of 18/10/18
 * {"p": ["controller"], "@class": "com.winterwell.profiler.data.Claim", "t": "2018-10-18T11:14:04Z", "v": "This is Peter Pan, a test account for SoGrow...",
	"f": ["mark@winterwell.com@email"], "k": "description", "kv": "description=This is Peter Pan, a test account for SoGrow...","o": "description-mark@winterwell.com@email"
	}
 */
const getClaimsForXId = (xid) => {
	const claims = DataStore.getValue(['data', 'Person', xid, 'claims']);

	if( ! claims ) return;

	const formattedClaims = claims.reduce( (obj, claim) => {
		let {k, f, v, p} = claim;

		// If contains "public", set to true
		// set to false ("private") otherwise
		// Reasoning is that default state is "private"/false anyway
		// Change this to "private" if you want all options checked by default
		if(_.isArray(p)) p = p.includes("public");

		// If the claim is from the given user id
		// add its value to the outgoing obj and continue 
		if( f.includes(xid) ) {
			obj[k] = {value: v, permission: p};
			return obj;
		}

		return obj;
	}, {});
	return _.isEmpty(formattedClaims) ? null : formattedClaims;
};

module.exports = {
	DigitalMirrorCard
};
