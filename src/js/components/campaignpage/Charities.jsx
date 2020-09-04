import React, { Fragment } from 'react';
import { Container } from 'reactstrap';
import ActionMan from '../../plumbing/ActionMan';
import CharityMiniCard from '../cards/CharityCard';
import Money from '../../base/data/Money';
import NGO from '../../base/data/NGO';
import C from '../../C';
import Counter from '../../base/components/Counter';
import { space } from '../../base/utils/miscutils';
import printer from '../../base/utils/printer';
import MDText from '../../base/components/MDText';

/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor or campaign page
 * 
 * // document custom return type
 * @returns ?{img:?string, quote:string, source:string} mostly returns null
 */
const tq = charity => {
	let cid = NGO.id(charity);
	return {
		helenbamber: {
			quote: `"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives."`,
			source: "Sophie at Helen Bamber"
		},

		"wwf": {
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
 */
const Charities = ({ charities }) => {
	// paranoia: filter nulls - is this needed??
	charities = charities.filter(x => x);
	// augment with SoGive data
	let sogiveCharities = charities.map(charityOriginal => {

		// Shallow copy charity obj
		let charity = Object.assign({}, charityOriginal);
		console.log(charity.id);
		if ( ! NGO.id(charity)) {
			console.warn("Charity without an id?!", charity);
			return charity;
		}

		// NB: the lower-level ServerIOBase.js helps patch mismatches between GL and SoGive ids
		const pvCharity = ActionMan.getDataItem({ type: C.TYPES.NGO, id: NGO.id(charity), status: C.KStatus.PUBLISHED });
		if (!pvCharity.value) return charity; // no extra data yet
		// merge, preferring SoGive data
		// Prefer SoGive for now as the page is designed to work with generic info - and GL data is often campaign/player specific
		// TODO: review this
		// NB: This merge is a shallow copy, so the objects can then be shallow edited without affecting other components
		charity = Object.assign(charity, pvCharity.value);

		// HACK: charity objs have conflicting IDs, force NGO to use id instead of @id
		charity['@id'] = undefined;

		return charity;
	});

	return (
		<div className="charity-card-container bg-gl-light-pink">
			<div className="py-5">
				<h2>Our Impact</h2>
			</div>
			<Container className="py-5">
				<div className="row pb-5 justify-content-center">
					{sogiveCharities.map((charity, i) =>
						<CharityMiniCard
							i={i} key={NGO.id(charity)}
							charity={charity}
							donationValue={charity.donation}
						/>
					)}
				</div>
				<div className="py-5">
					<h2>How charities use the donations</h2>
				</div>
				{sogiveCharities.map((charity, i) =>
					<CharityCard i={i} key={NGO.id(charity)} charity={charity} donationValue={charity.donation} />
				)}
			</Container>
		</div>
	);
};

/**
 * 
 * @param {!NGO} charity This data item is a shallow copy
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
	console.log("Quote: " + quote);
	let img = (quote && quote.img) || charity.images;

	// TODO let's reduce the use of custom css classes (e.g. charity-quote-img etc below)

	return (<div className="p-3">
		<div className={space("charity-quote row", !img && "no-img")}>
			{img ?
				<div className="charity-quote-img col-md-5 p-0">
					<img src={img} alt="charity" />
				</div>
			: null}
			<div className={space("charity-quote-content", img && "col-md-7")}>
				<div className="charity-quote-logo">
					<img src={charity.logo} alt="logo" />
				</div>
				<div className="charity-quote-text">
					{donationValue ? <div className="w-100"><h2><Counter currencySymbol="&pound;" value={donationValue} /> raised</h2></div> : null}
					{charity.simpleImpact ? <Impact impact={charity} donationValue={donationValue} /> : null}
					{quote ? <><p className="font-italic">{quote.quote}</p><p>{quote.source}</p></> : null}
					{!charity.simpleImpact && !quote ? <MDText source={desc} /> : null}
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
	let donationsMoney = new Money(charity.donation);
	// Attempt to get data from special field first, simple and easy
	if (charity.simpleImpact) {
		if (!charity.simpleImpact.name || !charity.simpleImpact.costPerBeneficiary || !donationValue) {
			return null;
		}
		let name = charity.simpleImpact.name;
		// TODO process plural/singular ??copy code from SoGive?
		name = name.replace(/\(singular: (.*)\)/g, "");
		let numOfImpact = prettyNumber(Math.round(Money.divide(donationsMoney, charity.simpleImpact.costPerBeneficiary)));
		impact = numOfImpact + " " + name;
	}
	
	return <b>{impact}</b>;
};

export default Charities;
