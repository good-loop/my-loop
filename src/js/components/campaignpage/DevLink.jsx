import React from 'react';

const DevLink = ({href, target, children}) => {
	return (
        <a className="dev-link small" href={href} target={target}>
            <div className="dev-label d-flex align-items-center justify-content-center">DEV</div>
            <div className="dev-text">{children}</div>
        </a>
	);
}

export default DevLink;