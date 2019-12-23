import React, { useState, useEffect } from 'react';
import { Container, InputGroup, InputGroupAddon, InputGroupText, Row, Form, FormGroup, Input, Label, Button } from 'reactstrap';
import Login from 'you-again';

import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import Profiler from '../base/Profiler';
import Person from '../base/data/Person';
import { LoginLink } from '../base/components/LoginWidget';


const RESULTS_PER_PAGE = 10;

const CharityPicker = () => {
	const [state, setState] = useState(null);

	let q = DataStore.getUrlValue('q');
	let from = DataStore.getUrlValue('from') || 0;
	const status = DataStore.getUrlValue('status') || '';

	const charityCards = () => {
		return state ? state.charities.map( c => <SearchResultCard item={c} /> ) : '';
	};

	return (
		<Container fluid id="charity-picker-bg">
			<Row className="charity-picker-box top">
				<div className="pick-a-charity-header">
					<h2>Pick a Charity</h2>
					<p>By choosing a preferred charity, we'll automatically make donations to them on your behalf where possible.</p>
				</div>
			</Row>
			<Row className="charity-picker-box bottom">
				<div className="search-bar-div">
					<SearchForm query={q} from={from} status={status} setState={setState} state={state} />
				</div>
				{ state ? <div className="shown-results">
					<p>{ state ? `Showing ${state ? state.charities.length : 0} results found` : '' }</p>
					<div className="charity-card-wrapper">
						{ state ? charityCards() : '' }
					</div>
				</div> : '' }
			</Row>
		</Container>
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
	const handleKeyUp = e => {
		if (e.key === 'Enter') {
			searchCharity();
		}
	};

	return (
		<div>
			<InputGroup>
				<Input
					type="search"
					name="search"
					id="search-input"
					placeholder="Search your charity..."
					value={value.q}
					onChange={handleChange}
					onKeyUp={handleKeyUp}
					className="border-right-0"
				/>
				<InputGroupAddon addonType="append">
					<InputGroupText className="bg-white">
						<i className="fas fa-search" />
					</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
};

const SearchResultCard = ({ item, CTA, onPick }) => {
	const [isFavourite, setIsFavourite] = useState(false);
	const xids = DataStore.getValue('data', 'Person', 'xids');

	const charityName = item.displayName || item.name;
	const charityDescription = item.summaryDescription || item.description;
	const charityId = item['@id'];

	useEffect(() => {
		// When the component is mounted check if the user has saved charity ids in their profile, and if the current one's among them.
		// If the user is not logged in default to false.
		const savedCharities = Login.isLoggedIn() ? DataStore.getValue(['data', 'Person', 'profiles'])[xids[0]].savedCharities : false;
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
	};

	// Remove the current charity's id from the user's profile.
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

	const cardButton = () => {
		if (!Login.isLoggedIn()) return <LoginLink><div className="picker-login-btn">Login to save your charity!</div></LoginLink>;
		if (isFavourite) {
			return removeCharityButton;
		}
		return saveCharityButton;
	};

	const charityLogo = () => {
		if (item.logo) return <img className="charity-card-logo" src={item.logo || ''} alt="charity logo" />;
		return <p>{ charityName }</p>;
	};

	return (
		<div className={ `charity-card ${isFavourite ? 'favourite' : ''}` } key={ item.id }>
			<div className="logo-div">
				{ charityLogo() }
			</div>
			<div className="info-div d-flex">
				<p>
					<span className="charity-card-name">{charityName} </span><br />
					{ charityDescription }
				</p>
				{ cardButton() }
			</div>
		</div>
	);
};

export default CharityPicker;
