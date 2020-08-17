
import React from 'react';
import { Jumbotron, Container } from 'reactstrap';
import ACard from './ACard';
import Roles from '../../base/Roles';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import NGO from '../../base/data/NGO';
import { SquareLogo } from '../Image';
import MDText from '../../base/components/MDText';
import Counter from '../../base/components/Counter';
import Money from '../../base/data/Money';
import WhiteCircle from '../campaignpage/WhiteCircle';

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

const stockPhotos = [
	'/img/campaign-stock/dew_web_shutterstock_1051967279.jpg',
	'/img/campaign-stock/sunrise_web_shutterstock_1504457996.jpg',
	'/img/campaign-stock/soil_web_shutterstock_1034022475.jpg',
	'/img/campaign-stock/hills_web_shutterstock_1462852808.jpg',
	'/img/campaign-stock/sprout_web_shutterstock_760733977.jpg',
];

/**
 * 
 * @param {?Number} i - e.g. 0 for "first in the list". Used for bg colour
 */
const CharityCard = ({charity, donationValue, i, imageLeft}) => {
	// console.log(donationValue);
	// fetch extra info from SoGive
	let cid = charity.id;
	if (cid) {
		const pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:charity.id, status:C.KStatus.PUBLISHED});
		let sogiveCharity = pvCharity.value;
		if (sogiveCharity) {
			// HACK: prefer short description
			// if (sogiveCharity.summaryDescription) sogiveCharity.description = sogiveCharity.summaryDescription;

			// Prefer full descriptions. If unavailable switch to summary desc.
			if (!sogiveCharity.description) sogiveCharity.description = sogiveCharity.summaryDescription;
			// merge in SoGive as defaults
			charity = Object.assign({}, sogiveCharity, charity);
			cid = NGO.id(sogiveCharity); // see ServerIO's hacks to handle bad data entry in the Portal
		}
	}

	// If charity has photo, use it. Otherwise use logo with custom colour bg and eliminate name.
	let photo = charity.highResPhoto || charity.images;
	let logo = charity.logo;

	let backgroundImage = photo;
	let stockWarning = false;
	if (!backgroundImage) {
		backgroundImage = stockPhotos[i % stockPhotos.length];
		stockWarning = true;
	}

	return ( 
		<div className="col charity-card">
			<div className="flex-column">
				<WhiteCircle className="mb-5 w-50 mx-auto">
					<CharityLogo charity={charity}/>
				</WhiteCircle>
				{donationValue? <h4 className="text-left">
					<Counter currencySymbol='&pound;' value={donationValue} />&nbsp;raised
				</h4> : null}
				<div className="stub-divider"></div>
				<div className="charity-description text-block" >
					<MDText source={charity.summaryDescription || ''} />
					{//tq(charity)? <div className="quote"><MDText source={//tq(charity)} /></div> : null}
					}
					<a href={charity.url} target="_blank" rel="noopener noreferrer">Go to charity website</a>
				</div>
				{Roles.isDev() && cid? <small><a href={'https://app.sogive.org/#simpleedit?charityId='+escape(cid)} target='_sogive'>SoGive</a></small> : null}
			</div>
		</div>
	);
};

/**
 * Logo (which you can click on)
 * TODO can we simplify this?? Also, standardise with company logo
 */
const CharityLogo = ({charity, link, className}) => {

	let $logo = (
		<img className="logo" src={charity.logo} alt={charity.name} className={className} />
	);
	// with / without `a` link?
	if (charity.url && link) {
		return <a href={charity.url} target="_blank" rel="noopener noreferrer">{$logo}</a>;
	}
	return $logo;
};

export default CharityCard;
