import React from 'react';
import Roles from '../../base/Roles';

const DevLink = ({href, target, children}) => {
	if ( ! Roles.isDev()) return null;
	return (
		<a className="dev-link small" href={href} target={target}>
			<div className="dev-label d-flex align-items-center justify-content-center">DEV</div>
			<div className="dev-text">{children}</div>
		</a>
	);
};

export default DevLink;
