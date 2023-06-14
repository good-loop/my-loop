
import React from 'react';
import C from '../C';
import { space } from '../base/utils/miscutils';
import { getId, getType } from '../base/data/DataClass';


/**
 * Status TODO This is a sketch!
 * 
 * TODO preserve filters 
 * 
 * An internal link
 * @param {Object} p
 * @param {?boolean} devOnly
 */
const ImpactHubLink = ({item,title,size,className}) => {
	let href = getImpactHubLink(item);
	if ( ! href) {
		return null;
	}
	return <C.A className={space(size,className)} href={href}>{title || item.name}</C.A>;
};

/**
 * * TODO preserve filters 
 * 
 * @param {?DataItem} item 
 * @returns {?String} link or null
 */
export const getImpactHubLink = (item) => {
	if ( ! item) return null;
	const type = getType(item);
	if ( ! type) {
		console.warn("ImpactHubLink - no type?!", item);
		return null;
	}
    let navtype = ({
        "Advertiser": "brand"
    }[type] || type).toLowerCase();
	let href = "/impact/view/"+navtype+"/"+getId(item);
	return href;
};


export default ImpactHubLink;
