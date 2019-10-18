
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

	return (
	// <ACard className="advert-card">
	// End of the campaign: <Misc.LongDate date={advert.end} /><br />
	// 	{advert.name}
	// 	{advert.campaign}
	// TODO campaign info -- some summary stats of date, 
	// 			thumbnail image, number of views
	// 			??group ads by campaign - eg TOMS run the same campaign over a few languages
	// 	{advert.videos && advert.videos[0]? <Misc.VideoThumbnail url={advert.videos[0].url} /> : null}
	// 	{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(advert.id)} target='_portal'>Portal Editor</a></small> : null}
	// </ACard>);

		<div className="advert-card">
			<div style={{textAlign: 'initial', padding: '1em'}}>
				<span>{advert.name}</span><br />
				{ advert.end? <span>End of campaign: {<Misc.LongDate date={advert.end} />}</span> : '' }<br />
				<span> {viewCount} </span>
			</div>
			<div style={{padding: '1em'}}>
				{advert.videos && advert.videos[0]? <Misc.VideoThumbnail url={advert.videos[0].url} /> : null}<br />
				{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(advert.id)} target='_portal'>Portal Editor</a></small> : null}
			</div>
		</div>
	);
};

export default AdvertCard;
