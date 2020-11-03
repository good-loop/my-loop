/**
 * A counter where the numbers spin up to the actual figure.
 */

 // TODO support for more precise than 3 sig figs

/* Possible TODO MAYBE! use react-spring for smoother, less expensive animations?? Should be default tool?? */

import React, {useState, useEffect, useRef} from 'react';
import { space } from '../base/utils/miscutils';
import printer from '../base/utils/printer';
import {useDoesIfVisible} from '../base/components/CustomHooks';
import Money from '../base/data/Money';

/**
 * Alternate version of Counter that ticks number up from the initial value at a steady rate
 * NB: Removed sigFigs - including sigFig rounding would heavily obscure the tick effect
 * 
 * @param {Number} value Initial value to display
 * @param {String} currencySymbol
 * @param {Money} amount - Convenient way to set value + currencySymbol
 * @param {Number} rate - 
 * @param {Number} tickTime - time between ticks in milliseconds
 * @param {Boolean} preservePennies Preserves 2 digits on the pennies count. This overrides sigFigs. True by default for money.
 * @param {Boolean} centerText Centers the text when counting up in the animation.
 */
const Ticker = ({value, amount, rate, tickTime=1000, currencySymbol = '', pretty = true, preservePennies, centerText=false}) => 
{
	if (amount) {
		value = Money.value(amount);
		currencySymbol = Money.currencySymbol(amount);
	}
	if ( ! value) {	// paranoia
		console.warn("Ticker - No value or amount");
		return null;
	}
	const [dispVal, setValue] = useState(value);
	const [running, setRunning] = useState(false);
	const ref = useRef();

	// Begin ticking on load
	useEffect(() => {
		const interval = setInterval(() => {
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
	const formatNum = x => {		
		try {
			return new Intl.NumberFormat('en-GB', options).format(x);
		} catch(er) {
			console.warn("Ticker.jsx formatNumber "+er); // Handle the weird Intl undefined bug, seen Oct 2019, possibly caused by a specific phone type
			return ""+x;	
		}	
	};

	let disp = pretty? formatNum(dispVal) : dispVal.toString();	

	// Get the total value in pretty penny form too, for preserving the size
	let totalVal = pretty ? formatNum(value) : value.toString();
	
	// Make sure the display value is no longer than the end size
	disp = disp.substr(0, totalVal.length);

	// To avoid having the surrounding text jitter, we fix the size.
	// using an invisible final value to get the sizing right.
	// Text is aligned by absolute position of span, right:0 = right alignment by default
	// If centerText is set, width is set to 100 and text-center does the job
	// When centerText is set, the container div gets some extra horizontal padding to stop text overflow
	return (
		<div className="position-relative d-inline-block" style={{padding: "0 " + (centerText ? "0.1rem" : "0")}}>
			<span className="invisible text-center" style={{width: centerText ? "100%" : "auto"}}>{currencySymbol + totalVal}</span>
			<span className="position-absolute text-center" style={{right: 0, width: centerText ? "100%" : "auto"}} ref={ref}>{currencySymbol + disp}</span>
		</div>
	);
};

export default Ticker;
