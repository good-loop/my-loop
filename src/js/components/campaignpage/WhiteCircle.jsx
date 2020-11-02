import React from 'react';
import { space } from '../../base/utils/miscutils';

/**
 * ?? doc how sizing works
 * @param {*} param0 
 */
const WhiteCircle = ({width, children, circleCrop, className}) => {
	let contentStyle = {
		width: circleCrop ? circleCrop + "%" : "70%",
		height: circleCrop ? circleCrop + "%" : "70%"
	};

	return (
		<div className={space("WhiteCircle", className)} style={{width}} >
			<div className="content" style={contentStyle}>
				{children}
			</div>
		</div>
	);
};

export default WhiteCircle;
