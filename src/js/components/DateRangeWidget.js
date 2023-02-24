import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { space } from '../base/utils/miscutils';
import { periodFromName } from './pages/greendash/dashutils';

import '../../style/DateRangeWidget.less';

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

const tomorrow = (date) => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

/** 00:00:00.000 on the same day as the given Date. */
const dayStart = (date = new Date()) => {
	return new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
};


const Day = ({date, className, onClick, onHover, ...rest}) => {
	if (!date) return <td className="day"></td>; // placeholder
	const isCont = date==="cont";

	return <td className={space('day', isCont && "cont", className)}
				onClick={() => onClick && !isCont && onClick(date)}
				onMouseOver={() => onHover && onHover(date)}
				{...rest}>
		{isCont ? "..." : date.getDate()}
	</td>;
}

const Month = ({year, month, start, end, setPeriod, hoverStart, hoverEnd, onDayClick, onDayHover, className}) => {
	const refDate = new Date(year, month, 1);

	let currentRow = [];
	const rows = [currentRow];

	// Pad start of month
	let dayCursor = 1;
	while (dayCursor != refDate.getDay()) {
		currentRow.push(null);
		dayCursor = (dayCursor + 1) % 7;
	}

	// Fill in days
	while (refDate.getMonth() === month) {
		if (currentRow.length === 7) {
			currentRow = [];
			rows.push(currentRow);
		}
		currentRow.push(new Date(refDate));
		refDate.setDate(refDate.getDate() + 1);
	}

	// What happens when a day on the calendar is clicked?
	const clickDay = onDayClick ? (date => date && onDayClick(date)) : null;

	// What happens when a day is hovered?
	const hoverDay = onDayHover ? (date => date && onDayHover(date)) : null;

	// Select a full month by clicking the name
	const clickMonth = () => {
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(monthStart);
		monthEnd.setMonth(monthEnd.getMonth() + 1);
		setPeriod(null, monthStart, monthEnd);
	};

	// end is exclusive - ie a [start, end) range - so is set to midnight 00:00 on the next day
	const dayBeforeEnd = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1) : new Date(2999, 10);

	// Convenient reference points
	const lastOfMonth = new Date(year, month + 1, 0); // 0th of next month = last day of this
	const now = new Date();

	return <div className={space('month text-center', className)}>
		<a onClick={clickMonth} className="month-name">
			{months[month]} {year}
		</a>
		<table>
			<thead>
				<tr className="day-names">
					{weekdays.map(name => <th className="day" key={name}>{name.substring(0, 2)}</th>)}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, i) => <tr key={i}>
					{row.map((date, j) => {
						// Mark selected region, future dates, selection-in-progress, and selections continuing over month borders
						let classes = [];
						const selected = between(start, end, date);
						const firstSel = sameDate(date, start);
						const lastSel = sameDate(date, dayBeforeEnd);
						if (selected) classes.push('selected');
						if (firstSel) classes.push('sel-start');
						if (lastSel) classes.push('sel-end');
						if (selected && !firstSel && !lastSel) {
							if (date.getDate() === 1) classes.push('cont-prev');
							if (sameDate(date, lastOfMonth)) classes.push('cont-next');
						}
						if (between(hoverStart, hoverEnd, date)) classes.push('hovered');
						if (after(date, now)) classes.push('future');

						return <Day date={date} className={space(classes)} key={`${date}-${j}`} onClick={clickDay} onHover={hoverDay} />;
					})}
				</tr>)}
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
	const [selDate, setSelDate] = useState(null); // For two-click period selection
	const [hoverStart, setHoverStart] = useState(null); // For highlighting potential period
	const [hoverEnd, setHoverEnd] = useState(null);

	useEffect(() => {
		setPeriod(dflt.name, dflt.start, dflt.end);
	}, [dflt]);

	// initial focus
	useEffect(() => {
		focusPeriod(dflt.start, dflt.end);
	}, []);

	const setPeriod = (name, start, end) => {
		setName(name);
		if (!start && !end) {
			const periodObj = periodFromName(name);
			if (periodObj) {
				setStart(periodObj.start);
				setEnd(periodObj.end);!sameDate(start, dflt.start) 
				return;
			}
		}
		setStart(start);
		setEnd(end);
	};

	const focusPeriod = (start, end) => {
		if (start && end) {
			const middleDate = new Date((start.getTime() + end.getTime()) / 2);
			setFocusDate(middleDate);
		} else if (start) setFocusDate(start);
	}
	
	// Send changes back to invoking component
	useEffect(() => {
		if (start && end && onChange)
			onChange({start, end, name});
	}, [start, end, name])

	// The month the 3-month calendar view is focused on (try to put current period in view by default)
	const [focusDate, setFocusDate] = useState(() => (dflt.end || dflt.start || new Date()));

	// Set period to "X days ago" --> "last midnight (ie 00:00:00 today)"
	const setDaysBack = (offset) => {
		// tommorow (end is non-inclusive)
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

	const selectDate = (date) => {
		if (!selDate) {
			setSelDate(date);
			setHoverStart(date);
			setHoverEnd(date);
		} else {
			const selDateFirst = before(selDate, date);
			const d1 = selDateFirst ? selDate : date;
			const d2 = selDateFirst ? tomorrow(date) : tomorrow(selDate);
			setPeriod(null, d1, d2);
			setSelDate(null);
			setHoverStart(null);
			setHoverEnd(null);
		}
	};

	const hoverDate = (date) => {
		if (!selDate) return;
		else {
			const selDateFirst = before(selDate, date);
			const d1 = selDateFirst ? selDate : date;
			const d2 = selDateFirst ? tomorrow(date) : tomorrow(selDate);
			setHoverStart(d1);
			setHoverEnd(d2);
		}
	}

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
			<Month className="prev-month" year={prevMonth.getFullYear()} month={prevMonth.getMonth()} setPeriod={setPeriod} start={start} end={end} hoverStart={hoverStart} hoverEnd={hoverEnd} onDayClick={selectDate} onDayHover={hoverDate} {...monthProps} />
			<Month className="this-month" year={focusDate.getFullYear()} month={focusDate.getMonth()} setPeriod={setPeriod} start={start} end={end} hoverStart={hoverStart} hoverEnd={hoverEnd} onDayClick={selectDate} onDayHover={hoverDate} {...monthProps} />
			<Month className="next-month" year={nextMonth.getFullYear()} month={nextMonth.getMonth()} setPeriod={setPeriod} start={start} end={end} hoverStart={hoverStart} hoverEnd={hoverEnd} onDayClick={selectDate} onDayHover={hoverDate} {...monthProps} />
		</div>
		<div className="presets-container">
			<Button className="preset" size="sm" onClick={setYesterday}>Yesterday</Button>
			<Button className="preset" size="sm" onClick={setLast7Days}>Last 7 days</Button>
			<Button className="preset" size="sm" onClick={setLast30Days}>Last 30 days</Button>
			<Button className="preset" size="sm" onClick={setThisMonth}>This month</Button>
			<Button className="preset" size="sm" onClick={setLastMonth}>Last month</Button>
			<Button className="preset" size="sm" color="primary" onClick={() => focusPeriod(start, end)}>Recenter</Button>
		</div>
	</div>
};


export default DateRangeWidget;