// Collection of controls for managing
// social media data linked by the user
import React from 'react';
import {assMatch} from 'sjtest';
import _ from 'lodash';
import PropControl from '../base/components/PropControl';
import DataStore from '../base/plumbing/DataStore';
import {createClaim, saveProfile, getClaimsForXId, saveProfileClaims} from '../base/Profiler';
import ServerIO from '../plumbing/ServerIO';
import Misc from '../base/components/Misc';
import Map from '../components/InteractiveMap';
// import InteractiveMap from '../components/InteractiveMap';

// @param dataFields: data that we would like to pull from corresponding social media site's API
// Just Twitter for the moment.
const socialMedia = [
	{
		service: 'twitter',
		idHandle: '@twitter',
		dataFields: ['name', 'location', 'relationship', 'job', 'gender'] // keys should match back-end/Datastore
	}
];

const ImageFromField = {
	name: 'https://amazonfashionweektokyo.com/en/wp-content/uploads/2016/01/Name_logo.jpg',
	location: 'https://images.idgesg.net/images/article/2017/07/location-pixabay-1200x800-100728584-large.jpg',
	relationship: 'https://s3.amazonaws.com/skinner-production/stories/featured_images/000/029/872/large/manage-work-relationship.jpg?1525026134',
	job: 'https://www.bing.com/th?id=OIP.PPBMLiYljuluJZtFxAZwDQHaHa&w=204&h=196&c=7&o=5&pid=1.7',
	gender: 'https://www.bing.com/th?id=OIP.i9b5MNDSvtAjd-u2Q8zPIwHaGE&w=241&h=193&c=7&o=5&pid=1.7'
};

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

/** Checkboxes for all items in 'dataFields'
 *  Can also edit data field when 'edit mode' is enabled.
 */
const PermissionControls = ({xidObj}) => {
	if(!xidObj || !xidObj.xid || !xidObj.dataFields) return null;

	const {xid, dataFields} = xidObj;
	const path = userdataPath.concat(xid);

	return (
		<div className="social-media-permissions">
			<div className="container">
				<h5 className='text-muted'> This data was taken from {xidObj.service}</h5>
				<div className="col-md-6 controls">
					{
						dataFields.map( field => {
							return (
								<div className='row data-control equal-column-height' key={'data-control-' + field}> 
									<div className='col-md-6'>
										<PropControl type="checkbox" path={path.concat(field)} prop={'permission'} label={label({xid, field, path})} key={field} saveFn={() => saveFn(xid, field)} />
									</div>
									<div className='col-md-6'>
										<PropControl type='text' path={path.concat(field)} prop={'value'} placeholder={field} style={{width: 'auto'}} />
									</div>
								</div>
							);
						})
					}
				</div>
				<div className='col-md-6 map' />
			</div>
		</div>
	);
};

// This is just a proof of concept.
// If we end up going with this method, would want to use images that represent the relevant data field
const label = ({xid, field, path}) => {
	const objPath = path.concat([field]);	

	return (
		<div className="input-label">
			<img style={{height: 'auto', width: '150px', marginRight: '15px'}} alt={field} src={ImageFromField[field] || 'https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/v1/722207/banner-illustration-publisher-no-hearts_lppr8a.jpg'} />
		</div>
	);
};

// Save updated parameters to user's Profiler space
// Note that this 
// Want to deal be a able to deal with an array of fields
// Important for editing data held where we use a "Save" button
const saveFn = (xid, fields) => {
	if(_.isString(fields)) fields = [fields];

	let claims = [];

	fields.forEach( field => {
		const data = DataStore.getValue(userdataPath.concat([xid, field]));

		// Allow blank string
		if( ! data && data !== '' ) return;
	
		const {value, permission} = data;
	
		const claim = createClaim({key: field, value, from: xid, p: permission});
		claims = claims.concat(claim);
	});

	saveProfileClaims(xid, claims, ServerIO.getJWTForService('twitter'));
};

// Clears all values from DataStore, then pushes Claims back up
const deleteFn = (xid, fields) => {
	if(!_.isArray(fields)) fields = [fields];

	fields.forEach( field => DataStore.setValue(userdataPath.concat([xid, field]), ''));
	saveFn(xid, fields);
};

module.exports = {
	DigitalMirrorCard
};
