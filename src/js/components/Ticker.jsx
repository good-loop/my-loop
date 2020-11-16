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
const Ticker = ({value, amount, rate, tickTime=1000, currencySymbol = '', pretty = true, preservePennies, centerText=false, unitWidth}) => 
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
	disp = currencySymbol + disp;

	let dispArr = disp.split("");
	return (
		<span className="position-relative d-inline-flex flex-row justify-content-center align-items-center" style={{padding: "0 " + (centerText ? "0.1rem" : "0")}}>
			{/*<span className="invisible text-center" style={{width: centerText ? "100%" : "auto"}}>{currencySymbol + totalVal}</span>
			<span className="position-absolute text-center" style={{right: 0, width: centerText ? "100%" : "auto"}} ref={ref}>{currencySymbol + disp}</span>*/}
			{dispArr.map((digit, i) => <span key={i} style={{width:unitWidth || "1rem", textAlign:"center", margin:"unset"}}>
				{digit}
			</span>)}
		</span>
	);
};

export default Ticker;
