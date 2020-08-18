import React from 'react';

/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor or campaign page
 */
const tq = charity => {
	return {
		helenbamber: `"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives." -- Sophie at Helen Bamber`,

		// TODO name
		wwf: `"The money raised through the H&M campaign will support WWF UK's vital work, fighting for a world where people and nature can
thrive, and continue to support schools, teachers and pupils to
develop their knowledge and understanding of the environmental
challenges facing our planet." -- Chiara Cadei, WWF`
	}[charity.id] || "";
};

const CharityQuote = ({charity}) => {

	let quote = tq(charity);

    return (
        quote ?
			<div className="charity-quote">
				<div className="charity-quote-img">

				</div>
				<div className="charity-quote-text">
					{quote}
				</div>
			</div>
		: null
    );
}

export default CharityQuote;