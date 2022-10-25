import React, { Fragment, useEffect, useState } from 'react';
import { Button, Modal, ModalBody } from 'reactstrap';
import { id } from '../../../../../GLAppManifest';
import { DownloadCSVLink } from '../../../base/components/SimpleTable';
import StyleBlock from '../../../base/components/StyleBlock';
import { space, stopEvent } from '../../../base/utils/miscutils';
import Misc from '../../../MiscOverrides';
import { getCarbon } from './carboncalc';
import { dataColours, GreenCard } from './dashutils';
import { getCarbonEmissions } from './emissionscalc';

/**
 * To extract path bounding box centres from an onscreen SVG (in SVG coords)...
Array.from(document.querySelectorAll('.map-svg path')).reduce((acc, path) => {
	const bbox = path.getBBox();
	acc[path.getAttribute('data-id')] = {
		cx: bbox.x + (bbox.width / 2),
		cy: bbox.y + (bbox.height / 2)
	};
	return acc;
}, {});
 * Q: Why do this preprocessing instead of extracting dynamically?
 * A: Countries are weird shapes - storing predefined text centres lets us fine-tune against
 * e.g. Alaska and Hawaii putting the centre of the U.S. in the northern Pacific.
 */

// When querying each country, what sub-location type should we breakdown on?
const subLocationForCountry = (country) =>
	({
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
		new Column({ Header: 'Region', accessor: 'name' }),
		new Column({ Header: 'Region ISO code', accessor: 'id' }),
		new Column({ Header: 'Impressions', accessor: 'impressions' }),
		new Column({ Header: 'CO2e (Kg)', accessor: 'carbon' }),
	];

	const tableData = Object.entries(data)
		.map(([id, { impressions, carbon }]) => {
			return { name: mapDefs.regions[id]?.name || 'unknown', id, impressions, carbon };
		})
		.sort((a, b) => (a.name || '').localeCompare(b.name));

	return (
		<DownloadCSVLink columns={cols} data={tableData}>
			CSV
		</DownloadCSVLink>
	);
};

const SVGMap = ({ mapDefs, data, setFocusRegion, svgRef, showLabels }) => {
	const [pathCentres, setPathCentres] = useState({}); // Estimate region centres from bounding boxes to place text labels

	if (!mapDefs) return null;
	const loading = data === 'loading';

	let regions = [];
	let labels = [];

	Object.entries(mapDefs.regions).forEach(([id, props]) => {
		let { carbon = 0, colour = zeroFill } = data?.[id] || {};
		let unit = 'kg';
		if (carbon >= 1000) {
			carbon /= 1000;
			unit = 't';
		}

		// Don't modify base map with applied fill/stroke!
		props = { ...props, fill: colour, stroke: '#fff', strokeWidth: mapDefs.svgAttributes.fontSize / 10 };

		// Don't paint misleading colours on a map we don't have data for
		if (loading) {
			props.fill = 'none';
			props.stroke = '#bbb';
		}

		// Countries are clickable, sublocations aren't.
		if (setFocusRegion) {
			props.style = { cursor: 'pointer' };
			props.onClick = () => setFocusRegion(id);
		}

		const pathId = `${mapDefs.id}-${id}`;

		// Find the centre of the region's bounding box to position a text label on the bigger map
		const pathRef = showLabels
			? (path) => {
					if (!path) return;
					setPathCentres((prev) => {
						if (prev[pathId]) return prev;
						const bbox = path.getBBox();

						return {
							...prev,
							[pathId]: { cx: bbox.x + bbox.width / 2, cy: bbox.y + bbox.height / 2 },
						};
					});
			  }
			: null;

		// Tooltip on hover
		const title = loading ? null : (
			<title>
				{props.name}: {carbon.toFixed(2)} {unit} CO2e
			</title>
		);

		regions.push(
			<path key={`path-${id}`} data-id={id} {...props} ref={pathRef}>
				{title}
			</path>
		);

		// Skip labels for regions with less than 100g carbon output. Harsh, I know
		if (showLabels && carbon > 0.1 && pathCentres[pathId]) {
			let { cx, cy } = { ...pathCentres[pathId], ...props };
			const transY = mapDefs.svgAttributes.fontSize / 2;

			labels.push(
				<g key={`label-${id}`}>
					<text className='map-label-name' x={cx} y={cy} textAnchor='middle' transform={`translate(0 ${-transY})`} fontWeight='600'>
						{props.name}
					</text>
					<text className='map-label-carbon' x={cx} y={cy} textAnchor='middle' transform={`translate(0 ${transY})`}>
						{carbon.toFixed(2)} {unit}
					</text>
				</g>
			);
		}
	});

	return (
		<div className='map-container text-center'>
			<svg className='map-svg' version='1.1' {...mapDefs.svgAttributes} xmlns='http://www.w3.org/2000/svg' ref={svgRef}>
				{regions}
				{labels}
			</svg>
			{loading && <Misc.Loading text={`Fetching carbon data for ${mapDefs.name}`} />}
		</div>
	);
};

