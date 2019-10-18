
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
import StoryCard from './StoryCard';

const bgColorPalette = ['#00A676', '#F7F9F9', '#E0D0C1', '#A76D60', '#4E8098', '#90C2E7']; 
/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor
 */
const tq = charity => {
	return {
		helenbamber: `"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives." -- Sophie at Helen Bamber`,
		centrepoint: `"This is a test quote. Regardless, someone surely said these exacts words somewhere, sometime." -- Me, writing this`
	}[charity.id] || "";
};

const CharityCard = ({charity, donationValue}) => {
	// fetch extra info from SoGive
	let cid = charity.id;
	console.log(`charity id: `, cid);
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

	let backgroundColor = charity.color;

	return (<ACard backgroundColor={backgroundColor || bgColorPalette[Math.floor(Math.random() * Math.floor(5))]} name={cid} className="card-container">
		<div className='charity-card' key={charity.name}>
			{/* <a className='flex-row charity' href={charity.url} target="_blank" rel="noopener noreferrer"
				style={photo || !charity.color ? {} : {background: charity.color}}
			>
				{photo && logo? <img className='logo-small' src={logo} style={{position:"relative",top:0,left:0}} /> : null}

				<SquareLogo url={photo || logo} className={photo? 'contain' : null} />
				<span className='name sub-header p-1 white contrast-text'>
					{photo ? charity.name : ''}
				</span>
			</a> */}
{/* 
			<div className="charity-info" style={{display: 'flex', flexDirection: 'row'}}>
				<div className="charity-text">
					<span className="name sub-header p-1 white contrast-text">
						{ charity.name }
					</span>
					<div className="charity-description text-block">
						<MDText source={charity.description || ''} />
					</div>
					<div className="charity-donation">
						<span>Total amount raised: </span>
						<span>{donationValue? <Counter currencySymbol={Money.currencySymbol(donationValue)} value={Money.value(donationValue)} /> : null}</span>
					</div>
					<br/>
					<blockquote className="blockquote"><MDText source={tq(charity)} /></blockquote>
				</div>
				<div className="charity-logo">
					<a className="charity" href={charity.url} target="_blank" rel="noopener no referrer"
						style={photo || !charity.color ? {} : {background: charity.color}}
					>
						<img className="logo" src={logo || photo} style={{position:"relative", top:0, left:0, backgroundColor: backgroundColor}} />
					</a>
				</div>
			</div> */}

			<div>
				<Jumbotron fluid>
					<Container fluid>
						<div className="charity-logo">
							<a className="charity" href={charity.url} target="_blank" rel="noopener no referrer"
								style={photo || !charity.color ? {} : {background: charity.color}}
							>
								<img className="logo" src={logo || photo} style={{position:"relative", top:0, left:0, backgroundColor: backgroundColor}} />
							</a>
						</div>
						<h3 className="display-4">{ charity.name }</h3>
						<p>{ charity.description }</p>
						<p>{donationValue? <Counter currencySymbol={Money.currencySymbol(donationValue)} value={Money.value(donationValue)} /> : null}</p>
					</Container>
				</Jumbotron>
			</div>

			<StoryCard />
			{/* <div className="story-card-mockup">
				<span>This will be the StoryCard</span>
			</div> */}
		</div>

		{/* <CharityCard2 charity={charity} /> */}
		
		{Roles.isDev() && cid? <small><a href={'https://app.sogive.org/#simpleedit?charityId='+escape(cid)} target='_sogive'>SoGive</a></small> : null}
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
