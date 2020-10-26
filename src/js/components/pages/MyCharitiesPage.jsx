import React, { useState } from 'react';
import csv from 'csvtojson';
import { Container } from 'reactstrap';
import Paginator from '../Paginator';
import MyLoopNavBar from '../MyLoopNavBar';
import C from '../../C';
import ActionMan from '../../plumbing/ActionMan';
import { yessy } from '../../base/utils/miscutils';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';

const MyCharitiesPage = () => {

	const [charities, setCharities] = useState([]);
	const csvFile = "/charities.csv";
	let jsonObj = [];
    
	if (!yessy(charities)) window.fetch('/charities.csv')
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
	else {
        for (let i = 0; i < charities.length; i ++) {
            const pvCharity = ActionMan.getDataItem({ type: C.TYPES.NGO, id: normaliseSogiveId(charities[i]), status: C.KStatus.PUBLISHED });
            const charity = pvCharity.value;
            if (charity) {
                console.log(charity);
            }
        }
	}
    
	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
		<div className="MyCharitiesPage">
			<img src="/img/LandingBackground/Charities_banner.png" className="w-100"/>
			<Container className="py-5">
				<h1>Charities we donate to</h1>
				<Paginator rows={5} cols={10}>
					{charities.map(c => <div className="charity">{c}</div>)}
				</Paginator>
			</Container>
		</div>
	</>);
};

export default MyCharitiesPage;
