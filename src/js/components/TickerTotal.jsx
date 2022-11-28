
import React from 'react';
import Money from '../base/data/Money';
import Ticker from './Ticker';

// snapshot from Nov 2022 https://good-loop.monday.com/boards/2603585504/pulses/3584293596/posts/1836008291
const amount = new Money("£5867636.62"); // wahoo!
const startTime = new Date("2022-11-28");
const rate = 10744.24 / (60*60*24); // £s per second

/**
 * How much money has Good-Loop raised?
 */
const TickerTotal = ({noPennies}) => <Ticker 
	amount={amount} rate={rate}
	tickTime={1000}
	startTime={startTime}
	preservePennies noPennies={noPennies}/>;

export default TickerTotal;
