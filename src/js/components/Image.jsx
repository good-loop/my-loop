import React from 'react';
import DataStore from '../base/plumbing/DataStore';

/**
 * ?? Why not out the css into a .less file?
 */
const RoundLogo = props => (
	<div
		{...props} 
		alt={props.alt} 
		style={{
			backgroundImage: `url('${props.url}')`,
			border: '1px solid grey',
			borderRadius: '50%',
			margin: 0,
			backgroundColor: '#fff',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center center',
			backgroundSize: '100%',
			height: '5rem',
			width: '5rem'
		}} 
	/>
);


/**
 * @param {?String} url The image url
 * @returns e.g. the url for the media server's mobile optimised version
 */
const optimise = url => {
	if ( ! url) return url;
	const isMediaImage = url.indexOf('media.good-loop.com') !== -1;
	if ( ! isMediaImage) return url;
	// mobile or standard?
	const isMobile = DataStore.getValue(['env', 'isMobile']);
	let optiurl;
	if (isMobile) {
		optiurl = url.replace('uploads/standard', 'uploads/mobile').replace('uploads/raw', 'uploads/mobile');
	} else {
		optiurl = url.replace('uploads/raw', 'uploads/standard');
	}
	return optiurl;
};


// TODO Instead of a jsx widget, have a function url -> optimised url. 
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

export {
	optimise,
	RoundLogo,
	OptimisedImage
}; 
