import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { getLogo, space, stopEvent, uniq } from '../../base/utils/miscutils';
import { modifyPage } from '../../base/plumbing/glrouter';
import DynImg from '../../base/components/DynImg';
import NavBars from './ImpactNavBars';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop } from './GLCards';
import FilterAndAccountTopBar from './ImpactFilterOptions'
import { fetchCharity } from '../pages/MyCharitiesPage'
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import ActionMan from '../../plumbing/ActionMan';
import C from '../../C';
import NGOImage from '../../base/components/NGOImage';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import { getDataItem } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import List from '../../base/data/List';
import ListLoad from '../../base/components/ListLoad';
import TODO from '../../base/components/TODO';
import { Button, Col, Container, InputGroup, Row, Card, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { LoginWidgetEmbed } from '../../base/components/LoginWidget';
import XId from '../../base/data/XId';

/**
 * DEBUG OBJECTS
 */

import Login from '../../base/youagain';
import AccountMenu from '../../base/components/AccountMenu';
import { nonce } from '../../base/data/DataClass';


const ImpactLoginCard = ({choice, setChoice, masterBrand}) => {
	setChoice(false);
	let content = null;
	if (Login.isLoggedIn()) {
		let user = Login.getUser();
		const name = (user.name || XId.prettyName(user.xid));

		const tempTotal = 12345;

		content = <>
			<Col className="decoration flex-center bg-gl-red impact-login-left-image" xs="12" sm="7">
				<Circle className="circle" width={"90%"} border="none">
					{masterBrand?.branding?.logo && <img src={masterBrand.branding.logo} id='impact-welcome-logo' className='logo'/>}
					<h3 className='color-good-loop'>Welcome {name}!</h3>
					<h3 className='color-good-loop'>{masterBrand?.name} <TODO>Brands</TODO> Have So Far Raised</h3>
					<h2 className='color-good-loop'><TODO>£{tempTotal}</TODO></h2>
					<p className='grey'>WITH</p>
					<img className="gl-logo my-4" src="/img/gl-logo/AdsForGood/AdsForGood.svg" />
				</Circle>
			</Col>
			<Col className="form" xs="12" sm="5">
				<a href="#" onClick={(event) => {setChoice(true)}}><div className='impact-login-page-options'><div className="logo" id="impact-login-overview-logo" />Impact Overview</div></a>
				<a href="#"><div className='impact-login-page-options'><div className="logo" id="impact-login-green-logo" />Impact Overview</div></a>
			</Col>
		</>;
	} else {
		content = <>
			<Col className="decoration flex-center bg-gl-red impact-login-left-image" xs="12" sm="4">
				<img className="gl-logo my-4 stamp" src="/img/gl-logo/AdsForGood/AdsForGood.svg" />
			</Col>
			<Col className="form" xs="12" sm="8">
				<img className="gl-logo my-4" src="/img/gl-logo/rectangle/logo-name.svg" />
				<LoginWidgetEmbed verb="login" canRegister={false} />
			</Col>
		</>;
	}

	return <Container>
		<Card body id="impact-login-card" className="m-4">
			<Container>
				<Row>
					{content}
				</Row>
			</Container>
		</Card>
	</Container>;

	return <>
		<AccountMenu />
		<button onClick={() => setChoice(true)}>{choice ? "True" : "False"}</button>
	</>;
};

export default ImpactLoginCard;
