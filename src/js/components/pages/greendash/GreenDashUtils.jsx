/**
 * Green Dashboard jsx utilities
 */
import React, { useState } from 'react';
import { PNGDownloadButton } from "../../../base/components/PNGDownloadButton";
import { Button, Card } from 'reactstrap';
import { mass } from './dashUtils';
import { space } from '../../../base/utils/miscutils';



/** Styling overrides applied to cards when doing PNG capture */
const screenshotStyle = {
	fontSize: '1.25rem',
	textAlign: 'center',
	fontWeight: 'bold',
	marginBottom: '8px'
};


/** OS-independent download (downward arrow in in-tray) icon */
export const downloadIcon = (
	<svg viewBox='0 0 100 100' className='icon download-icon'>
		<path d='m5 70v25h90v-25h-5v20h-80v-20z' />
		<path d='m45 10v50h-10l15 15 15-15h-10v-50h-10z' />
	</svg>
);


export const CO2 = <span>CO<sub>2</sub>e</span>;
export const CO2e = <span className="co2e">CO<sub>2</sub>e</span>;
export const NOEMISSIONS = <div>No {CO2} emissions for this period</div>;


export const ModeButton = ({ children, name, mode, setMode, size = 'sm', ...rest}) => {
	return (
		<Button size={size} color={mode === name ? 'primary' : 'secondary'} onClick={() => setMode(name)} {...rest}>
			{children}
		</Button>
	);
};


/** Utility: take a mass in kg and pretty-print in kg or tonnes if it's large enough (element with semantic classes) */
export const Mass = ({kg}) => {
	const n_u = mass(kg).split(" ");
	return (<span className="mass">
		<span className="number">{n_u[0]}</span> <span className="unit">{n_u[1]}</span>
	</span>);
	
};



/** Boilerplate styling for a subsection of the green dashboard */
export const GreenCard = ({ title, children, className, row, downloadable = true, ...rest}) => {
	const downloadButton = downloadable && (
		<PNGDownloadButton
			querySelector={`.${className}`}
			fileName={title}
			title="Click to download this card as a .PNG"
			opts={{scale: 1.25}}
			onCloneFn={(document) => {
				// Larger card headings
				document.querySelectorAll('.gc-title').forEach(node => {
					Object.assign(node.style, screenshotStyle);
				});
				// Greencard padding
				document.querySelector('.gc-body').style.border = 'none';
			}}
		/>
	);

	return <div className={space('green-card my-2 flex-column', className)} {...rest}>
		{title ? <h6 className="gc-title">{title}</h6> : null}
		{downloadButton}
		<Card body className={space('gc-body', row ? 'flex-row' : 'flex-column')}>{children}</Card>
	</div>
};


export const GreenCardAbout = ({children, ...rest}) => {
	if (true) return null; // TODO write the text for these
	const [open, setOpen] = useState(false);

	return <div className={space('card-about', open && 'open')}>
		<div className="about-body">
			{children}
		</div>
		<a className="about-button" onClick={() => setOpen(!open)}>
			<svg className="question-mark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{fill: 'none', stroke: 'currentColor', strokeWidth: 15.5, strokeLinecap: 'round'}}>
  			<path d="m50 69-.035-8.643c-.048-11.948 20.336-20.833 20.336-32 0-11-8.926-20.488-20.336-20.488-9.43 0-20.336 7.321-20.336 20.184" />
				<path d="m50 91v91" />
			</svg>
		</a>
	</div>;
}
