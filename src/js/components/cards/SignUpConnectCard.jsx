import React from 'react';
import { space, toTitleCase } from '../../base/utils/miscutils';
import { getProfilesNow } from '../../base/Profiler';
import { LoginLink, SocialSignInButton } from '../../base/components/LoginWidget';
import Misc from '../../base/components/Misc';
import DataStore from '../../base/plumbing/DataStore';
import XId from '../../base/data/XId';

const signInOrConnected = ({service, xid}) => {
	if (xid) return <Connected service={service} xid={xid} />;
	
	if (service === 'good-loop') {
		return <LoginLink className='btn bg-gl-red white'>Sign Up by Email</LoginLink>;
	}

	return (
		<SocialSignInButton service={service} verb='connect' />
	);
};

/**
 * Social CTAs: Share on social / connect
 */
const SignUpConnectCard = ({className}) => {
	// ??where is this loaded / set??
	let xids = DataStore.getValue(['data', 'Person', 'xids']);
	if (!xids) return <Misc.Loading />;

	// [id1@service1, id2@service2] --> {service1: id1@service1, service2: id2@service2}, only retain first ID for each service.
	const service2xid = xids.reduce((acc, id) => ({[XId.service(id)]: id, ...acc}), {});

	return (
		<div className={space('social-media-card', className)}>
			<p style={{fontSize:"0.85rem"}}>
				Boost your donations<br/>
				and track your impact
			</p>
			{signInOrConnected({ service: 'good-loop', xid: service2xid.email })}
			{signInOrConnected({ service: 'twitter', xid: service2xid.twitter })}
		</div>
	);
};


/**
 * An indicator that the user is logged in on the specified service.
 * Shows:
 * - profile photo if available
 * - a [service logo] + 'Connected' indicator
 * - the user's name
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
				<div className="connected">
					<Misc.Logo service={service} color={false} square={false} size="xsmall" /> Connected
				</div>
				<div className="name">{nameText}</div>
			</div>
		</div>
	);
};

export default SignUpConnectCard;
