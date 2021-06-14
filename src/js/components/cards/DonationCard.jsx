/* global navigator */
import React from 'react';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import Login from '../base/youagain';

/**
 * @returns {?Boolean} true if do-not-track is on
 */
const doNotTrack = () => {
	try {
		if (navigator.doNotTrack == "1") return true;
		if (navigator.doNotTrack == "0") return false;
	} catch (err) {
		console.warn("DNT check failed", err);
		return null;
	}
};

const DonationCard = ({xids}) => {
	if ( ! Login.isLoggedIn()) {
		return <Misc.LoginToSee />;
	}

	// Do not track?
	let dnt = doNotTrack();

	if ( ! xids) {
		if (dnt) {
			return <div>No tracking IDs to check - You have Do-Not-Track switched on, so we're not tracking you!</div>;
		}
		return <div>No tracking IDs to check {dnt===null? " - Do you have Do-Not-Track switched on?" : null}</div>;
	}

	// Assemble the data: top 5 of: charity, user-donation, community-donation
	// NB: if xids changes (eg extra linking is added)	then this will reload

	// Get donations by user (including all registered tracking IDs)
	let qAllIds = xids.map(xid => 'user:'+xid).join(' OR ');
	const donationsPath = ['widget', 'MyReport', 'user-donations', qAllIds];
	let q = qAllIds;
	let pvDonationData = DataStore.fetch(donationsPath, () => {
		const name = "user-donations"; // dummy parameter: helps identify request in network tab
		return ServerIO.getDonationsData({q, name});
	});

	if ( ! pvDonationData.resolved) {
		return <Misc.Loading text='Loading your donations...' />;
	}

	// TODO Warning: possibly broken by changes to returned data Sept 2018 ^DW
	let userTotal = pvDonationData.value && pvDonationData.value.total;

	// no user donations?
	if ( ! userTotal) {
		if (dnt) {
			return <div>No charity data... You have Do-Not-Track switched on, so we're not tracking you!</div>;
		}
		console.warn('No charity data for these xids', xids);
		// word-wrap fixes bug where users with a lot of linked IDs see giant string that scrolls off screen if charity data cannot be fetched
		// Might be better to just display qAllIds instead of xids, but this is easier to test right now (unable to reproduce on local/test)
		return (
			<>
				<p className="word-wrap">You do not appear to have made a donation via a Good-Loop ad</p>
				<a href='https://as.good-loop.com'>Watch a Good-Loop ad to donate</a>
			</>
		);
	}

	let donationsByCharity = pvDonationData.value.by_cid;

	const cids = Object.keys(donationsByCharity);

	// whats their main charity?
	const topCharityValue = {cid:null, v:0};
	cids.forEach(cid => {
		let dv = donationsByCharity[cid];
		if (dv <= topCharityValue.v) return;
		topCharityValue.cid = cid;
		topCharityValue.v = dv;
	});

	// load the community total for these charities
	let pvCommunityCharityTotal = DataStore.fetch(['widget','DonationCard','community'], () => {
		let qcids = cids.map(xid => 'cid:'+xid).join(' OR ');
		const name = "total-donations"; // dummy parameter: helps identify request in network tab
		return ServerIO.getDonationsData({q:qcids, name});
	});
	let communityDonationsByCharity = pvCommunityCharityTotal.value? pvCommunityCharityTotal.value.by_cid : {};

	let onlyOneCharity = cids.length === 1;

	// make rows
	let rows = cids.map(cid => {
		return {cid, userTotal: donationsByCharity[cid], communityTotal: communityDonationsByCharity[cid], onlyOneCharity: onlyOneCharity};
	});
	// sort by value??

	// render
	// TODO <You xids={xids} />

	return(<div>
		<p>What we've raised together</p>
		{rows.slice(0, 3).map(row => <CharityDonation key={row.cid} {...row} />)}
	</div>);
}; // ./DonationCard

const CharityDonation = ({cid, communityTotal, onlyOneCharity}) => {
	// HACK: avoid any dodgy numbers from old/new donation counters
	if (communityTotal > 20000) communityTotal *= 0.06;

	// TODO show the users donations - if they're above a threshold, e.g. £1
	// Below that and users will feel dispirited 

	// load charity info from SoGive
	// NB: can 404

	let charity = {};
	if (cid === 'unset') {
		charity = { name: 'No benefactor chosen' };
	} else {
		const pvCharity = ActionMan.getDataItem({type: C.TYPES.NGO, id: cid, status: C.KStatus.PUBLISHED, swallow: true});
		charity = pvCharity.value || {};
	}

	const img = charity.logo || charity.img || "/img/logo-white.svg";
	return (
		<div className={onlyOneCharity ? "" : "col-md-4"}>
			<div className="charity-circle">
				<div className="top">
					<img src={img} alt={`Logo for ${charity.displayName}`} className='charity-logo mx-auto' />
				</div>
				<div className="bottom">
					<p className="stats">
						<Misc.Money amount={communityTotal} />
					</p>
				</div>
			</div>
			<div className='top-p-1'>{charity.displayName || charity.name || cid}</div>
		</div>
	);
};

export default DonationCard;
