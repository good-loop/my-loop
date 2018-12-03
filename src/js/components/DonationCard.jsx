import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';
// import pivot from 'data-pivot';
import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import {getId} from '../base/data/DataClass';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import ActionMan from '../plumbing/ActionMan';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import Login from 'you-again';
import {LoginLink, SocialSignInButton} from '../base/components/LoginWidget';
import {getProfile, getProfilesNow} from '../base/Profiler';
import printer from '../base/utils/printer';
import {LoginToSee} from './Bits';

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
		return <LoginToSee />;
	}
	let hasjwts = Login.aliases? Login.aliases.filter(u => u.jwt) : [];
	if ( ! hasjwts.length) {
		DataStore.fetch(['transient','jwt',Login.getId()], () => {
			return Login.verify();
		});
		return <Misc.Loading text='Checking your login...' />;
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
		// word-wrap fixes bug where users with a lot of linked IDs see giant string that scrolls off screen if charity data cannot be fetched
		// Might be better to just display qAllIds instead of xids, but this is easier to test right now (unable to reproduce on local/test)
		return <p className="word-wrap">No charity data for {xids}. <a href='https://as.good-loop.com'>Watch a Good-Loop ad to donate</a></p>;
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
	
	// make rows
	let rows = cids.map(cid => {
		return {cid, userTotal: donationsByCharity[cid], communityTotal: communityDonationsByCharity[cid]};
	});
	// sort by value??
	
	// render
	// TODO <You xids={xids} />

	return(<div>
		<p>What we've raised together for your charities.</p>
		{rows.slice(0, 3).map(row => <CharityDonation key={row.cid} {...row} />)}
	</div>);
}; // ./DonationCard


const You = ({xids}) => {
	console.warn("You...", xids);
	let peeps = getProfilesNow(xids);
	// get image	
	let img = getImage(peeps);	
	console.warn("You img", img);
	return (<div></div>);
};

// TODO move to Profiler
const getImage = peeps => {	
	// any with an image?
	let peepsWithImg = peeps.filter(peep => peep.img);
	if (peepsWithImg.length) {
		// TODO use the claim data to pick the most recent
		return peepsWithImg[0].img;
	}
	// Facebook?
	// use http://graph.facebook.com/" + facebookId + "/picture?type=square For instance:
	let fbpeeps = peeps.filter(peep => XId.service(getId(peep)) === 'facebook');
	if (fbpeeps.length) {
		// TODO an ajax request to https://graph.facebook.com/{id}?fields=picture.width(720).height(720)&redirect=false
		// will get a json blob with picture.data.url
		// a redirect??
		let xid = fbpeeps[0].xid;
		// FIXME this kills react?!
		// let pvImg = DataStore.fetch(['transient', 'fb', xid], () => {
		// 	return $.get('https://graph.facebook.com/' + XId.id(fbpeeps[0].xid) + "/picture?type=square");
		// });
		// if (pvImg.resolved) {
		// 	console.warn("FB img", pvImg.value);
		// }
	}
	// TODO email - gravatar
	// ?? is there a gmail??
	// https://stackoverflow.com/questions/9128700/getting-google-profile-picture-url-with-user-id
	// <script src="https://www.avatarapi.com/js.aspx?email=peter.smith@gmail.com&size=128"></script>
	// https://picasaweb.google.com/data/feed/api/user/daniel.winterstein@gmail.com?kind=album&alt=json
	// then profilePic = myArr["feed"]["entry"][0]["media$group"]["media$thumbnail"][0]["url"]; 
	return null;
};

const CharityDonation = ({cid, userTotal, communityTotal}) => {
	// HACK: avoid any dodgy numbers from old/new donation counters
	if (communityTotal > 20000) communityTotal = communityTotal*0.06;

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
	
	const img = charity.logo || charity.img || "/img/logo-grey.png";
	return (
		<div className="col-md-4">
			<div className="charity-circle">
				<div className="top">
					<img src={img} alt={`Logo for ${charity.name}`} className='charity-logo mx-auto' />
				</div>
				<div className="bottom">
					<p className="stats">
						<Misc.Money amount={communityTotal} />
					</p>
				</div>
			</div>
			
			<div className='charity-circle-caption'>{charity.displayName || charity.name || cid}</div>
		</div>
	);
};

	// // TODO fetch peeps, use Person.img, use Login.getUser(), use gravatar and Facebook standards to get an image
	// let peeps = getProfilesNow(xids);
	// console.warn("image", peeps, Login.getUser(), Login.aliases);
	// let profileImg = (Login.getUser() && Login.getUser().img)
	// 	// TODO a fallback image
	// 	|| "http://scotlandjs.com/assets/speakers/irina-preda-e8f1d6ce56f84ecaf4b6c64be7312b56.jpg";

// 	// Display their charity + community donations
// 	return 	(<Misc.Col2>
// 		<div className="content">
// 			<div className="partial-circle big top">
// 				<img src="https://res.cloudinary.com/hrscywv4p/image/upload/c_limit,h_630,w_1200,f_auto,q_90/v1/722207/gl-logo-red-bkgrnd_qipkwt.jpg" />
// 			</div>
// 			<div className="partial-circle big bottom"><p className="stats">
// 				<Misc.Money amount={1} />
// 			</p></div>
// 			<div className="partial-circle2 small top">
// 				<img src={profileImg} />
// 			</div>
// 			<div className="partial-circle2 small bottom"><p className="stats">
// 				<Misc.Money amount={userTotal} />
// 			</p></div>
// 		</div>
// 		<div>{pvTopCharity.value? <CharityBlurb charity={pvTopCharity.value} /> : null}</div>
// 	</Misc.Col2>);
// }; // ./DonationsCard

// const CharityBlurb = ({charity}) => {
// 	let img = charity.logo || charity.img;
// 	// HACK for old SoGive data which has relative urls
// 	if (img && img[0]==='/') img = 'https://app.sogive.org'+img;
// 	return (<div>
// 		<h4>Your Top Charity</h4>
// 		<h4>{charity.name}</h4>
// 		{img? <img src={img} className='logo img-thumbnail' /> : null}
// 	</div>);
// };

export default DonationCard;
