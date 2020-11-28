
import React, { Component, useState, useRef, useEffect } from 'react';
import Money from '../base/data/Money';
import Ticker from './Ticker';
/**
 * How much money has Good-Loop raised?
 */
const TickerTotal = () => <Ticker amount={new Money("$1501886.40")} rate={0.1}
	startTime={/* arbitrarily taken from dev time ??it'd be nice to add auto recalibration */ new Date(1606220478753)}
	preservePennies />;

export default TickerTotal;
