import React, { useState, useEffect } from 'react';
import { Container, Row, Form, FormGroup, Input, Label, Button } from 'reactstrap';

import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import Profiler from '../base/Profiler';
import Person from '../base/data/Person';

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
		return state ? state.charities.map( c => <SearchResultCard item={c} /> ) : '';
	};

	return (
		<Container className="charity-picker-box">
			<div className="pick-a-charity-header">
				<h2>Pick a Charity</h2>
				<p>By choosing a preferred charity, we'll automatically make donations to them on your behalf where possible.</p>
			</div>
			<div className="search-bar-div">
				<SearchForm query={q} from={from} status={status} setState={setState} state={state} />
			</div>
			<div className="shown-results">
				<p>{ state ? `Showing ${state ? state.charities.length : 0} results found` : '' }</p>
				{ state ? charityCards() : '' }
			</div>
		</Container>
	);
};

const SearchResults = ({charities}) => {


	return (
		<div className="search-results-div">
			<p>{ `Showing ${charities.length} results found` }</p>
			<div>
				{ charities }
			</div>
		</div>
	);
};

const SearchForm = ({from, status, query, setState, state}) => {
	const [value, setValue] = useState('');
	
	useEffect(() => {
		setValue(DataStore.getUrlValue('q') || '');
	}, []);

	const maxCharities = charities => {
		if (charities <= 10) return charities;
		return charities.slice(0, 10);
	};

	const searchCharity = async () => {
		DataStore.setUrlValue('q', value);
		DataStore.setUrlValue('from', from);

		let data = await ServerIO.searchCharities({ q: value || query, from, size: RESULTS_PER_PAGE, status });
		let charities = maxCharities(data.cargo.hits);
		let total = data.cargo.total;
		setState({ ...state, total, charities });
	};


	const handleChange = e => {
		setValue(e.target.value);
		searchCharity();
	};
	const handleSubmit = e => {
		e.preventDefault();
		searchCharity();
	};

	return (
		<Form>
			<FormGroup>
				<Input
					type="test"
					name="search"
					id="search-input"
					placeholder="Search your charity..."
					value={value.q}
					onChange={handleChange}
				/>
				<Button onClick={handleSubmit}>Submit</Button>
			</FormGroup>
		</Form>
	);
};

const SearchResultCard = ({ item, CTA, onPick }) => {
	const [isFavourite, setIsFavourite] = useState(false);

	const charityName = item.displayName || item.name;
	const charityDescription = item.summaryDescription || item.description;
	const charityLogo = item.logo ? 
		<img style={{maxWidth: '100px'}} src={ item.logo } alt="charity logo" />
		: <div className="charity-logo-placeholder">{charityName}</div>;
	const charityId = item['@id'];

	const xids = DataStore.getValue('data', 'Person', 'xids');

	useEffect(() => {
		const savedCharities = DataStore.getValue(['data', 'Person', 'profiles'])[xids[0]].savedCharities;
		const isPresent = savedCharities ? savedCharities.includes(charityId) : false;
		setIsFavourite(isPresent);
	}, []);

	// We save the selected charity's id in the user's profiles in the DataStore.
	const saveCharity = () => {
		let profiles = DataStore.getValue(['data', 'Person', 'profiles']);
		xids.forEach(id => {
			const charitiesIdArray = profiles[id].savedCharities ? [...profiles[id].savedCharities, charityId] : [charityId]; 
			profiles[id] = { ...profiles[id], savedCharities: charitiesIdArray };
			Person.saveProfile(profiles[id]);
			setIsFavourite(true);
		});
		// profiles.forEach(profile => Person.saveProfile(profile));
	};

	const removeCharity = () => {
		let profiles = DataStore.getValue(['data', 'Person', 'profiles']);
		xids.forEach(id => {
			let charitiesIdArray = profiles[id].savedCharities ? profiles[id].savedCharities : [];
			charitiesIdArray = charitiesIdArray.filter(e => e !== charityId);
			profiles[id] = { ...profiles[id], savedCharities: charitiesIdArray };
			Person.saveProfile(profiles[id]);
			setIsFavourite(false);
		});
	};

	const saveCharityButton = <div className="picker-save-btn" onClick={saveCharity}>Add charity to your favourites</div>;
	const removeCharityButton = <div className="picker-remove-btn" onClick={removeCharity}>Remove charity from your favourites</div>;

	return (
		<div className="charity-card" key={ item.id }>
			<div className="logo-div">
				<img className="charity-card-logo" src={item.logo || ''} alt="charity logo" />
			</div>
			<div className="info-div d-flex">
				<p>
					<span className="charity-card-name">{charityName} </span>
					{ charityDescription }
				</p>
				{ isFavourite ? removeCharityButton : saveCharityButton }
			</div>
		</div>
	);
};

export default CharityPicker;
