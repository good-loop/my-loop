// Collection of controls for managing
// social media data linked by the user
import React from 'react';
import {assMatch} from 'sjtest';
import _ from 'lodash';
import PropControl from '../base/components/PropControl';
import DataStore from '../base/plumbing/DataStore';
import Claim from '../base/data/Claim';
import Profiler, {saveProfile, getClaimsForXId, saveProfileClaims} from '../base/Profiler';
import ServerIO from '../plumbing/ServerIO';
import Misc from '../base/components/Misc';
import { XId } from 'wwutils';

// @param dataFields: data that we would like to pull from corresponding social media site's API
// Just Twitter for the moment.
const socialMedia = [
	{
		service: 'twitter',
		idHandle: '@twitter',
		// type should match PropControl type
		// dictates what sort of input field will be used
		dataFields: [
			{
				field: 'name',
				type: 'text'
			}, 
			{
				field: 'gender',
				type:'select', // Drop-down menu
				options: ['Male', 'Female', 'Other', 'Not specified']
			}, 
			{
				field: 'location',
				type: 'text'
			}, 
			{
				field: 'job',
				type: 'text'
			}, 
			{
				field: 'relationship',
				type: 'select',
				options: ['Single', 'In a relationship', 'Engaged', 'Married', 'Divorced', 'Widowed', 'Not specified']
			}] // keys should match back-end/Datastore
	}
];

const userdataPath = ['widget', 'DigitalMirror', 'userdata'];

// ??This may be over-engineered
// ?? doc e.g. returns jsx and not string as you might expect
const iconFromField = (field, value) => {
	if( !_.isString(value) ) value = `${value}`; 
	value = value.toLowerCase();

	const icons = {
		// No icon for this
		name: {
			default: null
		},
		gender: {
			default:<i className="fa fa-genderless" />, 
			female: <i className="fa fa-venus" />, 
			male: <i className="fa fa-mars" />
		}, 
		location: {
			default: <i className="fa fa-globe" />
		},
		job: {
			default: <i className="fa fa-briefcase" />
		},
		relationship: {
			default: <i className="fa fa-heart" />
		}
	};

	const iconField = icons[field];

	if( !iconField ) return null;

	return icons[field][value] ? icons[field][value] : icons[field].default; 
};

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
	assMatch(xids, 'String[]');

	// call analyze data, once per XId
	xids.forEach(xid => {
		if (XId.service(xid) !== 'twitter') return; // TODO Facebook etc too
		DataStore.fetch(['widget','DigitalMirrorCard','analyzeData', xid], () => Profiler.requestAnalyzeData(xid));
	});	

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
			let writeData = getClaimsForXId(xid);//std && custom ? Object.assign(std, custom) : null;

			DataStore.setValue(writePath, writeData , false);
		}
	});

	// array of all relevant linked social media xids available
	// combined with blob of data from "socialMedia"
	// e.g [{xid: 'fakeuser@twitter', service: 'twitter', idHandle: '@twitter', dataFields:['location', 'relationship', 'job', 'gender']}]
	const socialXIds = socialMedia.reduce( (out, socialMediaService) => {
		// Minor TODO use the XId.service() method here
		// @email, @twitter, @facebook ...
		const {idHandle} = socialMediaService;
		// implicitly assuming that there is only going to be one xid per social media service
		const xid = xids.find( id => id.slice(id.length - idHandle.length) === idHandle);
		
		if(!xid) return out;

		return out.concat({xid, ...socialMediaService});
	}, []);

	// TODO if someone attaches two social medias -- we want to show one profile, which is a merge of them representing our best guess.

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
const PermissionControlRow = (path, fieldObj, debounceSaveFn, editModeEnabled) => {
	const {field, type, options} = fieldObj;
	// Hard-set 'name' to be header
	const isHeader = field === 'name';
	const fieldPath = path.concat(field);

	if(editModeEnabled) {
		return (
			<div className='row vertical-align revertHeight' key={'data-control-' + field}> 
				<div className='col-md-1'>
					<PropControl type="checkbox" path={fieldPath} prop={'permission'} label={label(field, fieldPath)} key={field} 
						saveFn={() => debounceSaveFn(field, 'myloop@app')} />
				</div>
				<div className={'col-md-8'}>
					<PropControl type={type} options={options} className={isHeader ? 'profile-name' : ''} 
						path={fieldPath} prop={'value'} placeholder={field} 
						saveFn={() => debounceSaveFn(field, 'myloop@app')}
					/>
				</div>
			</div>	
		);
	}
	const v = DataStore.getValue(path.concat([field, 'value']));
	// ?? profile-name: better to use a bootstrap instead of a custom css class
	return (
		<div className='row vertical-align' key={'data-control-' + field}> 
			{isHeader ? null : <div className='col-md-1'>{label(field, fieldPath)}</div>}
			<div className={'col-md-8' + (isHeader ? ' profile-name' : '')}>
				{v || capitalise(field)}
			</div>
		</div>
	);
};

