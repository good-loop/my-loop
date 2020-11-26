
import React from 'react';
import { Jumbotron, Container } from 'reactstrap';
import ACard from './ACard';
import Roles from '../../base/Roles';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import { SquareLogo } from '../Image';
import MDText from '../../base/components/MDText';
import Counter from '../../base/components/Counter';
import Money from '../../base/data/Money';
import WhiteCircle from '../campaignpage/WhiteCircle';
import DevLink from '../campaignpage/DevLink';
import { space } from '../../base/utils/miscutils';

/**
 * Logo + £s + summaryDescription
 * @param {?Number} i - e.g. 0 for "first in the list". Used for bg colour
 */
const CharityMiniCard = ({charity, NGOid, donationValue, imgClassName, i}) => {
	// HACK: prefer short description
	let desc = charity.summaryDescription || charity.description || '';
	// Cut descriptions down to 1 paragraph.
	let firstParagraph = (/^.+\n *\n/g).exec(desc);
	if (firstParagraph) {
		desc = firstParagraph[0];
	}
	
	return ( 
		<div className="col-md-4 charity-card mt-5 mt-md-0">
			<div className="flex-column">
				<WhiteCircle className="mb-5 w-50 mx-auto" circleCrop={charity.circleCrop}>
					<CharityLogo charity={charity} className={imgClassName}/>
				</WhiteCircle>
				{donationValue? <h4 className="text-left">
					<Counter currencySymbol="&pound;" amount={donationValue} />&nbsp;raised
				</h4> : null}
				<div className="stub-divider"/>
				<div className="charity-description text-block" >
					<MDText source={desc} />
					<a href={charity.url} target="_blank" rel="noopener noreferrer">Go to charity website</a>
				</div>
				{NGOid? <DevLink href={'https://app.sogive.org/#simpleedit?charityId='+escape(NGOid)} target="_sogive">SoGive</DevLink> : null}
			</div>
		</div>
	);
};

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

export {CharityLogo};

export default CharityMiniCard;
