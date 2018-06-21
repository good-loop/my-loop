import React from 'react';

import { assert } from 'sjtest';
import { Grid, Row, Col } from 'react-bootstrap';
import C from '../C';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import Misc from '../base/components/Misc';
import {getType, getId} from '../base/data/DataClass';
import {encURI} from 'wwutils';
import NGO from '../data/NGO';

const COOPLABELS = {
	ALLOW_OTHERS: "allow other charities (recommended)",
	MUST_USE_ONLY_MINE: "must use only my charities",
	MUST_USE_SOME_OF_MINE: "must use one of my charities"
};

/**
 * className Normally blank!
 */
const CharityControls = ({entity, ...other}) => {
	let type = getType(entity);
	assert(C.TYPES.has(type), "CharityControls.jsx - no/bad type", entity);
	assert(entity.id, "CharityControls.jsx - no id", entity);
	let path = ['data', type, entity.id, 'charities'];
	const charitiesList = (entity.charities && entity.charities.list) || [];
	// Is it ready (3 charities setup)?
	let ready = isReady(charitiesList);
	return (
		<Misc.Card title='Charities' warning={ready? null : 'not complete'} {...other} >
			<Misc.PropControl label='Allow other charities?'
				help={`Where possible, we prefer to show one charity each picked by the publisher, the advertiser, and the user.
				Some advertisers / publishers insist on more control. 
				Allowing other charities will give you the maximum £ value.`}
				item={entity.charities} path={path} prop='otherCharities' type='select'
				options={['ALLOW_OTHERS', 'MUST_USE_ONLY_MINE', 'MUST_USE_SOME_OF_MINE']}
				labels={COOPLABELS}
			/>
			<Grid fluid><Row>
				<Col sm={4}><CharityForm entity={entity} i={0} charity={charitiesList[0]} /></Col>
				<Col sm={4}><CharityForm entity={entity} i={1} charity={charitiesList[1]} /></Col>
				<Col sm={4}><CharityForm entity={entity} i={2} charity={charitiesList[2]} /></Col>
			</Row></Grid>
			<h4>Parent charity</h4>
			<p>Are the above entries actually projects of a single charity? If so, pick it (and change its displayable name if necessary) here.</p>
			<CharityPicker path={path.concat('parent')} />
			{entity.charities && entity.charities.parent ? (
				<Misc.PropControl label='Name' item={entity.charities.parent} path={path.concat(['parent'])} prop='name' />
			) : ''}
		</Misc.Card>
	);
};

const isReady = (charitiesList) => {
	// TODO also test that each charity is ready
	return charitiesList && charitiesList.length >= 3;
};

// //	{id:'Battersea Dogs & Cats Home', name:'Battersea Dogs & Cats Home', url:'https://www.battersea.org.uk/', logo: BURL+"mock-server/battersea-square-logo.png"},
const CharityForm = ({entity, charity, i}) => {
	assert(entity);
	if ( ! charity) charity = {};
	let type = getType(entity);
	let path = ['data', type, entity.id, 'charities', 'list', i];	
	return (
		<div className='well'>
			<h4>Charity {i+1}</h4>
			<CharityPicker path={path} />
			<Misc.PropControl label='name' item={charity} path={path} prop='name' />
			<Misc.PropControl label='url' type='url' item={charity} path={path} prop='url' />
			<Misc.PropControl label='White Logo' type='img' item={charity} path={path} prop='logo_white' bg={charity.color || '#3333aa'} />
			<Misc.PropControl label='Brand Colour' type='color' item={charity} path={path} prop='color' />
			<Misc.PropControl label='Colour Logo' type='img' item={charity} path={path} prop='logo' bg='white' />
			<Misc.PropControl label='Small Print' item={charity} path={path} prop='smallPrint' help='For charities which e.g. have a financial structure which donors must legally be made aware of.' />
			<Misc.PropControl label='Circle Crop Factor' item={charity} path={path} prop='circleCrop' type='number' max={100} min={0} />
			<div style={{backgroundColor: 'white', borderRadius: '50%', border: '1px solid grey', height: '100px', width: '100px', textAlign: 'center', overflow: 'hidden'}}>
				<img src={charity.logo} style={{
						height: `${charity.circleCrop || 100}%`, width: `${charity.circleCrop || 100}%`, 
						marginTop: `${(100 - (charity.circleCrop || 100)) / 2}%`, objectFit: 'contain'
					}} 
				/>
			</div>
		</div>
	);
};


const CharityPicker = ({path}) => {
	let charity = DataStore.getValue(path) || {};
	return (<div>
		<Misc.PropControl label='ID' item={charity} path={path} prop='id' 			
			type='autocomplete'
			modelValueFromInput={v => {
				if ( ! v) return v;
				// NB: runs on change only, otherwise it keeps looping, as the adserver & sogive servers return !== json.
				// NB: ServerIO.js getData will call SoGive for NGO data
				// Swallow errors, which we get whilst the user is typing
				let pvcharityData = ActionMan.getDataItem({type:C.TYPES.NGO, id:v, swallow:true, status:C.KStatus.PUBLISHED});
				pvcharityData.promise.then(res => {
					if ( ! res) return; // not a charity
					console.warn("set this data into the entity!!", res, charity);
					NGO.assIsa(res);
					// use SoGive data to fill-in, but prefer local data
					charity = Object.assign({}, res, charity);
					// set the filled-in charity data into the charity object.
					DataStore.setValue(path, charity);
				});
				return v;
			}}
			getItemValue={item => { console.warn("getItemValue", item); return getId(item) || 'no id'; }}
			renderItem={(item, isHighlighted) => {
				console.warn("renderItem", item);
				return (<div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
					{item.name || getId(item)}
				</div>); }
			}
			options={val => {
				console.warn("fetch options for "+val);
				// FIXME prefix handling! SoGive supports it, but the DB needs a refresh
				return $.ajax({
					url: 'https://app.sogive.org/search.json',
					data: {q: val}
				}).then(res => {
					console.warn("autocomp", res);
					let opts = res.cargo && res.cargo.hits; // [{'@id':'oxfam','id':'oxfam'}];
					return opts;
				});
			}}
		/>		
		<div>
			{charity.id? 
				<a href={'https://app.sogive.org/#edit?charityId='+encURI(charity.id)} target='_blank'>open in SoGive editor</a> 
				: <span className='disabled'>open in SoGive editor</span>}
			<h4><Misc.Thumbnail item={charity} /> {charity.name}</h4>
		</div>
	</div>);
}; // ./CharityPicker


export default CharityControls;
