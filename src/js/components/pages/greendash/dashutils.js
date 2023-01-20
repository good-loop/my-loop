import React, { useState } from 'react';
import { Button, Card } from 'reactstrap';
import DataStore from "../../../base/plumbing/DataStore";
import { isoDate, space } from '../../../base/utils/miscutils';
import { PNGDownloadButton } from '../../../base/components/PNGDownloadButton';


/**
 * Returns a period object for the quarter enclosing the given date
 * @param {?Date} date Default "now"
 * @returns {start, end, name}
 */
export const getPeriodQuarter = (date = new Date()) => {
	const qIndex = Math.floor(date.getMonth() / 3);
	const start = new Date(date);
	start.setMonth(qIndex * 3, 1);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 3);
	return {start, end, name: `${start.getFullYear()}-Q${qIndex + 1}`};
};


/**
 * Returns a period object for the month enclosing the given date
 * @param {?Date} date 
 * @returns 
 */
export const getPeriodMonth = (date = new Date()) => {
	const start = new Date(date)
	start.setDate(1);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	return {start, end, name: `${start.getFullYear()}-${end.getMonth()}`};
};


export const getPeriodYear = (date = new Date()) => {
	const start = new Date(date);
	start.setMonth(0, 1);
	start.setHours(0, 0, 0, 0);
	const end = new Date(date)
	end.setMonth(12);
	return {start, end, name: `${start.getFullYear()}`};
};


/** Read URL params and extract a period object if one is present 
 * @returns {?Object} {start:Date end:Date}
*/
export const periodFromUrl = () => {
	// User has set a named period (year, quarter, month)
	const periodName = DataStore.getUrlValue('period')
	const periodObjFromName = periodFromName(periodName);
	if (periodObjFromName) return periodObjFromName;

	// Custom period with start/end values
	const start = DataStore.getUrlValue('start');
	const end = DataStore.getUrlValue('end');
	if (start || end) {
		const period = {};
		if (start) {
			const [, yyyy, mm, dd] = start.match(/(\d+)-(\d+)-(\d+)/);
			period.start = new Date(yyyy, mm, dd);
			period.start.setMonth(period.start.getMonth() - 1); // correct for Date taking zero-index months
		}
		if (end) {
			const [, yyyy, mm, dd] = end.match(/(\d+)-(\d+)-(\d+)/);
			period.end = new Date(yyyy, mm, dd);
			period.end.setMonth(period.end.getMonth() - 1); // correct for Date taking zero-index months
			// Intuitive form "Period ending 2022-03-31" --> machine form "Period ending 2022-04-01T00:00:00"
			period.end.setDate(period.end.getDate() + 1);
		}
		return period;
	}

	// Nothing set in URL
	return null;
};

/**
 * Read URL params and extract a prob number if one is present 
 * @returns {number | null}
 */
export const probFromUrl = () => {
	const probName = DataStore.getUrlValue('prob')
	try {
		return Number.parseInt(probName);
	} catch (e) {
		console.log('Failed to read prob from url', e);
		return null;
	}
}

