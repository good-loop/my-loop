import React, { Fragment, useEffect, useState } from 'react';
import { Button, Modal, ModalBody } from 'reactstrap';
import { DownloadCSVLink } from '../../../base/components/SimpleTable';
import { space, stopEvent } from '../../../base/utils/miscutils';
import Misc from '../../../MiscOverrides';
import { dataColours, GreenCard } from './dashutils';
import { emissionsPerImpressions, getCarbonEmissions } from './emissionscalc';
import { isPer1000 } from './GreenMetricsEmissions';
// Doesn't need to be used, just imported so MiniCSSExtractPlugin finds the LESS
import CSS from '../../../../style/green-map-card.less';

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


/**
 * For positioning labels on an SVG map.
 * @param {Path} path An SVG <path> element.
 * @return {Object} The centre of the path's bounding box in format {cx, cy}
 */
const bbCentre = (path) => {
	const bbox = path.getBBox();
	return ({ cx: bbox.x + bbox.width / 2, cy: bbox.y + bbox.height / 2 })
};


/** OS-independent download (downward arrow in in-tray) icon */
const downloadIcon = <svg viewBox="0 0 100 100" className="icon download-icon">
	<path d="m5 70v25h90v-25h-5v20h-80v-20z"/>
	<path d="m45 10v50h-10l15 15 15-15h-10v-50h-10z"/>
</svg>;


/**
 * Provide CSV and SVG download links for the data shown on the map.
 */
const MapDownloader = ({data, svgEl, mapDefs, focusRegion}) => {
	if (!data || !svgEl || !mapDefs) return null;

	const cols = [
		new Column({ Header: 'Region', accessor: 'name' }),
		new Column({ Header: 'Region ISO code', accessor: 'id' }),
		new Column({ Header: 'Impressions', accessor: 'impressions' }),
		new Column({ Header: 'CO2e (Kg)', accessor: 'carbon' }),
	];

	// The table to download as .CSV
	const tableData = Object.entries(data)
	.map(([id, { impressions, carbon }]) => {
		return { name: mapDefs.regions[id]?.name || 'unknown', id, impressions, carbon };
	})
	.sort((a, b) => (a.name || '').localeCompare(b.name));

	// Rather than try to induce React to regenerate the link when the SVG contents change,
	// let's just lazy-read the SVG on click, so the download is definitely up-to-date.
	const downloadSvg = (e) => {
		stopEvent(e);
		const link = document.createElement('a');
		link.href = `data:image/svg+xml,${encodeURIComponent(svgEl?.outerHTML)}`;
		link.download = `green-map-${focusRegion}.svg`;
		link.style = { display: 'none' };
		document.body.appendChild(link); // This trick doesn't work in Firefox unless it's in the DOM
		link.click();
		document.body.removeChild(link);
	};

	return <div className="map-downloader">
		{downloadIcon}{' '}
		<a onClick={downloadSvg} href="#">Map</a>{' / '}
		<DownloadCSVLink columns={cols} data={tableData}>.CSV</DownloadCSVLink>
	</div>
};


const SVGMap = ({ mapDefs, data, setFocusRegion, svgRef, showLabels, per1000 }) => {
	const [pathCentres, setPathCentres] = useState({}); // Estimate region centres from bounding boxes to place text labels

	if (!mapDefs) return null;
	const loading = data === 'loading';

	let regions = [];
	let labels = [];

	// Do we display kg or tonnes?
	let unit = 'kg';
	let divisor = 1;
	if (Math.max(Object.values(data).map(v => v.carbon)) >= 1000) {
		unit = 't';
		divisor = 1000;
	}
	// Add suffix for carbon-per-mille?
	if (per1000) unit += '/1000';

	Object.entries(mapDefs.regions).forEach(([id, props]) => {
		let { carbon = 0, colour = zeroFill } = data?.[id] || {};
		carbon /= divisor; // If we're displaying tonnes, convert from kg

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

		// Once path is drawn, find the centre of the region's bounding box to position a text label on the bigger map
		const pathRef = showLabels ? (path) => {
			if (!path) return;
			setPathCentres((prev) => {
				if (prev[pathId]) return prev;
				return { ...prev, [pathId]: bbCentre(path) };
			});
		} : null;

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

		// Place label <text> elements. Skip regions with less than 100g carbon output. Harsh, I know
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

const MapCardEmissions = ({ baseFilters, per1000 }) => {
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
		let locnBuckets = pvChartData.value['by_' + locationField].buckets;

		// Rename locations with no corresponding map entry to OTHER
		// convert old non-namespaced sublocations e.g. 'CA' => 'US-CA'
		// combine data with same key to cleanedLocnBuckets
		let cleanedLocnBuckets = Object.values(
			locnBuckets.reduce((acc, val) => {
				const k = (mapDefs.id !== 'world' && !mapDefs.regions[val.key]) ? `${focusRegion}-${val.key}` : val.key;

				acc[k] = acc[k] ? ({
					key: k,
					count: acc[k].count + val.count,
					doc_count: acc[k].doc_count + val.doc_count,
					co2: acc[k].co2 + val.co2,
					co2base: acc[k].co2base + val.co2base,
					co2creative: acc[k].co2creative + val.co2creative,
					co2supplypath: acc[k].co2supplypath + val.co2supplypath,
				}) : val;
				return {...acc};
			}, {})
		);
		// Are we in carbon-per-mille mode?
		if (per1000) {
			cleanedLocnBuckets = emissionsPerImpressions(cleanedLocnBuckets)
		}

		// assign colours
		const colours = dataColours(cleanedLocnBuckets.map((row) => row.co2));
		// zip colours, states, carbon together for the map
		setMapData(
			cleanedLocnBuckets.reduce((acc, row, i) => {
				acc[row.key] = { colour: colours[i], impressions: row.count, carbon: row.co2 };
				return acc;
			}, {})
		);
	}, [JSON.stringify(filters), pvChartData.value, mapDefs, per1000]);

	// Bottom-right - prompt user to click a country, or provide a route back to the world map.
	let focusPrompt = 'Click to focus';
	if (!isWorld && mapDefsReady) {
		const returnToWorld = (e) => {
			stopEvent(e);
			setFocusRegion('world');
		};
		focusPrompt = <Button color="secondary" size="sm" onClick={returnToWorld}>Back</Button>;
	}

	// Receive reference to the SVG to pass down to the downloader
	const svgRef = (element) => element && setSvgEl(element);

	const cardContents = <>
		<div className='mb-2 text-center'>
			<strong>{mapDefs?.name}</strong>
		</div>
		<SVGMap setFocusRegion={isWorld && setFocusRegion} mapDefs={mapDefs} data={mapData} loading={!mapData} showLabels={popOut} svgRef={svgRef} per1000={per1000} />
		<div className='mt-2 map-controls'>
			<span className='pull-left'>
				{error ? (
					<small>{error}</small>
				) : (
					<MapDownloader data={mapData} {...{svgEl, mapDefs, focusRegion}} />
				)}
			</span>
			<span className='pull-right'>
				{focusPrompt}
			</span>
		</div>
	</>;

	// Per-1000 mode: No TOD card above, so the map can have more vertical space.
	const className = space('carbon-map flex-column', isPer1000() && 'taller-map');

	return (
		<GreenCard title='Where are your emissions produced?' className={className} downloadable={false}>
			<div role='button' className='pop-out-button' onClick={() => setPopOut(true)} title="Click for larger map">
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
