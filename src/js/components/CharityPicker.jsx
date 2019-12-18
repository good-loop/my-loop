import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Input, Label, Button } from 'reactstrap';

import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import Profiler from '../base/Profiler';
import C from '../C';

const RESULTS_PER_PAGE = 10;

const CharityPicker = () => {
	const [state, setState] = useState(null);

	useEffect(() => {
		console.log(state);
	}, [state]);

	let q = DataStore.getUrlValue('q');
	let from = DataStore.getUrlValue('from') || 0;
	const status = DataStore.getUrlValue('status') || '';
	let searchPager;

	const charityCards = () => {
		const charitySlice = state.charities > 10 ? state.charities.slice(0, 10) : state.charities;
		return charitySlice.map( c => <SearchResultCard item={c} /> );
	};

	return (
		<>
			<SearchForm query={q} from={from} status={status} setState={setState} state={state} />
			{ state ? charityCards() : '' }
		</>
	);
};


const SearchResults = () => {

};

const SearchForm = ({from, status, query, setState, state}) => {
	const [value, setValue] = useState('');
	
	useEffect(() => {
		setValue(DataStore.getUrlValue('q') || '');
	}, []);

	const searchCharity = async () => {
		DataStore.setUrlValue('q', value);
		DataStore.setUrlValue('from', from);

		let data = await ServerIO.searchCharities({ q: value || query, from, size: RESULTS_PER_PAGE, status });
		let charities = data.cargo.hits;
		let total = data.cargo.total;
		setState({ ...state, total, charities});
	};


	const handleChange = e => setValue(e.target.value);
	const handleSubmit = e => {
		e.preventDefault();
		searchCharity();
	};

	return (
		<Form>
			<FormGroup>
				<Label>Search</Label>
				<Input
					type="test"
					name="search"
					id="search-input"
					value={value.q}
					onChange={handleChange}
				/>
				<Button onClick={handleSubmit}>Submit</Button>
			</FormGroup>
		</Form>
	);
};

const SearchResultCard = ({ item, CTA, onPick }) => {
	const charityName = item.displayName || item.name;
	const charityDescription = item.summaryDescription || item.description;
	const charityLogo = item.logo ? 
		<img style={{maxWidth: '100px'}} src={ item.logo } alt="charity logo" />
		: <div className="charity-logo-placeholder">{charityName}</div>;
	const charityId = item['@id'];

	const xids = DataStore.getValue('data', 'Person', 'xids');

	// We save the selected charity's id in the user's profiles in the DataStore.
	const saveCharity = () => {
		let profiles = DataStore.getValue(['data', 'Person', 'profiles']);
		xids.forEach(id => {
			const charitiesIdArray = profiles[id].savedCharities ? [...profiles[id].savedCharities, charityId] : [charityId]; 
			profiles[id] = { ...profiles[id], savedCharities: charitiesIdArray };
		});
		DataStore.setValue(['data', 'Person', 'profiles'], profiles);
	};

	const removeCharity = () => {
		let profiles = DataStore.getValue(['data', 'Person', 'profiles']);
		xids.forEach(id => {
			let charitiesIdArray = profiles[id].savedCharities ? profiles[id].savedCharities : [];
			charitiesIdArray = charitiesIdArray.filter(e => e !== charityId);
			profiles[id] = { ...profiles[id], savedCharities: charitiesIdArray };
		});
		DataStore.setValue(['data', 'Person', 'profiles'], profiles);
	};

	const saveCharityButton = <button type="button" onClick={saveCharity}>save btn</button>;
	const removeCharityButton = <button type="button" onClick={removeCharity}>remove btn</button>

	// Check if this charity is already saved by the user. Used for styling and to avoid saving duplicates.
	const isFavourite = () => {
		const savedCharities = DataStore.getValue(['data', 'Person', 'profiles'])[xids[0]].savedCharities;
		return savedCharities ? savedCharities.includes(charityId) : false;
	};

	return (
		<div key={ item.id }>
			{ charityLogo }
			{ charityName }
			{ charityDescription }
			{ isFavourite() ? removeCharityButton : saveCharityButton }
			<br></br>
			{ `${isFavourite()}` }
		</div>
	);
};

export default CharityPicker;