/** Convert a name to a period object
 * @returns {?Object} {start:Date end:Date}
*/
export const periodFromName = (periodName) => {
	if (periodName) {
		if (periodName === 'all') {
			return {
				start: new Date('1970-01-01'),
				end: new Date('3000-01-01'),
				name: 'all'
			}
		}
		let refDate = new Date();
		
		// eg "2022-Q2"
		const quarterMatches = periodName.match(quarterRegex);
		if (quarterMatches) {
			refDate.setFullYear(quarterMatches[1]);
			refDate.setMonth(3 * (quarterMatches[2] - 1));
			return getPeriodQuarter(refDate);
		}
		// eg "2022-04"
		const monthMatches = periodName.match(monthRegex);
		if (monthMatches) {
			refDate.setFullYear(monthMatches[1]);
			refDate.setMonth(monthMatches[2]);
			return getPeriodMonth(refDate);
		}
		// eg "2022"
		const yearMatches = periodName.match(yearRegex);
		if (yearMatches) {
			refDate.setFullYear(yearMatches[1]);
			return getPeriodYear(refDate)
		}
	}

	// Custom period with start/end values
	const start = DataStore.getUrlValue('start');
	const end = DataStore.getUrlValue('end');
	if (start || end) {
		const period = {};
		if (start) {
			let [, yyyy, mm, dd] = start.match(/(\d+)-(\d+)-(\d+)/);
			mm = Number.parseInt(mm);
			period.start = new Date(yyyy, mm - 1, dd);// correct for Date taking zero-index months
		}
		if (end) {
			let [, yyyy, mm, dd] = end.match(/(\d+)-(\d+)-(\d+)/);
			mm = Number.parseInt(mm);
			period.end = new Date(yyyy, mm - 1, dd); // correct for Date taking zero-index months
			// Intuitive form "Period ending 2022-03-31" --> machine form "Period ending 2022-04-01T00:00:00"
			period.end.setDate(period.end.getDate() + 1);
		}
		return period;
	}

	// Nothing set in URL
	return null;
};


/** Take a period object and transform it to use as URL params */
export const periodToParams = ({name, start, end}) => {
	const newVals = {};
	if (name) {
		newVals.period = name;
	} else {
		// Custom period - remove period name from URL params and set start/end
		if (start) newVals.start = isoDate(start);
		if (end) {
			// Machine form "Period ending 2022-04-01T00:00:00" --> intuitive form "Period ending 2022-03-31"
			end = new Date(end);
			end.setDate(end.getDate() - 1);
			newVals.end = isoDate(end);
		}
	}
	return newVals;
}


