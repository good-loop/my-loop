import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { getBrowserVendor, isPortraitMobile, space } from '../../base/utils/miscutils';
import { PageCard, CardImgLeft, NewsAwards, TriCards, CurvePageCard } from './CommonComponents';
import {T4GSignUpButton} from '../T4GSignUp';
import DynImg from '../../base/components/DynImg';
import BG from '../../base/components/BG';
import BSCarousel, { next } from '../../base/components/BSCarousel';
import Page from './AccountPage';

export const SafariPage = () => {

	const SlideItems = [
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/preferences.png" className='w-75' alt="" />
				<img src="img/safari-preference/dropdown-preferences.png" className='dropdown-preferences' alt="" />
			</div>
			<p>In the Safari app on your Mac, choose Safari Preferences.</p>
		</>,
		<>
			<img src="/img/safari-preference/safari-final.png" className='w-75' alt="" />
			<p>Click General tab (first tab) in your Safari Preferences.</p>
		</>,
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/safari-final.png" className='w-75' alt="" />
				<img src="img/safari-preference/new-window.png" className='new-window' alt="" />
			</div>
		<p>Make sure your Safari opens with "A new window"</p>
	</>,
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/safari-final.png" className='w-75' alt="" />
				<img src="img/safari-preference/homepage.png" className='set-homepage' alt="" />
			</div>
			<p>Click the “New windows open with” pop-up menu, then choose Homepage.</p>
			<p>Click the “New tabs open with” pop-up menu, then choose Homepage.</p>
		</>,
		<>
			<div className="safari-dropdown">
				<img src="/img/safari-preference/safari-final.png" className='w-75' alt="" />
				<img src="img/safari-preference/safari-paste.png" className='safari-paste' alt="" />
			</div>
			<p>In the Homepage field, enter a the Tabs For Good address:</p>
			<span>
				<code>https://my.good-loop.com/newtab.html</code>
				<button onClick={() => {navigator.clipboard.writeText('https://my.good-loop.com/newtab.html')}} 
					className='btn btn-primary ml-3'>Copy To Clipboard</button>
			</span>
		</>,
		<>
			<img src="/img/safari-preference/safari-final.png" className='w-75' alt="" />
			<p>You're ready to use Tabs For Good and start raising money for good causes - just by browsing the internet.</p>
		</>
	];

	const slides = SlideItems.map((content, i) => (
		<div key={i} className='p-5 text-center safari-slideshow'>
			{content}
		</div>
	));

	return (<>
	<PageCard className="SafariPage widepage text-center">
		<img className="w-50 mb-1" src="img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" alt="" />
		<h1>Using Tabs For Good in Safari on Mac</h1>
		<BSCarousel className="mt-5 rounded" hasIndicators nextButton>
			{slides}
		</BSCarousel>
	</PageCard>
	</>)
}

export default SafariPage;
