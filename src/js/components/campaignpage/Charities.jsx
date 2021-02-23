import React, { useState } from 'react';
import { Container } from 'reactstrap';
import ActionMan from '../../plumbing/ActionMan';
import Roles from '../../base/Roles';
import CharityLogo from '../CharityLogo';
import PageCard from '../../base/components/PageCard';
import Money from '../../base/data/Money';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import C from '../../C';
import Counter from '../../base/components/Counter';
import { space } from '../../base/utils/miscutils';
import printer from '../../base/utils/printer';
import MDText from '../../base/components/MDText';
import WhiteCircle from './WhiteCircle';
import DevLink from './DevLink';
import LinkOut from '../../base/components/LinkOut';

/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor or campaign page
 * 
 * // custom return type
 * @returns ?{img:?string, quote:string, source:string} mostly returns null
 */
const tq = charity => {
	let cid = normaliseSogiveId(charity.id);
	return {
		helenbamber: {
			quote: `"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives."`,
			source: "Sophie at Helen Bamber"
		},

		"wwf-uk": {
			quote: `"The money raised through the H&M campaign will support WWF UK's vital work, fighting for a world where people and nature can
thrive, and continue to support schools, teachers and pupils to
develop their knowledge and understanding of the environmental
challenges facing our planet."`,
			source: "Chiara Cadei, WWF"
		}
	}[cid];
};

/**
 * 
 * @param {!NGO[]} charities
 * @param {{string:Money}} donation4charity - charity ID to donation amount
 * @param {?Boolean} filterLowDonations If true low donation charities will not display
 * @param {?Number} lowDonationThreshold Custom threshold number to treat charities as "low donation". 1% of the total by default
 * @param {?Boolean} showLowDonations If false will hide the donation number for low donation charities
 * @param {?Boolean} showDonations If false will hide all donation numbers
 * @param {?String[]} hideCharities hide specific charities by ID
 */
