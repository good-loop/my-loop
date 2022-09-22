import React, { Fragment, useEffect, useState } from 'react';
import { id } from '../../../../../GLAppManifest';
import StyleBlock from '../../../base/components/StyleBlock';
import { getCarbon } from './carboncalc';
import { dataColours, GreenCard } from './dashutils';


const globalRegions = {
	'northern africa': {
		DZ: 'Algeria',
		IC: 'The Canary Islands',
		EG: 'Egypt',
		LY: 'Libya',
		MA: 'Morocco',
		SS: 'South Sudan',
		TN: 'Tunisia',
		EH: 'Western Sahara'
	},
	'eastern africa': {
		BI: 'Burundi',
		KM: 'Comoros',
		DJ: 'Djibouti',
		ER: 'Eritrea',
		ET: 'Ethiopia',
		KE: 'Kenya',
		MG: 'Madagascar',
		MW: 'Malawi',
		MU: 'Mauritius',
		YT: 'Mayotte',
		MZ: 'Mozambique',
		RE: 'Réunion',
		RW: 'Rwanda',
		SC: 'Seychelles',
		SO: 'Somalia',
		TZ: 'Tanzania',
		UG: 'Uganda',
		ZM: 'Zambia',
		ZW: 'Zimbabwe'
	},
	'southern africa': {
		BW: 'Botswana',
		LS: 'Lesotho',
		NA: 'Namibia',
		ZA: 'South Africa',
		SZ: 'Eswatini'
	},
	'central africa': {
		AO: 'Angola',
		CM: 'Cameroon',
		CF: 'Central African Republic',
		TD: 'Chad',
		CG: 'Congo',
		CD: 'Congo, Democratic Republic of the',
		GQ: 'Equatorial Guinea',
		GA: 'Gabon',
		ST: 'Sao Tome and Principe'
	},
	'western africa': {
		BJ: 'Benin',
		BF: 'Burkina Faso',
		CV: 'Cabo Verde',
		CI: 'Côte d\'Ivoire',
		GM: 'Gambia',
		GH: 'Ghana',
		GN: 'Guinea',
		GW: 'Guinea-Bissau',
		LR: 'Liberia',
		ML: 'Mali',
		MR: 'Mauritania',
		NE: 'Niger',
		NG: 'Nigeria',
		SH: 'Saint Helena, Ascension and Tristan da Cunha',
		SN: 'Senegal',
		SL: 'Sierra Leone',
		TG: 'Togo'
	},
	'asia': {
		AF: 'Afghanistan',
		AM: 'Armenia',
		AZ: 'Azerbaijan',
		BD: 'Bangladesh',
		BT: 'Bhutan',
		BN: 'Brunei Darussalam',
		KH: 'Cambodia',
		CN: 'China',
		GE: 'Georgia',
		HK: 'Hong Kong',
		IN: 'India',
		ID: 'Indonesia',
		JP: 'Japan',
		KZ: 'Kazakhstan',
		KP: 'Korea (Democratic People\'s Republic of)',
		KR: 'Korea, Republic of',
		KG: 'Kyrgyzstan',
		LA: 'Lao People\'s Democratic Republic',
		MO: 'Macao',
		MY: 'Malaysia',
		MV: 'Maldives',
		MN: 'Mongolia',
		MM: 'Myanmar',
		NP: 'Nepal',
		PK: 'Pakistan',
		PH: 'Philippines',
		SG: 'Singapore',
		LK: 'Sri Lanka',
		TW: 'Taiwan',
		TJ: 'Tajikistan',
		TH: 'Thailand',
		TL: 'Timor-Leste',
		TM: 'Turkmenistan',
		UZ: 'Uzbekistan',
		VN: 'Viet Nam'
	},
	'europe': {
		AL: 'Albania',
		AD: 'Andorra',
		AT: 'Austria',
		BY: 'Belarus',
		BE: 'Belgium',
		BA: 'Bosnia and Herzegovina',
		BG: 'Bulgaria',
		HR: 'Croatia',
		CY: 'Cyprus',
		DK: 'Denmark',
		EE: 'Estonia',
		FO: 'Faroe Islands',
		FI: 'Finland',
		FR: 'France',
		DE: 'Germany',
		GI: 'Gibraltar',
		GR: 'Greece',
		GG: 'Guernsey',
		HU: 'Hungary',
		IS: 'Iceland',
		IE: 'Ireland',
		IT: 'Italy',
		JE: 'Jersey',
		XK: 'Kosovo',
		LV: 'Latvia',
		LI: 'Liechtenstein',
		LT: 'Lithuania',
		LU: 'Luxembourg',
		MK: 'North Macedonia',
		MT: 'Malta',
		MD: 'Moldova, Republic of',
		MC: 'Monaco',
		ME: 'Montenegro',
		NL: 'Netherlands',
		NO: 'Norway',
		PL: 'Poland',
		PT: 'Portugal',
		RO: 'Romania',
		RU: 'Russian Federation',
		SM: 'San Marino',
		RS: 'Serbia',
		SI: 'Slovenia',
		SK: 'Slovakia',
		ES: 'Spain',
		SJ: 'Svalbard and Jan Mayen',
		SE: 'Sweden',
		CH: 'Switzerland',
		CZ: 'Czechia',
		IM: 'Isle of Man',
		TR: 'Turkey',
		UA: 'Ukraine',
		GB: 'United Kingdom',
		VA: 'Vatican City'
	},
	'central america': {
		BZ: 'Belize',
		CR: 'Costa Rica',
		SV: 'El Salvador',
		GT: 'Guatemala',
		HN: 'Honduras',
		MX: 'Mexico',
		NI: 'Nicaragua',
		PA: 'Panama'
},
	'south america': {
		AR: 'Argentina',
		BO: 'Bolivia',
		BR: 'Brazil',
		CL: 'Chile',
		CO: 'Colombia',
		EC: 'Ecuador',
		FK: 'Falkland Islands',
		GF: 'French Guiana',
		GY: 'Guyana',
		PY: 'Paraguay',
		PE: 'Peru',
		SR: 'Suriname',
		UY: 'Uruguay',
		VE: 'Venezuela'
	},
	'middle east': {
		BH: 'Bahrain',
		IQ: 'Iraq',
		IR: 'Iran',
		IL: 'Israel',
		JO: 'Jordan',
		KW: 'Kuwait',
		LB: 'Lebanon',
		OM: 'Oman',
		PS: 'Palestine',
		QA: 'Qatar',
		SA: 'Saudi Arabia',
		SY: 'Syria',
		AE: 'The United Arab Emirates',
		YE: 'Yemen',
	},
	'oceania': {
		AU: 'Australia',
		FJ: 'Fiji',
		PF: 'French Polynesia',
		GU: 'Guam',
		KI: 'Kiribati',
		MH: 'Marshall Islands',
		FM: 'Micronesia (Federated States of)',
		NC: 'New Caledonia',
		NZ: 'New Zealand',
		PG: 'Papua New Guinea',
		WS: 'Samoa',
		AS: 'American Samoa',
		SB: 'Solomon Islands',
		VU: 'Vanuatu'
	},
	'north america': {
		US: 'The United States',
		CA: 'Canada',
		GL: 'Greenland',
		PM: 'Saint Pierre and Miquelon',
		BM: 'Bermuda'
	},
	'the caribbean': {
		AI: 'Anguilla',
		AG: 'Antigua and Barbuda',
		BS: 'Bahamas',
		BB: 'Barbados',
		KY: 'Cayman Islands',
		CU: 'Cuba',
		DM: 'Dominica',
		DO: 'Dominican Republic',
		GD: 'Grenada',
		GP: 'Guadeloupe',
		HT: 'Haiti',
		JM: 'Jamaica',
		MQ: 'Martinique',
		PR: 'Puerto Rico',
		BL: 'St Barthelemy',
		KN: 'St Kitts and Nevis',
		LC: 'St Lucia',
		SX: 'St Maarten',
		MF: 'St Martin',
		VC: 'St Vincent and the Grenadines',
		TT: 'Trinidad and Tobago',
		TC: 'Turks and Caicos Islands',
		VG: 'Virgin Islands, UK',
		VI: 'Virgin Islands, US',
	}
};

