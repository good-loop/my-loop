import React from 'react';
import Roles from '../../base/Roles';
import { space } from '../../base/utils/miscutils';
import C from '../../C';

const DevLink = ({href, target, children, style, className}) => {
	if ( ! Roles.isDev()) {
		return null;
	}
	return (
		<C.A className={space("dev-link small", className)} href={href} target={target} style={style}>
			<div className="dev-label d-flex align-items-center justify-content-center">DEV</div>
			<div className="dev-text">{children}</div>
		</C.A>
	);
};

export default DevLink;
