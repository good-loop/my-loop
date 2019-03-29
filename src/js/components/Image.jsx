import React from 'react';
import DataStore from '../base/plumbing/DataStore';

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
			backgroundSize: '83%',
			minHeight: '100px',
			minWidth: '100px',
			height: '5em',
			width: '5em'
		}} 
	/>
);

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
	RoundLogo,
	OptimisedImage
}; 
