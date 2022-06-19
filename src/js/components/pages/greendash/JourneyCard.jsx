import React, { useEffect, useState } from 'react';
import Misc from '../../../base/components/Misc';

import { A } from '../../../base/plumbing/glrouter';
import { encURI } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import { getCarbon } from './carboncalc';
import { GreenCard, GreenCardAbout, Mass } from './dashutils';


const Cloud = ({style}) => (
	<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg" className="cloud-graphic">
		<path style={style} d="M 40,0 C 29.182518,0.01697 20.339065,8.6319771 20.039062,19.445312 l -0.002,-0.002 C 18.657533,18.192739 16.862063,17.500031 15,17.5 10.857864,17.5 7.5,20.857864 7.5,25 7.50382,26.864819 8.202234,28.661331 9.4589844,30.039062 4.1635381,30.325958 0.01294938,34.696804 0,40 0,45.522847 4.4771525,50 10,50 h 80 c 5.522847,0 10,-4.477153 10,-10 0,-5.522847 -4.477153,-10 -10,-10 -0.852191,0.0053 -1.700209,0.119501 -2.523438,0.339844 0.01038,-0.113089 0.0182,-0.2264 0.02344,-0.339844 0,-4.142136 -3.357864,-7.5 -7.5,-7.5 C 80,15.596441 74.403559,10 67.5,10 64.294077,10.010424 61.214712,11.252239 58.898438,13.46875 56.114012,5.409736 48.526473,0.002163 40,0 Z"/>
	</svg>
);

/** Show mass of CO2 emitted and offset by the campaigns in focus 
 * 
 * ??Let's rename all co2 variables to be eg "co2OffsetKgs" for clarity
 * 
*/
const CO2Section = ({co2Offset, co2Emitted}) => {
	let cloudMessage = null;
	if (co2Offset && co2Emitted) {
		cloudMessage = (co2Offset < co2Emitted) ? (
			<>Offsets<br/>Pending</>
		) : (
			<>Carbon<br/>Neutral</>
		);
	}
	
	return <>
		<div className="cloud-indicator">
			<Cloud style={{fill: '#8bc'}} />
			<h3 className="cloud-message">{cloudMessage}</h3>
		</div>
		<h3 className="carbon-offset-total">
			{co2Offset ? <><Mass kg={co2Offset} /> of carbon offset</> : 'Fetching carbon offset...'}
		</h3>
		<h3 className="carbon-emission-total">
			{co2Emitted ? <><Mass kg={co2Emitted} /> emitted</> : 'Fetching total emissions...'}
		</h3>
	</>
};

/** Show number of trees planted by the campaigns in focus */
const TreesSection = ({treesPlanted}) => {
	if (!treesPlanted) return null;

	return <>
		<div>
			<img className="journey-tree" src="/img/green/tree-light.svg" />
			<img className="journey-tree" src="/img/green/tree-light.svg" />
			<img className="journey-tree" src="/img/green/tree-light.svg" />
		</div>
		<h3>{printer.prettyInt(treesPlanted)} trees planted</h3>
	</>;
};


/**
 * Show the carbon offsets & tree-planting of the current campaign set & compare estimated emissions.
 * @param {Object} props
 * @param {?Campaign[]} props.campaigns The campaign(s) currently in focus
 * @param {GreenTag[]} props.tags The green ad tag(s) currently in focus
 * @returns 
 */
const JourneyCard = ({ campaigns, tags }) => {
	if ( ! campaigns || ! campaigns.length) {
		return <Misc.Loading text="Fetching your campaign data..." />;
	}

	let offsets = campaigns.reduce((acc, c) => {
		// live co2 data
		// offsets
		if (c.co2) acc.co2 += c.co2;
		if (c.trees) acc.trees += c.trees;
		return acc;
	}, {co2: 0, trees: 0, coral: 0});

	// TODO
	let impactSplashPage = '/green?'; 
	let brandIds = [];
	let agencyIds = []
	if (brandIds.length===1) {
		impactSplashPage += '??'
	}
	// co2Emitted={co2Emitted}
	return <GreenCard title="Your journey so far" className="carbon-journey">
		<CO2Section co2Offset={offsets.co2}  />
		<TreesSection treesPlanted={offsets.trees} />
		<A className="btn btn-primary" href={impactSplashPage}><BrandLogo campaigns={campaigns} /> Impact Overview</A>
		<GreenCardAbout>
			<p>What carbon offsets do we use?</p>
			<p>What tree planting projects do we support?</p>
		</GreenCardAbout>
	</GreenCard>;
};

const BrandLogo = ({campaigns}) => {
	return null; // TODO if campaigns all share one brand, then show the logo
};

export default JourneyCard;
