import React from 'react';
import { Container } from 'reactstrap';
import PageCard from '../../base/components/PageCard';
import Money from '../../base/data/Money';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import Counter from '../../base/components/Counter';
import { space } from '../../base/utils/miscutils';
import printer from '../../base/utils/printer';
import MDText from '../../base/components/MDText';
import DevLink from './DevLink';
import LinkOut from '../../base/components/LinkOut';
import TestimonialPlayer from './TestimonialPlayer';

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
 * @param {!Campaign} campaign
 */
const Charities = ({ charities, donation4charity, campaign }) => {
	// The portal control data
	let hideImpact = campaign.hideImpact || {};
	// Filter nulls (paranoia)
	charities = charities.filter(x => x);
	//let sogiveCharities = fetchSogiveData(charities);

	const getDonation = c => {
		let d = donation4charity[c.id] || donation4charity[c.originalId]; // TODO sum if the ids are different
		// Filter charity if less then 1/10 the total donation
		return d;
	};

	return (
		<div className="charity-card-container bg-gl-light-pink">
			<div className="py-5">
				<h2>Our Impact</h2>
			</div>
			<Container className="pb-5">
				{charities.map((charity, i) =>
					<CharityCard i={i} key={charity.id}
						charity={charity}
						donationValue={getDonation(charity)}
						showImpact={ ! hideImpact[charity.id]}
						campaign={campaign}
					/>
				)}
			</Container>
		</div>
	);
};

/** Extra smallprint details for charities */
const CharityDetails = ({charities}) => {

	//let sogiveCharities = fetchSogiveData(charities);

	const hasRegNum = (c) => {
		return c.englandWalesCharityRegNum || c.scotlandCharityRegNum || c.niCharityRegNum || c.ukCompanyRegNum || c.usCharityRegNum;
	};

	// Registration numbers for all possible types of reg num for each charity
	// Include no-reg-info too, so no confusing gaps (and we still have the link)
	let regNums = charities.map(c => {
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
const CharityCard = ({ charity, donationValue, showImpact, campaign}) => {
	const ongoing = campaign.ongoing;
	// Prefer full descriptions here. If unavailable switch to summary desc.
	let desc = charity.description || charity.summaryDescription || '';
	// But do cut descriptions down to 1 paragraph.
	let firstParagraph = (/^.+\n *\n/g).exec(desc);
	if (firstParagraph) {
		desc = firstParagraph[0];
	}

	//console.log("SHOWING THE CHARITY",charity);

	const quote = charity.charityQuote;
	let img = charity.images;

	const testimonial = charity.testimonial;

	// TODO let's reduce the use of custom css classes (e.g. charity-quote-img etc below)

	return (<div className="p-3" id={"charity-" + charity.id}>
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
					{testimonial && <TestimonialPlayer src={testimonial} />}
					{donationValue? <div className="w-100"><h2>{ongoing && "Raising"} <Counter amount={donationValue} noPennies /> {!ongoing && "raised"}</h2></div> : null}
					{charity.simpleImpact && showImpact ? <Impact charity={charity} donationValue={donationValue} /> : null}
					{quote && quote.quote ? <><p className="font-italic">"{quote.quote}"</p><p>— {quote.source}</p></> : null}
					{!quote || !quote.quote ? <MDText source={desc} /> : null}
					{charity.url && <a href={charity.url} className="btn btn-primary mb-3">Learn more</a>}
					<div className="flex-row">
						<DevLink href={'https://app.sogive.org/#edit?action=getornew&charityId='+escape(normaliseSogiveId(charity.id))} target="_sogive">SoGive Editor</DevLink>
						{charity.ad ? (
							<DevLink href={ServerIO.PORTAL_ENDPOINT+'/#advert/' + escape(charity.ad)} target="_portal" className="ml-2">Advert Editor</DevLink>
						) : (
							<DevLink href={ServerIO.PORTAL_ENDPOINT+'/#campaign/' + escape(campaign.id) + '?strayCharities=' + escape(charity.id)} target="_portal" className="ml-2">Stray charity from {campaign.id}</DevLink>
						)}
					</div>
				</div>
			</div>
		</div>
	</div>
	);
};

// non-exhaustive list of verbs whose infinitive ends with E (fixing RNLI "to help sav lives" bug Jun 2021)
// TODO follow the (singular: xxx) pattern with e.g. "saved (infinitive: save, gerund: saving)"?
const eVerbs = ['rescued', 'saved'];

const infinitive = verb => verb.replace(/ed$/, eVerbs.includes(verb) ? 'e' : '');

// TODO use i18n.js instead, which does this + translations??
// For impact strings of format "nouns (singular: noun) verbed"
// Updated to accept (singular:noun) with no space, "nouns (singular: noun)" with no trailing verb
const singularRegex = /(.*)\s+\(singular:\s*(\S+)\)\s*(.*)/g;
// For impact strings of format "nouns verbed"
const simpleRegex = /(.*) (.*)$/g;
// For impact strings of format "verbed (number) nouns"
const numberRegex = /(\w+)\W*\(number\)\W*(\w+)/g
/**
 * Get charity impacts from impact model, if any data on it exists
 * @param {Output} impact
 * @param {Money} donationValue
 */
const Impact = ({ charity, donationValue }) => {
	const impact = charity.simpleImpact;
	if (!impact || !impact.name || !impact.costPerBeneficiary || !donationValue) return null;
	
	let impactDesc = impact.name;
	let donationsMoney = new Money(donationValue);
	const impactCount = Math.round(Money.divide(donationsMoney, impact.costPerBeneficiary));
	const charityClassBit = charity.name.replace(/ /g, '-');
	
	// Handle impact description format "Verbed 100 nouns"
	let match = numberRegex.exec(impactDesc);
	if (match) {
		const [, verbed, nouns] = numberRegex.exec(impactDesc);
		return <b>
			<span className={`impact-text-${charityClassBit}-start`}>{verbed}</span>{' '}
			<span className={`charity-impact-${charityClassBit}`}>{impactCount}</span>{' '}
			<span className={`impact-text-${charityClassBit}-end`}>{nouns}</span>
		</b>;
	}

	// Extract verb and noun from the impact description - assume "100 nouns verbed" format
	let [, nouns, verbed] = simpleRegex.exec(impactDesc);

	// Upgrade to the "specified singular noun" format if it's used
	const singularMatch = singularRegex.exec(impactDesc);
	if (singularMatch) {
		nouns = (impactCount === 1) ? singularMatch[2] : singularMatch[1];
		verbed = singularMatch[3];
	}

	// Use generic "to help verb nouns" phrasing for 0 impact count
	impactDesc = impactCount ? `${nouns} ${verbed}` : `To help ${infinitive(verbed)} ${nouns}`;

	// Don't say "0 To help verb nouns"...
	let countSpan = count ? <span className={`charity-impact-${charityClassBit}`}>{printer.prettyNumber(impactCount)} </span> : '';

	return <b>
		{countSpan}
		<span className={`impact-text-${charityClassBit}`}>{impactDesc}</span>
	</b>;
};

export { CharityDetails };
export default Charities;
