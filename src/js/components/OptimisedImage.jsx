import React from 'react';

/** Grabs either standard or mobile-optimised image depending on context
 * @render (21/03/19) made this render props to deal with unusual way that bg image is handled
 * Just providing a thin wrapper to an img element might be easier going forward
 * @param href https://testmedia.good-loop.com/uploads/standard/cat.jpg
 */
const OptimisedImage = (props) => {
	let {render} = props;
	let src = props.src || '';

	const isMobile = DataStore.getValue(['env', 'isMobile']);
	// Logos have different path structure (testmedia.good-loop.com/uploads/img/cat.jpg)
	const isStandardMediaImage = src.includes('media.good-loop.com/uploads/standard/');
	src = isMobile && isStandardMediaImage ? src.replace('uploads/standard', 'uploads/mobile') : src;

	return render({...props, src});
};

export default OptimisedImage;