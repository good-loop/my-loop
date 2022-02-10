
import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, ModalBody, ModalHeader, Container, Row, Col, Carousel, CarouselControl, CarouselItem, CarouselIndicators } from 'reactstrap';
import { id } from '../../../GLAppManifest';
import CloseButton from '../base/components/CloseButton';
import Icon from '../base/components/Icon';
import LinkOut from '../base/components/LinkOut';
import { getShowLogin, LoginWidgetEmbed, setShowLogin } from '../base/components/LoginWidget';
import Misc from '../base/components/Misc';
import { getId } from '../base/data/DataClass';
import DataStore from '../base/plumbing/DataStore';
import { getBrowserVendor, isMobile, space, stopEvent, toTitleCase } from '../base/utils/miscutils';
import Login from '../base/youagain';
import SubscriptionBox, { SubscriptionForm } from './cards/SubscriptionBox';
import CharityLogo from './CharityLogo';

// Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517111672164&cot=14
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing


const SUPPORTED_BROWSERS = ["CHROME","EDGE"];

const WIDGET_PATH = ['widget', 'T4GSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const STATUS_PATH = [...WIDGET_PATH, 'status'];

const showT4GSignUpModal = (s=true) => {
	DataStore.setValue(SHOW_PATH, s);
};

/**
 * Drop this CTA in -- on most pages, it will take you to the T4G page.
 * On the T4G page, it will open the sign-up flow.
 * 	...Unless you are signed-up (logged-in) then it offers a link to the pluginstore
 */
export const T4GCTA = ({className, children}) => {
	let path = DataStore.getValue("location","path");
	// NB: don't change into a chrome-store button (T4GPluginButton) -- that can be confusing
	return path[0]==="tabsforgood"? <T4GSignUpButton className={className} />
		: <C.A className={space(className, "btn btn-info mb-1 mr-2 text-uppercase")} href="/tabsforgood">Get Tabs-for-Good</C.A>;
}


/**
 * A button to start the sign-up flow.
 */
export const T4GSignUpButton = ({className,children}) => {		
	if (Login.isLoggedIn()) {
		return <T4GPluginButton className={className} />
	}
	return (
		<a className={space("T4GSignUpButton btn btn-primary", className)} href={window.location} 
			onClick={e => stopEvent(e) && showT4GSignUpModal()} >
			{children || "Sign Up For Tabs For Good"}
		</a>
	);
};

export const T4GPluginButton = ({className, label}) => {
	const browser = getBrowserVendor();
	if ( ! label) label = browser+" Store";
	let href = {
		CHROME: "https://chrome.google.com/webstore/detail/good-loop-tabs-for-good/baifmdlpgkohekdoilaphabcbpnacgcm?hl=en&authuser=1",
		EDGE: "https://microsoftedge.microsoft.com/addons/detail/goodloop-tabs-for-good/affgfbmpcboljigkpdeamhieippkglkn"
	}[browser];
	if ( ! href) {
		return <span className={space(className, "disabled btn btn-secondary")} >Not available for {browser} yet</span>;
	}
	return <LinkOut className={space(className, "btn btn-primary")} href={href}><Icon name={browser.toLowerCase()}/> {label}</LinkOut>;
};


/**
 * 
 * @param {Object} p
 * @param {?NGO} p.charity For a charity-specific sign up
 */
export const T4GSignUpModal = ({charity}) => {
	const show = DataStore.getValue(SHOW_PATH);
	// close on nav
	useEffect(function() {
		console.log("T4G signup cleanup called show:"+show);
	}, [""+window.location]);

	return (
		<Modal
			isOpen={show}
			className="T4G-modal"
			toggle={() => showT4GSignUpModal(!show)}
			size="lg"
		>
			<ModalBody>
				<CloseButton size='lg' onClick={() => showT4GSignUpModal(false)}/>
				{charity && <CharityLogo charity={charity} />}
				{isMobile()? <MobileSendEmail charity={charity} /> 
					: <DesktopSignUp charity={charity} />}
			</ModalBody>
		</Modal>
	);
};


const DesktopSignUp = ({charity}) => {
	const browser = getBrowserVendor();

	if ( ! SUPPORTED_BROWSERS.includes(browser)) {
		return <NotAvailableYet browser={browser} />
	}	
	// Step one or two?
	if (Login.isLoggedIn()) {
		return(<>
		TODO
		<T4GPluginButton />
		</>)
	}
	return <Container fluid>
		<Row>
			<img className="hummingbird" src="/img/green/hummingbird.png" alt="" />			

			<Col className='sign-up-right m-0' md={5}>
				<p>Tabs For Good By Good-Loop (Logo)</p>
				
				<LoginWidgetEmbed verb='register' onLogin={() => console.warn("TODO set charity??")}/>
			</Col>
		</Row>
	</Container>
};

const NotAvailableYet = ({browser,charity}) => {
	return (<>
		<p>We'll send you an email to let you know when Tabs-for-Good is available on <span>{toTitleCase(browser)}</span></p>
		<SubscriptionForm purpose="preregister" charityId={getId(charity)} />
		</>);
};

const MobileSendEmail = ({charity}) => {
	return (<Form>
		<div style={{textTransform:"capitalize"}}>
			We'll email you a link for desktop so you can start raising money for charity while you browse
		</div>
		<SubscriptionForm purpose="getT4Glink" charityId={getId(charity)} />
	</Form>);
};





const SignUpSlideSection = () => {
	const [animating, setAnimating] = useState(false);
	const [index, setIndex] = useState(0);

	const next = () => {
		if (animating) return;
		const nextIndex = index === items.length - 1 ? 0 : index + 1;
		setIndex(nextIndex);
	}
	
	const previous = () => {
		if (animating) return;
		const nextIndex = index === 0 ? items.length - 1 : index - 1;
		setIndex(nextIndex);
	}

	const goToIndex = (newIndex) => {
		if (animating) return;
		setIndex(newIndex);
	}

	const items = [
		<div className='slide-item bg-ml-pink'>
			<p className="text-center px-3">Thanks for joining us and getting Tabs for Good. You'll be all set in two simple steps:</p>
			<Row className='px-5'>
				<Col md={4}>
					<h1 style={{fontSize:"1rem"}}>Step 1</h1>
				</Col>
				<Col md={8}>
					<p>Sign up</p>
				</Col>
			</Row>
			<Row className='px-5'>
				<Col md={4}>
					<h1 style={{fontSize:"1rem"}}>Step 2</h1>
				</Col>
				<Col md={8}>
					We'll take you to the Chrome Store to install the Tabs for Good plugin.
				</Col>
			</Row>
		</div>,
		<div className='slide-item text-center align-items-center bg-ml-bluepink'>
			<img className='w-50 mb-3' src="img/signup/step-2.png" alt="" />
			<p className='px-3'>When you sign up, you'll get your own personalised portal where you can select the charity you want to support and see your impact grow</p>
		</div>,
		<div className='slide-item text-center align-items-center bg-ml-pink'>
			<img className='w-50 mb-3' src="img/signup/step-3.png" alt="" />
			<p className='px-3'>Once you're signed up, we'll immeditatly provide you with a link to the Chrome Store where you can add Tabs for Good to your browser </p>
			</div>,
		<div className='slide-item text-center align-items-center bg-ml-bluepink'>
			<img className='w-50 mb-3' src="img/signup/step-4.png" alt="" />
			<p className='px-3'>Once you've installed Tabs for Good, you can feel confident that your browsing is adding up into a force for good</p>
		</div>
	];

	const slides = items.map((content, i) => (
		<CarouselItem
			key={i}
			//className="slide-right"
			onExiting={() => setAnimating(true)}
			onExited={() => setAnimating(false)}
		>
			{content}	
		</CarouselItem>
	));

	return (<>
		<Col className='sign-up-left' md={7}>
			<Carousel
				activeIndex={index}
				next={next}
				previous={previous}
				interval={false}
			>
				<CarouselIndicators items={slides} activeIndex={index} onClickHandler={goToIndex} />
				{slides}
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
				<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
			</Carousel>
		</Col>
	</>)
}