/** Locale-independent date to string, formatted like "25 Apr 2022" */
export const printDate = (date) => `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
/** Locale-independent date (without year) to string, formatted like "25 Apr" */
export const printDateShort = (date) => `${date.getDate()} ${monthNames[date.getMonth()]}`;

const quarterNames = [, '1st', '2nd', '3rd', '4th'];


/**
 * Turn period object into clear human-readable text
 * @param {*} period Period object with either a name or at least one of start/end
 * @param {*} short True for condensed format
 * @returns 
 */
export const printPeriod = ({start, end, name = ''}, short) => {
	if (name === 'all') return 'All Time';

	// Is it a named period (quarter, month, year)?
	const quarterMatches = name.match(quarterRegex);
	if (quarterMatches) {
		const [, year, num] = quarterMatches;
		if (short) return `Q${num} ${year}`; // eg "Q1 2022"
		return `${year} ${quarterNames[num]} quarter`; // eg "2022 1st Quarter"
	}

	const monthMatches = name.match(monthRegex);
	if (monthMatches) {
		const [, month, year] = monthMatches;
		return `${monthNames[month]} ${year}`; // eg "Jan 2022"
	}

	const yearMatches = name.match(yearRegex);
	if (yearMatches) {
		const [, year] = yearMatches;
		if (short) return `${year}`; // eg "2022"
		return `Year ${year}`; // eg "Year 2022"
	}

	// Bump end date back by 1 second so eg 2022-03-01T00:00:00.000+0100 to 2022-04-01T00:00:00.000+0100
	// gets printed as "1 March 2022 to 31 March 2022"
	end = new Date(end);
	end.setSeconds(end.getSeconds() - 1);

	const pd = short ? printDateShort : printDate;
	return `${start ? pd(start) : ``} to ${end ? pd(end) : `now`}`;
};

export const periodKey = ({start, end, name}) => {
	if (name) return name;
	return `${start ? isoDate(start) : 'forever'}-to-${end ? isoDate(end) : 'now'}`
};

const quarterRegex = /^(\d\d?\d?\d?)-Q(\d)$/;
const monthRegex = /^(\d\d?\d?\d?)-(\d\d?)$/;
const yearRegex = /^(\d\d?\d?\d?)$/;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


/** Styling overrides applied to cards when doing PNG capture */
const screenshotStyle = {
	fontSize: '1.25rem',
	textAlign: 'center',
	fontWeight: 'bold',
	marginBottom: '8px'
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

const roundFormat = new Intl.NumberFormat('en-GB', {maximumFractionDigits: 0});
const oneDigitFormat = new Intl.NumberFormat('en-GB', {minimumFractionDigits: 1, maximumFractionDigits: 2});
const twoDigitFormat = new Intl.NumberFormat('en-GB', {minimumFractionDigits: 0, maximumFractionDigits: 1});

/**
 * printer.prettyNumber is a little short on nuance here - we want to show a degree of precision
 * 1-digit numbers get up to 2 decimals & at least one, eg 3.4567 -> 3.45, 1.001 -> 1.0
 * 2-digit numbers get up to 1 decimal, eg 23.456 -> 23.5, 91.04 -> 91
 * 3-digit numbers get rounded to integer
 */
const smartNumber = x => {
	if (x == 0) return '0';
	if (!x) return '';
	if (x > -10 && x < 10) return oneDigitFormat.format(x);
	else if (x > -100 && x < 100) return twoDigitFormat.format(x);
	return roundFormat.format(x);
}


const massGeneric = (kg, makeElement) => {
	const number = smartNumber(kg >= 1000 ? kg / 1000 : kg, true);
	const unit = kg < 1000 ? 'kg' : `tonne${kg !== 1 ? 's' : ''}`;

	return makeElement ? (
		<span className="mass">
			<span className="number">{number}</span> <span className="unit">{unit}</span>
		</span>
	) : (
		`${number} ${unit}`
	);
};


/** Utility: take a mass in kg and pretty-print in kg or tonnes if it's large enough (element with semantic classes) */
export const Mass = ({kg}) => {
	return massGeneric(kg, true)
};

/** Utility: take a mass in kg and pretty-print in kg or tonnes if it's large enough (raw string) */
export const mass = (kg) => {
	return massGeneric(kg);
}


export const ModeButton = ({ children, name, mode, setMode, size = 'sm', ...rest}) => {
	return (
		<Button size={size} color={mode === name ? 'primary' : 'secondary'} onClick={() => setMode(name)} {...rest}>
			{children}
		</Button>
	);
};


// HSL values for the maximum and mimimum values in the series - interpolete between for others
const dfltMaxColour = [192, 33, 48];
const dfltMinColour = [186, 9, 84];

/**
 * Generate pretty on-brand colours for a chart data range
 * @param {!number[]} series 
 * @param {?number[]} maxColour e.g. [255,0,0] bright red
 * @param {?number[]} minColour 
 * @returns 
 */
export const dataColours = (series, maxColour = dfltMaxColour, minColour = dfltMinColour) => {
	if (!series.length) return [];
	// if (series.length === 1) return [`hsl(${maxColour[0]} ${maxColour[1]} ${maxColour[2]})`]

	// make sure everything passed to max/min is coercable to a real number
	const cleanSeries = series.filter(x => isFinite(x));
	const max = Math.max(...cleanSeries);
	const min = Math.min(...cleanSeries);
	const range = max - min || 1; // no x/0 for perfectly uniform datasets!

	const [minH, minS, minL] = minColour;
	const [dH, dS, dL] = maxColour.map((x, i) => x - minColour[i]);

	return series.map(val => {
		const quotient = (val - min) / range;
		return `hsl(${Math.round(minH + (quotient * dH))} ${Math.round(minS + (quotient * dS))}% ${Math.round(minL + (quotient * dL))}%)`
	});
};

/** Minimum kg value where we should switch to displaying tonnes instead */
export const TONNES_THRESHOLD = 1000;

export const CO2 = <span>CO<sub>2</sub>e</span>;
export const CO2e = <span className="co2e">CO<sub>2</sub>e</span>;
export const NOEMISSIONS = <div>No {CO2} emissions for this period</div>;