const Charities = ({ charities, donation4charity, campaign }) => {
	
	// Low donation filtering data is represented as only 3 controls for portal simplicity
	// lowDntn = the threshold at which to consider a charity a low donation
	// hideCharities = a list of charity IDs to explicitly hide - represented by keySet as an object (explained more below line 103)
	// lowDntnDisplay = how to deal with low donation charities. represented as several different modes which are expanded into configurations:
	//   hide-low-charities = cut out low donation charities entirely
	//   hide-low-dntns = hide the donation figure for low donation charities
	//   hide-dntns = hide all donation figures
	//   Otherwise, show everything
	
	// The portal control data
	let {lowDntnDisplay, lowDntn, hideCharities, hideImpact} = campaign;
	// The expanded configurations to operate on, not stored in the portal
	let lowDonationThreshold, filterLowDonations, showLowDonations, showDonations;
	console.log("Low donation display set to " + lowDntnDisplay);

	// Does campaign page data contain data for low donation filtering, or is it old?
	if (lowDntn) {
		lowDonationThreshold = lowDntn.value;
	}
	if (lowDntnDisplay) {
		// Remove any trailing quotations that sometimes crop up
		lowDntnDisplay = lowDntnDisplay.replace(/\"/g, "");
		// Expand the lowDntnDisplay mode into a configuration
		filterLowDonations = lowDntnDisplay === "hide-low-charities";
		showLowDonations = lowDntnDisplay !== "hide-low-dntns";
		showDonations = lowDntnDisplay !== "hide-dntns";
	} else {
		filterLowDonations = false;
		showLowDonations = true;
		showDonations = true;
	}
	console.log("Low donation display settings:\n\tfilterLowDonations: " + filterLowDonations + "\n\tshowLowDonations: " + showLowDonations + "\n\tshowDonations: " + showDonations);

	// augment with SoGive data
	// Threshold is the given custom amount, otherwise 1% of total - or if total isnt loaded, £50
	const threshold = lowDonationThreshold ? lowDonationThreshold : (donation4charity.total ? donation4charity.total.value / 100 : 50);
	console.warn("Low donation threshold for charities set to " + threshold);
	/**/
	// Filter nulls
	charities = charities.filter(x => x);
	let sogiveCharities = fetchSogiveData(charities, filterLowDonations, threshold);

	const getDonation = c => {
		let d = donation4charity[c.id] || donation4charity[c.originalId]; // TODO sum if the ids are different
		// Filter charity if less then 1/10 the total donation
		return d;
	};

	sogiveCharities = sogiveCharities.map(charity => {
		const dntn = getDonation(charity);
		const include = dntn ? Money.value(dntn) >= threshold : false;
		console.log("FILTER FOR CHARITY " + charity.id + ": " + include + ", ", dntn);
		//console.log("Is " + charity.id + " a low donation? " + !include + ", as " + donation4charity[charity.id].value + " >= " + threshold);
		if (!include && filterLowDonations) return null;
		charity.lowDonation = !include;
		return charity;
	});
	sogiveCharities = sogiveCharities.filter(x => x);
	//let sogiveCharitiesWithDonations = sogiveCharities.filter(c => getDonation(c)); // Get rid of charities with no logged donations.
	// hideCharities is from a KeySet prop control, so is an object of schema {charity_id : bool}.
	// We want to convert it instead to a list of charity IDs
	if (hideCharities) {
		// Convert object to array
		let hideCharitiesArr = Object.keys(hideCharities);
		// Remove false entries - keySet will not remove charity IDs, but set them to false instead.
		hideCharitiesArr = hideCharitiesArr.filter(cid => hideCharities[cid]);
		sogiveCharities = sogiveCharities.filter(c => !hideCharitiesArr.includes(c.id));
	}
	if (!hideImpact) hideImpact = {};

	console.log("SOGIVE CHARITIES", sogiveCharities);
	//let sogiveCharitiesWithoutDonations = sogiveCharities.filter(c => ! getDonation(c)); // Keep other charities for the "Also Supported" section

	return (
		<div className="charity-card-container bg-gl-light-pink">
			<div className="py-5">
				<h2>Our Impact</h2>
			</div>
			<Container className="pb-5">
				{sogiveCharities.map((charity, i) =>
					<CharityCard i={i} key={charity.id}
						charity={charity}
						donationValue={getDonation(charity)}
						showDonations={showDonations}
						showLowDonations={showLowDonations}
						showImpact={!hideImpact[charity.id]} />
				)}
			</Container>
		</div>
	);
};

/** Extra smallprint details for charities */
const CharityDetails = ({charities}) => {

	let sogiveCharities = fetchSogiveData(charities);

	const hasRegNum = (c) => {
		return c.englandWalesCharityRegNum || c.scotlandCharityRegNum || c.niCharityRegNum || c.ukCompanyRegNum || c.usCharityRegNum;
	};

	// Registration numbers for all possible types of reg num for each charity
	// Include no-reg-info too, so no confusing gaps (and we still have the link)
	let regNums = sogiveCharities.map(c => {
		return <div className="charityInfo" key={c.id}><small>
			<b><LinkOut href={c.url}>{c.displayName || c.name}</LinkOut></b>
			<RegNum label="England & Wales Charity Commission registration number" regNum={c.englandWalesCharityRegNum}/>
			<RegNum label="Scottish OSCR registration number" regNum={c.scotlandCharityRegNum}/>
			<RegNum label="Northern Ireland registration number" regNum={c.niCharityRegNum}/>
			<RegNum label="UK Companies House number" regNum={c.ukCompanyRegNum}/>
			<RegNum label="USA registration number (EIN)" regNum={c.usCharityRegNum}/>
			<br/>
		</small></div>;
	});
	// Remove null values
	regNums = regNums.filter(x => x);
	if ( ! regNums.length) {
		return null; // No info?
	}
	let n = Math.min(4, regNums.length);
	return <PageCard>
		<h2>Charity Details</h2>
		<div className={"charity-details bg-white my-3 p-3 gridbox gridbox-md-"+n}>
			{regNums}
		</div>
	</PageCard>;
};

/** A labelled entry for a registration number, does not display if regNum is falsy */
const RegNum = ({label, regNum}) => {
	return regNum ? <div className="regNum">
		{label}: {regNum}
	</div> : null;
};

/**
 * 
 * @param {!NGO} charity This data item is a shallow copy
 * @param {?Money} donationValue
 */
const CharityCard = ({ charity, donationValue, showLowDonations, showDonations, showImpact }) => {
	// Prefer full descriptions here. If unavailable switch to summary desc.
	let desc = charity.description || charity.summaryDescription || '';
	// But do cut descriptions down to 1 paragraph.
	let firstParagraph = (/^.+\n *\n/g).exec(desc);
	if (firstParagraph) {
		desc = firstParagraph[0];
	}

	const quote = tq(charity);
	let img = (quote && quote.img) || charity.images;

	const showDonationNum = showDonations && (charity.lowDonation && showLowDonations || !charity.lowDonation);
	// if ( ! showDonationNum) console.log("Not showing donations for charity " + charity.id);
	// else if ( ! donationValue) console.warn("No donation value for charity " + charity.id + "!");

	// TODO let's reduce the use of custom css classes (e.g. charity-quote-img etc below)

	return (<div className="p-3">
		<div className={space("charity-quote row", !img && "no-img")}>
			{img &&
				<div className="charity-quote-img col-md-5 p-0">
					<img src={img} alt="charity" />
				</div>
			}
			<div className={space("charity-quote-content", img && "col-md-7")}>
				<div className="charity-quote-logo">
					<img src={charity.logo} alt="logo"/>
				</div>
				<div className="charity-quote-text">
					{showDonationNum && donationValue? <div className="w-100"><h2><Counter amount={donationValue} preservePennies={false} /> raised</h2></div> : null}
					{charity.simpleImpact && showImpact ? <Impact charity={charity} donationValue={donationValue} /> : null}
					{quote ? <><p className="font-italic">{quote.quote}</p><p>{quote.source}</p></> : null}
					{!quote ? <MDText source={desc} /> : null}
					<div className="flex-row">
						<DevLink href={'https://app.sogive.org/#edit?action=getornew&charityId='+escape(normaliseSogiveId(charity.id))} target="_sogive">SoGive Editor</DevLink>
						<DevLink href={ServerIO.PORTAL_ENDPOINT+'/#advert/' + escape(charity.ad)} target="_portal" className="ml-2">Advert Editor</DevLink>
					</div>
				</div>
			</div>
		</div>
	</div>
	);
};

// Augment ad charity objects with sogive data
const fetchSogiveData = (charities) => {
	let dupeIds = [];
	let sogiveCharities = charities.map(charityOriginal => {
		// Shallow copy charity obj
		let charity = Object.assign({}, charityOriginal);
		const sogiveId = normaliseSogiveId(charity.id);
		if ( ! sogiveId) {
			console.warn("Charity without an id?!", charity);
			return charity;
		}
		// Remove duplicates
		if (dupeIds.includes(sogiveId)) {
			return;
		}
		dupeIds.push(sogiveId);
		// NB: the lower-level ServerIOBase.js helps patch mismatches between GL and SoGive ids
		const pvCharity = ActionMan.getDataItem({ type: C.TYPES.NGO, id: sogiveId, status: C.KStatus.PUBLISHED });
		if ( ! pvCharity.value) {
			return charity; // no extra data yet
		}
		// merge, preferring SoGive data
		// Prefer SoGive for now as the page is designed to work with generic info - and GL data is often campaign/player specific
		// TODO: review this
		// NB: This merge is a shallow copy, so the objects can then be shallow edited without affecting other components
		charity = Object.assign(charity, pvCharity.value);
		// HACK: charity objs have conflicting IDs, force NGO to use id instead of @id
		charity['@id'] = undefined;
		charity.originalId = charityOriginal.id; // preserve for donation look-up
		return charity;
	});
	// Remove null entries
	sogiveCharities = sogiveCharities.filter(x => x);
	return sogiveCharities;
};

/**
 * Get charity impacts from impact model, if any data on it exists
 * @param {Output} impact
 * @param {Money} donationValue
 */
const Impact = ({ charity, donationValue }) => {
	if ( ! charity.simpleImpact) return null;
	if ( ! charity.simpleImpact.name || ! charity.simpleImpact.costPerBeneficiary || ! donationValue) {
		return null;
	}
	let impact = "";
	let donationsMoney = new Money(donationValue);
	const impactFormat = charity.simpleImpact.name;
	const numOfImpact = printer.prettyNumber(Math.round(Money.divide(donationsMoney, charity.simpleImpact.costPerBeneficiary)));
	// Process format to use singular or plural name
	// REGEX for (singular:...) format
	// Group 1: plural form
	// Group 3: singular form
	// Group 4: verb
	const singularFormatRegex = /(.*) (\(singular: (.*)\)) (.*)/g;
	let match = singularFormatRegex.exec(impactFormat);
	if (match) {
		const verb = match[4];
		const isSingular = numOfImpact === "1";
		const singular = match[3];
		const plural = match[1];
		// Use generic phrasing for 0 impact
		if (numOfImpact === "0") {
			impact = "To help " + verb.replace(/ed$/, "") + " " + plural;
		} else {
			impact = numOfImpact + " " + (isSingular ? singular : plural) + " " + verb;
		}
	} else {
		// Separate impact string into its name and verb using space
		const separatorRegex = /(.*) (.*)$/g;
		match = separatorRegex.exec(impactFormat);
		if (match) {
			let name = match[1];
			let verb = match[2];
			// If plural/singular versions can't be found, fall back to whatever was given
			if (numOfImpact === "0") {
				impact = "To help " + verb.replace(/ed$/, "ing") + " " + name;
			} else {
				impact = numOfImpact + " " + name + " " + verb;
			}
		} else {
			impact = numOfImpact + " " + impactFormat;
		}
	}	
	return <b>{impact}</b>;
};

export { CharityDetails };
export default Charities;
