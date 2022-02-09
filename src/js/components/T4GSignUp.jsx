
import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, ModalBody, ModalHeader, Container, Row, Col, Carousel, CarouselControl, CarouselItem, CarouselIndicators } from 'reactstrap';
import { id } from '../../../GLAppManifest';
import CloseButton from '../base/components/CloseButton';
import { getShowLogin, LoginWidgetEmbed, setShowLogin } from '../base/components/LoginWidget';
import Misc from '../base/components/Misc';
import { getId } from '../base/data/DataClass';
import DataStore from '../base/plumbing/DataStore';
import { getBrowserVendor, isMobile, space, stopEvent, toTitleCase } from '../base/utils/miscutils';
import Login from '../base/youagain';
import SubscriptionBox, { SubscriptionForm } from './cards/SubscriptionBox';
import CharityLogo from './CharityLogo';
import { T4GPluginButton } from './pages/CommonComponents';

// Design: https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517111672164&cot=14
// Copy: https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit?usp=sharing


const SUPPORTED_BROWSERS = ["CHROME","EDGE"];

const WIDGET_PATH = ['widget', 'T4GSignUp'];
const SHOW_PATH = [...WIDGET_PATH, 'show'];
const STATUS_PATH = [...WIDGET_PATH, 'status'];

const showLogin = (s=true) => {
	DataStore.setValue(SHOW_PATH, s);
};

export const T4GSignUpButton = ({className,children}) => {		
	return (
		<a className={space("T4GSignUpButton btn btn-primary", className)} href={window.location} 
			onClick={e => stopEvent(e) && showLogin()} >
			{children || "Sign Up For Tabs For Good"}
		</a>
	);
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
			toggle={() => showLogin(!show)}
			size="lg"
		>
			<ModalBody>
				<CloseButton size='lg' onClick={() => showLogin(false)}/>
				{charity && <CharityLogo charity={charity} />}
				{isMobile()? <MobileSendEmail charity={charity} /> : <DesktopSignUp charity={charity} />}
			</ModalBody>
		</Modal>
	);
};

const DesktopSignUp = ({charity}) => {

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
			<img className="hummingbird" src="img/green/hummingbird.png" alt="" />
			<SignUpSlideSection />

			<Col className='sign-up-right m-0' md={5}>
				<p>Tabs For Good By Good-Loop (Logo)</p>
				

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