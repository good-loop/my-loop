
import React, { useRef } from 'react';
import DataStore from '../base/plumbing/DataStore';
import { addScript } from '../base/utils/miscutils';

const BannerAd = () => {
	//<!-- BEGIN JS TAG - banner placement for newtab (desktop) < - DO NOT MODIFY -->
	// https://console.appnexus.com/placement?id=1610003
	let placementId = DataStore.getUrlValue("placement") || 20079232;
	return <div>BannerAd here <Script src={`//ib.adnxs.com/ttj?id=${placementId}&size=300x250`} here /></div>;
	// addScript({}, domElement);
	// return (<script src="http://ib.adnxs.com/ttj?id={placementId}&size=[WIDTHxHEIGHT]" type="text/javascript"></script>);
};

const scripts = {};

const Script = ({src, async, onload, onerror, here}) => {
	if ( ! here) {
		// NB: unlike useEffect this avoids duplicate adds for any use of this script tag
		if (scripts[src]) {
			return null;
		}
		addScript({src, async, onload, onerror}); // async, onload, onerror, domElement
		scripts[src] = true;
		return null;
	}
	const ref = useRef();
	if ( ! scripts[src] && ref.current) {
		addScript({src, async, onload, onerror, domElement:ref.current});
		scripts[src] = true;
	}
	return <div ref={ref}>script tag in here</div>;
};

export default BannerAd;
