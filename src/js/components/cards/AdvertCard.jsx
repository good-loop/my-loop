
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
import printer from '../../base/utils/printer';

const AdvertCard = ({advert, viewCount, donationTotal, donationBreakdown, totalViewCount}) => {
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
		<div className="pb-5 d-flex row mx-auto justify-content-center">
			<div className="pt-4 pr-3">
				<div className="sub-header-font">
					<p>{durationText}</p>
					<p>
						<span className="value-highlight">{printer.prettyNumber(thisViewCount)}</span> viewers raised<br />
						<span className="header-font value-highlight">&pound;<Counter value={moneyRaised} /></span>
					</p>
				</div>
			</div>
			<div>
				{advert.videos && advert.videos[0]? <Misc.VideoThumbnail url={advert.videos[0].url} width={480} height={270} /> : null}<br />
				{Roles.isDev()? <small><a href={'https://portal.good-loop.com/#advert/'+escape(advert.id)} target='_portal'>Portal Editor</a></small> : null}
			</div>
		</div>
	);
};

export default AdvertCard;
