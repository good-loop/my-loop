
import React from 'react';
import { space } from '../base/utils/miscutils';
import NGO from '../base/data/NGO';

/**
 * Logo (which you can click on)
 * TODO can standardise this with brand logos
 * @param {?boolean} link true to make the logo a link
 */
const CharityLogo = ({charity, className, style, link=false}) => {
	// Check for SVG and use specific width if so
	let svgClasses="";
	let imgType = /^.*\.([a-zA-Z]*).*$/g.exec(charity.logo);
	if (imgType) {
		imgType = imgType[1];	
		if (imgType.toLowerCase() === "svg") {
			svgClasses = "w-100";
		}
	}
	// 'logo' class forces the logos to be too small for the circle - so leaving it out
	let $logo = <img className={space(className, svgClasses)} style={style} src={charity.logo} alt={charity.name} />;
	if ( ! charity.logo) {
		console.warn("Charity without a logo",NGO.id(charity),charity);
		$logo = <span className={className} style={style}>{charity.name || NGO.id(charity)}</span>; // fallback to their name
	}
	// with / without `a` link?
	if (charity.url && link) {
		return <a href={charity.url} style={style} className="charity-logo w-100 h-100 d-flex justify-content-center align-items-center" target="_blank" rel="noopener noreferrer">{$logo}</a>;
	}
	return $logo;
};

export default CharityLogo;
