import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { space } from '../base/utils/miscutils';
import { periodFromName } from './pages/greendash/dashutils';



const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Are these two Dates on the same day? */
const sameDate = (d1, d2) => {
	if (!d1 || !d2) return false;
	return (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate())
};


/** Do the first two dates surround the first? */
const between = (d1, d2, test) => {
	if (!d1 || !d2 || !test) return false;
	return (
		(d1.getTime() <= test.getTime() && d2.getTime() > test.getTime())
		|| (d2.getTime() <= test.getTime() && d1.getTime() > test.getTime())
	);
};

/**
 * is d1 a date after d2?
 * @param {Date} d1 
 * @param {Date} d2 
 */
const after = (d1, d2) => {
	if (!d1 || !d2) return false;
	return d1.getTime() > d2.getTime();
}

/**
 * is d1 a date before d2?
 * @param {Date} d1 
 * @param {Date} d2 
 */
 const before = (d1, d2) => {
	if (!d1 || !d2) return false;
	return d1.getTime() < d2.getTime();
}

/** 00:00:00.000 on the same day as the given Date. */
const dayStart = (date = new Date()) => {
	return new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
};


const Day = ({date, className, onClick, ...rest}) => {
	if (!date) return <td className="day"></td>; // placeholder

	return <td className={space('day', className)}>
		<a onClick={() => onClick && onClick(date)} {...rest}>
			{date==="cont" ? "..." : date.getDate()}
		</a>
	</td>;
}

const Month = ({year, month, start, end, setPeriod, className}) => {
	const refDate = new Date(year, month, 1);

	let currentRow = [];
	const rows = [currentRow];

	// pad start
	let dayCursor = 1;
	while (dayCursor != refDate.getDay()) {
		currentRow.push(null);
		dayCursor = (dayCursor + 1) % 7;
	}

	// fill in days
	while (refDate.getMonth() === month) {
		if (currentRow.length === 7) {
			currentRow = [];
			rows.push(currentRow);
		}
		currentRow.push(new Date(refDate));
		refDate.setDate(refDate.getDate() + 1);
	}

	// What happens when a day on the calendar is clicked?
	const clickDay = (date) => {
		if (!date) return;
		const dayAfter = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
		// First click will set a range of 1 day encompassing the day clicked.
		// Clicks before the start date will move the start date.
		if (!start || date.getTime() < start.getTime()) {
			const newStart = date;
			const newEnd = end || dayAfter;
			setPeriod(null, newStart, newEnd);
			return;
		}
		// Clicks after end date will move the end date.
		// for execution to reach this point, start must exist & be before clicked date
		if (!end || date.getTime() > end.getTime()) {
			setPeriod(null, start, dayAfter);
			return;
		}
		// Clicks within range move whichever of start/end is closer to the clicked date.
		if (Math.abs(start.getTime() - date.getTime()) < Math.abs(end.getTime() - date.getTime())) {
			setPeriod(null, date, end);
		} else {
			setPeriod(null, start, dayAfter);
		}
	};

	const clickMonth = () => {
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(monthStart);
		monthEnd.setMonth(monthEnd.getMonth() + 1);
		setPeriod(null, monthStart, monthEnd);
	};

	console.log(start, end);

	return <div className={space('month', className)}>
		<a onClick={clickMonth}>
			<div className="month-name">{months[month]} {year}</div>
		</a>
		<table>
			<thead>
				<tr className="day-names">
					{weekdays.map(name => <th className="day" key={name}>{name.substring(0, 2)}</th>)}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, i) => {
				return (
					<tr key={i}>
						{row.map((date, i) => {
							let selClass = between(start, end, date) ? 'selected' : '';
							if (selClass) {
								if (sameDate(date, start)) selClass += ' sel-start';
								// end is exclusive - ie a [start, end) range - so is set to midnight 00:00 on the next day
								const dayBeforeEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
								if (sameDate(date, dayBeforeEnd)) selClass += ' sel-end';
							}
							return <Day date={date} className={selClass} key={i} onClick={clickDay} />;
						})}
						{i === rows.length - 1 && after(end, row[row.length - 1]) ?
							<Day date={"cont"} className="selected"/>
						 : null}
					</tr>
				)})}
			</tbody>
		</table>
	</div>;
};

