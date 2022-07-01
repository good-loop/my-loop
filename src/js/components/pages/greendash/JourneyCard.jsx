import React from 'react';
import Misc from '../../../base/components/Misc';
import Logo from '../../../base/components/Logo';
import Campaign from '../../../base/data/Campaign';
import DataStore from '../../../base/plumbing/DataStore';

import { A } from '../../../base/plumbing/glrouter';
import { encURI } from '../../../base/utils/miscutils';
import printer from '../../../base/utils/printer';
import { getCarbon, getOffsetsByType } from './carboncalc';
import { GreenCard, GreenCardAbout, Mass } from './dashutils';
import { getDataItem } from '../../../base/plumbing/Crud';
import KStatus from '../../../base/data/KStatus';
import { isTester } from '../../../base/Roles';
import { DownloadCSVLink } from '../../../base/components/SimpleTable';


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
const CO2Section = ({co2Offset}) => <>
	<div className="cloud-indicator">
		<Cloud style={{fill: '#8bc'}} />
	</div>
	<h3 className="carbon-offset-total">
		{co2Offset !== null ? <><Mass kg={co2Offset} /> of carbon offset</> : 'Fetching carbon offset...'}
	</h3>
</>;


/** Show number of trees planted by the campaigns in focus */
const TreesSection = ({treesPlanted, coralPlanted}) => {
	if (!treesPlanted && !coralPlanted) return null;

	return <>
		<div>
			<img className="journey-tree" src="/img/green/tree-light.svg" />
			<img className="journey-tree" src="/img/green/tree-light.svg" />
			<img className="journey-tree" src="/img/green/tree-light.svg" />
		</div>
		{treesPlanted? <h3>{printer.prettyInt(treesPlanted)} trees planted</h3> : null /* NB: avoid "0" */}
		{coralPlanted? <h3>{printer.prettyInt(coralPlanted)} pieces of coral planted</h3> : null}
	</>;
};


/**
 * Show the carbon offsets & tree-planting of the current campaign set & compare estimated emissions.
 * @param {Object} props
 * @param {?Campaign[]} props.campaigns The campaign(s) currently in focus
 * @param {?Boolean} props.emptyTable Carbon data loaded but empty - show "no data" insead of "loading campaigns"
 * @returns 
 */
const JourneyCard = ({ campaigns, period, emptyTable }) => {
	if (emptyTable) return (
		<GreenCard title="Your journey so far" className="carbon-journey">
			<p>No data available for your current filters.</p>
		</GreenCard>
	);
	
	if (!campaigns || !campaigns.length) {
		return <Misc.Loading text="Fetching your campaign data..." />;
	}

	let isLoading;
	const offsetTypes = "carbon trees coral".split(" ");


	let offsets = {}; // HACK will include carbonTotal etc too
	offsetTypes.forEach(ot => offsets[ot+"Total"] = 0);
	campaigns.forEach(campaign => {
		const offsets4type = getOffsetsByType({campaign, period});
		offsetTypes.forEach( ot => offsets[ot+"Total"] += (offsets4type[ot+"Total"] || 0) );
		if (offsets4type.isLoading) isLoading = true;
	});

	// Which impact splash page to link to?
	// TODO test for an agency
	// NB: We don't want to just link to the campaign in the url -- we want to always have a master campaign
	let impactSplashPage, brandOrAgency;
	let masterCampaigns = campaigns.filter(Campaign.isMaster);
	if (masterCampaigns.length===1) {
		impactSplashPage = "/green/"+encURI(masterCampaigns[0].id);
	} else {
		// in the url??
		const brandId = DataStore.getUrlValue("brand");
		const agencyId = DataStore.getUrlValue("agency");
		if (brandId) {
			impactSplashPage = '/green?brand='+encURI(brandId);
			brandOrAgency = getDataItem({type:C.TYPES.Advertiser,id:brandId, status:KStatus.PUBLISHED}).value;	
		} else if (agencyId) {
			impactSplashPage = '/green?agency='+encURI(agencyId);
			brandOrAgency = getDataItem({type:C.TYPES.Agency,id:agencyId, status:KStatus.PUBLISHED}).value;	
		} else {
			// 1st master campaign (if there is one)			
			let masters = campaigns.map(Campaign.masterFor).filter(m => m.id);
			if (masters.length) {
				// HACK pick the first
				let spec = Object.assign({status:KStatus.PUBLISHED}, masters[0]);
				impactSplashPage = '/green?'+
					({Agency: "agency", Advertiser: "brand"}[spec.type])+"="+encURI(spec.id);
				let pvBrandOrAgency = getDataItem(spec);
				brandOrAgency = pvBrandOrAgency.value;	
			}
		}
	}
	// HACK a download for us
	let downloadCSVLink;
	if (isTester()) {
		let sq = SearchQuery.setPropOr(null, 'campaign', campaigns.map(c => c.id));
		let pvCarbonData = getCarbon({
			q: sq.query,
			start: period?.start.toISOString() || '2022-01-01',
			end: period?.end.toISOString() || 'now'
		});
		if (pvCarbonData.value) {
			let table = pvCarbonData.value.table;
			let columns = table[0];
			let data = table.slice(1);
			let objdata = data.map(row => {
				let obj = {};
				columns.forEach((c, i) => obj[c] = row[i]);
				return obj;
			});
			downloadCSVLink = <DownloadCSVLink columns={columns} data={objdata} />;
		}
	}

	return <GreenCard title="Your journey so far" className="carbon-journey">
		{isLoading? <Misc.Loading /> : <div>
			<CO2Section co2Offset={offsets.carbonTotal} />
			<TreesSection treesPlanted={offsets.treesTotal} coralPlanted={offsets.coralTotal} />
		</div>}
		{impactSplashPage && <A className="btn btn-primary" href={impactSplashPage}><Logo item={brandOrAgency} /> Impact Overview</A>}
		{downloadCSVLink}
		<GreenCardAbout>
			<p>What carbon offsets do we use?</p>
			<p>What tree planting projects do we support?</p>
			<p>Campaigns now have info on their non-CO2-offset projects!</p>
		</GreenCardAbout>
		{DataStore.getUrlValue("period") !== "all" && <small>The offsets shown are for campaigns that overlap the time period.</small>}
	</GreenCard>;
};

export default JourneyCard;
