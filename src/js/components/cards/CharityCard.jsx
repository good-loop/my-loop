
import React from 'react';
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

/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor
 */
const tq = charity => {
	return {
		helenbamber: `"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives." -- Sophie at Helen Bamber`
	}[charity.id] || "TODO thank-you comment from the charity, if we received one";
};

const CharityCard = ({charity, donationValue}) => {
	// fetch extra info from SoGive
	let cid = charity.id;
	if (cid) {
		const pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:charity.id, status:C.KStatus.PUBLISHED});
		let sogiveCharity = pvCharity.value;
		if (sogiveCharity) {		
			// HACK: prefer short description
			if (sogiveCharity.summaryDescription) sogiveCharity.description = sogiveCharity.summaryDescription;
			// merge in SoGive as defaults
			charity = Object.assign({}, sogiveCharity, charity);
			cid = NGO.id(sogiveCharity); // see ServerIO's hacks to handle bad data entry in the Portal
		}
	}

	// If charity has photo, use it. Otherwise use logo with custom colour bg and eliminate name.
	let photo = charity.highResPhoto || charity.images;
	let logo = charity.logo;

	let backgroundColor = charity.color;

	return (<ACard backgroundColor={backgroundColor} name={cid} >
		<div className='charity-card' key={charity.name}>
			<a className='flex-row charity' href={charity.url} target="_blank" rel="noopener noreferrer"
				style={photo || !charity.color ? {} : {background: charity.color}}
			>
				{photo && logo? <img className='logo-small' src={logo} style={{position:"relative",top:0,left:0}} /> : null}

				<SquareLogo url={photo || logo} className={photo? 'contain' : null} />
				<span className='name sub-header p-1 white contrast-text'>
					{photo ? charity.name : ''}
				</span>
			</a>
			<CharityCard2 charity={charity} />
			<div>TODO Impact if we know it
				{donationValue? <Counter currencySymbol={Money.currencySymbol(donationValue)} value={Money.value(donationValue)} /> : null}
			</div>
			<blockquote className="blockquote"><MDText source={tq(charity)} /></blockquote>
			{Roles.isDev() && cid? <small><a href={'https://app.sogive.org/#simpleedit?charityId='+escape(cid)} target='_sogive'>SoGive</a></small> : null}
		</div>
	</ACard>);
};

const CharityCard2 = ({charity}) => {
	// impact data?? e.g. you funded 10 trees <-- This would be best when we can TODO
	if (charity.description) {
		return <div className='charity-description text-block'><MDText source={charity.description} /></div>;
	}
	// TODO money donated to this charity??
	return null;
};

export default CharityCard;
