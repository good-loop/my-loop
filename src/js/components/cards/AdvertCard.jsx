
import React from 'react';
import PageCard from './PageCard';
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
import printer from '../../base/utils/printer';

/**
 * Info to the public about an ad campaign
 * @param {Advert} advert
 */
const AdvertCard = ({advert, viewCount, donationTotal, donationBreakdown, totalViewCount, isMulti}) => {
	// let name = advert.name || advert.campaign; // hm - we can't count on these names being written for the public
	const durationText = advert.start || advert.end ? (<>
		This advert ran
		{ advert.start ? <span> from {<Misc.RoughDate date={advert.start} />}</span> : null}
		{ advert.end ? <span> to {<Misc.RoughDate date={advert.end} />}</span> : '' }
	</>) : '';

	// const thisViewCount = viewCount ? <Counter value={viewCount} /> : '';
	const thisViewCount = viewCount || ''; // multiple counters makes the updates start to chug & looks cluttered in close proximity

	// Money raised by ad based on viewers
	const moneyRaised = donationTotal * (thisViewCount / totalViewCount);

	return (
		<div className="mb-5 d-flex column mx-auto justify-content-center ad-card">
			<div>
				{advert.videos && advert.videos[0]? <Misc.VideoThumbnail url={advert.videos[0].url} width={576} height={324} /> : null}<br />
				{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(advert.id)} target='_portal'>Portal Editor</a></small> : null}
				<div className="pt-3 pb-5 advert-impact-text" style={{margin: '0 auto'}}>
					<span>{printer.prettyNumber(thisViewCount)} people raised &pound;<Counter value={moneyRaised} /> by watching an ad in this campaign</span>
				</div>
			</div>
		</div>
	);
};

export default AdvertCard;
