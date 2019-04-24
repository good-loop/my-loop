import React from 'react';
import { XId } from 'wwutils';
import { getProfilesNow } from '../base/Profiler';
import { SocialSignInButton } from '../base/components/LoginWidget';

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
			
			{	// Show text if ids contains an undefined value (user still hasn't connected one of their social media accounts)
				Object.values(ids).some( id => id === undefined || id === null) ? <p>Connect your social media - you can use this to boost the donations you generate!</p> : null
			}
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
					<SocialSignInButton service='twitter' verb='connect' />
				</div>
			)}
			{ids.fbid ? (
				// TODO show some data about them from FB
				<div>Facebook ID: {XId.id(ids.fbid)} {fbpeep? fbpeep.name : ''}</div>
			) : (
				<div>
					<div><SocialSignInButton service='facebook' verb='connect' /></div>
				</div>	
			)}
		</div>
	);
};

export default SocialMediaCard;
