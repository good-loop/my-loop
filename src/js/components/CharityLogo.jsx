
import React from 'react';
import { space } from '../base/utils/miscutils';
import NGO from '../base/data/NGO';

/**
 * Logo (which you can click on)
 * TODO can standardise this with brand logos
 * @param {?boolean} link true to make the logo a link
 */
const CharityLogo = ({charity, className, size, style, link=false}) => {
	// Check for SVG and use specific width if so
	let svgClasses="";
	let imgType = /^.*\.([a-zA-Z]*).*$/g.exec(charity.logo);
	if (imgType) {
		imgType = imgType[1];
		if (imgType.toLowerCase() === "svg") {
			svgClasses = "w-100"; // width 100?? won't that make it giant in the wrong setting??
		}
	}
	// 'logo' class forces the logos to be too small for the circle - so leaving it out
	let altText = charity.displayName || NGO.id(charity);
	let $logo = <img className={space(className, "logo", size&&"logo-"+size, svgClasses)} style={style} src={charity.logo} alt={altText} />;
	if ( ! charity.logo) {
		console.warn("Charity without a logo",NGO.id(charity),charity);
		$logo = <span className={className} style={style}>{charity.displayName || NGO.id(charity)}</span>; // fallback to their name
	}
	// with / without `a` link?
	if (charity.url && link) {
		// if charity URL doesn't start with "http://" or "https://" then add it ourselves, otherwise the href will break when being rendered
		if (!/^https?:\/\//.test(charity.url)) {
			charity.url = 'https://' + charity.url;
		}
		return <a href={charity.url} style={style} className="charity-logo w-100 h-100 d-flex justify-content-center align-items-center" target="_blank" rel="noopener noreferrer" aria-label={"Read more about " + altText}>{$logo}</a>;
	}
	return $logo;
};

export default CharityLogo;
