import React from 'react';
import { space } from '../../base/utils/miscutils';

const WhiteCircle = ({width, children, className}) => {
	return (
		<div className={space("white-circle", className)} style={{width}} >
			<div className="content">
				{children}
			</div>
		</div>
	);
};

export default WhiteCircle;
