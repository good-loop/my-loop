// Collection of controls for managing
// social media data linked by the user
import React from 'react';
import {assMatch} from 'sjtest';
import _ from 'lodash';
import PropControl from '../base/components/PropControl';
import DataStore from '../base/plumbing/DataStore';
import Claim from '../base/data/Claim';
import {saveProfile, getClaimsForXId, saveProfileClaims} from '../base/Profiler';
import ServerIO from '../plumbing/ServerIO';
import Misc from '../base/components/Misc';

// @param dataFields: data that we would like to pull from corresponding social media site's API
// Just Twitter for the moment.
const socialMedia = [
	{
		service: 'twitter',
		idHandle: '@twitter',
		dataFields: ['name', 'gender', 'location', 'job', 'relationship'] // keys should match back-end/Datastore
	}
];

const IconFromField = {
	// No icon for this
	name: null,
	gender: <i className="fa fa-venus"></i>,
	location: <i className="fa fa-globe"></i>,
	job: <i className="fa fa-briefcase"></i>,
	relationship: <i className="fa fa-heart"></i>
};

const userdataPath = ['widget', 'DigitalMirror', 'userdata'];

// TODO: Think that this will need to change significantly in future
// Rough form: can open menu to see specific data we've found and where it's come from
// Separate input fields that allow user to set override

// Is currently not an issue as we are only working with data from one social media source (Twitter)
// Need to set things up so that user provided data (regardless of the form that this comes in)
// is shown rather than whatever data has come from Twitter.
// Editing these fields always modifies the user provided data on the back-end
// rather than the data held for that specific social media source 

const DigitalMirrorCard = ({xids}) => {
	if(!xids) return null;

	// ??Switch to using [draft, Person, xid] as the storage for edits
	// -- and hence reuse some existing Crud code.
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
			// We are currently just reading from Claims
			// Might want to pay more attention to std, custom after we've added multiple data sources
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
			{/* <InteractiveMap /> */}
			{
				socialXIds && socialXIds.length > 0
					? socialXIds.map( xidObj => <PermissionControls xidObj={xidObj} key={xidObj.xid} />)
					: 'You do not appear to have shared any social media data with us' 
			}
		</div>
	);
};

/**TODO: clean this up */
const PermissionControlRow = (path, field, debounceSaveFn, editModeEnabled) => {
	// Hard-set 'name' to be header
	const isHeader = field === 'name';

	if(editModeEnabled) {
		return (
			<div className='row vertical-align' key={'data-control-' + field}> 
				{isHeader ? null : <div className='col-md-1'><PropControl type="checkbox" path={path.concat(field)} prop={'permission'} label={label(field)} key={field} saveFn={() => debounceSaveFn(field, 'myloop@app')} /></div>}
				<div className={'col-md-8'}><PropControl className={isHeader ? 'header' : ''} type='text' path={path.concat(field)} prop={'value'} placeholder={field} style={{width: 'auto'}} saveFn={() => debounceSaveFn(field, 'myloop@app')} /></div>
			</div>	
		);
	}

	return (
		<div className='row vertical-align' key={'data-control-' + field}> 
			{isHeader ? null : <div className='col-md-1'>{label(field)}</div>}
			<div className={'col-md-8' + (isHeader ? ' header' : '')}>{DataStore.getValue(path.concat([field, 'value'])) || capitalise(field)}</div>
		</div>
	);
};

/** Checkboxes for all items in 'dataFields'
 *  Can also edit data field when 'edit mode' is enabled.
 */
const PermissionControls = ({xidObj}) => {
	if(!xidObj || !xidObj.xid || !xidObj.dataFields) return null;

	const {xid, dataFields} = xidObj;
	const path = userdataPath.concat(xid);

	// Move debounceSaveFn and editMode in to PermissionControlRow?

	// Save function. Can only be called once every 5 seconds
	// Important that this be stored somewhere more permanent than the component body
	// If you don't, a debounce function will be created on each redraw,
	// causing a save to fire on every key stroke.
	let debounceSaveFn = DataStore.getValue(['widget', 'DigitalMirror', xid, 'debounceSaveFn']);

	// TODO: fix autosave 
	let visible = DataStore.getValue(['widget','DigitalMirror','autosaveTriggered']);

	if( !debounceSaveFn ) {
		debounceSaveFn = _.debounce((field, from) => saveFn(xid, field, from), 5000);
		DataStore.setValue(['widget', 'DigitalMirror', xid, 'debounceSaveFn'], debounceSaveFn);
	}

	const editModeEnabled = DataStore.getValue(['widget', 'DigitalMirror', 'editModeEnabled']);
	const toggleEditMode = () => {
		DataStore.setValue(['widget', 'DigitalMirror', 'editModeEnabled'], !editModeEnabled);
	};

	return (
		<div>
			<div className="mirror container">
				<div className='row'>
					<div className="col-md-6 main">
						{
							// TODO: (24/10/18) isHeader is a hack. Wanted first item in the list to appear larger
							// come back and clean this up
							dataFields.map( field => PermissionControlRow(path, field, debounceSaveFn, editModeEnabled))
						}
					</div>
					<div className='col-md-5 map' />
				</div>				
			</div>
			<span className='pull-right info'> <i className="fas fa-info-circle" /> This data was taken from {capitalise(xidObj.service)}</span>		
			<button className='pull-left' onClick={toggleEditMode} type='button'> Edit </button>
			{visible === true ? <div><p>Saved Successfully</p></div> : null}
		</div>
	);
};

// This is just a proof of concept.
// If we end up going with this method, would want to use images that represent the relevant data field
const label = (field) => (	
	IconFromField[field] ? (
		<div className="input-label">
			{IconFromField[field]}
		</div>
	): null
);

// Save updated parameters to user's Profiler space
// Note that this 
// Want to deal be a able to deal with an array of fields
// Important for editing data held where we use a "Save" button
/**
 * @param from optional
 */
const saveFn = (xid, fields, from) => {
	// to inform the user that an autosave event happened
	DataStore.setValue(['widget','DigitalMirror', 'autosaveTriggered'], true);
	
	if( _.isString(fields) ) fields = [fields];

	// This is really just a bit of paranoia 
	// While this should only ever be saving Claims that have been edited by the user,
	// wanted to be absolutely sure that unmodified Twitter data was not being marked as
	// having come from 'myloop@app'
	if( !from ) from = [xid];
	else from = [xid].concat(from);

	let claims = [];

	fields.forEach( field => {
		const data = DataStore.getValue(userdataPath.concat([xid, field]));

		// Allow blank string
		if( !data && data !== '' ) return;
	
		let {value, permission} = data;

		// Make sure this is true OR false
		// Found this was 'undefined' where no data was loaded for a particular field
		if( !permission ) permission = false;

		const claim = Claim.make({key: field, value, from, p: permission});
		claims = claims.concat(claim);
	});

	saveProfileClaims(xid, claims);
};

/** Little helper method to capitalise first character in a given string */
const capitalise = (string) => {
	return string[0].toUpperCase() + string.slice(1);
};

module.exports = {
	DigitalMirrorCard
};
