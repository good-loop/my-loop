/**
 * A counter where the numbers spin up to the actual figure.
 */

 // TODO support for more precise than 3 sig figs

/* Possible TODO MAYBE! use react-spring for smoother, less expensive animations?? Should be default tool?? */

import React, { useState, useEffect } from 'react';
import Money from '../base/data/Money';


/**
 * Alternate version of Counter that ticks number up from the initial value at a steady rate
 * NB: Removed sigFigs - including sigFig rounding would heavily obscure the tick effect
 * @param {Object} p
 * @param {Number} p.value Initial value to display
 * @param {String} p.currencySymbol
 * @param {Money} p.amount - Convenient way to set value + currencySymbol
 * @param {Number} p.rate - amount added per tickTime
 * @param {Number} p.tickTime - time between ticks in milliseconds
 * @param {Boolean} p.preservePennies Preserves 2 digits on the pennies count. This overrides sigFigs. True by default for money.
 * @param {Boolean} p.noPennies Just the pounds
 * @param {Boolean} p.centerText Centers the text when counting up in the animation.
 * @param {Date} p.startTime Calculates the start value based on a start time so the ticker updates on refreshes
 */
const Ticker = ({value, amount, rate, tickTime=1000, currencySymbol = '', pretty = true, preservePennies, noPennies, centerText=false, startTime}) =>
{
	if (amount) {
		value = Money.value(amount);
		currencySymbol = Money.currencySymbol(amount);
	}
	if ( ! value) { // paranoia
		console.warn("Ticker - No value or amount");
		return null;
	}

	const timeDiff = startTime ? Date.now() - startTime.getTime() : 0;
	const valDiff = (timeDiff / tickTime) * rate;

	const [dispVal, setValue] = useState(value);
	// Use state to make sure the offset is only stored once
	const [valOffset] = useState(startTime ? valDiff : 0);

	// Begin ticking on load
	useEffect(() => {
		// Start routine updates
		const interval = setInterval(() => {
			// If the startTime is set, use that to calculate differences
			// Otherwise use a fixed rate addition
			setValue(dispVal + rate);
		}, tickTime);
		return () => clearInterval(interval);
	});

	// Number Formatting
	const options = {};
	// ...set default value for preservePennies and sigFigs (but not both)
	if (preservePennies===undefined && (amount || currencySymbol)) {
		preservePennies = true;
	}
	if (preservePennies) {
		options.minimumFractionDigits = 2;
		options.maximumFractionDigits = 2;
	}
	if (noPennies) {
		options.minimumFractionDigits = 0;
		options.maximumFractionDigits = 0;
	}
	const formatNum = x => {
		try {
			return new Intl.NumberFormat('en-GB', options).format(x);
		} catch(er) {
			console.warn("Ticker.jsx formatNumber "+er); // Handle the weird Intl undefined bug, seen Oct 2019, possibly caused by a specific phone type
			return '' + x;
		}
	};

	let offsetDispVal = dispVal + valOffset;
	if (pretty) offsetDispVal = formatNum(offsetDispVal);
	
	return (
		<span className="Ticker">
			{currencySymbol}{offsetDispVal}
		</span>
	);
};

export default Ticker;
