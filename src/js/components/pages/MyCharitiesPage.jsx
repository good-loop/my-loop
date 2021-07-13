import React, { useState } from 'react';
import csv from 'csvtojson';
import { Container } from 'reactstrap';
import Paginator from '../Paginator';
import MyLoopNavBar from '../MyLoopNavBar';
import C from '../../C';
import ActionMan from '../../plumbing/ActionMan';
import { yessy } from '../../base/utils/miscutils';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import CharityLogo from '../CharityLogo';

/**
 * TODO refactor - merge with the lower level handling of mapping Good-Loop data to SoGive IDs
 */
const dntnTrackerToSogiveID = charity => {
	const id = {
		"Art Fund": "national-art-collections-fund",
		"Battersea Dogs & Cats Home": "battersea-dogs-and-cats-home",
		"Care International": "care-international-uk",
		"CARE International": "care-international-uk",
		"Friends of the Earth": "friends-of-the-earth",
		"Great Ormond Street": "great-ormond-street-hospital-childrens-charity",
		"Meningitis Foundation": "meningitis-research-foundation",
		"Prince of Wales Trust": "prince-s-trust",
		"Save The Children": "the-save-the-children-fund",
		"Save The Children:": "the-save-the-children-fund",
		Shelter: "shelter-national-campaign-for-homeless-people-limited",
		"MS Society": "the-multiple-sclerosis-society-of-great-britain-and-northern-ireland",
		"CoppaFeel!": "coppafeel",
		"Learning through Landscapes": "the-learning-through-landscapes-trust",
		Mind: "national-association-for-mental-health",
		"MIND (less their BS fees)": "national-association-for-mental-health",
		"Habitat for Humanity": "habitat-for-humanity-gb",
		"Wildlife Sampling": "wildlife-blood-sampling",
		"Helen Bamber":"helenbamber",
		"The Mix": "youthnet",
		UNICEF: "unicef-uk",
		"British Red Cross": "the-british-red-cross-society",
		"War Child": "war-child-uk",
		"Make a Wish": "make-a-wish-uk",
		"??Nordoff Robins??": "nordoff-robbins-music-therapy-in-scotland",
		BHF: "british-heart-foundation",
		TBC: "tbc-productions",
		"Centre Point": "centrepoint-soho",
		RSPCA: "royal-society-for-the-prevention-of-cruelty-to-animals",
		"Canine Partners": "canine-partners-for-independence",
		"Fare Share": "fare-share-trust"
	}[charity];
	return id;
};

const MyCharitiesPage = () => {

	const [charityIDs, setCharities] = useState([]);

	let charities = [];

	// Parse CSV from donations tracker into json
	if (!yessy(charityIDs)) {
		fetchAllCharityIDs().then(chars => setCharities(chars)).catch(status => console.error("Failed to get donation tracker CSV! Status: " + status));
	} else {
		charities = fetchAllCharities(charityIDs);
		// Get logo charities
		charities = charities.filter(c => c.logo);
	}

	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
		<div className="MyCharitiesPage">
			<img src="/img/LandingBackground/Charities_banner.png" className="w-100 mt-5" alt="banner" />
			<Container className="py-5">
				<h1>Charities that benefit</h1>
				<Paginator rows={5} cols={7} rowsMD={2} colsMD={5} pageButtonRangeMD={1} displayCounter displayLoad>
					{charities.map((c, i) => <div className="p-3 d-flex justify-content-center align-items-center" style={{height: "140px"}}>
						<CharityLogo charity={c} key={i} style={{maxWidth: "100%", maxHeight:"100%"}} link/>
					</div>)}
				</Paginator>
			</Container>
		</div>
	</>);
};

/*
	TODO use DataStore.fetch instead of window.fetch
 * Fetches list of all charities from the donation tracker CSV
 * Split from fetchAllCharities so that the CSV list can be cached while the sogive requests can update per render
 */
const fetchAllCharityIDs = () => {
	let charities = [];
	return new Promise ((resolve, reject) => {
		// Parse CSV from donations tracker into json
		window.fetch('/charities.csv')
			.then(res => {
				if (res.status !== 200) {
					reject(res.status);
				}
				return res.text();
			})
			.then(csvStr => {
				csv({
					noheader:true,
					output: "csv"
				})
					.fromString(csvStr)
					.then(csvRow => {
						let charList = [];
						for (let i = 5; i < csvRow.length; i++) {
							const charity = csvRow[i][7];
							if (charity && !charList.includes(charity)) charList.push(charity);
						}
						resolve(charList);
					});
			});
	});
};
/** TODO refactor. Split munging csv data out from fetching SoGive data. If something is doing a fetch, it should return a PromiseValue */
const fetchAllCharities = (csvData) => {
	let charities = [];
	// Get sogive data for charities
	for (let i = 0; i < csvData.length; i ++) {
		const charity = fetchCharity(csvData[i]);
		if (charity) charities.push(charity);
	}
	return charities;
};
/** TODO This looks overly complex -- What's the scenario where vanilla ActionMan.getDataItem() doesn't work? */
const fetchCharity = (id) => {

	let pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:normaliseSogiveId(id), status:C.KStatus.PUBLISHED, swallow:true});
	if ( ! pvCharity.value) {
		const mappedId = dntnTrackerToSogiveID(id);
		if (!mappedId) {
			return null;
		}
		pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:mappedId, status:C.KStatus.PUBLISHED, swallow:true});
		if ( ! pvCharity.value) {
			return null;
		}
		if (pvCharity.error) {
			return null; // offline maybe
		}
	}
	if (pvCharity.error) {
		return null; // offline maybe
	}
	let charity = pvCharity.value;
	if (!charity.id) charity.id = id;
	return charity;
};

export { fetchAllCharities, fetchAllCharityIDs, fetchCharity };
export default MyCharitiesPage;
