import React, { useEffect, useState } from 'react';
import { Col, Row, Container, Button } from 'reactstrap';
import WhiteCircle from '../campaignpage/WhiteCircle';


const WelcomePage = () => {
	return (<div className='t4g-welcome-page'>
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
	</div>);
};

export default WelcomePage;
