
import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, ModalBody, ModalHeader, Container, Row, Col, Carousel, CarouselControl, CarouselItem, CarouselIndicators } from 'reactstrap';
import { id } from '../../../GLAppManifest';
import BSCarousel from '../base/components/BSCarousel';
import CloseButton from '../base/components/CloseButton';
import Icon from '../base/components/Icon';
import LinkOut from '../base/components/LinkOut';
import { getShowLogin, LoginWidgetEmbed, setShowLogin } from '../base/components/LoginWidget';
import Misc from '../base/components/Misc';
import { getNavProps } from '../base/components/NavBar';
import { getId } from '../base/data/DataClass';
import NGO from '../base/data/NGO';
import { getDataItem } from '../base/plumbing/Crud';
import DataStore from '../base/plumbing/DataStore';
import { getBrowserVendor, isMobile, space, stopEvent, toTitleCase } from '../base/utils/miscutils';
import Login from '../base/youagain';
import C from '../C';
import SubscriptionBox, { SubscriptionForm } from './cards/SubscriptionBox';
import CharityLogo from './CharityLogo';
import { setPersonSetting } from './pages/TabsForGoodSettings';
import { ArrowLink } from './pages/CommonComponents';
import BG from '../base/components/BG';

// Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517111672164&cot=14
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing


const SUPPORTED_BROWSERS = ["CHROME", "EDGE", "SAFARI"];