/** 
 * TODO Try to avoid adhoc data structures like xidObj -- they easily get confusing.
 * 
 * Checkboxes for all items in 'dataFields'
 *  Can also edit data field when 'edit mode' is enabled.
 */
const PermissionControls = ({xidObj}) => {
	if(!xidObj || !xidObj.xid || !xidObj.dataFields) return null;

	const {xid, dataFields} = xidObj;
	const path = userdataPath.concat(xid);

	const profileImage = DataStore.getValue(path.concat('img'));

	// Move debounceSaveFn and editMode in to PermissionControlRow?

	// Save function. Can only be called once every 5 seconds
	// Important that this be stored somewhere more permanent than the component body
	// If you don't, a debounce function will be created on each redraw,
	// causing a save to fire on every key stroke.
	let debounceSaveFn = DataStore.getValue(['widget', 'DigitalMirror', xid, 'debounceSaveFn']);
	if( !debounceSaveFn ) {
		debounceSaveFn = _.debounce((field, from) => saveFn(xid, field, from), 1000);
		DataStore.setValue(['widget', 'DigitalMirror', xid, 'debounceSaveFn'], debounceSaveFn);
	}

	let visible = DataStore.getValue(['widget','DigitalMirror','autosaveTriggered']);

	const editModeEnabled = DataStore.getValue(['widget', 'DigitalMirror', 'editModeEnabled']);
	const toggleEditMode = () => {
		DataStore.setValue(['widget', 'DigitalMirror', 'editModeEnabled'], !editModeEnabled);
	};

	return (
		<div>
			<div className="mirror">
				<div className='description'>
					<p>Your data can help us boost the amount that is donated whenever you see one of our ads.</p>
					<p>And you get to choose what information you share.</p>
				</div>
				<div className='container'>
					<div className='row'>
						<div className="col-md-4 profile-details">
							{dataFields.map( fieldObj => PermissionControlRow(path, fieldObj, debounceSaveFn, editModeEnabled))}
						</div>
						<div className='col-md-5 profile-photo'>
							{ profileImage ? <img src={profileImage.value} alt='user-profile' /> : null}
						</div>
					</div>
				</div>				
			</div>
			<div>
				<div>
					<button className='btn btn-default edit' onClick={toggleEditMode} type='button'> Edit </button>
					{ visible === true ? <span className='autosave'>Saved Successfully</span> : null }
				</div>
			</div>
		</div>
	);
};

// This is just a proof of concept.
// If we end up going with this method, would want to use images that represent the relevant data field
const label = (field, fieldPath) => {
	let fieldValue = DataStore.getValue(fieldPath);
	// If there is data, will be in form {permission: bool, value: 'val'}
	fieldValue = fieldValue && fieldValue.value;

	const icon = iconFromField(field, fieldValue);

	return (	
		icon ? (
			<div className="input-label">
				{icon}
			</div>
		): null
	);
};

// TODO use Crud instead
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
	setTimeout(() => DataStore.setValue(['widget','DigitalMirror', 'autosaveTriggered'], false), 1000);
};

/** Minor TODO Maybe use css text-effect instead
 * Little helper method to capitalise first character in a given string */
const capitalise = (string) => {
	return string[0].toUpperCase() + string.slice(1);
};

export default DigitalMirrorCard;

