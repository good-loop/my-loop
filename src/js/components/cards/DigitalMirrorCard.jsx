// Collection of controls for managing
// social media data linked by the user
import React, {useEffect, useRef} from 'react';
import _ from 'lodash';
import {XId, encURI} from 'wwutils';

import PropControl from '../../base/components/PropControl';
import DataStore from '../../base/plumbing/DataStore';
import Claim from '../../base/data/Claim';
import {saveProfileClaims} from '../../base/Profiler';
import ServerIO from '../../plumbing/ServerIO';
import {useLogsIfVisible} from '../../base/components/CustomHooks';

const userdataPath = ['widget', 'DigitalMirror', 'userdata'];

/**
 * @param {*} doesIfVisibleRef Pass this to component, MixPanel tracking event will be sent out if the element is ever completely visible on user's screen
 */
const DigitalMirrorCard = ({xids}) => {
	if(!xids) return null;

	const twitterXId = xids.find( xid => XId.service(xid) === 'twitter' );

	// Possibly overkill?
	useEffect( () => {
		if( !twitterXId ) return;
		ServerIO.load(`${ServerIO.PROFILER_ENDPOINT}/profile/${ServerIO.dataspace}/${encURI(twitterXId)}`, {swallow:true})
			.then( res => DataStore.setValue([...userdataPath, twitterXId], res.cargo, false));
	}, [twitterXId]);

	let doesIfVisibleRef = useRef();
	useLogsIfVisible(doesIfVisibleRef, 'DigitalMirrorVisible');

	return (
		<div ref={doesIfVisibleRef}>
			<ConsentControls xid={twitterXId} />
		</div>
	);
};

const debounceSaveFn = _.debounce(({xid, data, from}) => saveFn(xid, data, from), 3000);

/**
 * @param fieldType is just PropControl's type. What kind of input field do you want
 * @param iconFn should return Font Awesome/other icon element. Is a function because icon should change based on value of field
*/
const ConsentControlRow = ({path, prop, fieldType, iconFn, selectOptions, xid}) => {
	const editModeEnabled = DataStore.getValue(['widget', 'DigitalMirror', 'editModeEnabled']);

	// Shows where value for text field is not available
	const placeholder = 'Unknown ' + prop;
	const value = DataStore.getValue([...path, prop]);

	return (
		<div className='row flex-row flex-centre top-p-1'> 
			<div className='col-md-1 input-label'>
				{iconFn && iconFn(value)}
			</div>
			<div className={'col-md-11' + (value ? '' : ' text-muted')}>
				{
					editModeEnabled
						? <PropControl 
							type={fieldType}
							path={path} 
							prop={prop}
							options={selectOptions}
							saveFn={() => debounceSaveFn({data: DataStore.getValue(path), from: 'myloop@app', prop, xid})}
						/>
						:(value || placeholder)
				}
			</div>
		</div>
	);
};

/** 
 * Checkboxes for all items in 'dataFields'
 *  Can also edit data field when 'edit mode' is enabled.
 */
const ConsentControls = ({xid}) => {
	const path = [...userdataPath, xid, 'std'];
	const claims = DataStore.getValue(path);

	if( !claims || !xid ) {
		return null;
	}

	const {img} = claims;
	const hasSaved = DataStore.getValue(['widget', 'DigitalMirror', 'autosaveTriggered']);

	const toggleEditMode = () => {
		const currentValue = DataStore.getValue(['widget', 'DigitalMirror', 'editModeEnabled']);
		DataStore.setValue(['widget', 'DigitalMirror', 'editModeEnabled'], !currentValue);
	};

	return (
		<div>
			<div className="mirror">
				<div className='description'>
					<p>Your data can help us boost the amount that is donated whenever you see one of our ads.</p>
				</div>
				<div className='container-fluid word-wrap'>
					<div className='col-sm-2' />
					<div className='col-sm-3 profile-photo'>
						{img && <img className='img-thumbnail img-profile' src={img} alt='user-profile' />}
					</div>
					<div className="col-sm-5 profile-details">
						<ConsentControlRow 
							xid={xid}
							path={path}
							prop='name' 
							fieldType='text'
						/>
						<ConsentControlRow 
							xid={xid}
							path={path}
							prop='gender' 
							fieldType='select'
							selectOptions={['', 'male', 'female']}
							iconFn={value => value === 'female' ? <i className='fa fa-venus' /> : ( value === 'male' ? <i className='fa fa-mars' /> : <i className='fa fa-genderless' />)} 
						/>
						<ConsentControlRow 
							xid={xid} 
							path={path}
							prop='location' 
							fieldType='text' 
							iconFn={() => <i className='fa fa-globe' />} 
						/>
						<ConsentControlRow 
							xid={xid} 
							path={path}
							prop='job' 
							fieldType='text' 
							iconFn={() => <i className='fa fa-briefcase' />} 
						/>
						<ConsentControlRow 
							xid={xid} 
							path={path}
							prop='relationship' 
							fieldType='select'
							selectOptions={['', 'Single', 'In a relationship', 'Engaged', 'Married', 'Divorced', 'Widowed', 'Not specified']}
							iconFn={() => <i className='fa fa-heart' />} 
						/>
					</div>
					<div className='col-sm-2' />
				</div>				
			</div>
			<div className='p-1'>
				<div>
					<button className='btn btn-default edit' onClick={toggleEditMode} type='button'> Edit </button>
					{ hasSaved && <span className='autosave'>Saved Successfully</span> }
				</div>
			</div>
		</div>
	);
};

// TODO use Crud instead
// Save updated parameters to user's Profiler space
// Note that this 
// Want to deal be a able to deal with an array of fields
// Important for editing data held where we use a "Save" button
/**
 * @param from optional
 * @param fieldObjs [{field: "name"}, {field: "relationship"}] is rough format expected
 * Will deconstruct and, for each 'field' value, generate a Claim to be sent to the back-end
 * Wanted it to bulk save all data fields like this to work-around a bug (31/10/18) where typing
 * quickly meant that only the first field edited would be saved. Caused by race against debounce
 */
const saveFn = (xid, data, from) => {
	// to inform the user that an autosave event happened
	DataStore.setValue(['widget','DigitalMirror', 'autosaveTriggered'], true);

	if( !from ) from = [xid];
	else from = [xid].concat(from);

	// Allow blank string
	if( !data ) return;

	let claims = [];
	Object.keys(data).forEach( key => {
		claims = [...claims, new Claim({key, value: data[key], from, c: true})];
	});

	saveProfileClaims(xid, claims);
	setTimeout(() => DataStore.setValue(['widget', 'DigitalMirror', 'autosaveTriggered'], false), 1000);
};

export default DigitalMirrorCard;
