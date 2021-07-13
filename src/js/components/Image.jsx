import React from 'react';
import { space } from '../base/utils/miscutils';

// FIXME this doesnt get printed 'cos Bootstrap sets background to off for printing.
// Either (a) stronger css to get it printed, or (b) use and <img> instead
const BaseLogo = ({alt, className, style, url, children, ...rest}) => (
	<div alt={alt} className={className} style={{backgroundImage: `url('${url}')`, ...style}} {...rest}>
		{children}
	</div>
);

/** Basically just the adunit's charity logo */
const RoundLogo = ({className, ...rest}) => <BaseLogo {...rest} className={'round-logo' + (className ? ' ' + className : '')} />;

/**
 * Uses "% margins are relative to element width" trick to force square aspect - see main.less
 * Occupies 1/3 screen-width by default.
 */
const SquareLogo = ({className, children, ...rest}) => (
	<BaseLogo {...rest} className={space('square-logo', className)}>
		<div className="squarener" />
		{children}
	</BaseLogo>
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
	const isMobile = isMobile();
	let optiurl;
	if (isMobile) {
		optiurl = url.replace('uploads/standard', 'uploads/mobile')
			.replace('uploads/raw', 'uploads/mobile');
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
	src = optimise(src);
	return render({...props, src});
};

export default OptimisedImage;

export {
	optimise,
	RoundLogo,
	SquareLogo,
	OptimisedImage
};
