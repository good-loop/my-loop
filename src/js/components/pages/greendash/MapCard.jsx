import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { id } from '../../../../../GLAppManifest';
import { DownloadCSVLink } from '../../../base/components/SimpleTable';
import StyleBlock from '../../../base/components/StyleBlock';
import { stopEvent } from '../../../base/utils/miscutils';
import Misc from '../../../MiscOverrides';
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


/** Map regions not in the dataset (because there are no events for them)
 * should be the same colour as regions with value 0*/
const zeroFill = dataColours([0, 1])[0];


const MapDownloadCSV = ({ data, mapDefs }) => {
	if (!data || !mapDefs) return 'CSV';

	const cols = [
		new Column({Header: 'Region', accessor: 'name'}),
		new Column({Header: 'Region ISO code', accessor: 'id'}),
		new Column({Header: 'Impressions', accessor: 'impressions'}),
		new Column({Header: 'CO2e (Kg)', accessor: 'carbon'}),
	];

	const tableData = Object.entries(data).map(([id, {impressions, carbon}]) => {
		return { name: mapDefs.regions[id]?.name || 'unknown', id, impressions, carbon };
	}).sort((a, b) => (a.name || '').localeCompare(b.name));

	return <DownloadCSVLink columns={cols} data={tableData}>CSV</DownloadCSVLink>;
};


const SVGMap = ({ mapDefs, data, setFocusRegion, svgRef }) => {
	if (!mapDefs) return null;
	const loading = data === 'loading';

	return <div className="map-container">
		<svg className="map-svg" style={{stroke: 'none'}} version="1.1" {...mapDefs.svgAttributes} xmlns="http://www.w3.org/2000/svg" ref={svgRef} >
			{Object.entries(mapDefs.regions).map(([id, props]) => {
				let { carbon = 0, colour = zeroFill } = (data?.[id] || {});
				let unit = 'kg';
				if (carbon >= 1000) {
					carbon /= 1000;
					unit = 't';
				}

				// don't modify base map with applied fill/stroke!
				props = { ...props, fill: colour }; 

				// Don't paint misleading colours on a map we don't have data for
				if (loading) {
					props.fill = 'none';
					props.stroke = '#bbb';
					props.strokeWidth = '1px';
				}

				// Countries are clickable, sublocations aren't
				if (setFocusRegion) {
					props.style = {cursor: 'pointer'};
					props.onClick = () => setFocusRegion(id);
				}

				const title = loading ? null : <title>{props.name}: {carbon.toFixed(2)} {unit} CO2e</title>;

				return <path key={id} {...props}>{title}</path>;
			})}
		</svg>
		{loading && <Misc.Loading text={`Fetching carbon data for ${mapDefs.name}`} />}
	</div>;
};


const MapCard = ({ baseFilters }) => {
	const [mapData, setMapData] = useState('loading'); // Object mapping region ID to imps + carbon
	const [focusRegion, setFocusRegion] = useState('world'); // ID of currently focused country
	const [mapDefs, setMapDefs] = useState(); // JSON object with map paths and meta
	const [svgEl, setSvgEl] = useState(); // ref to the map SVG to create download button
	const [error, setError] = useState(); // Problems loading map?

	const isWorld = (focusRegion === 'world');
	const mapDefsReady = mapDefs && (mapDefs.id === focusRegion);

	// Fetch the JSON with the map data for the current focus country
	useEffect(() => {
		// No mapdefs for this country? Return to world map and tell user
		const onError = () => {
			setFocusRegion('world');
			setError(`No detailed map available for country code "${focusRegion}"`);
		};

		fetch(`/js-data/mapdefs-${focusRegion}.json`)
			.then(res => {
				if (!res.ok) {
					onError();
					return;
				}
				res.json().then(json => {
					setMapDefs(json);
					// clear error on successfully loading a country map
					if (!isWorld) setError(null);
				}).catch(onError);
			})
	}, [focusRegion]);

	// Which location or sub-location type do we want? Country, sub-1, sub-2?
	const locationField = isWorld ? 'country' : subLocationForCountry(focusRegion);

	// Augment base filters with extra query/breakdown params as necessary
	const filters = { ...baseFilters, breakdown: [locationField] };

	// Are we looking at one country, or the whole world map?
	if (!isWorld) {
		// Restrict results to this country, so we can breakdown on sub-location.
		filters.q = SearchQuery.setPropOr(new SearchQuery(filters.q), 'country', [focusRegion]).query;
		filters.focusCountry = focusRegion;
		filters.subLocationField = locationField;
	};

	const pvChartData = getCarbon(filters);

	useEffect(() => {
		// Don't process data we don't have
		if (!pvChartData.value) {
			setMapData('loading');
			return;
		};
		// Don't process data using metadata for wrong map
		if (!mapDefs || !mapDefsReady) return;

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
				let fixedKey = `${focusRegion}-${key}`;
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
			acc[row[0]] = { colour: colours[i], impressions: row[1], carbon: row[2] };
			return acc;
		}, {}));
	}, [JSON.stringify(filters), pvChartData.value, mapDefs]);



	return (
		<GreenCard title="Where are your emissions produced?" className="carbon-map flex-column" downloadable={false}>
			<SVGMap setFocusRegion={isWorld && setFocusRegion} mapDefs={mapDefs} data={mapData} svgRef={setSvgEl} loading={!mapData} />
			<div className="mt-2 text-center">
				<strong>{mapDefs?.name}</strong>
				<span className="pull-right">
					{isWorld ? 'Click a country to focus' : (
						mapDefsReady && <a href="#" onClick={(e) => { stopEvent(e); setFocusRegion('world');}}>Back</a>
					)}
				</span>
			</div>
			<div className="mt-2 text-center">
				{error ? <small>{error}</small> : <>
					Download{' '}
					<a download="green-map.svg" href={`data:image/svg+xml,${encodeURIComponent(svgEl?.outerHTML)}`}>map</a>{' / '}
					<MapDownloadCSV data={mapData} mapDefs={mapDefs} />
				</>}
			</div>
		</GreenCard>
	);
};


export default MapCard;
