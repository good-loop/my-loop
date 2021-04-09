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
		let vertId = params.get('gl.vert');
		let cmpId = params.get('gl.campaign');
		if (vertId) return `${hashBase}/vert/${vertId}`;
		if (cmpId) return `${hashBase}/cmp/${cmpId}`
	}
	return hashBase;
}

/** Check changed hash and send a synthetic pageview if the change constitutes a new page */
const onHashChange = (event) => {
	const oldUrl = syntheticPath(event.oldURL);
	const newUrl = syntheticPath(event.newURL);

	if (oldUrl !== newUrl) {
		ga('set', 'page', newUrl);
		ga('send', 'pageview');
	}
}

/** Dummy component: watches for hash changes and logs to Google Analytics */
const HashWatcher = () => {
	useEffect(() => {
		window.addEventListener('hashchange', onHashChange);
		onHashChange(null, window.location.href);
		return () => window.removeEventListener('hashchange', onHashChange);
	}, [])
	return null;
}

export default HashWatcher;