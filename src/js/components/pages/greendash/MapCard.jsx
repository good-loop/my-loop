import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { id } from '../../../../../GLAppManifest';
import StyleBlock from '../../../base/components/StyleBlock';
import { getCarbon } from './carboncalc';
import { dataColours, GreenCard } from './dashutils';


// When querying each country, what sub-location type should we breakdown on?
const subLocationForCountry = (country) => ({
	UK: 'locn_sub2', // Counties
	// We default to locn_sub1, so we can omit these - keep as comments for reference.
	// US: 'locn_sub1', // States
	// AU: 'locn_sub1', // States
	// CA: 'locn_sub1', // States
}[country] || 'locn_sub1');


const SVGMap = ({ mapDefs, data, setFocusCountry, svgRef }) => {
	if (!mapDefs) return null;

	return <svg id="geo-heat-map" style={{stroke: 'none'}} version="1.1" {...mapDefs.svgAttributes} xmlns="http://www.w3.org/2000/svg" ref={svgRef} >
		{Object.entries(mapDefs.regions).map(([id, props]) => {
			let { carbon = 0, colour } = (data[id] || {});
			if (!carbon.toFixed) debugger;
			let unit = 'kg';
			if (carbon >= 1000) {
				carbon /= 1000;
				unit = 't';
			}
			return <path key={id} fill={colour} onClick={() => setFocusCountry(id)} {...props}>
				<title>{props.name}: {carbon.toFixed(2)} {unit} CO2e</title>
			</path>
		})}
	</svg>;
};


const MapCard = ({ baseFilters }) => {
	const [mapData, setMapData] = useState({}); // Object mapping region ID to imps + carbon
	const [focusCountry, setFocusCountry] = useState(); // ID of currently focused country
	const [mapDefs, setMapDefs] = useState();
	const [svgEl, setSvgEl] = useState();

	// Fetch the JSON with the map data for the current focus country
	useEffect(() => {
		fetch(`/js-data/mapdefs-${focusCountry || 'world'}.json`)
			.then(res => res.json())
			.then(json => setMapDefs(json));
	}, [focusCountry]);

	// Which location or sub-location type do we want? Country, sub-1, sub-2?
	const locationField = focusCountry ? subLocationForCountry(focusCountry) : 'country'

	// Augment base filters with extra query/breakdown params as necessary
	const filters = { ...baseFilters, breakdown: [locationField] };

	// Are we looking at one country, or the whole world map?
	if (focusCountry) {
		// Restrict results to this country, so we can breakdown on sub-location.
		filters.q = SearchQuery.setPropOr(new SearchQuery(filters.q), 'country', [focusCountry]).query;
		filters.focusCountry = focusCountry;
		filters.subLocationField = locationField;
	};

	const pvChartData = getCarbon(filters);

	useEffect(() => {
		if (!pvChartData.value) return;
		if (!mapDefs) return;

		// Country or sub-location breakdown?
		const locnTable = pvChartData.value.tables[locationField].slice(1);

		// Aggregate together "not shown on this map" rows in the table
		let processedRows = locnTable.map(row => {
			const key = row[0];
			// apply any aliases specified by the map definition (eg collapse US territories to one name)
			const alias = mapDefs.aliases[key];
			if (alias) return [alias, ...row.slice(1)];
			// Rename locations with no corresponding map entry to OTHER
			if (!mapDefs.regions[key]) {
				// convert old non-namespaced sublocations e.g. 'CA' => 'US-CA'
				let fixedKey = `${focusCountry}-${key}`;
				if (!mapDefs.regions[fixedKey]) fixedKey = ''
				return [fixedKey, ...row.slice(1)];
			}
			return row;
		}).reduce((acc, row) => {
			// transform to object and combine rows which have same location ID
			const prevRow = acc[row[0]];
			if (!prevRow) {
				acc[row[0]] = row;
			} else {
				prevRow[1] += row[1]; // impression count
				prevRow[2] += row[2]; // carbon kg
			}
			return acc;
		}, {});

		// ...and back from object to array
		processedRows = Object.values(processedRows);

		// assign colours
		const colours = dataColours(processedRows.map(row => row[2]));
		// zip colours, states, carbon together for the map
		setMapData(processedRows.reduce((acc, row, i) => {
			acc[row[0]] = { colour: colours[i], carbon: row[2] };
			return acc;
		}, {}));
	}, [pvChartData.value]);

	// if (mapData) console.warn('********************** MAPDATA', mapData);
	
	return (
		<GreenCard title="Where are your emissions produced?" className="carbon-map flex-column">
			{focusCountry && <p>
				Current focus: <strong>{mapDefs.name}</strong>
				<span className="pull-right">
					<a href="#" onClick={() => setFocusCountry()}>World Map</a>
				</span>
			</p>}
			<SVGMap setFocusCountry={setFocusCountry} mapDefs={mapDefs} data={mapData} svgRef={setSvgEl} />
			<a className="text-center" download="green-map.svg" href={`data:image/svg+xml,${encodeURIComponent(svgEl?.outerHTML)}`}>
				Download
			</a>
		</GreenCard>
	);
};


export default MapCard;
