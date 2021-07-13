import React from 'react';
import { space } from '../../base/utils/miscutils';

/**
 * ?? doc how sizing works
 * @param {*} param0
 */
const WhiteCircle = ({width, children, circleCrop, className, style}) => {
	let contentStyle = {
		width: circleCrop ? circleCrop + "%" : "70%",
		height: circleCrop ? circleCrop + "%" : "70%"
	};

	let divStyle = {width, ...style};

	return (
		<div className={space("WhiteCircle", className)} style={divStyle}>
			<div className="content" style={contentStyle}>
				{children}
			</div>
		</div>
	);
};

export default WhiteCircle;
