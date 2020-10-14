import React, { Fragment } from 'react';
import { Container } from 'reactstrap';
import ActionMan from '../../plumbing/ActionMan';
import CharityMiniCard, {CharityLogo} from '../cards/CharityCard';
import Money from '../../base/data/Money';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import C from '../../C';
import Counter from '../../base/components/Counter';
import { space } from '../../base/utils/miscutils';
import printer from '../../base/utils/printer';
import MDText from '../../base/components/MDText';
import WhiteCircle from './WhiteCircle';
import DevLink from './DevLink';

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
 */
const Charities = ({ charities, donation4charity }) => {
	let dupeIds = [];
	// augment with SoGive data
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
		console.log('****** Got SoGive data for charity ' + charity.id, pvCharity.value);
		if ( ! pvCharity.value) return charity; // no extra data yet
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

	const getDonation = c => donation4charity[c.id] || donation4charity[c.originalId]; // TODO sum if the ids are different
	let sogiveCharitiesWithDonations = sogiveCharities.filter(c => getDonation(c)); // Get rid of charities with no logged donations.
	let sogiveCharitiesWithoutDonations = sogiveCharities.filter(c => ! getDonation(c)); // Keep other charities for the "Also Supported" section

	return (
		<div className="charity-card-container bg-gl-light-pink">
			<div className="py-5">
				<h2>Our Impact</h2>
			</div>
			<Container className="py-5">
				<div className="row pb-5 justify-content-center">
					{sogiveCharitiesWithDonations.map((charity, i) =>
						<CharityMiniCard
							i={i} key={charity.id}
							charity={charity}
							NGOid={charity.id}
							donationValue={charity.donation}
						/>
					)}
				</div>
				<AlsoSupported charities={sogiveCharitiesWithoutDonations} />
				<div className="py-5">
					<h2>How charities use the donations</h2>
				</div>
				{sogiveCharitiesWithDonations.map((charity, i) =>
					<CharityCard i={i} key={charity.id} charity={charity} donationValue={getDonation(charity)} />
				)}
			</Container>
		</div>
	);
};

/**
 * 
 * @param {!NGO} charity This data item is a shallow copy
 * @param {!Money} donationValue
 */
const CharityCard = ({ charity, donationValue, i }) => {
	// Prefer full descriptions here. If unavailable switch to summary desc.
	let desc = charity.description || charity.summaryDescription || '';
	// But do cut descriptions down to 1 paragraph.
	let firstParagraph = (/^.+\n *\n/g).exec(desc);
	if (firstParagraph) {
		desc = firstParagraph[0];
	}

	const quote = tq(charity);
	let img = (quote && quote.img) || charity.images;

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
					<img src={charity.logo} alt="logo" />
				</div>
				<div className="charity-quote-text">
					{donationValue ? <div className="w-100"><h2><Counter amount={donationValue} /> raised</h2></div> : null}
					{charity.simpleImpact ? <Impact charity={charity} donationValue={donationValue} /> : null}
					{quote ? <><p className="font-italic">{quote.quote}</p><p>{quote.source}</p></> : null}
					{!quote ? <MDText source={desc} /> : null}
				</div>
			</div>
		</div>
	</div>
	);
};

/**
 * 
 * @param {Output} impact
 * @param {Money} donationValue
 */
const Impact = ({ charity, donationValue }) => {
	// Get charity impacts from impact model, if any data on it exists
	let impact = "";
	let donationsMoney = new Money(donationValue);
	// Attempt to get data from special field first, simple and easy
	if (charity.simpleImpact) {
		if (!charity.simpleImpact.name || !charity.simpleImpact.costPerBeneficiary || !donationValue) {
			return null;
		}
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
	}
	
	return <b>{impact}</b>;
};

const AlsoSupported = ({charities}) => {
	return (charities.length ? <>
		<h2>Also supporting</h2>
		<div className="pt-3 row justify-content-center">
			{charities.map(charity => <div className="col-md-3 col-4">
				<WhiteCircle className="mb-5 w-50 mx-auto" circleCrop={charity.circleCrop}>
					<CharityLogo charity={charity} link/>
				</WhiteCircle>
				{normaliseSogiveId(charity.id)? <DevLink href={'https://app.sogive.org/#simpleedit?charityId='+escape(normaliseSogiveId(charity.id))} target="_sogive">SoGive</DevLink> : null}
			</div>)}
		</div>
	</> : null);
};

export default Charities;
