import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { getBrowserVendor, isPortraitMobile, space } from '../../base/utils/miscutils';
import { PageCard, CardImgLeft, NewsAwards, TriCards, CurvePageCard } from './CommonComponents';
import {T4GSignUpButton} from '../T4GSignUp';
import DynImg from '../../base/components/DynImg';
import BG from '../../base/components/BG';

export const SafariPage = () => {
	return (<>
	<PageCard className="SafariPage widepage">
		<h1>Using Tabs For Good in Safari on Mac</h1>
		<ol>
			<li>In the Safari app  on your Mac, choose Safari Preferences, then click General.</li>
			<li>In the Homepage field, enter a the Tabs For Good address: <code>https://my.good-loop.com/newtab.html</code> <button onClick={() => {navigator.clipboard.writeText('https://my.good-loop.com/newtab.html')}} className='btn btn-seconday'>Copy To Clipboard</button></li>
			<li>Click the “New windows open with” pop-up menu, then choose Homepage.</li>
			<li>Click the “New tabs open with” pop-up menu, then choose Homepage.</li>
		</ol>
	</PageCard>
	</>)
}

export default SafariPage;
