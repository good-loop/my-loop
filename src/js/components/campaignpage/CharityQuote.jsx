import React from 'react';
import Counter from '../../base/components/Counter';

/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor or campaign page
 */
const tq = charity => {
	return {
		helenbamber: {quote:`"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives."`,
					source: "Sophie at Helen Bamber"},

		// TODO name
		wwf: {
			img: "/img/WWF_FeelGoodImage.png",
			quote:`"The money raised through the H&M campaign will support WWF UK's vital work, fighting for a world where people and nature can
thrive, and continue to support schools, teachers and pupils to
develop their knowledge and understanding of the environmental
challenges facing our planet."`,
			source: "Chiara Cadei, WWF"}
	}[charity.id] || "";
};

const CharityQuote = ({charity, donationValue}) => {

	let quote = tq(charity);
    return (
		quote ?
			<div className="p-3">
				<div className="charity-quote row">
					<div className="charity-quote-img col-md-5 p-0">
						<img src={quote.img} className="w-100"/>
					</div>
					<div className="charity-quote-content col-md-7">
						<div className="charity-quote-logo">
							<img src={charity.logo}/>
						</div>
						<div className="charity-quote-text">
							{donationValue ? <h2><Counter currencySymbol='&pound;' value={donationValue} /> raised</h2> : null}
							<p class="font-italic">
								{quote.quote}
							</p>
							<p>{quote.source}</p>
						</div>
					</div>
				</div>
			</div>
		: null
    );
}

export {CharityQuote, tq}