const WIDGET_PATH = ['widget', 'T4GSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const STATUS_PATH = [...WIDGET_PATH, 'status'];

const showT4GSignUpModal = (s = true) => {
	DataStore.setValue(SHOW_PATH, s);
};


/**
 * A button to start the T4G sign-up flow.
 */
export const T4GSignUpButton = ({ className, children, dUnset }) => {
	if (Login.isLoggedIn()) {
		if (isMobile()) {
			return <T4GSignUpLink className={space("T4GSignUpButton btn btn-primary", className)}>{children || "Get Tabs for Good"}</T4GSignUpLink>;
		}
		return <T4GPluginButton className={className} dUnset />
	}
	return (
		<T4GSignUpLink className={space("T4GSignUpButton btn btn-primary", className)} />
	);
};

export const T4GHowItWorksButton = ({className}) =>
	<ArrowLink className={className} link="/tabsforgood#howitworks" >How it works</ArrowLink>;;


export const T4GSignUpLink = ({ className, children, onClick }) => {
	return (
		<a className={`${space(className)} t4g-signup-button`} href={window.location}
			onClick={e => {
				stopEvent(e);
				showT4GSignUpModal();
				if (onClick) onClick();
			}} >
			{children || "Get " + C.T4G}
		</a>
	);
};

export const T4GPluginButton = ({ className, label, dUnset }) => {
	const browser = getBrowserVendor();
	if (!label) label = <span className='ml-1'>{browser} Store</span>;
	let href = {
		CHROME: "https://chrome.google.com/webstore/detail/good-loop-tabs-for-good/baifmdlpgkohekdoilaphabcbpnacgcm?hl=en&authuser=1",
		EDGE: "https://microsoftedge.microsoft.com/addons/detail/goodloop-tabs-for-good/affgfbmpcboljigkpdeamhieippkglkn"
	}[browser];
	if (browser == 'SAFARI') {
		label = <span className='ml-1'>Set Homepage for {browser}</span>;
		href = 'safari'
		return <C.A className={space(className, "btn btn-primary", (dUnset ? "d-unset" : "d-flex-block justify-content-center align-items-center"))} href={href}><Icon name={browser.toLowerCase()} /> {label}</C.A>
	}
	if (!href) {
		return <span className={space(className, "disabled btn btn-secondary")} >Not available for {browser} yet</span>;
	}
	return <LinkOut className={space(className, "btn btn-primary", (dUnset ? "d-unset" : "d-flex-block justify-content-center align-items-center"))} href={href}><Icon name={browser.toLowerCase()} /> {label}</LinkOut>;
};


/**
 * 
 * @param {Object} p
 */
export const T4GSignUpModal = () => {
	const show = DataStore.getValue(SHOW_PATH);

	// charity specific?
	let charity = null;
	const nprops = getNavProps();
	if (nprops && nprops.brandType === "NGO") {
		let pvCharity = getDataItem({ type: "NGO", id: nprops.brandId });
		charity = pvCharity.value;
	}

	// close on nav
	useEffect(function () {
		console.log("T4G signup cleanup called show:" + show);
	}, ["" + window.location]);

	return (
		<Modal
			isOpen={show}
			className="T4G-modal"
			toggle={() => showT4GSignUpModal(!show)}
			size="lg"
		>
			<ModalBody className='pt-0'>
				<CloseButton size='lg' onClick={() => showT4GSignUpModal(false)} />

				{charity && <CharityLogo charity={charity} />}
				{isMobile() ? <MobileSendEmail charity={charity} />
					: <DesktopSignUp charity={charity} />}
			</ModalBody>
		</Modal>
	);
};

const DesktopSignUp = ({ charity }) => {
	const browser = getBrowserVendor();

	if (!SUPPORTED_BROWSERS.includes(browser)) {
		return <NotAvailableYet charity={charity} browser={browser} />
	}
	// NB: we have the left and right step 1 / 2 below

	// set charity if they register
	const onRegister = e => {
		if (charity) {
			setPersonSetting("charity", getId(charity));
		}
	};

	const Steps = ({ step }) => {
		let circleOne = step == 1 ? "circle circle-active" : "circle circle-done";
		let circleTwo = step == 2 ? "circle circle-active" : "circle";

		return (<>
			<div className={circleOne}></div>
			<div className={circleTwo}></div>
			<span id="circle-step-1">Step 1 - Sign Up</span>
			<span id="circle-step-2">Step 2 - Install</span>
		</>)
	}

	return <Container fluid>
		<Row>
			<Col className='sign-up-left px-0'>
				<BG className='welcome-text' src="/img/TabsForGood/About-t4g-blob.svg" size="contain" repeat="no-repeat" center>
                    <h1>Welcome to Tabs For Good!</h1>
                    <p>Create your account to start raising money for your favourite charity while you browse</p>
                </BG>
                <img src="/img/TabsForGood/signup-overlay.png" className='bubbles-overlay'/>
			</Col>
			<Col className='sign-up-right m-0 py-5 d-flex flex-column justify-content-between align-items-center h-100'>
				{!Login.isLoggedIn() ?
					<>
						<div className='d-flex flex-column justify-content-center align-items-center'>
							<img className="w-50 mb-3" src="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" alt="" />
							<div className="steps-graphic">
								<Steps step={1} />
							</div>
						</div>
						<div className="w-100">
							<LoginWidgetEmbed verb='register' product="T4G" onLogin={onRegister} onRegister={onRegister} />
							{charity && <div>This will set your charity to {NGO.displayName(charity)}. You can change settings at anytime.</div>}
						</div>
					</>
					: /* Step 2 */ <div>
						<div className='d-flex flex-column justify-content-center align-items-center'>
							<img className="w-50 mb-3" src="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" alt="" />
							<div className="steps-graphic">
								<Steps step={2} />
							</div>
						</div>
						<div className="text-center px-5">
                            <h1>Success!</h1>
                            <p>You've signed up! Now click the button to install Tabs For Good</p>
                            <br/>
							<T4GPluginButton />
						</div>
					</div>
				}
			</Col>
		</Row>
	</Container>
};

const MobileSendEmail = ({ charity }) => {
	return (
		<Container fluid>
			<div className='mobile-send-email d-flex flex-column justify-content-between align-items-center'>
				<img className="hummingbird-mobile logo mt-3" src="/img/green/hummingbird.png" />
				<img className="w-50 mb-3" src="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" alt="" />
				<div style={{ textTransform: "capitalize" }}>
					We'll email you a link for desktop so you can start raising money for charity while you browse
				</div>
				<SubscriptionForm purpose="getT4Glink" product="T4G" charityId={getId(charity)} textCenter />
			</div>
		</Container>
	);
};

const NotAvailableYet = ({ browser, charity }) => {
	return (<>
		<img src="/img/signup/hand-globe-coins.png" className='hand-globe' />
		<div className='clearfix'>
			<img className="pull-right w-25 m-3" src="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" alt="Tabs for Good" />
		</div>
		<div className='mx-auto w-50 d-flex flex-column align-items-center'>
			<p class="mt-5">We'll send you an email to let you know when Tabs for Good is available on <span>{toTitleCase(browser)}</span></p>
			<SubscriptionForm purpose="preregister"
				product="T4G"
				charityId={getId(charity)} browser={browser}
				buttonText="Keep me Informed" />
		</div>
	</>);
};