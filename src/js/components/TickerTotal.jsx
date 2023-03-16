
import React from 'react';
import Money from '../base/data/Money';
import Ticker from './Ticker';

// snapshot from March 2023 - 2146208.31 donated in total of 2022 & 6059167.69 raised in total so far
const amount = new Money("£6059167.69"); // wahoo!
const startTime = new Date("2022-12-31");
const rate = 2146208.31 / (60*60*24*365); // £s per second

/**
 * How much money has Good-Loop raised?
 */
const TickerTotal = ({noPennies}) => <Ticker 
	amount={amount} rate={rate}
	tickTime={1000}
	startTime={startTime}
	preservePennies noPennies={noPennies}/>;

export default TickerTotal;
