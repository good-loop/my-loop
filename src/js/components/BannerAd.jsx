
import React, { useRef } from 'react';
import DataStore from '../base/plumbing/DataStore';
import { addScript } from '../base/utils/miscutils';

const BannerAd = () => {
	//<!-- BEGIN JS TAG - banner placement for newtab (desktop) < - DO NOT MODIFY -->
	// https://console.appnexus.com/placement?id=1610003
	let placementId = DataStore.getUrlValue("placement") || 20079232;
	return <Script src={`http://ib.adnxs.com/ttj?id=${placementId}&size=300x250`} />;
	// addScript({}, domElement);
	// return (<script src="http://ib.adnxs.com/ttj?id={placementId}&size=[WIDTHxHEIGHT]" type="text/javascript"></script>);
};

const scripts = {};

const Script = ({src}) => {
	// const ref = useRef();
	if (scripts[src]) {
		return;
	}
	addScript({src}); // async, onload, onerror, domElement
	scripts[src] = true;
};

export default BannerAd;
