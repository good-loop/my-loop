import React, { useEffect, useState } from 'react';

import { getDataLogData } from '../../../base/plumbing/DataLog';
import printer from '../../../base/utils/printer';
import { byId, dataToCarbon, GreenCard, Mass, impsToBytes } from './dashutils';


const Cloud = ({style}) => (
	<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg" className="cloud-graphic">
		<path style={style} d="M 40,0 C 29.182518,0.01697 20.339065,8.6319771 20.039062,19.445312 l -0.002,-0.002 C 18.657533,18.192739 16.862063,17.500031 15,17.5 10.857864,17.5 7.5,20.857864 7.5,25 7.50382,26.864819 8.202234,28.661331 9.4589844,30.039062 4.1635381,30.325958 0.01294938,34.696804 0,40 0,45.522847 4.4771525,50 10,50 h 80 c 5.522847,0 10,-4.477153 10,-10 0,-5.522847 -4.477153,-10 -10,-10 -0.852191,0.0053 -1.700209,0.119501 -2.523438,0.339844 0.01038,-0.113089 0.0182,-0.2264 0.02344,-0.339844 0,-4.142136 -3.357864,-7.5 -7.5,-7.5 C 80,15.596441 74.403559,10 67.5,10 64.294077,10.010424 61.214712,11.252239 58.898438,13.46875 56.114012,5.409736 48.526473,0.002163 40,0 Z"/>
	</svg>
);

/** Show mass of CO2 emitted and offset by the campaigns in focus */
const CO2Section = ({co2Offset, co2Emitted}) => {
	if (!co2Offset) return null;

	
	const diff = co2Offset - co2Emitted;
	const diffFactor = Math.abs(diff / co2Offset);

	const cloudStyle = {fill: 'white', strokeWidth: 2};
	let cloudMessage;
	if (diffFactor < 0.05) {
		cloudStyle.stroke = '#aef';
		cloudMessage = 'neutral'
	} else if (diff < 0) {
		cloudStyle.stroke = '#fc7';
		cloudMessage = 'positive';
	} else {
		cloudStyle.stroke = '#6e5';
		cloudMessage = 'negative'
	}
	
	return <>
		<div className="cloud-indicator">
			<Cloud style={cloudStyle} />
			<h3 className="cloud-message">
				Carbon<br/>{cloudMessage}
			</h3>
			
		</div>
		<h3 className="carbon-offset-total"><Mass kg={co2Offset} /> of carbon offset</h3>
		<h3 className="carbon-emission-total"><Mass kg={co2Emitted} /> emitted</h3>
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
 * Show the lifetime carbon offsets & tree-planting of the current campaign set & compare estimated emissions.
 * @param {Object} props
 * @param {Campaign[]} props.campaigns The campaign(s) currently in focus
 * @param {GreenTag[]} props.tags The green ad tag(s) currently in focus
 * @returns 
 */
const JourneyCard = ({ campaigns, tags }) => {
	if (!campaigns || !campaigns.length || !tags) return 'fart';

	// Total carbon offset / trees planted for all campaigns
	const {co2: co2Offset, trees: treesPlanted} = campaigns.reduce((acc, c) => {
		if (c.co2) acc.co2 += c.co2;
		if (c.trees) acc.trees += c.trees;
		return acc;
	}, {co2: 0, trees: 0});

	const [co2Emitted, setCo2Emitted] = useState();

	// Different from the data retrieved in GreenMetrics: no time limit (as it compares to all-time carbon offsets)
	const pvAllTimeData = getDataLogData({
		dataspace: 'green',
		q: `evt:pixel AND (${campaigns.map(c => `campaign:${c.id}`).join(' OR ')})`,
		breakdowns: ['adid'],
		start: '1970-01-01'
	});

	// 
	useEffect(() => {
		if (!pvAllTimeData.resolved) {
			setCo2Emitted(null);
			return;
		}
		const atd = pvAllTimeData.value;
		const totalBytes = impsToBytes(atd.by_adid.buckets, byId(tags));
		setCo2Emitted(dataToCarbon(totalBytes));
	}, [pvAllTimeData.resolved]);

	return <GreenCard title="Your journey so far" className="carbon-journey">
		<CO2Section co2Offset={co2Offset} co2Emitted={co2Emitted} />
		<TreesSection treesPlanted={treesPlanted} />
	</GreenCard>;
};

export default JourneyCard;
