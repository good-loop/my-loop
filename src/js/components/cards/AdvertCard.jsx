
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
import ServerIO from '../../plumbing/ServerIO';

const AdvertCard = ({advert, viewCount, donationTotal, donationBreakdown}) => {

	// console.log(advert);
	// console.log(totalViews);
	// TODO pull impressions data from DataLog

	let name = advert.name || advert.campaign;
	if (donationBreakdown !== undefined) console.log(`$£_)^*_$£*_£&" ----`, donationBreakdown.by_cid[advert.campaign]);

	const durationText = advert.start || advert.end ? (<>
		Ran
		{ advert.start ? <span> from {<Misc.LongDate date={advert.start} noWeekday />}</span> : null}
		{ advert.end ? <span> to {<Misc.LongDate date={advert.end} noWeekday />}</span> : '' }
	</>) : '';

	const adViews = 5000 + Math.floor(Math.random() * Math.floor(10000));

	return (
		<div className="pb-5 d-flex row mx-auto justify-content-center">
			<div className="pt-4 pr-3 sub-header-font" style={{minWidth: '30%'}}>			
				<h3 className="sub-header-font">{name}</h3>
				{durationText} <br />
				<span className="header-font">&pound;<Counter value={donationTotal} /></span> <br/>
				<span className="sub-header-font">{viewCount? <Counter value={viewCount} /> : ''}&nbsp;watched this advert</span>
			</div>
			<div>
				{advert.videos && advert.videos[0]? <Misc.VideoThumbnail url={advert.videos[0].url} width={360} height={270} /> : null}<br />

				{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(advert.id)} target='_portal'>Portal Editor</a></small> : null}
			</div>
		</div>
	);
};

export default AdvertCard;
