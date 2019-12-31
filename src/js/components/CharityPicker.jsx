import React, { useState, useEffect } from 'react';
import { Container, InputGroup, InputGroupAddon, InputGroupText, Row, Form, FormGroup, Input, Label, Button } from 'reactstrap';
import Login from 'you-again';
import _ from 'lodash';

import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import { saveProfileClaims } from '../base/Profiler';
import Claim from '../base/data/Claim';
import { LoginLink } from '../base/components/LoginWidget';
import C from '../C';


const RESULTS_DISPLAYED = 10;

const CharityPicker = () => {
	// TODO Should charities go in DataStore?
	const [charities, setCharities] = useState([]);
	const [query, setQuery] = useState('');

	const handleChange = e => {
		const q = e.target.value;
		setCharities([]);
		setQuery(q);
		if (q.length === 0) { // If search bar is cleared display no charities.
			setCharities([]);
			return;
		}
		ServerIO.searchCharities({ q, from: 0, status: C.KStatus.PUBLISHED })
			.then(({cargo}) => setCharities(cargo.hits));
	};

	return (
		<Container fluid id="charity-picker-bg">
			<Row className="charity-picker-box top">
				<div className="pick-a-charity-header">
					<h2>Pick a Charity</h2>
					<p>The selected charities will be saved to your Good-Loop account and prioritised in future interactions.</p>
				</div>
			</Row>
			<Row className="charity-picker-box bottom">
				<InputGroup className="search-bar-div">
					{/* class border-right-0 removes grey line between search box and addon */}
					<Input id="search-input" type="search" name="search" className="border-right-0"
						placeholder="Search by charity name or keywords"
						value={query}
						onChange={ _.debounce(handleChange, 300, { leading: true, trailing: false }) }
					/>
					<InputGroupAddon addonType="append">
						<InputGroupText className="bg-white">
							<i className="fas fa-search" />
						</InputGroupText>
					</InputGroupAddon>
				</InputGroup>
				{ charities ? <SearchResults charities={charities} /> : '' }
			</Row>
		</Container>
	);
};

const SearchResults = ({ charities }) => {
	// TODO We can assign saved charities to a @trk ID if the user isn't logged in,
	// but we should maybe tell them it's only saved for this browser
	const profiles = DataStore.getValue('data', 'Person', 'profiles') || {};

	let savedCharities = '';
	Object.values(profiles).forEach(profile => {
		/* TODO Andris' claims list has one entry with k:savedcharities and one with k:savedCharities
		...but the one with k=savedcharities ALSO has kv:savedCharities=etc.
		Do we crush keys down to lowercase when checking for duplicates? Should we? */
		const scClaim = profile.claims.find(claim => claim.k === 'savedCharities');
		const thisSavedCharities = scClaim && scClaim.v ? scClaim.v : '';
		// thisSavedCharities.forEach(charity => savedCharities[charity] = true);
		savedCharities += thisSavedCharities;
	});

	return (
		<div className="shown-results">
			{/* Rewrite for truncated charity list / no search yet / etc*/}
			<p>Showing {charities.length} results</p>
			<div className="charity-card-wrapper">
				{ charities.map(c => {
					// const isSaved = savedCharities[c['@id']] !== undefined;
					const isSaved = savedCharities.includes(c['@id']);
					return <SearchResultCard savedCharities={savedCharities} charity={c} />;
				})}
			</div>
		</div>
	);
};

const saveRemoveCharity = (cid, remove) => {
	let profiles = DataStore.getValue(['data', 'Person', 'profiles']) || [];
	Object.values(profiles).forEach(profile => {
		const scClaim = profile.claims.find(claim => claim.k=== 'savedCharities');
		let savedCharities = [];
		if (scClaim && scClaim.v && _.isString(scClaim.v)) savedCharities = scClaim.v.split(',');

		const index = savedCharities.indexOf(cid);
		if (index >= 0) {
			if (remove) savedCharities.splice(index, 1);
		} else if (!remove) {
			savedCharities.push(cid);
		}

		// const newProfile = { ...profiles, savedCharities: savedCharities.join(',') };
		// Person.saveProfile(newProfile);
		saveProfileClaims(profile.id, [new Claim({key: 'savedCharities', value: savedCharities.join(','), from: 'myloop@app', c: true})]);
	});
};


const SearchResultCard = ({ charity, savedCharities }) => {
	const [saved, setSaved] = useState(false);
	const charityName = charity.displayName || charity.name;
	const charityDescription = charity.summaryDescription || charity.description;

	const isSaved = savedCharities.includes(charity['@id']);
	if (!saved && isSaved) setSaved(isSaved);

	const handlePickerClick = e => {
		const isRemoveBtn = e.target.className.includes('remove');
		saveRemoveCharity(charity['@id'], isRemoveBtn);
		setSaved(!saved);
	};

	const cardButton = saved ? (
		<div className="picker-remove-btn" onClick={handlePickerClick}>Remove charity from your favourites</div>
	) : (
		<div className="picker-save-btn" onClick={handlePickerClick}>Add charity to your favourites</div>
	);

	const charityLogo = charity.logo ? (
		<img className="charity-card-logo" src={charity.logo || ''} alt="charity logo" />
	) : (
		<p>{charityName}</p>
	);

	return (
		<div className={`charity-card ${saved ? 'favourite' : ''}`} key={charity.id}>
			<div className="logo-div">{charityLogo}</div>
			<div className="info-div d-flex">
				<h5 className="charity-card-name">{charityName}</h5>
				<p>{charityDescription}</p>
				{cardButton}
			</div>
		</div>
	);
};

export default CharityPicker;
