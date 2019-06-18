import React from 'react';

const ImpactCard = ({children, className}) => (
	<div className={'impact-card ' + className}>
		{children}
	</div>
);

/** Generic div with image as background
 * Width auto to allow for bootstrap col
 */
const ImpactImage = ({className, imageSrc, children}) => (
	<div className={'img-block-basic text-left ' + className} style={{backgroundImage: 'url(' + imageSrc + ')'}}>
		{children}
	</div>
);

export {
	ImpactCard,
	ImpactImage
};
export default ImpactCard;
