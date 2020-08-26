import React, { Fragment } from 'react';
import { Container } from 'reactstrap';
import ActionMan from '../../plumbing/ActionMan';
import CharityQuote from './CharityQuote';
import CharityMiniCard from '../cards/CharityCard';
import Money from '../../base/data/Money';
import NGO from '../../base/data/NGO';
import C from '../../C';

/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor or campaign page
 */
const tq = charity => {
	return {
		helenbamber: {
			quote: `"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives."`,
			source: "Sophie at Helen Bamber"
		},

		// TODO name
		"wwf-uk": {
			img: "/img/WWF_FeelGoodImage.png",
			quote: `"The money raised through the H&M campaign will support WWF UK's vital work, fighting for a world where people and nature can
thrive, and continue to support schools, teachers and pupils to
develop their knowledge and understanding of the environmental
challenges facing our planet."`,
			source: "Chiara Cadei, WWF"
		}
	}[charity['@id']] || "";
};


// use printer.prettyNumber instead
// if something else is needed, we should document it
// function formatNumber(num) {
// 	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
// }

/**
 * 
 * @param {!NGO[]} charities 
 */
const Charities = ({ charities }) => {
	// paranoia: filter nulls - is this needed??
	charities = charities.filter(x => x);
	// augment with SoGive data
	let sogiveCharities = charities.map(charity => {
		if (!charity.id) {
			console.warn("Charity without an id?!", charity);
			return charity;
		}
		// NB: the lower-level ServerIOBase.js helps patch mismatches between GL and SoGive ids
		const pvCharity = ActionMan.getDataItem({ type: C.TYPES.NGO, id: charity.id, status: C.KStatus.PUBLISHED });
		if (!pvCharity.value) return charity; // no extra data yet
		// merge, preferring Good-Loop data (esp the GL id, and GL donation)
		// NB: GL data is more likely to be stale, but it might also be custom-edited -- and it can happily be tweaked by Good-Loop staff
		// NB: This merge is a copy, so the objects can then be edited without affecting other components
		let mergedCharity = Object.assign({}, pvCharity.value, charity);
		return mergedCharity;
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
							i={i} key={charity.id}
							charity={charity}
							donationValue={charity.donation}
						/>
					)}
				</div>
				<div className="py-5">
					<h2>How are charities using the money raised?</h2>
				</div>
				{sogiveCharities.map((charity, i) =>
					<CharityCard i={i} key={charity.id} charity={charity} />
				)}
			</Container>
		</div>
	);
};

/**
 * 
 * @param {!NGO} charity - This can be modified without side-effects
 */
const CharityCard = ({ charity, i }) => {
	// Get charity impacts from impact model, if any data on it exists
	let donationsMoney = new Money(charity.donation);
	// Prefer full descriptions here. If unavailable switch to summary desc.
	let desc = charity.description || charity.summaryDescription || '';
	// But do cut descriptions down to 1 paragraph.
	let firstParagraph = (/^.+\n *\n/g).exec(desc);
	if (firstParagraph) {
		desc = firstParagraph[0];
	}

	quote.img ??;

	return (<div className="p-3">
		<div className={space("charity-quote row", !quote.img && "no-img")}>
			{quote.img ?
				<div className="charity-quote-img col-md-5 p-0">
					<img src={quote.img} className="w-100" />
				</div>
				: null}
			<div className={"charity-quote-content" + (quote.img ? " col-md-7" : "")}>
				<div className="charity-quote-logo">
					<img src={charity.logo} />
				</div>
				<div className="charity-quote-text">
					{donationValue ? <div className="w-100"><h2><Counter currencySymbol='&pound;' value={donationValue} /> raised</h2></div> : null}
					{charity.simpleImpact ? <Impact impact={charity.simpleImpact} donationValue={donationValue} /> : null}
					{quote ? <p class="font-italic">{quote.quote}</p><p>{quote.source}</p> : null}
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
const Impact = ({ impact, donationValue }) => {
	if (!impact.name || !impact.costPerBeneficiary || !donationValue) {
		return null;
	}
	// TODO process plural/singular ??copy code from SoGive?
	const name = impact.name.replace(/\(singular: (.*)\)/g, "");
	let numOfImpact = printer.prettyNumber(Math.round(Money.divide(donationValue, impact.costPerBeneficiary)));
	return <div>{numOfImpact} {name}</div>;
};

export default Charities;
