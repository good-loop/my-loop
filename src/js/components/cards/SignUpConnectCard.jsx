import React from 'react';
import { XId, join, toTitleCase } from 'wwutils';
import { getProfilesNow } from '../../base/Profiler';
import { RegisterLink, SocialSignInButton } from '../../base/components/LoginWidget';
import Misc from '../../base/components/Misc';
import DataStore from '../../base/plumbing/DataStore';

/**
 * Social CTAs: Share on social / connect
 */
const SignUpConnectCard = ({className}) => {
	// ??where is this loaded / set??
	let xids = DataStore.getValue(['data', 'Person', 'xids']);
	if (!xids) return <Misc.Loading />;
	// TODO (31/10/18): move emailID in to ids after email signup code has been implemented

	const emailID = xids.filter(id => XId.service(id)==='email')[0];
	const twitterID = xids.filter(id => XId.service(id)==='twitter')[0];
	const fbid = xids.filter(id => XId.service(id)==='facebook')[0];
	
	return (
		<div className={join('flex-row flex-wrap social-media-card', className)}>
			<div className='pad1'>
				{emailID? <Connected service='email' xid={emailID} />
					: <RegisterLink className='btn btn-lg btn-gl' verb='Sign Up' />
				}
			</div>
			<div className='pad1'>
				{twitterID ? <Connected service='twitter' xid={twitterID} />
					: <SocialSignInButton service='twitter' verb='connect' size="lg" />
				}
			</div>
			<div className='pad1'>
				{fbid? <Connected service='facebook' xid={fbid} />
					: <SocialSignInButton service='facebook' verb='connect' size="lg" />
				}
			</div>
		</div>
	);
};

/**
 * TODO show the profile photo
 * 
 * TODO a green tick??
 */
const Connected = ({service, xid}) => {
	const profile = getProfilesNow([xid])[0] || {std: {}};
	// Show the user name for Facebook, not the ID.
	let { name, img } = profile.std;

	const nameText = service === 'facebook' ? (
		name || `id: ${XId.id(xid)}`
	) : XId.prettyName(xid);

	// TODO Fallback for profile photo

	return (
		<div className="social-connected">
			<Misc.Logo service={service} color square size="small" />&nbsp;
			<img className="user-pic" src={img} alt={`User pic for ${toTitleCase(service)} user ${XId.prettyName(xid)}`} />&nbsp;
			{nameText}
		</div>
	);
};

export default SignUpConnectCard;
