import React from 'react';
import { XId, join, toTitleCase } from 'wwutils';
import { getProfilesNow } from '../../base/Profiler';
import { LoginLink, SocialSignInButton } from '../../base/components/LoginWidget';
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
		<div className={join('social-media-card', className)}>
			<div className='pad1'>
				{emailID? <Connected service='good-loop' xid={emailID} />
					: <LoginLink className='btn btn-lg btn-default bg-gl-red white'><Misc.Icon fa='envelope' size='2x' /> Sign-Up</LoginLink>
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
	let { name, img } = profile.std;

	// Don't get caught out by mixed content restrictions
	if (img) img = img.replace(/^http:/, 'https:');

	const nameText = service === 'facebook' ? (
		name || `id: ${XId.id(xid)}` // Show the user name for Facebook, not the ID.
	) : XId.prettyName(xid);

	return (
		<div className={`social-connected bg-${service} white`}>
			{ img ? <><img className="user-pic" src={img} alt="" />&nbsp;</> : ''}
			<div>
				<div className="connected"><Misc.Logo service={service} color={false} square={false} size="xsmall" /> Connected</div>
				<div className="name">{nameText}</div>
			</div>
		</div>
	);
};

export default SignUpConnectCard;