// When querying each country, what sub-location type should we breakdown on?
// Modularise by making this part of the map JSON?
const subLocationForCountry = {
	UK: 'locn_sub2', // Counties
	US: 'locn_sub1', // States
	AU: 'locn_sub1', // States
	CA: 'locn_sub1', // States
};


const SVGMap = ({ mapDefs, data, setFocusCountry }) => {
	if (!mapDefs) return null;

	return <svg id="geo-heat-map" style={{stroke: 'none'}} version="1.1" {...mapDefs.svgAttributes} xmlns="http://www.w3.org/2000/svg">
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
	const [mapData, setMapData] = useState({});
	const [focusCountry, setFocusCountry] = useState();
	// const [focusCountry, setFocusCountry] = useState();
	const [mapDefs, setMapDefs] = useState();

	// Augment base filters with extra query/breakdown params as necessary
	const filters = {
		...baseFilters,
		breakdown: ['country'],
	};
	// Are we looking at one country, or the whole world map?
	if (focusCountry) {
		// Restrict results to this country, so we can breakdown on sub-location
		filters.q = SearchQuery.setPropOr(new SearchQuery(filters.q), 'country', [focusCountry]).query;
		filters.focusCountry = focusCountry;
		// Which sub-location type do we want? (Default to first-level)
		const subLocationField = subLocationForCountry[focusCountry] || 'locn_sub1';
		filters.breakdown = [subLocationField];
		filters.subLocationField = subLocationField;
	};

	const pvChartData = getCarbon(filters);

	// Fetch the JSON with the map data for the current focus country
	useEffect(() => {
		fetch(`/js-data/mapdefs-${focusCountry || 'world'}.json`)
			.then(res => res.json())
			.then(json => setMapDefs(json));
	}, [focusCountry]);

	useEffect(() => {
		if (!pvChartData.value) return;
		if (!mapDefs) return;

		// Country or sub-location breakdown?
		let locnTable;
		if (!focusCountry) {
			locnTable = pvChartData.value.tables.country.slice(1);
		} else {
			const subLocationField = subLocationForCountry[focusCountry] || 'locn_sub1';
			locnTable = pvChartData.value.tables[subLocationField].slice(1);
		}

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
			// transform to object and combine rows with same first column
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

	if (mapData) console.warn('********************** MAPDATA', mapData);
	
	return (
		<GreenCard title="Here is a map" className="carbon-map flex-column">
			<SVGMap setFocusCountry={setFocusCountry} mapDefs={mapDefs} data={mapData} />
		</GreenCard>
	);
};

export default MapCard;
