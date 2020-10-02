import React from 'react';
import { space } from '../../base/utils/miscutils';

const WhiteCircle = ({width, children, circleCrop, className}) => {
	let contentStyle = {
		width: circleCrop ? circleCrop + "%" : "70%",
		height: circleCrop ? circleCrop + "%" : "70%"
	};

	return (
		<div className={space("white-circle", className)} style={{width}} >
			<div className="content" style={contentStyle}>
				{children}
			</div>
		</div>
	);
};

export default WhiteCircle;
