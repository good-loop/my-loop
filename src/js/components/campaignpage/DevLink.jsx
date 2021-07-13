import React from 'react';
import Roles from '../../base/Roles';
import { space } from '../../base/utils/miscutils';

const DevLink = ({href, target, children, style, className}) => {
	if ( ! Roles.isDev()) {
		return null;
	}
	return (
		<a className={space("dev-link small", className)} href={href} target={target} style={style}>
			<div className="dev-label d-flex align-items-center justify-content-center">DEV</div>
			<div className="dev-text">{children}</div>
		</a>
	);
};

export default DevLink;
