
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

const AdvertCard = ({advert, viewCount}) => {

	// console.log(advert);
	// console.log(totalViews);
	// TODO pull impressions data from DataLog

	let name = advert.name || advert.campaign;

	const durationText = advert.start || advert.end ? (<>
		Ran
		{ advert.start ? <span> from {<Misc.LongDate date={advert.start} noWeekday />}</span> : null}
		{ advert.end ? <span> to {<Misc.LongDate date={advert.end} noWeekday />}</span> : '' }
	</>) : '';


	return (
		<div className="col-sm-4 pb-5">
			<div>			
				<h3>{name}</h3>
				{durationText}
				{false && viewCount? <Counter value={viewCount} /> : null /* This is giving us strangely tiny numbers (eg "12", see CampaignPage for source)*/}
				
			</div>
			<div>
				{advert.videos && advert.videos[0]? <Misc.VideoThumbnail url={advert.videos[0].url} width={300} height={225} /> : null}<br />

				{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(advert.id)} target='_portal'>Portal Editor</a></small> : null}
			</div>
		</div>
	);
};

export default AdvertCard;