/**
 * 
 * @param p
 * @param {Object} p.dflt A period object which sets the initial range
 * @param {Function} p.onChange Called with a {start, end, name} object every time the range changes.
 * @returns  
 */
const DateRangeWidget = ({dflt, className, onChange}) => {
	const [name, setName] = useState(dflt.name); // Named time periods, eg "2021-Q1", "yesterday"
	const [start, setStart] = useState(dflt.start);
	const [end, setEnd] = useState(dflt.end);

	useEffect(() => {
		setPeriod(dflt.name, dflt.start, dflt.end);
		console.log("DEFAULT PERIOD:::", dflt);
	}, [dflt]);

	const setPeriod = (name, start, end) => {
		setName(name);
		if (!start && !end) {
			const periodObj = periodFromName(name);
			if (periodObj) {
				setStart(periodObj.start);
				setEnd(periodObj.end);
				focusPeriod(periodObj.start, periodObj.end);
				return;
			}
		}
		setStart(start);
		setEnd(end);
		focusPeriod(start, end);
	};

	const focusPeriod = (start, end) => {
		if (start && end) {
			const middleDate = new Date((start.getTime() + end.getTime()) / 2);
			setFocusDate(middleDate);
		} else if (start) setFocusDate(start);
	}
	
	// Send changes back to invoking component
	useEffect(() => {
		if (start && end && onChange) onChange({start, end, name});
	}, [start, end, name])

	// The month the 3-month calendar view is focused on (try to put current period in view by default)
	const [focusDate, setFocusDate] = useState(() => (dflt.end || dflt.start || new Date()));

	// Set period to "X days ago" --> "last midnight (ie 00:00:00 today)"
	const setDaysBack = (offset) => {
		const newEnd = new Date();
		newEnd.setHours(0, 0, 0, 0);
		const newStart = new Date(newEnd);
		if (offset) newStart.setDate(newStart.getDate() + offset);
		setPeriod(null, newStart, newEnd);
	};
	
	// Set period to "Calendar month of X months ago"
	const setCalendarMonth = (offset) => {
		const newEnd = new Date();
		newEnd.setHours(0, 0, 0, 0); // ??
		newEnd.setMonth(offset + newEnd.getMonth() + 1, 1);
		const newStart = new Date(newEnd)
		newStart.setMonth(newStart.getMonth() - 1);
		setPeriod(null, newStart, newEnd);
	};

	// Quick buttons for common ranges (names currently unused)
	const setYesterday = () => setDaysBack(-1, 'yesterday');
	const setLast7Days = () => setDaysBack(-7, 'last-7')
	const setLast30Days = () => setDaysBack(-30, 'last-30');
	const setThisMonth = () => setCalendarMonth(0, 'this-month');
	const setLastMonth = () => setCalendarMonth(-1, 'last-month')

	// The months before and after the focused month
	const prevMonth = new Date(focusDate.getFullYear(), focusDate.getMonth() - 1, 1);
	const nextMonth = new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 1);

	const monthProps = { start, end, setPeriod };

	return <div className={space('select-date-range', className)}>
		<div className="months-container">
			<a className="shift-focus prev" onClick={() => setFocusDate(prevMonth)}>◀</a>
			<a className="shift-focus next" onClick={() => setFocusDate(nextMonth)}>▶</a>
			<Month className="prev-month" year={prevMonth.getFullYear()} month={prevMonth.getMonth()} start={start} end={end} {...monthProps} />
			<Month className="this-month" year={focusDate.getFullYear()} month={focusDate.getMonth()} start={start} end={end} {...monthProps} />
			<Month className="next-month" year={nextMonth.getFullYear()} month={nextMonth.getMonth()} start={start} end={end} {...monthProps} />
		</div>
		<div className="presets-container">
			<Button className="preset" size="sm" onClick={setYesterday}>Yesterday</Button>
			<Button className="preset" size="sm" onClick={setLast7Days}>Last 7 days</Button>
			<Button className="preset" size="sm" onClick={setLast30Days}>Last 30 days</Button>
			<Button className="preset" size="sm" onClick={setThisMonth}>This month</Button>
			<Button className="preset" size="sm" onClick={setLastMonth}>Last month</Button>
		</div>
	</div>
};


export default DateRangeWidget;