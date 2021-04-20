import { useEffect } from 'react';

/** Construct a normalised non-hash path for analytics purposes */
const syntheticPath = (url) => {
	if (!url) return null;
	const urlObj = new URL(url);
	const hash = urlObj.hash || '#my';
	let [hashBase, hashParams = ''] = hash.split('?');
	hashBase = hashBase.replace(/^#/, '');
	
	if ('campaign' === hashBase) {
		const params = new URLSearchParams(hashParams);
		
		let cmpId = params.get('gl.campaign');
		if (cmpId) return `${hashBase}/${cmpId}`
		let agencyId = params.get('agency');
		if (agencyId) return `${hashBase}/agency/${agencyId}`;
		let vertiserId = params.get('gl.vertiser')
		if (vertiserId) return `${hashBase}/advertiser/${vertiserId}`
		let vertId = params.get('gl.vert');
		if (vertId) return `${hashBase}/advert/${vertId}`;
	}
	return hashBase;
}

/** Check changed hash and send a synthetic pageview if the change constitutes a new page */
const onHashChange = (event) => {
	const oldUrl = syntheticPath(event.oldURL);
	const newUrl = syntheticPath(event.newURL);

	// Transitional issue: if using a cached index.html, window.ga will be undefined.
	// This will resolve itself in time, but tolerate quietly for now.
	// Users with old index.html will get one impression logged on initial pageload, as before.
	if (window.ga && (oldUrl !== newUrl)) {
		ga('set', 'page', newUrl);
		ga('send', 'pageview');
	}
}

/** Dummy component: watches for hash changes and logs to Google Analytics as navigation events with synthetic URLs. */
const HashWatcher = () => {
	useEffect(() => {
		window.addEventListener('hashchange', onHashChange);
		onHashChange({oldURL: null, newURL: window.location.href});
		return () => window.removeEventListener('hashchange', onHashChange);
	}, [])
	return null;
}

export default HashWatcher;