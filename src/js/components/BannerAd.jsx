
import React from 'react';
import DataStore from '../base/plumbing/DataStore';
import { addScript } from '../base/utils/miscutils';

const BannerAd = () => {	
	//<!-- BEGIN JS TAG - banner placement for newtab (desktop) < - DO NOT MODIFY -->
	// https://console.appnexus.com/placement?id=1610003
	let placementId = DataStore.getUrlValue("placement") || 20079232;
	// addScript({}, domElement);
	return "TODO dynamic script tag";
	// return (<script src="http://ib.adnxs.com/ttj?id={placementId}&size=[WIDTHxHEIGHT]" type="text/javascript"></script>);
};

export default BannerAd;
