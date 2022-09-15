import React, { useEffect, useState } from 'react';
import { Col, Row, Container, Button } from 'reactstrap';
import WhiteCircle from '../campaignpage/WhiteCircle';
import { addImageCredit } from '../../base/components/AboutPage';
import Editor3ColLayout, { LeftSidebar, MainPane } from '../../base/components/Editor3ColLayout';
import { LoginLink } from '../../base/components/LoginWidget';
import Person, { getAllXIds, getEmail, getProfile, hasConsent, PURPOSES } from '../../base/data/Person';
import DataStore from '../../base/plumbing/DataStore';
import { lg } from '../../base/plumbing/log';
import { getScreenSize, isMobile, space } from '../../base/utils/miscutils';
import Login from '../../base/youagain';
import SubscriptionBox from '../cards/SubscriptionBox';
import ShareButton from '../ShareButton';
import AccountSettings from './AccountSettings';
import TabsForGoodSettings from './TabsForGoodSettings';
import C from '../../C';
import MyDataDashboard from '../mydata/MyDataDashboardPage';


const WelcomePage = () => {
	return (<>
		<Container className='container'>
			<div className='content-col' style={{ alignContent: 'center' }}>
				<WhiteCircle width={"7.5%"} className="gl-logo-circle">
					<img className='gl-logo' src='/img/TabsForGood/WelcomePage/my_good-loop_Colour_RoundLogo.svg' alt='good-loop logo' />
				</WhiteCircle>
				<WhiteCircle width={"60%"} className="middle-circle">
					<p className='color-gl-red red-text' style={{ color: "@gl-red" }}>Welcome! Open A New Tab To Get Started</p>
					<p className='extra-text'>When you open a new tab, Google will ask if you want to keep the extension - be sure to select 'Keep It'</p>
					<img className='keep-it' alt='reminder to press keep it in google' src='/img/TabsForGood/WelcomePage/keep-it-screenshot.png'></img>
				</WhiteCircle>
				<img className='overlay' src='/img/TabsForGood/WelcomePage/overlay-desktop.png' alt="showcase photos"></img>
			</div>
		</Container>
	</>);
};

export default WelcomePage;
