import React, { useState } from 'react';
import { Card } from 'reactstrap';

import DataStore from "../../../base/plumbing/DataStore";
import { isoDate, space } from '../../../base/utils/miscutils';


/**
 * Returns a period object for the quarter enclosing the given date
 * @param {?Date} date Default "now"
 * @returns 
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


/** Read URL params and extract a period object if one is present */
export const periodFromUrl = () => {
	// User has set a named period (year, quarter, month)
	const periodName = DataStore.getUrlValue('period')
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


/** Take a period object and put it in the URL params */
export const periodToUrl = ({name, start, end}) => {
	if (name) {
		// Named period (eg "2022-Q1") - put period name in URL and remove start/end
		DataStore.setUrlValue('period', name, false);
		DataStore.setUrlValue('start', null, false);
		DataStore.setUrlValue('end', null, false);
	} else {
		// Custom period - remove period name from URL params and set start/end
		DataStore.setUrlValue('period', null, false);
		DataStore.setUrlValue('start', start ? isoDate(start) : null, false);
		if (end) {
			// Machine form "Period ending 2022-04-01T00:00:00" --> intuitive form "Period ending 2022-03-31"
			end = new Date(end);
			end.setDate(end.getDate() - 1);
			DataStore.setUrlValue('end', isoDate(end), false);
		} else {
			DataStore.setUrlValue('end', null, false);
		}
	}
	DataStore.update();
}


/** Locale-independent date to string, formatted like "25 Apr 2022" */
export const printDate = (date) => `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
/** Locale-independent date (without year) to string, formatted like "25 Apr" */
export const printDateShort = (date) => `${date.getDate()} ${monthNames[date.getMonth()]}`;

const quarterNames = [, '1st', '2nd', '3rd', '4th'];


/** Turn period object into clear human-readable text */
export const printPeriod = ({start, end, name = ''}) => {
	if (name === 'all') return 'All Time';

	// Is it a named period (quarter, month, year)?
	const quarterMatches = name.match(quarterRegex);
	if (quarterMatches) return `${quarterMatches[1]} ${quarterNames[quarterMatches[2]]} quarter`;

	const monthMatches = name.match(monthRegex);
	if (monthMatches) return `${monthNames[monthMatches[2]]} ${monthMatches[1]}`;

	const yearMatches = name.match(yearRegex);
	if (yearMatches) return `Year ${yearMatches[1]}`;

	// Bump end date back by 1 second so eg 2022-03-01T00:00:00.000+0100 to 2022-04-01T00:00:00.000+0100
	// gets printed as "1 March 2022 to 31 March 2022"
	end = new Date(end);
	end.setSeconds(end.getSeconds() - 1);

	return `${start ? printDate(start) : ``} to ${end ? printDate(end) : `now`}`;
};

export const periodKey = ({start, end, name}) => {
	if (name) return name;
	return `${start ? isoDate(start) : 'forever'}-to-${end ? isoDate(end) : 'now'}`
};

const quarterRegex = /^(\d\d?\d?\d?)-Q(\d)$/;
const monthRegex = /^(\d\d?\d?\d?)-(\d\d?)$/;
const yearRegex = /^(\d\d?\d?\d?)/;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


/** Boilerplate styling for a subsection of the green dashboard */
export const GreenCard = ({ title, children, className, ...rest}) => {
	return <div className={space('green-card', 'mb-2', className)} {...rest}>
		{title ? <h6 className="gc-title">{title}</h6> : null}
		<Card body className="gc-body">{children}</Card>
	</div>
};


export const GreenCardAbout = ({children, ...rest}) => {
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


/** Utility: take a mass in kg and pretty-print in kg or tonnes if it's large enough  */
export const Mass = ({kg}) => {
	const number = kg >= 1000 ? kg / 1000 : kg;
	const unit = kg >= 1000 ? 'tonnes' : 'kg';
	return <span className="mass">
		<span className="number">{printer.prettyInt(number)}</span>
		<span className="unit">{unit}</span>
	</span>
};

// HSL values for the maximum and mimimum values in the series - interpolete between for others
const dfltMaxColour = [192, 33, 48];
const dfltMinColour = [186, 9, 84];

export const dataColours = (series, maxColour = dfltMaxColour, minColour = dfltMinColour) => {
	const max = Math.max(...series);
	const min = Math.min(...series);
	const range = max - min;

	const [minH, minS, minL] = minColour;
	const rangeH = maxColour[0] - minH;
	const rangeS = maxColour[1] - minS;
	const rangeL = maxColour[2] - minL;

	const fart = series.map(val => {
		const quotient = (val - min) / range;
		return `hsl(${Math.round(minH + (quotient * rangeH))} ${Math.round(minS + (quotient * rangeS))}% ${Math.round(minL + (quotient * rangeL))}%)`
	});
	return fart;
};

/** Minimum kg value where we should switch to displaying tonnes instead */
export const TONNES_THRESHOLD = 1000;
