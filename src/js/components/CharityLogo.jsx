import React from 'react';
import { space } from '../base/utils/miscutils';
import NGO from '../base/data/NGO';

/**
 * Logo (which you can click on)
 * TODO can standardise this with brand logos
 * @param {?boolean} link true to make the logo a link
 */
const CharityLogo = ({charity, className, link=false}) => {
	// Check for SVG and use specific width if so
	let svgClasses="";
	console.log("Charity logo is : " + charity.logo);
	const match = /^.*\.([a-zA-Z]*).*$/g.exec(charity.logo);
	if (match) {
		const imgType = match[1];
		if (imgType.toLowerCase() === "svg") {
			svgClasses = "w-100";
		}
	}
	// 'logo' class forces the logos to be too small for the circle - so leaving it out
	let $logo = <img className={space(className, svgClasses)} src={charity.logo} alt={charity.name} />;
	if ( ! charity.logo) {
		console.warn("Charity without a logo",NGO.id(charity),charity);
		$logo = <span>{charity.name || NGO.id(charity)}</span>; // fallback to their name
	}
	// with / without `a` link?
	if (charity.url && link) {
		return <a href={charity.url} target="_blank" rel="noopener noreferrer" className="flex-row justify-content-center align-items-center">{$logo}</a>;
	}
	return $logo;
};

export default CharityLogo;
