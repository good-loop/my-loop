import React, { useState } from 'react';
import csv from 'csvtojson';
import { Container } from 'reactstrap';
import Paginator from '../Paginator';
import MyLoopNavBar from '../MyLoopNavBar';
import C from '../../C';
import ActionMan from '../../plumbing/ActionMan';
import { yessy } from '../../base/utils/miscutils';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import { CharityLogo } from '../cards/CharityCard';

// FIXME refactor to merge with normaliseSogiveId()
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
	// TODO what data format is this?? We usually use `charities` has type NGO[] 
	// So for strings, prefer a name like `charityIds`
	// NB: You can probably use DataStore instead here
	const [charities, setCharities] = useState([]);

	let charityLogos = [];

	// Parse CSV from donations tracker into json
	if ( ! yessy(charities)) {
		// TODO use DataStore.fetch instead
		window.fetch('/charities.csv')
			.then(res => {
				if (res.status !== 200) {
					console.error("Failed to get CSV! " + res.status);
					return;
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
						setCharities(charList);
					});
			});
	}
	
	// Get sogive data for charities 
	for (let i = 0; i < charities.length; i ++) {
		let cid = charities[i];
		// HACK conversion from ad-hoc id to SoGive id?
		normaliseSogiveId(charities[i]);
		const mappedID = dntnTrackerToSogiveID(cid);
		if (mappedID) cid = mappedID;
		// ?? is normaliseSogiveId() needed here? I thught ServerIO does it as a lower-level hack. ^DW
		let pvCharity = ActionMan.getDataItem({ type: C.TYPES.NGO, id: cid, status: C.KStatus.PUBLISHED });
		let charity = pvCharity.value;
		if (charity && charity.logo) {
			charityLogos.push(charity);
		}
	}	
    
	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
		<div className="MyCharitiesPage">
			<img src="/img/LandingBackground/Charities_banner.png" className="w-100 mt-5" alt="banner" />
			<Container className="py-5">
				<h1>Charities we donate to</h1>
				<Paginator rows={5} cols={7} rowsMD={2} colsMD={5} pageButtonRangeMD={1} displayCounter displayLoad>
					{charityLogos.map((c, i) => <div key={i} className="p-3 d-flex justify-content-center align-items-center" style={{height: "140px"}}>
						<CharityLogo charity={c} style={{maxWidth: "100%", maxHeight:"100%"}} link/>
					</div>)}
				</Paginator>
			</Container>
		</div>
	</>);
};

export default MyCharitiesPage;
