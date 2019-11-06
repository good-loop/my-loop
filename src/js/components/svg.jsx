// Collection of all inline svgs used throughout My-Loop

// TODO document this kind of code! There is lots of opaque hard-coding here.
// Parameterise it too.

import React from 'react';

/** The yin-yang-ish curve on the "HOW IT \ WORKS" element */
const howItWorksCurveSVG= (
	<svg id="how-it-works-curve" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
		<path d="M0 5 V 0 h 100 v 95 C 15 95 85 5 0 5 z" />
	</svg>
);


/** The turned-down upper-left corner of the splash element where the GL logo lives */
const navBarLogoContainerSVG = (
	<svg id="logo-container-curve" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 100">
		<path d="M0 0 H180 C 180 100 0 0 0 100Z" />
	</svg>
);
/** The more compact pill-shaped container used on mobile */
const navBarLogoPillSVG = (
	<svg id="logo-container-pill" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20">
		<path d="M10 20 A10 10 0 0 1 10 0 L90 0 A10 10 0 0 1 90 20 Z" />
	</svg>
);
// old path <path d="M100 0C100 50 0 20 0 100V0z" />
// old viewbox 0 0 100 100


/** The Good-Loop "g-l" logo glyph. Broken out here because it's used multiple times */
const glGlyphPath = (
	<path d="M80.686 15.76c-.435 13.064-6.851 21.44-14.02 29.38a49.644 49.644 0 0 1-2.215-8.047h.004c5.031-5.978 9.055-12.896 9.104-20.954.02-3.288-.62-9.161-4.538-9.227-4.909-.082-8.382 8.937-8.824 15.671-1.316 20.018 6.5 37.154 11.756 37.082 2.397-.032 3.143-3.114 3.502-5.871.2-1.541 2.26-2.971 4.191-2.295 1.931.676 2.588 2.41 2.36 4.09-.73 5.372-5.187 11.68-11.242 10.872C59.02 64.255 54.712 44.873 53.61 34.949 51.368 14.763 57.517-.995 70.696 1.457c6.628 1.233 10.254 6.365 9.99 14.302zM34.348 28.384c6.665.404 10.015 3.858 12.198 6.541 2.325 2.858 1.945 4.93.24 6-1.705 1.07-3.573.18-4.913-.992-5.841-5.11-9.975-5.647-14.447-.728-4.135 4.547-2.58 12.555 1.342 17.063 3.55 4.08 8.354 6.712 12.064 9.465 4.935 3.662 10.374 9.682 10.051 18.722-.38 10.658-6.734 15.942-14.689 15.355-6.93-.512-12.375-4.402-12.934-12.273-.381-5.382 1.675-11.615 7.377-17.08 1.945 1.273 3.683 2.62 5.134 4.292-2.453 2.491-5.484 6.084-5.576 10.162-.053 2.334.208 8.143 5.907 8.72 3.786.384 8.256-4.359 7.976-9.58-.312-5.836-2.388-9.65-8.237-13.965-8.426-6.218-17.084-9.51-17.307-23.708-.198-12.618 9.998-18.346 15.814-17.994zm18.24 21.518c.775 2.316 1.762 4.727 2.805 6.768a191.742 191.742 0 0 0-8.35 8.799c-1.805-1.566-3.544-2.79-5.424-4.074 3.51-4.033 7.485-8.036 10.969-11.493z" />
);

/**
 * The Good-Loop logo!
 * SVG tricks used to make it look properly nice:
 * The two red yin-yang halves are actually half-boxes. The whole drawing is clipped to a 100x100 circle using a a clip-path element.
 * We use the "g-l" glyph both as drawn path in the solid form of the logo and a black (ie "cut this region out") mask in the outlined form.
 * Why all this weirdness? Because when you have any two shapes overlapping in an SVG, and they're cut off at the same edge, there's
 * a 99% chance the rear element will peek out for an antialiased half-pixel somewhere and look AWFUL.
 * This way, the shapes interlock and never share edges.
 */
const GlLogoGenericSvg = ({outline, colour1 = '#770f00', colour2 = '#af2009', colourBg = '#fff'}) => (
	<svg xmlns="http://www.w3.org/2000/svg" className="gl-logo-svg" viewBox="0 0 100 100">
		<mask id="mask">
			<circle fill="#fff" cx="50" cy="50" r="50" />
			{ outline ? <g fill="#000">{glGlyphPath}</g> : '' }
		</mask>
		<g mask="url(#mask)">
			<path fill={outline ? undefined : colour2} d="M100 0v100l-70 .078C7.748 67.155 90.519 52.227 75 .094z" />
			<path fill={outline ? undefined : colour1} d="M0 0l.5 100 29.5.078C7.748 67.155 90.519 52.227 75 .094z" />
			{outline ? '' : <g fill={colourBg}>{glGlyphPath}</g>}
		</g>
	</svg>
);

const glLogoDefaultSvg = <GlLogoGenericSvg />;
const glLogoOutlineSvg = <GlLogoGenericSvg outline />;


const splitColouredCircleSVG = (
	<svg className="split-coloured-circle-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
		<path d="M0 0c1.271 11.668 4.088 23.222 8.302 33.791 6.84 17.156 16.73 31.603 29.621 43.272 1.39 1.257 2.573 2.287 2.632 2.287.285.003 8.932-5.374 10.964-6.818 14.64-10.406 24.271-22.724 31.288-40.014 2.465-6.074 3.78-10.017 7.82-23.46A600.105 600.105 0 0 1 93.418 0z" fill="#a41b00"/>
		<path d="M93.182 0a604.804 604.804 0 0 0-2.846 9.278c-4.508 15.05-6.782 21.485-10.123 28.64C72.3 54.858 59.93 68.092 42.862 77.881l-2.527 1.45 1.966 1.51c4.658 3.577 10.54 7.28 15.648 9.855 5.361 2.702 12.933 5.495 18.703 6.898 4.262 1.037 10.479 2.018 14.343 2.266.545.034 2.794.08 4.998.1L100 100 99.872 0z" fill="#ab2d15"/>
	</svg>
);

export {
	howItWorksCurveSVG,
	navBarLogoContainerSVG,
	navBarLogoPillSVG,
	glLogoDefaultSvg,
	glLogoOutlineSvg,
	GlLogoGenericSvg,
	splitColouredCircleSVG
};
