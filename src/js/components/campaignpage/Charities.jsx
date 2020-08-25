import React from 'react';
import { Container } from 'reactstrap';
import ActionMan from '../../plumbing/ActionMan';
import CharityQuote from './CharityQuote';
import CharityCard from '../cards/CharityCard';

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
		"wwf-uk": {
			img: "/img/WWF_FeelGoodImage.png",
			quote:`"The money raised through the H&M campaign will support WWF UK's vital work, fighting for a world where people and nature can
thrive, and continue to support schools, teachers and pupils to
develop their knowledge and understanding of the environmental
challenges facing our planet."`,
			source: "Chiara Cadei, WWF"}
	}[charity['@id']] || "";
};

const Charities = ({charities}) => {

    /*
    // Check if this page has any quotes to add
	let hasQuotes = false;
	charities.forEach(charity => {
		if (tq(charity)) {
			hasQuotes = true;
			return;
		}
	});*/

	let sogiveCharities = charities.map (charity=> {
		// fetch extra info from SoGive
		let cid = charity.id;
		let sogiveCharity = null;
		if (cid) {
			const pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:charity.id, status:C.KStatus.PUBLISHED});
			sogiveCharity = pvCharity.value;
			if (sogiveCharity) {
				// HACK: prefer short description
				// if (sogiveCharity.summaryDescription) sogiveCharity.description = sogiveCharity.summaryDescription;

				// Prefer full descriptions. If unavailable switch to summary desc.
				if (!sogiveCharity.description) {
					sogiveCharity.description = sogiveCharity.summaryDescription;
				}
				
				// If no descriptions exist, fallback to the charity object description
				if (!sogiveCharity.description) {
					sogiveCharity.description = charity.description;
				}
				
				// Cut descriptions down to 1 paragraph.
				let firstParagraph = (/^.+\n\n/g).exec(sogiveCharity.description);
				if (firstParagraph) {
					sogiveCharity.description = firstParagraph[0];
				}
				// merge in SoGive as defaults
				// Retain donation amount
				charity = Object.assign({}, sogiveCharity, charity);
				cid = NGO.id(sogiveCharity); // see ServerIO's hacks to handle bad data entry in the Portal
			}
		}
		return charity;
	});

    return (
        <div className="charity-card-container bg-gl-light-pink">
            <div className="py-5">
                <h2>Our Impact</h2>
            </div>
            <Container className="py-5">
                <div className="row pb-5 justify-content-center">
                    {sogiveCharities.map((charity, i) => (
                        charity ?
                        <CharityCard
                            i={i} key={charity.id}
                            charity={charity}
                            donationValue={charity.donation}
                        />
                        : null
                    ))}
                </div>
            </Container>
            <div className="pt-5">
                <h2>How are charities using the money raised?</h2>
            </div>
            <Container className="py-5">
                {sogiveCharities.map((charity, i) => (
                    charity ?
                    <CharityQuote
                        i={i} key={charity.id}
                        charity={charity}
                        quote={tq(charity)}
                        donationValue={charity.donation}
                    />
                    : null
                ))}
            </Container>
        </div>
    );
}

export default Charities;