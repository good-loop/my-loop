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

const SimplifiedCharityControls = ({entity, path, ...other}) => {
	let charities = DataStore.getValue(path);
	let type = getType(entity);
	assert(C.TYPES.has(type), "CharityControls.jsx - no/bad type", entity);
	assert(entity.id, "CharityControls.jsx - no id", entity);

	return (
		<Misc.Card title='Charities' {...other} >
			<Misc.PropControl label='Allow other charities?'
				help={`Where possible, we prefer to show one charity each picked by the publisher, the advertiser, and the user.
				Some advertisers / publishers insist on more control. 
				Allowing other charities will give you the maximum £ value.`}
				item={charities} path={['data', type, entity.id, 'charities']} prop='otherCharities' type='select'
				options={['ALLOW_OTHERS', 'MUST_USE_ONLY_MINE', 'MUST_USE_SOME_OF_MINE']}
				labels={COOPLABELS}
			/>
			<Grid fluid><Row>
				<Col sm={4}><SimplifiedCharityForm path={path} i={0} /></Col>
				<Col sm={4}><SimplifiedCharityForm path={path} i={1} /></Col>
				<Col sm={4}><SimplifiedCharityForm path={path} i={2} /></Col>
			</Row></Grid>
		</Misc.Card>
	);
};

// //	{id:'Battersea Dogs & Cats Home', name:'Battersea Dogs & Cats Home', url:'https://www.battersea.org.uk/', logo: BURL+"mock-server/battersea-square-logo.png"},
const SimplifiedCharityForm = ({path, i}) => {
	const proppath = path.concat(`${i}`);
	let charity = DataStore.getValue(proppath);//entity.charities && entity.charities.list && entity.charities.list[i] || {};
	return (
		<div className='well'>
			<h4>Charity {i+1}</h4>
			<Misc.PropControl
				label='Name:	'
				item={charity}
				path={proppath}
				prop={'name'}
				type='autocomplete'
				modelValueFromInput={(v) => {
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
						DataStore.setValue(proppath, res);
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
			<button 
				title={'Click to remove this charity'}
				onClick={() => DataStore.setValue(proppath, {})}
			> 
				<Misc.Icon glyph='remove' />
			</button>
			<div style={{backgroundColor: 'white', borderRadius: '50%', border: '1px solid grey', height: '100px', width: '100px', textAlign: 'center', overflow: 'hidden'}}>
				<img
					src={charity.logo}
					style={{height: `${charity.circleCrop || 100}%`, width: `${charity.circleCrop || 100}%`, marginTop: `${(100 - (charity.circleCrop || 100)) / 2}%`, objectFit: 'contain', }}
					alt={charity.name? `Logo for ${charity.name}` : ''}
				/>
			</div>
		</div>
	);
};

export default SimplifiedCharityControls;
