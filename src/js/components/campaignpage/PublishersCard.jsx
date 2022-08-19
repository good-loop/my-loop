import React from 'react';
import _ from 'lodash';

import Misc from "../../base/components/Misc";
import publishers from '../../data/PublisherList';

/**
 * @deprecated in August 2022
 * TODO: remove if applicable - unused elsewhere & presume it's purpose has passed
 *	 	 written over two years ago & only update since was a tidy up
 * Which publishers showed an advert? List the high profile ones.
 */
const PublishersCard = ({pvViewData}) => {
	if ( ! pvViewData.resolved) return <Misc.Loading />;
	if ( ! pvViewData.value) return null;
	const byPub = pvViewData.value.by_pub;
	if ( ! byPub) return null;

	// Array of publisher logos from mockup.
	// TODO: Get proper Publisher objects
	// for each bucket (ie data on a publisher this campaign ran on)
	let pubs = byPub.buckets.map(pBucket => {
		// find the publisher object which matches it
		const pub = publishers.find(thisPub => pBucket.key === thisPub.name);
		return pub;
	});
	// filter nulls (ie not high profile publishers)
	pubs = pubs.filter(p => p);
	if ( ! pubs.length) return null;

	return (
		<div className="section pub-container d-flex justify-content-center">
			<div className="header-font text-center pb-5 pl-4 pr-4">
				This is where you might have seen our campaign</div>
			<div className="text-center">
				{pubs.map(pub => <PubSign key={pub.id} pub={pub} />)}
			</div>
		</div>);
};

/** @deprecated in August 2022 
 *  TODO: remove if you remove PublishersCard - only used there
*/
const PubSign = ({pub}) => (
	<div key={pub.name} className="pb-5 pub-div d-inline-block" style={{width: '33%'}}>
		<img src={pub.branding.logo} alt={pub.name} />
	</div>);

export default PublishersCard;
