import React from 'react';

/**
 * DO NOT USE THIS YET (19/10/18)
 * Word is that we should work based on geolocation in future, but am currently not getting any geolocation data from Twitter
 * The map API itself only understands geolocation params [lat, long]. There is a little plugin (Geocoder) that can translate between
 * the two, but this may be slow/thorny to integrate.
 */

// Looks like we might not be able to use react-leaflet if we want to use
// leaflet-control-geocoder too

class InteractiveMap extends React.Component {
	constructor(props) {
		super(props);

		this.setRef = (ref, value) => {
			this[ref] = value;
		};

		this.focusRef = (ref) => {
			if (this[ref]) this[ref].focus();
		};


		const {position} = props;

		this.mapRef = null;

		this.state = {
			position,
			// Reference to our map instance
			map: null
		};
	}

	componentDidMount() {
		const {position} = this.state;

		// Leaflet is the basic JS map API
		const leafletPV = loadScript('https://unpkg.com/leaflet@1.3.4/dist/leaflet.js');
		// Geocoder allows us to translate between Geolocation values and human-readable place names
		const geocoderPV = loadScript('https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js');

		// Geocoder code is dependant on leaflet having loaded and a map object having been set up
		leafletPV.then( () => geocoderPV)
			.then(() => {
				const {L} = window;
				// Minor TODO: avoid using "map" as a variable name -- 'cos of similarity to the built-in
				// Array.map() and Map
				const map = L.map('mapid').setView([55.953251, -3.188267], 13);
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors',
					maxZoom: 18,
				}).addTo(map);

				// Set up Geocoder code
				L.Control.geocoder().addTo(map);

				this.setState({map});
			});
	}

	componentDidUpdate(prevProps, prevState) {
		
	}

	render() {
		let {position, map} = this.state;

		// Default marker is Edinburgh
		if ( !position ) position = [55.953251, -3.188267];
		// <Map center={position} zoom={13} style={{height: '300px', width: '300px'}} >
		// 	<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
		// 	<Marker position={position}>
		// 		<Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
		// 	</Marker>
		// </Map>
		return (
			<div id="mapid" style={{ height: '300px', width: '300px' }} />
		);
	}
}

const loadScript = (src) => new Promise( (resolve, reject) => {
	const $head = document.querySelector('head');
	const $script = document.createElement('script');
	$script.setAttribute('src', src);

	$script.addEventListener('load', () => {
		resolve(true);
	});
	$script.addEventListener('error', err => {
		throw new Error(err);
	});
	$head.appendChild($script);
});

module.exports = InteractiveMap;
