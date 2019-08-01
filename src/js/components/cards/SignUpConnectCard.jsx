import React from 'react';
import { XId, join, toTitleCase } from 'wwutils';
import { getProfilesNow } from '../../base/Profiler';
import { RegisterLink, SocialSignInButton } from '../../base/components/LoginWidget';
import { TwitterLogo, FacebookLogo } from '../SocialShare';
import Misc from '../../base/components/Misc';
import DataStore from '../../base/plumbing/DataStore';

/**
 * Social CTAs: Share on social / connect
 */
const SignUpConnectCard = ({className}) => {
	// ??where is this loaded / set??
	let xids = DataStore.getValue(['data', 'Person', 'xids']);
	if( ! xids ) return <Misc.Loading />;
	// TODO (31/10/18): move emailID in to ids after email signup code has been implemented
	const emailID = xids.filter(id => XId.service(id)==='email')[0];
	const twitterID = xids.filter(id => XId.service(id)==='twitter')[0];
	const fbid = xids.filter(id => XId.service(id)==='facebook')[0];
	
	return (
		<div className={join('flex-row flex-wrap social-media-card', className)}>
			<div className='pad1'>
				{emailID? <Connected service='email' xid={emailID} />
					: <RegisterLink className='sub-header btn btn-gl' verb='Sign Up' />
				}
			</div>
			<div className='pad1'>
				{twitterID ? <Connected service='twitter' xid={twitterID} />
					: <SocialSignInButton service='twitter' verb='connect' className='sub-header btn btn-gl' />
				}
			</div>
			<div className='pad1'>
				{fbid? <Connected service='facebook' xid={fbid} /> 
					: <SocialSignInButton service='facebook' verb='connect' className='sub-header btn btn-gl' />
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
	const fbpeep = getProfilesNow([xid])[0];
	// Show the user name for Facebook, not the ID.
	let name = fbpeep? fbpeep.name : '';
	return (<div>			
		<Misc.Icon fa="handshake-o" />
		{toTitleCase(service)}
		{service==='facebook'? name || 'id: '+XId.id(xid) : XId.prettyName(xid)}
	</div>);
};

export default SignUpConnectCard;