const MapCardEmissions = ({ baseFilters }) => {
	const [mapData, setMapData] = useState('loading'); // Object mapping region ID to imps + carbon
	const [focusRegion, setFocusRegion] = useState('world'); // ID of currently focused country
	const [mapDefs, setMapDefs] = useState(); // JSON object with map paths and meta
	const [svgEl, setSvgEl] = useState(); // ref to the map SVG to create download button
	const [error, setError] = useState(); // Problems loading map?
	const [popOut, setPopOut] = useState(false); // Pop out card for larger map?

	const isWorld = focusRegion === 'world';
	const mapDefsReady = mapDefs && mapDefs.id === focusRegion;

	// Fetch the JSON with the map data for the current focus country
	useEffect(() => {
		// No mapdefs for this country? Return to world map and tell user
		const onError = () => {
			setFocusRegion('world');
			setError(`No detailed map available for country code "${focusRegion}"`);
		};

		fetch(`/js-data/mapdefs-${focusRegion}.json`).then((res) => {
			if (!res.ok) {
				onError();
				return;
			}
			res
				.json()
				.then((json) => {
					setMapDefs(json);
					// clear error on successfully loading a country map
					if (!isWorld) setError(null);
				})
				.catch(onError);
		});
	}, [focusRegion]);

	// Which location or sub-location type do we want? Country, sub-1, sub-2?
	const locationField = isWorld ? 'country' : subLocationForCountry(focusRegion);

	// Augment base filters with extra query/breakdown params as necessary
	const filters = { ...baseFilters, breakdown: [locationField + '{"emissions":"sum"}'] };

	// Are we looking at one country, or the whole world map?
	if (!isWorld) {
		// Restrict results to this country, so we can breakdown on sub-location.
		filters.q = SearchQuery.setPropOr(new SearchQuery(filters.q), 'country', [focusRegion]).query;
		filters.focusCountry = focusRegion;
		filters.subLocationField = locationField;
	}

	const pvChartData = getCarbonEmissions(filters);

	useEffect(() => {
		// Don't process data we don't have
		if (!pvChartData.value) {
			setMapData('loading');
			return;
		}
		// Don't process data using metadata for wrong map
		if (!mapDefs || !mapDefsReady) return;

		// Country or sub-location breakdown?
		const locnBuckets = pvChartData.value['by_' + locationField].buckets;

		// Rename locations with no corresponding map entry to OTHER
		// convert old non-namespaced sublocations e.g. 'CA' => 'US-CA'
		// combine data with same key to cleanedLocnBuckets
		const cleanedLocnBuckets = Object.values(
			locnBuckets.reduce((acc, val) => {
				const k = (mapDefs.id !== 'world' && !mapDefs.regions[val.key]) ? `${focusRegion}-${val.key}` : val.key;

				acc[k] = acc[k]
					? {
							key: k,
							count: acc[k].count + val.count,
							doc_count: acc[k].doc_count + val.doc_count,
							co2: acc[k].co2 + val.co2,
							co2base: acc[k].co2base + val.co2base,
							co2creative: acc[k].co2creative + val.co2creative,
							co2supplypath: acc[k].co2supplypath + val.co2supplypath,
					  }
					: val;

				return {...acc};
			}, {})
		);

		// assign colours
		const colours = dataColours(cleanedLocnBuckets.map((row) => row.co2));
		// zip colours, states, carbon together for the map
		setMapData(
			cleanedLocnBuckets.reduce((acc, row, i) => {
				acc[row.key] = { colour: colours[i], impressions: row.count, carbon: row.co2 };
				return acc;
			}, {})
		);
	}, [JSON.stringify(filters), pvChartData.value, mapDefs]);

	const cardContents = (
		<>
			<div className='mb-2 text-center'>
				<strong>{mapDefs?.name}</strong>
			</div>
			<SVGMap setFocusRegion={isWorld && setFocusRegion} mapDefs={mapDefs} data={mapData} svgRef={setSvgEl} loading={!mapData} showLabels={popOut} />
			<div className='mt-2 map-controls'>
				<span className='pull-left'>
					{error ? (
						<small>{error}</small>
					) : (
						<>
							Download{' '}
							<a download={`green-map-${focusRegion}.svg`} href={`data:image/svg+xml,${encodeURIComponent(svgEl?.outerHTML)}`}>
								map
							</a>
							{' / '}
							<MapDownloadCSV data={mapData} mapDefs={mapDefs} />
						</>
					)}
				</span>
				<span className='pull-right'>
					{isWorld
						? 'Click to focus'
						: mapDefsReady && (
								<a
									href='#'
									onClick={(e) => {
										stopEvent(e);
										setFocusRegion('world');
									}}
								>
									Back
								</a>
						  )}
				</span>
			</div>
		</>
	);

	return (
		<GreenCard title='Where are your emissions produced?' className='carbon-map flex-column' downloadable={false}>
			<div role='button' className='pop-out-button' onClick={() => setPopOut(true)}>
				⇱
			</div>
			{!popOut && cardContents}
			<Modal className='carbon-map' isOpen={popOut} toggle={() => setPopOut(!popOut)} size='xl'>
				<ModalBody>{popOut && cardContents}</ModalBody>
			</Modal>
		</GreenCard>
	);
};

export default MapCardEmissions;
