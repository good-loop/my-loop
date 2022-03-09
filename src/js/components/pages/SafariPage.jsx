import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { getBrowserVendor, isPortraitMobile, space } from '../../base/utils/miscutils';
import { PageCard, CardImgLeft, NewsAwards, TriCards, CurvePageCard } from './CommonComponents';
import {T4GSignUpButton} from '../T4GSignUp';
import DynImg from '../../base/components/DynImg';
import BG from '../../base/components/BG';
import BSCarousel from '../../base/components/BSCarousel';
import Page from './AccountPage';

export const SafariPage = () => {

	const SlideItems = [
		<>
			<img src="/img/SafariPage/safari-inital.png" alt="" />
			<p>In the Safari app  on your Mac, choose Safari Preferences, then click General.</p>
		</>,
		<>
			<p>In the Homepage field, enter a the Tabs For Good address:</p>
			<p>
				<code>https://my.good-loop.com/newtab.html</code>
				<button onClick={() => {navigator.clipboard.writeText('https://my.good-loop.com/newtab.html')}} 
					className='btn btn-seconday'>Copy To Clipboard</button>
			</p>
		</>,
		<>
			<img src="/img/SafariPage/safari-final.png" alt="" />
			<p>Click the “New windows open with” pop-up menu, then choose Homepage.</p>
			<p>Click the “New tabs open with” pop-up menu, then choose Homepage.</p>
		</>,
	];

	const slides = SlideItems.map((content, i) => (
		<div key={i} style={{height:'25em'}} className='p-5 text-center'>
			{content}
		</div>
	));

	return (<>
	<PageCard className="SafariPage widepage">
		<h1>Using Tabs For Good in Safari on Mac</h1>
		<BSCarousel className="bg-gl-light-pink mt-5 rounded" hasIndicators>
			{slides}
		</BSCarousel>
	</PageCard>
	</>)
}

export default SafariPage;
