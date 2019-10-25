
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

const bgColorPalette = ['#00A676', '#F7F9F9', '#E0D0C1', '#A76D60', '#4E8098', '#90C2E7']; 
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

/**
 * 
 * @param {?Number} i - e.g. 0 for "first in the list". Used for bg colour
 */
const CharityCard = ({charity, donationValue, i}) => {
	console.log(donationValue);
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

	// bg colour - use palette
	if (i===undefined) i = Math.floor(Math.random() * bgColorPalette.length);
	let backgroundColor = charity.color || bgColorPalette[i % bgColorPalette.length];
	let backgroundImage = photo;

	// hack: different mobile vs desktop designs -- easiest done in js than pure css
	const isMobile = DataStore.getValue('env', 'isMobile');

	return (<ACard backgroundImage={isMobile? null : backgroundImage} backgroundColor={backgroundColor} name={cid} className="charity-card">
		
		<div className="logo"><CharityLogo charity={charity} /></div>

		<div className="white-inner-card" style={backgroundImage? {} : {backgroundColor:'transparent'}}>
			<h3 className="black">{ charity.name }</h3>

			{donationValue? <div className="charity-donation">
				{/* <span style={{color: '#770f00'}}><Counter currencySymbol={Money.currencySymbol(donationValue)} value={Money.value(donationValue)} /></span> */}
				<span style={{color: '#770f00'}}><Counter currencySymbol='&pound;' value={donationValue} /></span>
				<span>&nbsp;raised</span>
			</div> : null}		

			<div className="charity-description text-block" >
				<MDText source={charity.summaryDescription || ''} />
				{tq(charity)? <blockquote className="blockquote"><MDText source={tq(charity)} /></blockquote> : null}			
			</div>
		</div>

		{isMobile && photo? <img className='photo' src={photo} /> : null}

		{Roles.isDev() && cid? <small><a href={'https://app.sogive.org/#simpleedit?charityId='+escape(cid)} target='_sogive'>SoGive</a></small> : null}
	</ACard>);
};

/**
 * Logo (which you can click on)
 * TODO can we simplify this?? Also, standardise with company logo
 */
const CharityLogo = ({charity}) => {
	let photo = charity.photo || charity.highResPhoto || charity.images;
	let logo = charity.logo;
	let imgSrc = logo || photo;

	let $logo = <img className="logo" src={imgSrc} style={{background: charity.color}} alt={charity.name} />;
	// with / without `a` link?
	if (charity.url) {
		return <a href={charity.url} target="_blank" rel="noopener noreferrer">{$logo}</a>;
	}
	return $logo;
};

export default CharityCard;
