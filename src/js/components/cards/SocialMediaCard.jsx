import React from 'react';
import { XId } from 'wwutils';
import { getProfilesNow } from '../../base/Profiler';
import { RegisterLink, SocialSignInButton } from '../../base/components/LoginWidget';
import { TwitterLogo, FacebookLogo } from '../SocialShare';

/**
 * Social CTAs: Share on social / connect
 */
const SocialMediaCard = ({allIds=[], className}) => {
	// TODO (31/10/18): move emailID in to ids after email signup code has been implemented
	const emailID = allIds.filter(id => XId.service(id)==='email')[0];
	const twitterID = allIds.filter(id => XId.service(id)==='twitter')[0];
	const fbid = allIds.filter(id => XId.service(id)==='facebook')[0];

	if( emailID && twitterID && fbid) {
		return null;
	}

	const fbpeep = getProfilesNow([fbid])[0]; 
	return (
		<div className={'social-media-card ' + className}>
			<div className='flex-row flex-wrap'>
				{
					!emailID
					&& (
						<div className='pad1'>
							<RegisterLink className='sub-header btn btn-gl' verb='Sign Up' />
						</div>
					)
				}
				<div className='social-connect-container'>
					{twitterID ? (
						<div className='wrapper'>
							<p className="connected">
								<i className="fa fa-handshake-o" /> 
								Twitter id: 
								<a href={'https://twitter.com/'+XId.id(twitterID)} target='_blank' rel='noopener noreferrer'>
									{XId.id(twitterID)}
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
					{fbid ? (
						// TODO show some data about them from FB
						<div>Facebook ID: {XId.id(fbid)} {fbpeep? fbpeep.name : ''}</div>
					) : (
						<div>
							<SocialSignInButton service='facebook' verb='connect'>
								<FacebookLogo className='intent-link-small' />
							</SocialSignInButton>
						</div>	
					)}
				</div>
			</div>
		</div>
	);
};

export default SocialMediaCard;
