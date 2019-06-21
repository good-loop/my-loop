import React from 'react';
import { XId } from 'wwutils';
import { getProfilesNow } from '../../base/Profiler';
import { SocialSignInButton } from '../../base/components/LoginWidget';
import { TwitterLogo, FacebookLogo } from '../SocialShare';

/**
 * Social CTAs: Share on social / connect
 */
const SocialMediaCard = ({allIds=[], className}) => {
	// TODO (31/10/18): move emailID in to ids after email signup code has been implemented
	const emailID = allIds.filter(id => XId.service(id)==='email')[0];

	const ids = {
		twitterID: allIds.filter(id => XId.service(id)==='twitter')[0],
		fbid: allIds.filter(id => XId.service(id)==='facebook')[0],
	};

	const fbpeep = getProfilesNow([ids.fbid])[0]; 
	return (
		<div className={className}>
			{emailID ? '' : '' /* <div> TODO: email capture </div> */	}
			{ids.twitterID ? (
				<div className='wrapper'>
					<p className="connected">
						<i className="fa fa-handshake-o" /> 
						Twitter id: 
						<a href={'https://twitter.com/'+XId.id(ids.twitterID)} target='_blank'>
							{XId.id(ids.twitterID)}
						</a>
					</p>
				</div>
				) : (
				<div>
					<SocialSignInButton service='twitter' verb='connect'>
						<TwitterLogo className='intent-link-small' />
					</SocialSignInButton>
				</div>
			)}
			{ids.fbid ? (
				// TODO show some data about them from FB
				<div>Facebook ID: {XId.id(ids.fbid)} {fbpeep? fbpeep.name : ''}</div>
			) : (
				<div>
					<SocialSignInButton service='facebook' verb='connect'>
						<FacebookLogo className='intent-link-small' />
					</SocialSignInButton>
				</div>	
			)}
		</div>
	);
};

export default SocialMediaCard;
