
import React from 'react';
import Money from '../base/data/Money';
import Ticker from './Ticker';

// snapshot from March 2023 - 2146208.31 donated in total of 2022 & 6059167.69 raised in total so far
const tickerProps = {
	amount: new Money('£6059167.69'), // wahoo!
	startTime: new Date('2022-12-31'),
	tickTime: 1000,
	rate: 2146208.31 / (60 * 60 * 24 * 365), // £ per second
};

/**
 * How much money has Good-Loop raised?
 */
const TickerTotal = ({noPennies}) => (
	<Ticker noPennies={noPennies} preservePennies {...tickerProps} />
);

export default TickerTotal;
