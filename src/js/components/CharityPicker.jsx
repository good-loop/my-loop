import React, { useState, useEffect } from 'react';
import { Container, Input } from 'reactstrap';
import _ from 'lodash';

import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import { saveProfileClaims } from '../base/Profiler';
import Claim from '../base/data/Claim';
import C from '../C';

const savingPath = ['widget', 'charityPicker', 'saving'];
DataStore.setValue(savingPath, false);



/**


	TODO Redesign & Refactor
	This component is prob easiest taking the learnings & redoing from scratch.

	- Offer users a search box + some suggestion buttons. Just a search box is potentially confusing.
	- The current code is buggy, and reinvents the wheel using non-GL patterns, inc inefficient data loading.

	@Deprecated 
*/
const CharityPicker = () => {
	// Note: only make quick fixes. Any major work should be done as a re-write.

	// TODO refactor: charities go in DataStore - this widget should not use internal state.
	const [savedCharities, setSavedCharities] = useState([]);
	const [showSearch, setShowSearch] = useState(false);

	// TODO doc fns - what side effects is this trying to have?
	const retrieveSavedCharities = () => {
		const profiles = DataStore.getValue('data', 'Person', 'profiles');
		if ( ! profiles) return; // HACK fix NPE
		let charityIdSet = {};
		Object.values(profiles).forEach(profile => {
			const scClaim = profile.claims.find(claim => claim.k === 'savedCharities');
			const thisSavedCharities = (scClaim && scClaim.v) ? scClaim.v : '';
			thisSavedCharities.split(',').forEach(cid => charityIdSet[cid] = true);
		});

		let charityObjs = [];
		let idsNotFetched = Object.keys(charityIdSet); // Strike off each ID as we get a charity from the server...
		// TODO fetch the list in one ajax call
		Object.keys(charityIdSet).forEach(id => {
			ServerIO.getCharity({id})
				.then(({cargo}) => charityObjs.push(cargo))
				.always(() => {
					// ...Once all charities on the list have been fetched (or failed), update this component
					idsNotFetched.splice(idsNotFetched.indexOf(id), 1);
					if (idsNotFetched.length === 0) setSavedCharities(charityObjs);
				});
		});
	};

	/** Function to save or unsave the charity specified by cid */
	const setSavedCharity = ({charity, remove}) => {
		const newSavedCharities = remove ? savedCharities.filter(c => c['@id'] !== charity['@id']) : savedCharities.concat(charity);
		const newSavedIds = _.uniq(newSavedCharities.map(c => c['@id']));

		const newSavedClaim = new Claim({
			key: 'savedCharities',
			value: newSavedIds.join(','),
			from: 'myloop@app',
			c: true,
		});
		// Grab the existing profiles, create a new Claim with appropriate data for each one
		// and save it to back-end. We save them as claims in the profile in order to generate a full
		// history we can store and use.
		let profiles = DataStore.getValue(['data', 'Person', 'profiles']) || [];
		let xidsToUpdate = Object.keys(profiles);
		console.log(`this are the xids`, profiles);
		const promises = saveProfileClaims(xidsToUpdate, [newSavedClaim]);
		// update each profile when the server responds
		promises.forEach(promise => {
			promise.then(response => console.log('response for profile update:', response));
		});
		// TODO See useEffect below - if this component is bound to user profile, we won't need to do this
		setSavedCharities(newSavedCharities);
	};

	// TODO Don't useEffect - we have other & better ways of doing things.
	// TODO Bind this component to the user profile so we get full saved charity data when it's ready
	useEffect(() => {
		setTimeout(() => retrieveSavedCharities(), 800);
	}, []);

	const headerContents = savedCharities.length ? <>
		<h2>Your Saved Charities</h2>
		<p>These charities will be prioritised in future interactions.</p>
	</> : <>
		<h2>Pick a Charity</h2>
		<p>The selected charities will be saved to your Good-Loop account and prioritised in future interactions.</p>
	</>;

	const showSearchButton = (savedCharities.length && !showSearch) ? (
		<div className="add-charities-btn" role="button" onClick={() => setShowSearch(true)}>Add more charities</div>
	) : null;

	const search = (showSearch || savedCharities.length === 0) ? (
		<CharitySearch savedCharities={savedCharities} setSaved={setSavedCharity} />
	) : null;
	
	return (
		<div id="charity-picker">
			<Container className="charity-picker-inner">
				<div className="charity-picker-header">
					{headerContents}
				</div>
				<div className="saved-charities">
					{savedCharities.map(c => <SearchResultCard charity={c} isSaved setSaved={setSavedCharity} />)}
				</div>
				{showSearchButton}
				{search}
			</Container>
		</div>
	);
};

const CharitySearch = ({savedCharities, setSaved}) => {
	const [query, setQuery] = useState('');
	const [result, setResult] = useState([]);

	const savedCharityIds = savedCharities.map(c => c['@id']);

	const onQueryChange = e => {
		const q = e.target.value;
		setQuery(q);
		if (q.length === 0) { // If search bar is cleared display no charities.
			setResult([]);
			return;
		}
		// Pull out IDs of saved charities for use below
		
		// Calls SoGive and returns appropriate list from that server.
		ServerIO.searchCharities({ q, from: 0, status: C.KStatus.PUBLISHED })
			.then(({cargo}) => {
				// Only show charities not already saved
				const chars = cargo.hits.filter(c => !savedCharityIds.includes(c['@id']));
				setResult(chars);
			});
	};

	const resultsPlural = (result.length === 1) ? 'result' : 'results';

	return <>
		<div className="search-bar">
			{/* class border-right-0 removes grey line between search box and addon */}
			<div className="search-input-container">
				<Input className="search-input" type="search" name="search"
					placeholder="Search by charity name or keywords"
					value={query}
					onChange={ _.debounce(onQueryChange, 300, { leading: true, trailing: false }) }
				/>
				<i className="fas fa-search search-icon" />
			</div>

		</div>
		<div className="search-results">
			{/* Rewrite for truncated charity list / no search yet / etc*/}
			<p>Showing {result.length} {resultsPlural}</p>
			<div className="charity-card-wrapper">
				{result.map(c => {
					const isSaved = savedCharityIds.includes(c['@id']);
					return isSaved ? '' : <SearchResultCard charity={c} isSaved={isSaved} setSaved={setSaved} />;
				})}
			</div>
		</div>
	</>;
};


const SearchResultCard = ({ charity, isSaved, setSaved }) => {
	const charityName = charity.displayName || charity.name;
	const charityDescription = charity.summaryDescription || charity.description;

	// Props for the save/remove button
	const disabled = DataStore.getValue(savingPath);
	const onClick = () => setSaved({charity, remove: isSaved});
	const buttonLabel = (isSaved ? 'Remove charity from' : 'Add charity to') + ' your favourites';

	const charityLogo = charity.logo ? (
		<img className="charity-card-logo" src={charity.logo || ''} alt="charity logo" />
	) : (
		<p>{charityName}</p>
	);

	return (
		<div className={`charity-card ${isSaved ? 'favourite' : ''}`} key={charity.id}>
			<div className="logo-div">{charityLogo}</div>
			<div className="info-div d-flex">
				<h5 className="charity-card-name">{charityName}</h5>
				<p>{charityDescription}</p>
				<div role="button" className="save-remove-btn" disabled={disabled} onClick={onClick}>{buttonLabel}</div>
			</div>
		</div>
	);
};

export default CharityPicker;
