/** TODO SVG widgets to do nice funky layout */

import React from 'react';
import ServerIO from '../plumbing/ServerIO';

/**
  * @deprecated in August 2022
 * Fill the top-left corner
 */
const TopLeftCornerSwerve = ({children}) => {
	// TODO document
	return (<div>{children}</div>);
};

/**
 * @deprecated in August 2022
 * Top bulges with a lean to the right, Flat bottom
 */
const TopRightBulge = ({children, background}) => {
	// ??do we need absolute urls??
	let bgurl = background.match(/^http/) ? background : ServerIO.MYLOOP_ENDPOINT+'/'+background;
	// Use abs positioning within the card to put contents over backdrop
	return (<div name="TopRightBulge" style={{position:'relative'}}>
		<svg
			viewBox="0 0 1062.992 850.39327"
			style={{
				position:'absolute',
				bottom: 0
			}}
			preserveAspectRatio="none"
		>
			<defs>
				<pattern id="image" x="0" y="0" height="1" width="1"
					viewBox="0 0 1000 666" preserveAspectRatio="xMidYMid slice"
				>
					<image
						width="1000"
						height="666"
						xlinkHref={bgurl}
						preserveAspectRatio="xMidYMid slice"
					/>
				</pattern>
			</defs>
			<path
				id="path3336"
				d="M 739.65309,24.273895 A 842.80831,1282.2272 75.325871 0 0 239.69389,88.203568 842.80831,1282.2272 75.325871 0 0 -762.10481,880.63285 l 1858.98731,0 0,-810.156975 A 842.80831,1282.2272 75.325871 0 0 739.65309,24.273895 Z"
				fill="url(#image)"
				style={{
					stroke: '#ffffff',
					strokeWidth: '10',
					strokeOpacity: '1'
				}}
			/>
		</svg>
		<div style={{position:"absolute",top:'10vh'}}>{children}</div>
	</div>);
};

export {
	TopLeftCornerSwerve,
	TopRightBulge
};
