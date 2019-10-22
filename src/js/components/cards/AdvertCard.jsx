
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
	return (<ACard>
		<div>			
			<h3>{name}</h3>

			{ advert.end? <span>End of campaign: {<Misc.LongDate date={advert.end} />}</span> : '' }<br />
			
			{viewCount? <Counter value={viewCount} /> : null}
		</div>
		<div style={{padding: '1em'}}>
			{advert.videos && advert.videos[0]? <Misc.VideoThumbnail url={advert.videos[0].url} /> : null}<br />

			{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(advert.id)} target='_portal'>Portal Editor</a></small> : null}
		</div>
	</ACard>
	);
};

export default AdvertCard;
